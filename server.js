require('dotenv').config();
const express = require('express');
const https = require('https');
const app = express();

const GAS_URL = process.env.GAS_URL;
const PORT = process.env.PORT || 3000;

if (!GAS_URL) {
  console.error('ERROR: GAS_URL tidak ditemukan. Pastikan file .env sudah dibuat.');
  process.exit(1);
}

app.use(express.json());
app.use(express.static(__dirname));

// Proxy endpoint — forward POST data ke Google Apps Script
app.post('/submit', (req, res) => {
  const body = JSON.stringify(req.body);
  const url = new URL(GAS_URL);

  const options = {
    hostname: url.hostname,
    path: url.pathname + url.search,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const request = https.request(options, (gasRes) => {
    let data = '';
    gasRes.on('data', chunk => data += chunk);
    gasRes.on('end', () => {
      console.log('GAS status:', gasRes.statusCode);
      try {
        res.json(JSON.parse(data));
      } catch {
        res.json({ success: true });
      }
    });
  });

  request.on('error', err => {
    console.error('GAS error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  });
  request.write(body);
  request.end();
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
