const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;
const path = require('path');

async function scrapeMonsters() {
  try {
    // Récupérer la page
    const response = await axios.get('https://www.aidedd.org/dnd-filters/monstres.php');
    const $ = cheerio.load(response.data);

    // Vérifier la structure de la page
    console.log('Structure de la page :');
    console.log('Nombre de tables :', $('table').length);
    console.log('Première table :', $('table').first().html());

    const monsters = [];

    // Parcourir chaque ligne du tableau
    $('table tr').each((i, row) => {
      // Ignorer l'en-tête
      if (i === 0) return;

      const columns = $(row).find('td');
      if (columns.length === 0) return;

      // Log des données brutes
      console.log('Ligne', i, ':');
      console.log('Colonnes :', columns.length);
      columns.each((j, col) => {
        console.log(`Colonne ${j}:`, $(col).text().trim());
      });

      // Extraire les données de base
      const name = $(columns[1]).text().trim();
      const type = $(columns[5]).text().trim();
      const size = $(columns[6]).text().trim();
      const ac = $(columns[7]).text().trim();
      const hp = $(columns[8]).text().trim();
      const speed = $(columns[9]).text().trim();
      const alignment = $(columns[10]).text().trim();
      const legendary = $(columns[11]).text().trim() === 'Légendaire';
      const source = $(columns[12]).text().trim();
      const cr = $(columns[4]).text().trim();

      // Log des données extraites
      console.log('Données extraites :', {
        name,
        type,
        size,
        ac,
        hp,
        speed,
        alignment,
        legendary,
        source,
        cr
      });

      // Calculer l'XP basé sur le CR
      const xp = calculateXP(cr);

      // Extraire le type de monstre (premier mot avant le CR)
      const typeMatch = type.match(/^([^(]+)/);
      const monsterType = typeMatch ? typeMatch[1].trim() : 'Inconnu';

      // Créer l'objet monstre
      const monster = {
        id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        nom: name,
        type: monsterType,
        taille: size,
        alignement: alignment,
        ca: parseInt(ac) || 10,
        pv: parseInt(hp) || 1,
        vitesse: speed,
        force: 10,
        dexterite: 10,
        constitution: 10,
        intelligence: 10,
        sagesse: 10,
        charisme: 10,
        jds: {},
        resistance: [],
        immunite: [],
        sens: 'Vision normale',
        langues: 'Commun',
        dangerosite: cr,
        cr: cr,
        xp: xp,
        traits: [],
        actions: [],
        source: source,
        legendaire: legendary
      };

      monsters.push(monster);
    });

    // Sauvegarder dans un fichier
    const outputPath = path.join(__dirname, '../src/data/monsters.json');
    await fs.writeFile(outputPath, JSON.stringify(monsters, null, 2), 'utf8');
    console.log(`Scraped ${monsters.length} monsters successfully!`);

  } catch (error) {
    console.error('Error scraping monsters:', error);
  }
}

function calculateXP(cr) {
  const xpTable = {
    '0': 0,
    '1/8': 25,
    '1/4': 50,
    '1/2': 100,
    '1': 200,
    '2': 450,
    '3': 700,
    '4': 1100,
    '5': 1800,
    '6': 2300,
    '7': 2900,
    '8': 3900,
    '9': 5000,
    '10': 5900,
    '11': 7200,
    '12': 8400,
    '13': 10000,
    '14': 11500,
    '15': 13000,
    '16': 15000,
    '17': 18000,
    '18': 20000,
    '19': 22000,
    '20': 25000,
    '21': 33000,
    '22': 41000,
    '23': 50000,
    '24': 62000,
    '25': 75000,
    '26': 90000,
    '27': 105000,
    '28': 120000,
    '29': 135000,
    '30': 155000
  };

  return xpTable[cr] || 0;
}

scrapeMonsters(); 