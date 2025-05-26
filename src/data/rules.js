// Tables D&D 5e
export const SEUILS_DIFFICULTE = {
  1: { facile: 25, moyenne: 50, difficile: 75, mortelle: 100 },
  2: { facile: 50, moyenne: 100, difficile: 150, mortelle: 200 },
  3: { facile: 75, moyenne: 150, difficile: 225, mortelle: 400 },
  4: { facile: 125, moyenne: 250, difficile: 375, mortelle: 500 },
  5: { facile: 250, moyenne: 500, difficile: 750, mortelle: 1100 }
};

export const MULTIPLICATEURS_XP = { 1: 1, 2: 1.5, 3: 2, 4: 2, 5: 2.5, 6: 2.5, 7: 3 };

// Rencontres aléatoires
export const RENCONTRES_ALEATOIRES = {
  'Forêt': {
    'Faible': [
      {
        description: 'Une bande de gobelins embusqués',
        monstres: [
          { id: 'gobelin', quantite: 4 }
        ]
      },
      {
        description: 'Un orc solitaire à la recherche de nourriture',
        monstres: [
          { id: 'orc', quantite: 1 }
        ]
      }
    ],
    'Moyenne': [
      {
        description: 'Une patrouille d\'orcs',
        monstres: [
          { id: 'orc', quantite: 3 }
        ]
      },
      {
        description: 'Un ogre et ses gobelins',
        monstres: [
          { id: 'ogre', quantite: 1 },
          { id: 'gobelin', quantite: 2 }
        ]
      }
    ]
  },
  'Montagne': {
    'Faible': [
      {
        description: 'Des gobelins en embuscade',
        monstres: [
          { id: 'gobelin', quantite: 3 }
        ]
      }
    ],
    'Moyenne': [
      {
        description: 'Une bande d\'orcs montagnards',
        monstres: [
          { id: 'orc', quantite: 4 }
        ]
      },
      {
        description: 'Un ogre des montagnes',
        monstres: [
          { id: 'ogre', quantite: 1 }
        ]
      }
    ]
  },
  'Plaine': {
    'Faible': [
      {
        description: 'Des gobelins nomades',
        monstres: [
          { id: 'gobelin', quantite: 3 }
        ]
      }
    ],
    'Moyenne': [
      {
        description: 'Une horde d\'orcs en maraude',
        monstres: [
          { id: 'orc', quantite: 4 }
        ]
      }
    ]
  }
}; 