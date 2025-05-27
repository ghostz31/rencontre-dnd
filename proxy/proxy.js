const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');

const app = express();
const port = 3001;

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Activer CORS pour toutes les routes
app.use(cors());

// Charge le mapping nom VF → slug pour Aidedd
const monsterMap = JSON.parse(fs.readFileSync(__dirname + '/aidedd-monsters.json', 'utf-8'));

// Fonction de normalisation (minuscule, sans accents, sans espaces)
function normalize(str) {
  // Supprime les numéros à la fin (ex: "aarakocra-2" -> "aarakocra")
  str = str.replace(/-\d+$/, '');
  
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

// Route pour Aidedd
app.get('/aidedd', async (req, res) => {
  const { vf } = req.query;
  if (!vf) return res.status(400).send('Missing vf param');
  
  console.log('Recherche du monstre:', vf);
  
  // Recherche exacte d'abord
  let slug = monsterMap[vf];
  console.log('Recherche exacte:', slug);
  
  // Si pas trouvé, recherche tolérante
  if (!slug) {
    const normVf = normalize(vf);
    console.log('Recherche normalisée:', normVf);
    
    // Recherche dans les clés normalisées
    for (const [key, value] of Object.entries(monsterMap)) {
      const normKey = normalize(key);
      console.log('Comparaison:', normKey, 'avec', normVf);
      if (normKey === normVf) {
        slug = value;
        console.log('Trouvé avec normalisation:', key, '->', slug);
        break;
      }
    }
  }

  if (!slug) {
    console.log('Monstre non trouvé. Liste des monstres disponibles:');
    console.log(Object.keys(monsterMap).join(', '));
    return res.status(404).send('Monstre non trouvé dans le mapping Aidedd');
  }

  const url = `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
  console.log('URL finale:', url);
  
  try {
    const response = await fetch(url);
    const html = await response.text();
    // Autorise l'affichage dans une iframe depuis ton front
    res.set('Content-Type', 'text/html');
    res.set('Access-Control-Allow-Origin', '*');
    res.set('X-Frame-Options', 'ALLOWALL');
    res.send(html);
  } catch (e) {
    console.error('Proxy error:', e);
    res.status(500).send('Erreur proxy');
  }
});

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'Proxy server is running!' });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Server Error', message: err.message });
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
  console.log('Test the proxy at http://localhost:3001/test');
});
