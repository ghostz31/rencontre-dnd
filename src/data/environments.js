import { MONSTRES_DATABASE } from './monsters';

// Définition des environnements et leurs monstres associés
export const ENVIRONNEMENTS = {
  'Forêt': {
    description: 'Une dense forêt où la lumière du soleil filtre à peine à travers les feuilles.',
    monstres: [
      { id: 'ours-brun', nom: 'Ours brun', cr: '1', xp: 200 },
      { id: 'loup', nom: 'Loup', cr: '1/4', xp: 50 },
      { id: 'gobelin', nom: 'Gobelin', cr: '1/4', xp: 50 },
      { id: 'orc', nom: 'Orc', cr: '1/2', xp: 100 },
      { id: 'ogre', nom: 'Ogre', cr: '2', xp: 450 },
      { id: 'troll', nom: 'Troll', cr: '5', xp: 1800 },
      { id: 'treant', nom: 'Tréant', cr: '9', xp: 5000 }
    ]
  },
  'Montagne': {
    description: 'Des pics escarpés et des cavernes profondes où résonnent les échos.',
    monstres: [
      { id: 'aigle-geant', nom: 'Aigle géant', cr: '1', xp: 200 },
      { id: 'griffon', nom: 'Griffon', cr: '2', xp: 450 },
      { id: 'manticore', nom: 'Manticore', cr: '3', xp: 700 },
      { id: 'chimere', nom: 'Chimère', cr: '6', xp: 2300 },
      { id: 'g-ant-du-givre', nom: 'Géant du givre', cr: '8', xp: 3900 },
      { id: 'dragon-rouge-jeune', nom: 'Dragon rouge (jeune)', cr: '10', xp: 5900 }
    ]
  },
  'Plaine': {
    description: 'De vastes étendues d\'herbe ondulant sous le vent.',
    monstres: [
      { id: 'loup', nom: 'Loup', cr: '1/4', xp: 50 },
      { id: 'centaure', nom: 'Centaure', cr: '2', xp: 450 },
      { id: 'hippogriffe', nom: 'Hippogriffe', cr: '1', xp: 200 },
      { id: 'griffon', nom: 'Griffon', cr: '2', xp: 450 },
      { id: 'manticore', nom: 'Manticore', cr: '3', xp: 700 },
      { id: 'chimere', nom: 'Chimère', cr: '6', xp: 2300 }
    ]
  },
  'Désert': {
    description: 'Un paysage aride où le sable brûlant s\'étend à perte de vue.',
    monstres: [
      { id: 'scorpion-geant', nom: 'Scorpion géant', cr: '3', xp: 700 },
      { id: 'manticore', nom: 'Manticore', cr: '3', xp: 700 },
      { id: 'g-ant-du-feu', nom: 'Géant du feu', cr: '9', xp: 5000 },
      { id: 'dragon-bleu-jeune', nom: 'Dragon bleu (jeune)', cr: '9', xp: 5000 },
      { id: 'sphinx', nom: 'Sphinx', cr: '17', xp: 18000 }
    ]
  },
  'Marais': {
    description: 'Une zone humide et malsaine où la brume s\'élève des eaux stagnantes.',
    monstres: [
      { id: 'crocodile', nom: 'Crocodile', cr: '1/2', xp: 100 },
      { id: 'hydre', nom: 'Hydre', cr: '8', xp: 3900 },
      { id: 'otyugh', nom: 'Otyugh', cr: '5', xp: 1800 },
      { id: 'troll', nom: 'Troll', cr: '5', xp: 1800 },
      { id: 'dragon-vert-jeune', nom: 'Dragon vert (jeune)', cr: '8', xp: 3900 }
    ]
  },
  'Souterrain': {
    description: 'Des tunnels sombres et des cavernes profondes sous la surface.',
    monstres: [
      { id: 'gobelin', nom: 'Gobelin', cr: '1/4', xp: 50 },
      { id: 'orc', nom: 'Orc', cr: '1/2', xp: 100 },
      { id: 'ogre', nom: 'Ogre', cr: '2', xp: 450 },
      { id: 'minotaure', nom: 'Minotaure', cr: '3', xp: 700 },
      { id: 'beholder', nom: 'Beholder', cr: '13', xp: 10000 },
      { id: 'dragon-rouge-adulte', nom: 'Dragon rouge (adulte)', cr: '17', xp: 18000 }
    ]
  },
  'Côte': {
    description: 'Le bord de mer où les vagues se brisent sur les rochers.',
    monstres: [
      { id: 'sirene', nom: 'Sirène', cr: '1', xp: 200 },
      { id: 'sahuagin', nom: 'Sahuagin', cr: '1/2', xp: 100 },
      { id: 'kraken', nom: 'Kraken', cr: '23', xp: 50000 },
      { id: 'dragon-bleu-adulte', nom: 'Dragon bleu (adulte)', cr: '16', xp: 15000 }
    ]
  },
  'Arctique': {
    description: 'Un paysage gelé où la neige et la glace dominent.',
    monstres: [
      { id: 'ours-polaire', nom: 'Ours polaire', cr: '2', xp: 450 },
      { id: 'yeti', nom: 'Yéti', cr: '3', xp: 700 },
      { id: 'g-ant-du-givre', nom: 'Géant du givre', cr: '8', xp: 3900 },
      { id: 'dragon-blanc-adulte', nom: 'Dragon blanc (adulte)', cr: '13', xp: 10000 }
    ]
  },
  'Ruines': {
    description: 'Les vestiges d\'une civilisation ancienne, maintenant en ruines.',
    monstres: [
      { id: 'squelette', nom: 'Squelette', cr: '1/4', xp: 50 },
      { id: 'zombie', nom: 'Zombie', cr: '1/4', xp: 50 },
      { id: 'momie', nom: 'Momie', cr: '3', xp: 700 },
      { id: 'lich', nom: 'Liche', cr: '21', xp: 33000 },
      { id: 'dragon-d-or-adulte', nom: 'Dragon d\'or (adulte)', cr: '17', xp: 18000 }
    ]
  },
  'Urbain': {
    description: 'Une ville ou un village où la vie grouille dans les rues.',
    monstres: [
      { id: 'voleur', nom: 'Voleur', cr: '1/4', xp: 50 },
      { id: 'assassin', nom: 'Assassin', cr: '8', xp: 3900 },
      { id: 'doppelganger', nom: 'Doppelganger', cr: '3', xp: 700 },
      { id: 'vampire', nom: 'Vampire', cr: '13', xp: 10000 },
      { id: 'dragon-d-argent-adulte', nom: 'Dragon d\'argent (adulte)', cr: '16', xp: 15000 }
    ]
  }
};

