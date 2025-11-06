const express = require('express');
const cors = require('cors');
const https = require('https');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// Helper function to fetch from external APIs
function fetchAPI(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// NewsAPI endpoint
app.get('/api/newsapi', async (req, res) => {
  try {
    const country = req.query.country || 'in';
    const language = req.query.language || 'en';
    const apiKey = 'f20f53e207ed497dace6c1d4a47daec9';
    
    const url = `https://newsapi.org/v2/top-headlines?country=${country}&language=${language}&apiKey=${apiKey}&pageSize=100`;
    const data = await fetchAPI(url);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from NewsAPI', details: error.message });
  }
});

// NewsData endpoint
app.get('/api/newsdata', async (req, res) => {
  try {
    const country = req.query.country || 'in';
    const language = req.query.language || 'en';
    const apiKey = 'pub_630bb6b01dd54da7b8a20061a5bd8224';
    
    const url = `https://newsdata.io/api/1/news?apikey=${apiKey}&country=${country}&language=${language}`;
    const data = await fetchAPI(url);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from NewsData', details: error.message });
  }
});

// GNews endpoint
app.get('/api/gnews', async (req, res) => {
  try {
    const country = req.query.country || 'in';
    const lang = req.query.lang || 'en';
    const apiKey = '7ea52edafd1d5eccbddcf495ceba6c11';
    
    const url = `https://gnews.io/api/v4/top-headlines?country=${country}&lang=${lang}&apikey=${apiKey}&max=100`;
    const data = await fetchAPI(url);
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch from GNews', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

