const https = require('https');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GAS_URL = process.env.GAS_URL;
  if (!GAS_URL) {
    return res.status(500).json({ success: false, error: 'GAS_URL not configured' });
  }

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
      try {
        res.json(JSON.parse(data));
      } catch {
        res.json({ success: true });
      }
    });
  });

  request.on('error', err => {
    res.status(500).json({ success: false, error: err.message });
  });
  request.write(body);
  request.end();
};
