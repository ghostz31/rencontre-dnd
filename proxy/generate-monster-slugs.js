const fetch = require('node-fetch');
const cheerio = require('cheerio');
const fs = require('fs');

const url = 'https://www.aidedd.org/dnd-filters/monstres.php';

fetch(url)
  .then(res => res.text())
  .then(html => {
    const $ = cheerio.load(html);
    const mapping = {};
    // Parcours chaque ligne du tableau
    $('table tr').each((i, el) => {
      const link = $(el).find('a[href*="/dnd/monstres.php?vf="]');
      if (link.length) {
        const href = link.attr('href');
        const slugMatch = href.match(/vf=([^&]+)/);
        const slug = slugMatch ? slugMatch[1] : null;
        // Le nom VF est dans la 2e colonne (td)
        const name = $(el).find('td').eq(1).text().trim();
        if (name && slug) mapping[name] = slug;
      }
    });
    fs.writeFileSync('proxy/aidedd-monsters.json', JSON.stringify(mapping, null, 2), 'utf-8');
    console.log('Mapping généré avec', Object.keys(mapping).length, ' monstres.');
  }); 