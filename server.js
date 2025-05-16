const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/klines', async (req, res) => {
  const symbol = req.query.symbol || 'AUDJPY';
  const interval = req.query.interval || '1m';
  const limit = req.query.limit || 100;
  try {
    const url = `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy API running on http://localhost:${PORT}`);
});
