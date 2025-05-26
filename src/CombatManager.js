import React, { useState, useEffect, useRef } from 'react';
import { MONSTRES_DATABASE, TYPES_MONSTRE, CRS_DISPONIBLES } from './data/monsters';
import { Plus, Search, Minus, Save, Heart, Eye, Dice6, Undo2, ArrowRight, X, Trash2, Home } from 'lucide-react';
import { calculerDifficulte, genererInitiative } from './utils/encounterUtils';
import { getPlayerGroups } from './data/playerGroups';
import { Link } from 'react-router-dom';

// Définition des conditions disponibles
const CONDITIONS = [
  { id: 'empoisonne', nom: 'Empoisonné', couleur: 'purple', description: 'Désavantage aux jets d\'attaque et de sauvegarde' },
  { id: 'etourdi', nom: 'Étourdi', couleur: 'yellow', description: 'Incapable d\'agir, désavantage aux jets de sauvegarde' },
  { id: 'charme', nom: 'Charmé', couleur: 'pink', description: 'Ne peut pas attaquer le charmeur' },
  { id: 'terrorise', nom: 'Terrorisé', couleur: 'red', description: 'Désavantage aux tests et jets d\'attaque' },
  { id: 'a-terre', nom: 'À terre', couleur: 'gray', description: 'Désavantage aux jets d\'attaque' },
  { id: 'inconscient', nom: 'Inconscient', couleur: 'black', description: 'Incapable d\'agir, vulnérable' },
  { id: 'paralyse', nom: 'Paralysé', couleur: 'blue', description: 'Incapable d\'agir, vulnérable' },
  { id: 'aveugle', nom: 'Aveuglé', couleur: 'gray', description: 'Désavantage aux jets d\'attaque' },
  { id: 'sourd', nom: 'Sourd', couleur: 'gray', description: 'Ne peut pas entendre' },
  { id: 'entrave', nom: 'Entravé', couleur: 'orange', description: 'Vitesse réduite à 0' },
];

const dndbeyondUrlRegex = /^https?:\/\/(www\.)?dndbeyond\.com\/characters\/[0-9]+/i;

