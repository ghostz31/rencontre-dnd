const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = 3001;

// Activer CORS pour toutes les routes
app.use(cors());

// Configuration du proxy
const proxyOptions = {
  target: 'https://character-service.dndbeyond.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/character': '/v5/character'
  },
  onProxyRes: function (proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
  }
};

// Route pour le proxy
app.use('/api/character', createProxyMiddleware(proxyOptions));

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'Proxy server is running!' });
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
}); 