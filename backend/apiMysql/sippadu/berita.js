const express = require('express');
const router = express.Router();
const http = require('http');

router.get('/', (req, res) => {
  try {
    // Mencoba lewat HTTP biasa (port 80)
    const url = 'http://server-web.konaweselatankab.go.id/api/v1/publish_satpol_pengumuman/beritaAndroidDashboard';

    http.get(url, (response) => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          if (!data) return res.status(502).json({ message: 'Empty response dari server web' });
          res.json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ message: 'Data bukan JSON valid', error: e.message, snippet: data.substring(0, 50) });
        }
      });
    }).on('error', (err) => {
      res.status(500).json({ message: 'HTTP Request Error', error: err.message });
    });
  } catch (error) {
    res.status(500).json({ message: 'Global Router Error', error: error.message });
  }
});

router.post('/isi_berita', (req, res) => {
  try {
    const url = 'http://server-web.konaweselatankab.go.id/api/v1/publish_satpol_pengumuman/isi_berita';
    
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

    const proxyReq = http.request(url, options, (response) => {
      let data = '';
      response.on('data', chunk => { data += chunk; });
      response.on('end', () => {
        try {
          if (!data) return res.status(502).json({ message: 'Empty response dari detail' });
          res.json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ message: 'Detail JSON error', error: e.message });
        }
      });
    });

    proxyReq.on('error', (err) => {
      res.status(500).json({ message: 'Detail HTTP error', error: err.message });
    });

    proxyReq.write(payloadData);
    proxyReq.end();
  } catch (error) {
    res.status(500).json({ message: 'Global Detail Error', error: error.message });
  }
});

module.exports = router;
