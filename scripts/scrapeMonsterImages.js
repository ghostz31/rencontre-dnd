const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const monsters = require('../src/data/monsters.json');

function slugify(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
}

async function downloadImage(url, dest) {
  const writer = fs.createWriteStream(dest);
  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
    timeout: 15000
  });
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

async function scrapeImages() {
  const outputDir = path.join(__dirname, '../public/images/monstres');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let count = 0;
  for (const monstre of monsters) {
    const slug = slugify(monstre.nom || monstre.name || '');
    if (!slug) continue;
    const url = `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
    try {
      const { data } = await axios.get(url, { timeout: 15000 });
      const $ = cheerio.load(data);
      // Cherche l'image principale (dans la fiche, souvent dans .fichemonstre img)
      let imgUrl = $('div.fichemonstre img').attr('src');
      if (!imgUrl) imgUrl = $('img').first().attr('src');
      if (!imgUrl) {
        console.log(`[${monstre.nom}] Pas d'image trouvée.`);
        continue;
      }
      // Si l'URL est relative, complète
      if (imgUrl.startsWith('/')) imgUrl = 'https://www.aidedd.org' + imgUrl;
      // Détermine l'extension
      const ext = path.extname(imgUrl).split('?')[0] || '.jpg';
      const dest = path.join(outputDir, `${slug}${ext}`);
      // Télécharge l'image
      await downloadImage(imgUrl, dest);
      count++;
      console.log(`[${monstre.nom}] Image téléchargée : ${dest}`);
    } catch (e) {
      console.log(`[${monstre.nom}] Erreur : ${e.message}`);
    }
    // Petite pause pour ne pas surcharger le serveur
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n${count} images téléchargées !`);
}

scrapeImages(); 