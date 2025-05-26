import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'dnd-groupes-joueurs';
const FAVORITES_KEY = 'dnd-favorite-groups';

export default function usePlayerGroups() {
  const [groups, setGroups] = useState([]);
  const [favoriteGroups, setFavoriteGroups] = useState([]);

  useEffect(() => {
    let initialGroups = [];
    const migrated = localStorage.getItem('dnd-groups-migrated');
    if (!migrated) {
      const newGroups = localStorage.getItem(STORAGE_KEY);
      if (!newGroups || newGroups === '[]') {
        const oldGroups = localStorage.getItem('dnd-player-groups');
        if (oldGroups && oldGroups !== '[]') {
          localStorage.setItem(STORAGE_KEY, oldGroups);
          initialGroups = JSON.parse(oldGroups);
        }
      }
      localStorage.setItem('dnd-groups-migrated', 'true');
    }
    // Toujours lire la clé actuelle, même après migration
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      initialGroups = Array.isArray(saved) ? saved : [];
    } catch {
      initialGroups = [];
    }
    setGroups(initialGroups);

    try {
      const favs = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]');
      setFavoriteGroups(Array.isArray(favs) ? favs : []);
    } catch {
      setFavoriteGroups([]);
    }
  }, []);

  // Sauvegarder groupes à chaque modification
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
  }, [groups]);

  // Sauvegarder favoris à chaque modification
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteGroups));
  }, [favoriteGroups]);

  // API pour manipuler les groupes
  const addGroup = useCallback(group => {
    setGroups(prev => [...prev, group]);
  }, []);

  const updateGroup = useCallback(updatedGroup => {
    setGroups(prev => prev.map(g => g.id === updatedGroup.id ? updatedGroup : g));
  }, []);

  const deleteGroup = useCallback(groupId => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
    setFavoriteGroups(prev => prev.filter(id => id !== groupId));
  }, []);

  // API pour les favoris
  const toggleFavorite = useCallback(groupId => {
    setFavoriteGroups(prev => prev.includes(groupId)
      ? prev.filter(id => id !== groupId)
      : [...prev, groupId]
    );
  }, []);

  return {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    favoriteGroups,
    toggleFavorite,
    setGroups, // pour compatibilité éventuelle
    setFavoriteGroups
  };
} 