export default function CombatManager() {
  // État pour la configuration du groupe
  const [nombrePJ, setNombrePJ] = useState(4);
  const [niveauPJ, setNiveauPJ] = useState(1);

  // État pour la sélection/filtrage des monstres
  const [rechercheMonster, setRechercheMonster] = useState('');
  const [filtreType, setFiltreType] = useState('Tous');
  const [filtreCR, setFiltreCR] = useState('Tous');
  const [monstresSelectionnes, setMonstresSelectionnes] = useState([]);

  // Builder de rencontre
  const [nomRencontre, setNomRencontre] = useState('');
  const [rencontresSauvegardees, setRencontresSauvegardees] = useState([]);

  // Initiative
  const [initiative, setInitiative] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);

  // État pour la gestion des tours
  const [currentRound, setCurrentRound] = useState(1);
  const [currentTurn, setCurrentTurn] = useState(1);
  const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
  const [turnHistory, setTurnHistory] = useState([]);

  // État pour la gestion des participants
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participantActions, setParticipantActions] = useState([]);

  // État pour la gestion des conditions
  const [participantConditions, setParticipantConditions] = useState({});

  // État pour l'édition de l'initiative
  const [editingInitiative, setEditingInitiative] = useState(null);

  // État pour la gestion des groupes
  const [selectedMonsters, setSelectedMonsters] = useState([]);
  const [favoriteGroups, setFavoriteGroups] = useState([]);
  const [showFavoriteGroups, setShowFavoriteGroups] = useState(false);

  // Ajout d'un état pour l'édition du nom et de la catégorie
  const [editingFavoriteId, setEditingFavoriteId] = useState(null);
  const [editingFavoriteName, setEditingFavoriteName] = useState('');
  const [editingFavoriteCategory, setEditingFavoriteCategory] = useState('');
  const [newFavoriteCategory, setNewFavoriteCategory] = useState('');
  const [favoriteCategoryFilter, setFavoriteCategoryFilter] = useState('');

  // État pour la gestion des groupes de joueurs
  const [playerGroups, setPlayerGroups] = useState([]);
  const [selectedPlayerGroupId, setSelectedPlayerGroupId] = useState('');
  const [selectedPlayerGroup, setSelectedPlayerGroup] = useState(null);

  // État pour la synchronisation
  const [syncingPjId, setSyncingPjId] = useState(null);
  const [syncPjError, setSyncPjError] = useState({});
  const [syncPjSuccess, setSyncPjSuccess] = useState({});

  // Charger l'initiative depuis le localStorage au chargement
  useEffect(() => {
    const savedInitiative = localStorage.getItem('dnd-initiative');
    if (savedInitiative) {
      setInitiative(JSON.parse(savedInitiative));
    }
  }, []);

  // Chargement des rencontres sauvegardées au montage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('dnd-rencontres') || '[]');
      setRencontresSauvegardees(saved);
    } catch (error) {
      console.error('Erreur chargement:', error);
    }
  }, []);

  // Chargement des groupes favoris au montage
  useEffect(() => {
    const saved = localStorage.getItem('dnd-favorite-groups');
    if (saved) {
      setFavoriteGroups(JSON.parse(saved));
    }
  }, []);

  // Lorsqu'un groupe est sélectionné, pré-remplir les PJ dans l'initiative
  useEffect(() => {
    if (selectedPlayerGroupId) {
      const group = playerGroups.find(g => g.id === selectedPlayerGroupId);
      setSelectedPlayerGroup(group);
      if (group) {
        // Créer les PJ à partir du groupe
        const pjs = group.joueurs.map((j, idx) => ({
          id: `pj-${group.id}-${idx}`,
          nom: j.nom || `Joueur ${idx + 1}`,
          type: 'PJ',
          initiative: j.initiative || 0,
          pv: j.pv || j.pvMax || 20,
          pvMax: j.pvMax || 20,
          ca: j.ca || 10,
          niveau: j.niveau || 1,
          avatar: j.avatar || '',
          classes: j.classes || '',
          dndbeyondUrl: j.dndbeyondUrl || '',
          dexterite: 10, // Peut être amélioré si on synchronise la dex
        }));
        // Remplacer les PJ existants dans l'initiative
        setInitiative(prev => [
          ...pjs,
          ...prev.filter(p => p.type !== 'PJ')
        ]);
        setNombrePJ(group.joueurs.length);
        setNiveauPJ(Math.round(group.joueurs.reduce((acc, j) => acc + (j.niveau || 1), 0) / group.joueurs.length));
      }
    } else {
      setSelectedPlayerGroup(null);
    }
    // eslint-disable-next-line
  }, [selectedPlayerGroupId]);

  // Filtrage des monstres
  const monstresFiltres = MONSTRES_DATABASE.filter(monstre => {
    const matchNom = monstre.nom.toLowerCase().includes(rechercheMonster.toLowerCase());
    const matchType = filtreType === 'Tous' || monstre.type.toLowerCase() === filtreType.toLowerCase();
    const matchCR = filtreCR === 'Tous' || monstre.cr.toString() === filtreCR;
    return matchNom && matchType && matchCR;
  });

  // Ajout d'un monstre sélectionné
  const ajouterMonstre = (monstre) => {
    const existant = monstresSelectionnes.find(m => m.id === monstre.id);
    if (existant) {
      setMonstresSelectionnes(prev =>
        prev.map(m => m.id === monstre.id ? { ...m, quantite: m.quantite + 1 } : m)
      );
    } else {
      setMonstresSelectionnes(prev => [...prev, { ...monstre, quantite: 1 }]);
    }
  };

  // Suppression d'un monstre sélectionné
  const retirerMonstre = (id) => {
    setMonstresSelectionnes(prev => {
      const monstre = prev.find(m => m.id === id);
      if (monstre && monstre.quantite > 1) {
        return prev.map(m => m.id === id ? { ...m, quantite: m.quantite - 1 } : m);
      } else {
        return prev.filter(m => m.id !== id);
      }
    });
  };

  // Calcul de la difficulté
  const difficulte = calculerDifficulte(monstresSelectionnes, nombrePJ, niveauPJ);

  // Sauvegarde de la rencontre
  const sauvegarderRencontre = () => {
    if (!nomRencontre.trim()) return;
    const rencontre = {
      id: Date.now(),
      nom: nomRencontre,
      nombrePJ,
      niveauPJ,
      monstres: monstresSelectionnes,
      difficulte: calculerDifficulte(monstresSelectionnes, nombrePJ, niveauPJ),
      dateCreation: new Date().toLocaleDateString('fr-FR')
    };
    const nouvelles = [...rencontresSauvegardees, rencontre];
    setRencontresSauvegardees(nouvelles);
    localStorage.setItem('dnd-rencontres', JSON.stringify(nouvelles));
    setNomRencontre('');
    alert('Rencontre sauvegardée !');
  };

  // Générer l'ordre d'initiative
  const genererOrdreInitiative = () => {
    const participants = [];
    // PJs
    for (let i = 1; i <= nombrePJ; i++) {
      participants.push({
        id: `pj-${i}`,
        nom: `Joueur ${i}`,
        type: 'PJ',
        initiative: 0,
        pv: 20 + (niveauPJ * 5),
        pvMax: 20 + (niveauPJ * 5),
        dexterite: 10,
      });
    }
    // Monstres
    monstresSelectionnes.forEach(monstre => {
      for (let i = 1; i <= monstre.quantite; i++) {
        participants.push({
          id: `${monstre.id}-${i}`,
          nom: monstre.quantite > 1 ? `${monstre.nom} ${i}` : monstre.nom,
          type: 'Monstre',
          initiative: 0,
          pv: monstre.pv,
          pvMax: monstre.pv,
          dexterite: monstre.dexterite || 10,
        });
      }
    });
    // Générer l'initiative
    const avecInitiative = participants.map(entite => ({
      ...entite,
      initiative: genererInitiative(entite)
    })).sort((a, b) => b.initiative - a.initiative);
    setInitiative(avecInitiative);
  };

  // Fonction pour gérer le drag & drop de l'initiative
  const handleDragStart = (index) => setDraggedIndex(index);
  const handleDragOver = (index) => {
    if (draggedIndex === null || draggedIndex === index) return;
    const newOrder = [...initiative];
    const [removed] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, removed);
    setDraggedIndex(index);
    setInitiative(newOrder);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  // Fonction pour passer au tour suivant
  const nextTurn = () => {
    if (initiative.length === 0) return;

    // Sauvegarder l'état actuel dans l'historique
    setTurnHistory(prev => [...prev, {
      round: currentRound,
      turn: currentTurn,
      participantIndex: currentParticipantIndex,
      initiative: [...initiative]
    }]);

    // Calculer le prochain tour
    const nextIndex = (currentParticipantIndex + 1) % initiative.length;
    setCurrentParticipantIndex(nextIndex);

    // Si on revient au premier participant, c'est un nouveau round
    if (nextIndex === 0) {
      setCurrentRound(prev => prev + 1);
      setCurrentTurn(1);
    } else {
      setCurrentTurn(prev => prev + 1);
    }
  };

  // Fonction pour annuler le dernier tour
  const undoLastTurn = () => {
    if (turnHistory.length === 0) return;

    const lastState = turnHistory[turnHistory.length - 1];
    setCurrentRound(lastState.round);
    setCurrentTurn(lastState.turn);
    setCurrentParticipantIndex(lastState.participantIndex);
    setInitiative(lastState.initiative);
    setTurnHistory(prev => prev.slice(0, -1));
  };

  // Fonction pour ajouter une action à l'historique
  const addAction = (action) => {
    setParticipantActions(prev => [...prev, {
      id: Date.now(),
      round: currentRound,
      turn: currentTurn,
      participant: selectedParticipant?.nom,
      action: action,
      timestamp: new Date().toISOString()
    }]);
  };

  // Fonction pour gérer les dégâts/soins
  const updateParticipantHP = (participantId, amount) => {
    setInitiative(prev => prev.map(p => {
      if (p.id === participantId) {
        const newHP = Math.max(0, Math.min(p.pvMax, p.pv + amount));
        return { ...p, pv: newHP };
      }
      return p;
    }));
  };

  // Fonction pour ajouter une condition
  const addCondition = (participantId, conditionId) => {
    setParticipantConditions(prev => ({
      ...prev,
      [participantId]: [...(prev[participantId] || []), conditionId]
    }));
  };

  // Fonction pour retirer une condition
  const removeCondition = (participantId, conditionId) => {
    setParticipantConditions(prev => ({
      ...prev,
      [participantId]: (prev[participantId] || []).filter(id => id !== conditionId)
    }));
  };

  // Fonction pour obtenir les conditions d'un participant
  const getParticipantConditions = (participantId) => {
    return (participantConditions[participantId] || []).map(id => 
      CONDITIONS.find(c => c.id === id)
    );
  };

  // Fonction pour mettre à jour le score d'initiative
  const updateInitiative = (participantId, newScore) => {
    setInitiative(prev => prev.map(p => {
      if (p.id === participantId) {
        return { ...p, initiative: parseInt(newScore) || 0 };
      }
      return p;
    }));
  };

  // Fonction pour grouper les monstres identiques
  const groupMonsters = () => {
    const grouped = initiative.reduce((acc, participant) => {
      if (participant.type === 'PJ') {
        acc.push(participant);
      } else {
        const existingGroup = acc.find(p => 
          p.type === 'Monstre' && 
          p.nom === participant.nom && 
          p.pvMax === participant.pvMax
        );
        
        if (existingGroup) {
          existingGroup.quantite = (existingGroup.quantite || 1) + 1;
          existingGroup.pv += participant.pv;
          existingGroup.pvMax += participant.pvMax;
        } else {
          acc.push({ ...participant, quantite: 1 });
        }
      }
      return acc;
    }, []);

    setInitiative(grouped);
  };

  // Fonction pour dégrouper les monstres
  const ungroupMonsters = () => {
    const ungrouped = initiative.reduce((acc, participant) => {
      if (participant.type === 'PJ' || !participant.quantite) {
        acc.push(participant);
      } else {
        const pvPerMonster = participant.pv / participant.quantite;
        const pvMaxPerMonster = participant.pvMax / participant.quantite;
        
        for (let i = 0; i < participant.quantite; i++) {
          acc.push({
            ...participant,
            id: `${participant.id}-${i}`,
            quantite: undefined,
            pv: pvPerMonster,
            pvMax: pvMaxPerMonster,
            nom: participant.quantite > 1 ? `${participant.nom} ${i + 1}` : participant.nom
          });
        }
      }
      return acc;
    }, []);

    setInitiative(ungrouped);
  };

  // Sauvegarde des groupes favoris
  const saveFavoriteGroups = (groups) => {
    setFavoriteGroups(groups);
    localStorage.setItem('dnd-favorite-groups', JSON.stringify(groups));
  };

  // Fonction pour sélectionner/désélectionner un monstre
  const toggleMonsterSelection = (monsterId) => {
    setSelectedMonsters(prev => 
      prev.includes(monsterId)
        ? prev.filter(id => id !== monsterId)
        : [...prev, monsterId]
    );
  };

  // Fonction pour grouper les monstres sélectionnés
  const groupSelectedMonsters = () => {
    if (selectedMonsters.length < 2) return;

    const selected = initiative.filter(p => selectedMonsters.includes(p.id));
    const unselected = initiative.filter(p => !selectedMonsters.includes(p.id));

    const grouped = selected.reduce((acc, participant) => {
      const existingGroup = acc.find(p => 
        p.type === 'Monstre' && 
        p.nom === participant.nom && 
        p.pvMax === participant.pvMax
      );
      
      if (existingGroup) {
        existingGroup.quantite = (existingGroup.quantite || 1) + 1;
        existingGroup.pv += participant.pv;
        existingGroup.pvMax += participant.pvMax;
      } else {
        acc.push({ ...participant, quantite: 1 });
      }
      return acc;
    }, []);

    setInitiative([...unselected, ...grouped]);
    setSelectedMonsters([]);
  };

  // Fonction pour sauvegarder un groupe en favori (avec catégorie)
  const saveGroupAsFavorite = () => {
    const group = initiative.find(p => p.quantite > 1);
    if (!group) return;
    const newFavorite = {
      id: Date.now(),
      nom: group.nom,
      quantite: group.quantite,
      pvMax: group.pvMax / group.quantite,
      dateCreation: new Date().toISOString(),
      categorie: newFavoriteCategory.trim() || 'Non classé',
    };
    saveFavoriteGroups([...favoriteGroups, newFavorite]);
    setNewFavoriteCategory('');
  };

  // Fonction pour démarrer l'édition d'un favori
  const startEditFavorite = (fav) => {
    setEditingFavoriteId(fav.id);
    setEditingFavoriteName(fav.nom);
    setEditingFavoriteCategory(fav.categorie || '');
  };

  // Fonction pour valider l'édition
  const confirmEditFavorite = (favId) => {
    const updated = favoriteGroups.map(fav =>
      fav.id === favId
        ? { ...fav, nom: editingFavoriteName, categorie: editingFavoriteCategory || 'Non classé' }
        : fav
    );
    saveFavoriteGroups(updated);
    setEditingFavoriteId(null);
    setEditingFavoriteName('');
    setEditingFavoriteCategory('');
  };

  // Fonction pour filtrer par catégorie
  const filteredFavorites = favoriteCategoryFilter
    ? favoriteGroups.filter(fav => fav.categorie === favoriteCategoryFilter)
    : favoriteGroups;

  // Récupérer toutes les catégories existantes
  const allCategories = Array.from(new Set(favoriteGroups.map(fav => fav.categorie || 'Non classé')));

  // Fonction pour appliquer un groupe favori
  const applyFavoriteGroup = (favorite) => {
    const newMonsters = Array(favorite.quantite).fill(null).map((_, index) => ({
      id: `monster-${Date.now()}-${index}`,
      nom: favorite.nom,
      type: 'Monstre',
      initiative: 0,
      pv: favorite.pvMax,
      pvMax: favorite.pvMax,
      dexterite: 10
    }));

    setInitiative(prev => [...prev, ...newMonsters]);
    setShowFavoriteGroups(false);
  };

  // Fonction pour supprimer un groupe favori avec confirmation
  const deleteFavoriteGroup = (favId) => {
    const fav = favoriteGroups.find(f => f.id === favId);
    if (!fav) return;
    if (!window.confirm(`Supprimer le groupe favori « ${fav.nom} » ?`)) return;
    const updated = favoriteGroups.filter(fav => fav.id !== favId);
    saveFavoriteGroups(updated);
    if (editingFavoriteId === favId) {
      setEditingFavoriteId(null);
      setEditingFavoriteName('');
      setEditingFavoriteCategory('');
    }
  };

  // Fonction pour synchroniser un PJ en cours de combat
  const syncPjFromDndBeyond = async (pj) => {
    if (!pj.dndbeyondUrl || !dndbeyondUrlRegex.test(pj.dndbeyondUrl)) return;
    setSyncingPjId(pj.id);
    setSyncPjError({});
    setSyncPjSuccess({});
    try {
      const res = await fetch(`http://localhost:4000/dndbeyond?url=${encodeURIComponent(pj.dndbeyondUrl)}`);
      if (!res.ok) throw new Error('Erreur lors de la récupération');
      const data = await res.json();
      setInitiative(prev => prev.map(p =>
        p.id === pj.id
          ? {
              ...p,
              nom: data.name || p.nom,
              niveau: data.level || p.niveau,
              avatar: data.avatar || p.avatar,
              pvMax: data.hp || p.pvMax,
              pv: data.hpCurrent || data.hp || p.pv,
              ca: data.ac || p.ca,
              initiative: data.initiative || p.initiative,
              classes: data.classes || p.classes,
            }
          : p
      ));
      setSyncPjSuccess({ [pj.id]: true });
    } catch (err) {
      setSyncPjError({ [pj.id]: true });
    } finally {
      setSyncingPjId(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col">
      {/* Contenu principal : colonnes */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Colonne gauche : Préparation */}
        <div className="md:w-1/3 w-full bg-white border-r border-gray-200 p-4 overflow-y-auto flex flex-col gap-6">
          {/* Configuration du groupe */}
          <section className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-2">Groupe de joueurs</h2>
            <div className="flex items-center gap-2 mb-2">
              <select
                value={selectedPlayerGroupId}
                onChange={e => setSelectedPlayerGroupId(e.target.value)}
                className="p-2 border rounded"
              >
                <option value="">-- Aucun groupe sélectionné --</option>
                {playerGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.nom}</option>
                ))}
              </select>
              {selectedPlayerGroup && (
                <button
                  className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                  onClick={() => setSelectedPlayerGroupId('')}
                >
                  Désélectionner
                </button>
              )}
            </div>
            {selectedPlayerGroup && (
              <div className="bg-white border rounded p-2 flex flex-wrap gap-2">
                {selectedPlayerGroup.joueurs.map(j => (
                  <div key={j.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                    {j.avatar ? (
                      <img src={j.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">PJ</span>
                    )}
                    <span className="font-medium">{j.nom}</span>
                    <span className="text-xs text-gray-500">Niv {j.niveau}</span>
                    <span className="text-xs text-gray-500">PV {j.pv}/{j.pvMax}</span>
                    <span className="text-xs text-gray-500">CA {j.ca}</span>
                    <span className="text-xs text-gray-500">Init {j.initiative}</span>
                    {j.classes && <span className="text-xs text-gray-500">{j.classes}</span>}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-2">Configuration du groupe</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de PJ</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={nombrePJ}
                  onChange={e => setNombrePJ(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Niveau des PJ</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={niveauPJ}
                  onChange={e => setNiveauPJ(parseInt(e.target.value) || 1)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>
          </section>

          {/* Sélection des monstres */}
          <section className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-2">Sélection des monstres</h2>
            <div className="grid grid-cols-1 gap-4 mb-4">
              <input
                type="text"
                placeholder="Rechercher..."
                value={rechercheMonster}
                onChange={e => setRechercheMonster(e.target.value)}
                className="p-2 border rounded-md"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filtreType}
                  onChange={e => setFiltreType(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="Tous">Tous les types</option>
                  {TYPES_MONSTRE.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <select
                  value={filtreCR}
                  onChange={e => setFiltreCR(e.target.value)}
                  className="p-2 border rounded-md"
                >
                  <option value="Tous">Tous les CR</option>
                  {CRS_DISPONIBLES.map(cr => (
                    <option key={cr} value={cr}>CR {cr}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded">
              {monstresFiltres.map(monstre => (
                <div key={monstre.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="font-medium">{monstre.nom}</div>
                    <div className="text-sm text-gray-500">
                      CR {monstre.cr} • {monstre.xp} XP • {monstre.type}
                    </div>
                  </div>
                  <button
                    onClick={() => ajouterMonstre(monstre)}
                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Builder de rencontre */}
          <section className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-2">Builder de rencontre</h2>
            <div className={`rounded p-3 mb-3 border ${
              difficulte.couleur === 'green' ? 'bg-green-50 border-green-200' :
              difficulte.couleur === 'blue' ? 'bg-blue-50 border-blue-200' :
              difficulte.couleur === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
              difficulte.couleur === 'orange' ? 'bg-orange-50 border-orange-200' :
              difficulte.couleur === 'red' ? 'bg-red-50 border-red-200' :
              'bg-gray-50 border-gray-200'
            }`}>
              <h3 className="font-semibold mb-2">Difficulté</h3>
              <div className={`text-lg font-bold ${
                difficulte.couleur === 'green' ? 'text-green-700' :
                difficulte.couleur === 'blue' ? 'text-blue-700' :
                difficulte.couleur === 'yellow' ? 'text-yellow-700' :
                difficulte.couleur === 'orange' ? 'text-orange-700' :
                difficulte.couleur === 'red' ? 'text-red-700' :
                'text-gray-700'
              }`}>
                {difficulte.niveau}
              </div>
              {difficulte.xpTotal > 0 && (
                <div className="text-sm text-gray-600 mt-2">
                  XP Total: {difficulte.xpTotal}
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Nom de la rencontre"
              value={nomRencontre}
              onChange={e => setNomRencontre(e.target.value)}
              className="w-full p-2 border rounded-md text-sm mb-2"
            />
            <button
              onClick={sauvegarderRencontre}
              disabled={!nomRencontre.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 flex items-center justify-center mb-2"
            >
              <Save className="mr-2" size={16} />
              Sauvegarder
            </button>
          </section>
        </div>

        {/* Colonne droite : Combat */}
        <div className="md:w-2/3 w-full bg-gray-50 p-4 overflow-y-auto flex flex-col gap-6">
          {/* Initiative et participants */}
          <section className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Initiative</h2>
              <div className="flex gap-2">
                <button
                  onClick={genererOrdreInitiative}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
                >
                  <Dice6 className="mr-2" size={16} /> Générer l'ordre
                </button>
                <button
                  onClick={() => setInitiative(prev => [...prev].sort((a, b) => b.initiative - a.initiative))}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center"
                >
                  <ArrowRight className="mr-2" size={16} /> Trier par initiative
                </button>
                <button
                  onClick={groupMonsters}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                >
                  <Plus className="mr-2" size={16} /> Grouper tous
                </button>
                <button
                  onClick={ungroupMonsters}
                  className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 flex items-center"
                >
                  <Minus className="mr-2" size={16} /> Dégrouper tous
                </button>
                <button
                  onClick={() => setShowFavoriteGroups(!showFavoriteGroups)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center"
                >
                  <Heart className="mr-2" size={16} /> Groupes favoris
                </button>
              </div>
            </div>
            
            {/* Panneau des groupes favoris */}
            {showFavoriteGroups && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Groupes favoris</h3>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Catégorie (optionnel)"
                      value={newFavoriteCategory}
                      onChange={e => setNewFavoriteCategory(e.target.value)}
                      className="p-1 border rounded text-sm"
                      style={{ minWidth: 120 }}
                    />
                    <button
                      onClick={saveGroupAsFavorite}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Sauvegarder groupe actuel
                    </button>
                  </div>
                </div>
                <div className="mb-2 flex gap-2 items-center">
                  <span className="text-sm">Filtrer par catégorie :</span>
                  <select
                    value={favoriteCategoryFilter}
                    onChange={e => setFavoriteCategoryFilter(e.target.value)}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="">Toutes</option>
                    {allCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredFavorites.map(favorite => (
                    <div
                      key={favorite.id}
                      className="p-2 bg-white rounded border hover:border-blue-300 cursor-pointer group relative"
                      onClick={() => applyFavoriteGroup(favorite)}
                    >
                      {editingFavoriteId === favorite.id ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="text"
                            value={editingFavoriteName}
                            onChange={e => setEditingFavoriteName(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => { if (e.key === 'Enter') confirmEditFavorite(favorite.id); }}
                            className="p-1 border rounded text-sm mb-1"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editingFavoriteCategory}
                            onChange={e => setEditingFavoriteCategory(e.target.value)}
                            onClick={e => e.stopPropagation()}
                            onKeyDown={e => { if (e.key === 'Enter') confirmEditFavorite(favorite.id); }}
                            className="p-1 border rounded text-sm"
                            placeholder="Catégorie"
                          />
                          <button
                            onClick={e => { e.stopPropagation(); confirmEditFavorite(favorite.id); }}
                            className="mt-1 px-2 py-1 bg-blue-600 text-white rounded text-xs"
                          >Valider</button>
                        </div>
                      ) : (
                        <>
                          <div className="font-medium flex items-center gap-2">
                            {favorite.nom}
                            <button
                              className="ml-1 text-xs text-gray-400 group-hover:text-blue-600"
                              onClick={e => { e.stopPropagation(); startEditFavorite(favorite); }}
                            >Renommer</button>
                            <button
                              className="ml-1 text-xs text-gray-400 group-hover:text-red-600"
                              title="Supprimer"
                              onClick={e => { e.stopPropagation(); deleteFavoriteGroup(favorite.id); }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="text-xs text-gray-500">Catégorie : {favorite.categorie || 'Non classé'}</div>
                          <div className="text-sm text-gray-500">
                            ×{favorite.quantite} • PV: {favorite.pvMax}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {initiative.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                Cliquez sur le bouton pour générer l'ordre d'initiative.
              </div>
            ) : (
              <div className="space-y-2">
                {initiative.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-move ${
                      currentParticipantIndex === index 
                        ? 'border-blue-500 bg-blue-50' 
                        : selectedMonsters.includes(participant.id)
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-blue-300'
                    } ${draggedIndex === index ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (participant.type === 'Monstre') {
                        toggleMonsterSelection(participant.id);
                      } else {
                        setSelectedParticipant(participant);
                      }
                    }}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={e => { e.preventDefault(); handleDragOver(index); }}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="flex-shrink-0 w-12 text-center">
                      {editingInitiative === participant.id ? (
                        <input
                          type="number"
                          value={participant.initiative}
                          onChange={e => updateInitiative(participant.id, e.target.value)}
                          onBlur={() => setEditingInitiative(null)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') setEditingInitiative(null);
                          }}
                          className="w-full p-1 text-center border rounded"
                          autoFocus
                        />
                      ) : (
                        <div 
                          className="font-bold text-lg cursor-pointer hover:text-blue-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingInitiative(participant.id);
                          }}
                        >
                          {participant.initiative}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">Initiative</div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">
                          {participant.nom}
                          {participant.quantite > 1 && (
                            <span className="ml-2 text-sm text-gray-500">
                              (×{participant.quantite})
                            </span>
                          )}
                          {/* Bouton de synchronisation D&D Beyond pour PJ */}
                          {participant.type === 'PJ' && participant.dndbeyondUrl && dndbeyondUrlRegex.test(participant.dndbeyondUrl) && (
                            <button
                              className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs"
                              onClick={e => { e.stopPropagation(); syncPjFromDndBeyond(participant); }}
                              disabled={syncingPjId === participant.id}
                              title="Synchroniser avec D&D Beyond"
                            >
                              {syncingPjId === participant.id ? '⏳' : 'Synchroniser'}
                            </button>
                          )}
                          {syncPjSuccess[participant.id] && <span className="ml-1 text-green-600 text-xs">✓</span>}
                          {syncPjError[participant.id] && <span className="ml-1 text-red-600 text-xs">Erreur</span>}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          participant.type === 'PJ' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {participant.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-1">
                        {participant.avatar && (
                          <img src={participant.avatar} alt="avatar" className="w-6 h-6 rounded-full object-cover" />
                        )}
                        {participant.type === 'PJ' && (
                          <>
                            <span className="text-xs text-gray-500">CA {participant.ca}</span>
                            {participant.classes && <span className="text-xs text-gray-500">{participant.classes}</span>}
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1">
                          <div className="h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 rounded-full bg-green-500"
                              style={{ width: `${(participant.pv / participant.pvMax) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium">
                          {participant.pv}/{participant.pvMax}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {getParticipantConditions(participant.id).map(condition => (
                          <span
                            key={condition.id}
                            className={`px-2 py-0.5 rounded text-xs font-medium bg-${condition.couleur}-100 text-${condition.couleur}-700`}
                          >
                            {condition.nom}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Boutons de gestion des sélections */}
            {selectedMonsters.length > 0 && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={groupSelectedMonsters}
                  disabled={selectedMonsters.length < 2}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Grouper sélection ({selectedMonsters.length})
                </button>
                <button
                  onClick={() => setSelectedMonsters([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Annuler
                </button>
              </div>
            )}
          </section>

          {/* Détails du participant sélectionné */}
          {selectedParticipant && (
            <section className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <h2 className="text-lg font-bold mb-4">Détails de {selectedParticipant.nom}</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Points de vie</div>
                    <div className="flex items-center gap-2">
                      <div className="text-lg font-semibold">{selectedParticipant.pv}/{selectedParticipant.pvMax}</div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => updateParticipantHP(selectedParticipant.id, -5)}
                          className="px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => updateParticipantHP(selectedParticipant.id, 5)}
                          className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                        >
                          +5
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded">
                    <div className="text-sm text-gray-500">Dextérité</div>
                    <div className="text-lg font-semibold">{selectedParticipant.dexterite}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Conditions</h4>
                  <div className="flex flex-wrap gap-2">
                    {CONDITIONS.map(condition => {
                      const hasCondition = getParticipantConditions(selectedParticipant.id)
                        .some(c => c.id === condition.id);
                      return (
                        <button
                          key={condition.id}
                          onClick={() => hasCondition 
                            ? removeCondition(selectedParticipant.id, condition.id)
                            : addCondition(selectedParticipant.id, condition.id)
                          }
                          className={`px-3 py-1 rounded flex items-center gap-2 ${
                            hasCondition
                              ? `bg-${condition.couleur}-100 text-${condition.couleur}-700`
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                          title={condition.description}
                        >
                          {condition.nom}
                          {hasCondition && <X size={14} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Actions rapides</h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => addAction('Attaque')}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Attaque
                    </button>
                    <button
                      onClick={() => addAction('Sort')}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                    >
                      Sort
                    </button>
                    <button
                      onClick={() => addAction('Bonus')}
                      className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    >
                      Action bonus
                    </button>
                    <button
                      onClick={() => addAction('Réaction')}
                      className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                    >
                      Réaction
                    </button>
                  </div>
                </div>

                {selectedParticipant.avatar && (
                  <img src={selectedParticipant.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover mb-2" />
                )}
                {selectedParticipant.type === 'PJ' && (
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-sm text-gray-700">CA : <span className="font-bold">{selectedParticipant.ca}</span></span>
                    {selectedParticipant.classes && <span className="text-sm text-gray-700">Classe(s) : <span className="font-bold">{selectedParticipant.classes}</span></span>}
                    {selectedParticipant.dndbeyondUrl && (
                      <a href={selectedParticipant.dndbeyondUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">Voir la fiche D&D Beyond</a>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Historique d'actions */}
          <section className="bg-white rounded-lg shadow p-4 border border-gray-200">
            <h2 className="text-lg font-bold mb-4">Historique d'actions</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {participantActions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucune action enregistrée</p>
              ) : (
                participantActions.map(action => (
                  <div key={action.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                    <div className="flex-shrink-0 w-16 text-sm text-gray-500">
                      R{action.round}.T{action.turn}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{action.participant}</div>
                      <div className="text-sm text-gray-600">{action.action}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer fixe : Contrôles de tour */}
      <footer className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow flex items-center justify-between px-8 py-3 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={undoLastTurn}
            disabled={turnHistory.length === 0}
            className="px-4 py-2 bg-gray-200 rounded font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Undo2 size={16} />
            UNDO
          </button>
          <button 
            onClick={nextTurn}
            disabled={initiative.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowRight size={16} />
            NEXT
          </button>
        </div>
        <div className="text-lg font-bold text-gray-700">
          Round {currentRound} • Tour {currentTurn}
          {initiative.length > 0 && (
            <span className="ml-4 text-sm font-normal">
              {initiative[currentParticipantIndex]?.nom}
            </span>
          )}
        </div>
        <Link
          to="/"
          className="px-4 py-2 bg-gray-600 text-white rounded font-semibold hover:bg-gray-700 flex items-center gap-2"
        >
          <Home size={16} />
          Retour au menu
        </Link>
      </footer>
    </div>
  );
}