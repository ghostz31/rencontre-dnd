import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dnd-groupes-joueurs';
const OLD_STORAGE_KEY = 'dnd-player-groups';
const FAVORITES_KEY = 'dnd-favorite-groups';

// Fonction utilitaire pour créer un nouveau joueur
function createEmptyPlayer() {
  return {
    id: Date.now() + '-' + Math.random(),
    nom: '',
    pvMax: 20,
    pv: 20,
    ca: 10,
    niveau: 1,
    classes: '',
    initiative: 0,
    avatar: '',
    json: ''
  };
}

// Fonction utilitaire pour créer un nouveau groupe
function createEmptyGroup() {
  return {
    id: Date.now() + '-' + Math.random(),
    nom: '',
    joueurs: [createEmptyPlayer()],
    dateCreation: new Date().toISOString(),
    dateMaj: new Date().toISOString()
  };
}

export default function usePlayerGroups() {
  const [groups, setGroups] = useState([]);
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chargement initial des données
  useEffect(() => {
    const loadData = () => {
      try {
        console.log('Chargement des groupes...');
        // Charger les groupes
        const savedGroups = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        const savedOldGroups = JSON.parse(localStorage.getItem(OLD_STORAGE_KEY) || '[]');
        
        console.log('Groupes sauvegardés:', savedGroups);
        console.log('Anciens groupes:', savedOldGroups);
        
        // Fusionner les groupes en évitant les doublons
        const allGroups = [...savedGroups];
        savedOldGroups.forEach(oldGroup => {
          if (!allGroups.some(g => g.id === oldGroup.id)) {
            allGroups.push(oldGroup);
          }
        });

        console.log('Groupes fusionnés:', allGroups);

        // S'assurer que chaque groupe a une structure valide
        const validGroups = allGroups.map(group => ({
          ...createEmptyGroup(),
          ...group,
          joueurs: (group.joueurs || []).map(joueur => ({
            ...createEmptyPlayer(),
            ...joueur
          }))
        }));

        console.log('Groupes validés:', validGroups);
        setGroups(validGroups);

        // Charger les favoris
        const savedFavorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
        setFavoriteGroups(savedFavorites);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setGroups([]);
        setFavoriteGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sauvegarder les groupes
  const saveGroups = useCallback((newGroups) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newGroups));
      localStorage.setItem(OLD_STORAGE_KEY, JSON.stringify(newGroups));
      setGroups(newGroups);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des groupes:', error);
    }
  }, []);

  // Sauvegarder les favoris
  const saveFavorites = useCallback((newFavorites) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavoriteGroups(newFavorites);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  }, []);

  // API pour manipuler les groupes
  const addGroup = useCallback((group = createEmptyGroup()) => {
    saveGroups([...groups, group]);
  }, [groups, saveGroups]);

  const updateGroup = useCallback((updatedGroup) => {
    const newGroups = groups.map(g => 
      g.id === updatedGroup.id ? { ...g, ...updatedGroup, dateMaj: new Date().toISOString() } : g
    );
    saveGroups(newGroups);
  }, [groups, saveGroups]);

  const deleteGroup = useCallback((groupId) => {
    const newGroups = groups.filter(g => g.id !== groupId);
    saveGroups(newGroups);
    saveFavorites(favoriteGroups.filter(id => id !== groupId));
  }, [groups, favoriteGroups, saveGroups, saveFavorites]);

  // API pour les favoris
  const toggleFavorite = useCallback((groupId) => {
    const newFavorites = favoriteGroups.includes(groupId)
      ? favoriteGroups.filter(id => id !== groupId)
      : [...favoriteGroups, groupId];
    saveFavorites(newFavorites);
  }, [favoriteGroups, saveFavorites]);

  // API pour les joueurs
  const addPlayerToGroup = useCallback((groupId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedGroup = {
        ...group,
        joueurs: [...group.joueurs, createEmptyPlayer()],
        dateMaj: new Date().toISOString()
      };
      updateGroup(updatedGroup);
    }
  }, [groups, updateGroup]);

  const removePlayerFromGroup = useCallback((groupId, playerId) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedGroup = {
        ...group,
        joueurs: group.joueurs.filter(j => j.id !== playerId),
        dateMaj: new Date().toISOString()
      };
      updateGroup(updatedGroup);
    }
  }, [groups, updateGroup]);

  const updatePlayer = useCallback((groupId, playerId, updates) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      const updatedGroup = {
        ...group,
        joueurs: group.joueurs.map(j => 
          j.id === playerId ? { ...j, ...updates } : j
        ),
        dateMaj: new Date().toISOString()
      };
      updateGroup(updatedGroup);
    }
  }, [groups, updateGroup]);

  return {
    groups,
    favoriteGroups,
    isLoading,
    addGroup,
    updateGroup,
    deleteGroup,
    toggleFavorite,
    addPlayerToGroup,
    removePlayerFromGroup,
    updatePlayer,
    createEmptyGroup,
    createEmptyPlayer
  };
} 