const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// 🛡️ SECURITY: Add security headers
app.use(helmet());

// 🛡️ SECURITY: Rate limiting - prevent abuse (INCREASED FROM 100 TO 750)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 750, // Max 750 requests per IP per 15 minutes (increased from 100)
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', limiter);

// 🛡️ SECURITY: Restrict CORS to your domain only
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// Parse JSON bodies
app.use(express.json());

// 🛡️ SECURITY: API Keys from environment variables (fallback to hardcoded for now)
const API_KEYS = {
  newsapi: process.env.NEWSAPI_KEY || 'f20f53e207ed497dace6c1d4a47daec9',
  newsdata: process.env.NEWSDATA_KEY || 'pub_630bb6b01dd54da7b8a20061a5bd8224',
  gnews: process.env.GNEWS_KEY || '7ea52edafd1d5eccbddcf495ceba6c11',
  currents: process.env.CURRENTS_KEY || 'XHsTPUmUy2xRLyDO0bxyFD2BlpSuT6vv7d-hSB7nPXagxAHe'
};

// Root route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'News API Proxy Service - Secured Edition',
    version: '2.0.0',
    endpoints: [
      '/api/newsapi',
      '/api/newsdata',
      '/api/gnews',
      '/api/currents'
    ],
    security: {
      helmet: 'enabled',
      rateLimit: '750 requests per 15 minutes', // Updated message
      cors: 'restricted'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 🛡️ SECURITY: Input validation helper
function validateInput(country, language) {
  const validCountries = ['in', 'us', 'gb', 'ca', 'au', 'de', 'fr', 'es'];
  const validLanguages = ['en', 'hi', 'es', 'fr', 'de'];
  
  return {
    country: validCountries.includes(country) ? country : 'in',
    language: validLanguages.includes(language) ? language : 'en'
  };
}

// NewsAPI endpoint
app.get('/api/newsapi', async (req, res) => {
  try {
    const { country, language } = validateInput(
      req.query.country || 'in',
      req.query.language || 'en'
    );
    
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&language=${language}&apiKey=${API_KEYS.newsapi}&pageSize=100`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    // 🛡️ SECURITY: Don't expose API key in error messages
    if (data.code === 'apiKeyInvalid') {
      return res.status(401).json({ error: 'Authentication failed' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('NewsAPI Error:', error);
    res.status(500).json({ error: 'Failed to fetch from NewsAPI' });
  }
});

// NewsData endpoint
app.get('/api/newsdata', async (req, res) => {
  try {
    const { country, language } = validateInput(
      req.query.country || 'in',
      req.query.language || 'en'
    );
    
    const url = `https://newsdata.io/api/1/news?apikey=${API_KEYS.newsdata}&country=${country}&language=${language}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('NewsData Error:', error);
    res.status(500).json({ error: 'Failed to fetch from NewsData' });
  }
});

// GNews endpoint
app.get('/api/gnews', async (req, res) => {
  try {
    const { country, language } = validateInput(
      req.query.country || 'in',
      req.query.lang || req.query.language || 'en'
    );
    
    const url = `https://gnews.io/api/v4/top-headlines?country=${country}&lang=${language}&apikey=${API_KEYS.gnews}&max=100`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('GNews Error:', error);
    res.status(500).json({ error: 'Failed to fetch from GNews' });
  }
});

// Currents API endpoint
app.get('/api/currents', async (req, res) => {
  try {
    const { country, language } = validateInput(
      req.query.country || 'in',
      req.query.language || 'en'
    );
    
    const url = `https://api.currentsapi.services/v1/latest-news?apiKey=${API_KEYS.currents}&language=${language}&region=${country}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Currents API Error:', error);
    res.status(500).json({ error: 'Failed to fetch from Currents API' });
  }
});

// 🛡️ SECURITY: 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 🛡️ SECURITY: Error handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running securely on port ${PORT}`);
  console.log(`📡 Proxy endpoints ready:
    - /api/newsapi
    - /api/newsdata
    - /api/gnews
    - /api/currents`);
  console.log(`🛡️ Security features enabled:
    - Helmet.js (security headers)
    - Rate limiting (750 req/15min) ⬆️ INCREASED
    - CORS restrictions
    - Input validation
    - Error sanitization`);
});