// Fonction pour obtenir les monstres adaptés à un niveau et une difficulté
export const getMonstresAdaptes = (environnement, niveauMoyen, difficulte) => {
  // On ne garde que les monstres de l'environnement qui existent dans la base principale
  let monstresEnv = ENVIRONNEMENTS[environnement].monstres
    .map(m => MONSTRES_DATABASE.find(dbm => dbm.id === m.id))
    .filter(Boolean);

  const tableXP = {
    'Faible': 0.5,
    'Moyenne': 1,
    'Difficile': 1.5,
    'Mortelle': 2
  };

  // Filtre les monstres dont le CR est adapté au niveau
  let monstresFiltres = monstresEnv.filter(m => {
    const cr = parseFloat(m.cr);
    const niveau = parseFloat(niveauMoyen);
    return cr >= niveau - 2 && cr <= niveau + 2;
  });

  // Si aucun monstre trouvé, fallback sur tous les monstres de l'environnement
  if (monstresFiltres.length === 0) {
    monstresFiltres = monstresEnv;
  }

  // Trie les monstres par XP
  monstresFiltres.sort((a, b) => a.xp - b.xp);

  // Sélectionne aléatoirement des monstres jusqu'à atteindre l'XP cible
  const xpCible = niveauMoyen * 100 * tableXP[difficulte];
  let xpTotal = 0;
  let selection = [];

  while (xpTotal < xpCible && monstresFiltres.length > 0) {
    const index = Math.floor(Math.random() * monstresFiltres.length);
    const monstre = monstresFiltres[index];
    // Vérifie si l'ajout de ce monstre ne dépasse pas trop l'XP cible
    if (xpTotal + monstre.xp <= xpCible * 1.2) {
      const existant = selection.find(m => m.id === monstre.id);
      if (existant) {
        existant.quantite += 1;
      } else {
        selection.push({ ...monstre, quantite: 1 });
      }
      xpTotal += monstre.xp;
    } else {
      // Si on ne peut plus ajouter de monstre sans dépasser l'XP cible, on arrête
      break;
    }
  }

  // Si aucun monstre n'a pu être sélectionné, on en ajoute au moins un aléatoire
  if (selection.length === 0 && monstresFiltres.length > 0) {
    const monstre = monstresFiltres[Math.floor(Math.random() * monstresFiltres.length)];
    selection.push({ ...monstre, quantite: 1 });
    xpTotal = monstre.xp;
  }

  return {
    monstres: selection,
    xpTotal,
    description: ENVIRONNEMENTS[environnement].description
  };
}; 