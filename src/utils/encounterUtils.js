import { SEUILS_DIFFICULTE, MULTIPLICATEURS_XP } from '../data/rules';

// Calcul de la difficulté d'une rencontre
export const calculerDifficulte = (monstres, nombrePJ, niveauPJ) => {
  // Multiplicateurs de difficulté selon le nombre de monstres
  const multiplicateurs = {
    1: 1,
    2: 1.5,
    3: 2,
    4: 2.5,
    5: 2.5,
    6: 2.5,
    7: 3,
    8: 3,
    9: 3,
    10: 3,
    11: 4,
    12: 4,
    13: 4,
    14: 4,
    15: 4
  };

  // XP par niveau de PJ
  const xpParNiveau = {
    1: 300,
    2: 600,
    3: 1200,
    4: 1700,
    5: 3500,
    6: 4000,
    7: 5000,
    8: 6000,
    9: 7500,
    10: 9000,
    11: 10500,
    12: 11500,
    13: 13500,
    14: 15000,
    15: 18000,
    16: 20000,
    17: 25000,
    18: 27000,
    19: 30000,
    20: 40000
  };

  // Calcul de l'XP totale des monstres
  let xpTotal = 0;
  let nombreTotalMonstres = 0;

  monstres.forEach(monstre => {
    xpTotal += monstre.xp * monstre.quantite;
    nombreTotalMonstres += monstre.quantite;
  });

  // Application du multiplicateur
  const multiplicateur = multiplicateurs[nombreTotalMonstres] || 4;
  xpTotal *= multiplicateur;

  // XP totale du groupe
  const xpGroupe = xpParNiveau[niveauPJ] * nombrePJ;

  // Détermination de la difficulté
  let niveau;
  let couleur;

  if (xpTotal < xpGroupe * 0.5) {
    niveau = 'Très facile';
    couleur = 'green';
  } else if (xpTotal < xpGroupe * 0.75) {
    niveau = 'Facile';
    couleur = 'blue';
  } else if (xpTotal < xpGroupe * 1.25) {
    niveau = 'Moyenne';
    couleur = 'yellow';
  } else if (xpTotal < xpGroupe * 1.5) {
    niveau = 'Difficile';
    couleur = 'orange';
  } else {
    niveau = 'Mortelle';
    couleur = 'red';
  }

  return {
    niveau,
    couleur,
    xpTotal: Math.round(xpTotal)
  };
};

// Génération d'initiative
export const genererInitiative = (entite) => {
  // Bonus d'initiative basé sur la Dextérité
  const bonusDex = Math.floor((entite.dexterite - 10) / 2);
  
  // Jet de dé
  const jet = Math.floor(Math.random() * 20) + 1;
  
  return jet + bonusDex;
}; 