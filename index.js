const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

// --- Your API Route ---
app.get('/api/newsdata', (req, res) => {
  return res.json({ status: 'ok', message: 'Demo newsdata endpoint working!' });
});

// Optionally, add other routes you need
app.get('/', (req, res) => {
  res.send('Backend is running');
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
