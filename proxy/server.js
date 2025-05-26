const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

// Helper pour extraire un nombre depuis un texte
function extractNumber(text) {
  const match = text && text.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

app.get('/dndbeyond', async (req, res) => {
  const { url } = req.query;
  if (!url || !/^https?:\/\/(www\.)?dndbeyond\.com\/characters\/[0-9]+/i.test(url)) {
    return res.status(400).json({ error: 'URL D&D Beyond invalide.' });
  }
  try {
    const { data: html } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; DnD-Proxy/1.0)'
      }
    });
    const $ = cheerio.load(html);

    // Extraction des données principales
    const name = $('[data-testid="character-name-header"]').text().trim() || $('h1').first().text().trim();
    const avatar = $("img[data-testid='character-avatar']").attr('src') || $(".ddb-campaigns-character-card-avatar img").attr('src');
    const level = extractNumber($('[data-testid="character-level-summary"]').text()) || extractNumber($('.ct-character-level').text());
    const hp = extractNumber($('[data-testid="hit-points-maximum"]').text()) || extractNumber($('.ct-health-summary__max-value').text());
    const hpCurrent = extractNumber($('[data-testid="hit-points-current"]').text()) || extractNumber($('.ct-health-summary__current-value').text());
    const ac = extractNumber($('[data-testid="ac-value"]').text()) || extractNumber($('.ct-armor-class-box__value').text());
    const initiative = extractNumber($('[data-testid="initiative-value"]').text()) || extractNumber($('.ct-initiative-box__value').text());

    // Bonus : récupération des classes principales (optionnel)
    const classes = $('[data-testid="character-class-summary"]').text().trim() || $('.ct-character-class-summary').text().trim();

    res.json({
      name,
      avatar,
      level,
      hp,
      hpCurrent,
      ac,
      initiative,
      classes
    });
  } catch (err) {
    res.status(500).json({ error: 'Impossible de récupérer la fiche D&D Beyond.', details: err.message });
  }
});

app.get('/', (req, res) => {
  res.send('D&D Beyond Proxy is running. Use /dndbeyond?url=...');
});

app.listen(PORT, () => {
  console.log(`D&D Beyond Proxy running on http://localhost:${PORT}`);
}); 