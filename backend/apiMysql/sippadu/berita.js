const express = require('express');
const router = express.Router();
const https = require('https');

// Proxy GET List Berita
router.get('/', (req, res) => {
  const url = 'https://server-web.konaweselatankab.go.id/api/v1/publish_satpol_pengumuman/beritaAndroidDashboard';

  https.get(url, (response) => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ message: 'Error parsing data', error: e.message });
      }
    });
  }).on('error', (err) => {
    res.status(500).json({ message: 'Error fetching berita', error: err.message });
  });
});

// Proxy POST Detail Berita
router.post('/isi_berita', (req, res) => {
  const url = 'https://server-web.konaweselatankab.go.id/api/v1/publish_satpol_pengumuman/isi_berita';
  
  const payloadData = JSON.stringify({
    id: req.body.id,
    data_ke: 1,
    cari_value: ""
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadData)
    }
  };

  const proxyReq = https.request(url, options, (response) => {
    let data = '';
    response.on('data', chunk => { data += chunk; });
    response.on('end', () => {
      try {
        res.json(JSON.parse(data));
      } catch (e) {
        res.status(500).json({ message: 'Error parsing data', error: e.message });
      }
    });
  });

  proxyReq.on('error', (err) => {
    res.status(500).json({ message: 'Error fetching detail berita', error: err.message });
  });

  proxyReq.write(payloadData);
  proxyReq.end();
});

module.exports = router;
