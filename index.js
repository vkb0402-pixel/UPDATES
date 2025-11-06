const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Root route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// News API endpoint (example with mock data)
app.get('/api/newsdata', async (req, res) => {
  try {
    // Mock news data - replace this with real API calls later
    const mockNews = {
      status: "success",
      results: [
        {
          title: "Sample News 1",
          description: "This is sample news article 1",
          pubDate: new Date().toISOString(),
          link: "https://example.com/news1"
        },
        {
          title: "Sample News 2",
          description: "This is sample news article 2",
          pubDate: new Date().toISOString(),
          link: "https://example.com/news2"
        }
      ]
    };
    
    res.json(mockNews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
