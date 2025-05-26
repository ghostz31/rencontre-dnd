import React, { useState, useEffect, useRef } from 'react';
import usePlayerGroups from './hooks/usePlayerGroups';
import { Plus, Trash2, Edit, Save, User, Users, Star, Home, Pencil, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function emptyPlayer() {
  return {
    id: Date.now() + '-' + Math.random(),
    nom: '',
    pvMax: '',
    pv: '',
    ca: '',
    classes: '',
  };
}

function emptyGroup() {
  return { id: Date.now() + '-' + Math.random(), nom: '', joueurs: [emptyPlayer()], dateCreation: new Date().toISOString(), dateMaj: new Date().toISOString() };
}

const dndbeyondUrlRegex = /^https?:\/\/(www\.)?dndbeyond\.com\/characters\/[0-9]+/i;

export default function PlayerGroupsPage({ showFavorites = false }) {
  const navigate = useNavigate();
  const {
    groups,
    addGroup,
    updateGroup,
    deleteGroup,
    favoriteGroups,
    toggleFavorite
  } = usePlayerGroups();
  const [editingGroup, setEditingGroup] = useState(null);
  const [editing, setEditing] = useState(false);
  const [syncingPlayerId, setSyncingPlayerId] = useState(null);
  const [syncError, setSyncError] = useState({});
  const [syncSuccess, setSyncSuccess] = useState({});
  const [importJson, setImportJson] = useState({});
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(showFavorites);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [newGroup, setNewGroup] = useState({
    nom: '',
    joueurs: []
  });
  const [newPlayer, setNewPlayer] = useState({
    nom: '',
    classe: '',
    niveau: 1
  });

  const autoSaveTimeout = useRef();

  // Filtrage des groupes
  const filteredGroups = showOnlyFavorites
    ? groups.filter(group => favoriteGroups.includes(group.id))
    : groups;

  // Ajout/édition/suppression via l'API du hook
  const handleSaveGroup = (group) => {
    if (!group.nom.trim() || group.joueurs.length === 0) return;
    group.dateMaj = new Date().toISOString();
    if (!group.dateCreation) {
      group.dateCreation = new Date().toISOString();
    }
    if (groups.some(g => g.id === group.id)) {
      updateGroup(group);
    } else {
      addGroup(group);
    }
    setEditingGroup(null);
    setEditing(false);
  };

  const handleDeleteGroup = (groupId) => {
    if (!window.confirm('Supprimer ce groupe ?')) return;
    deleteGroup(groupId);
    setEditingGroup(null);
    setEditing(false);
  };

  // Favoris
  const handleToggleFavorite = (groupId) => {
    toggleFavorite(groupId);
  };

  const handleEditGroup = (group) => {
    setEditingGroup({ ...group, joueurs: group.joueurs.map(j => ({ ...j })) });
    setEditing(true);
  };

  const handleAddPlayer = () => {
    setEditingGroup({ ...editingGroup, joueurs: [...editingGroup.joueurs, emptyPlayer()] });
  };

  const handleRemovePlayer = (playerId) => {
    setEditingGroup({ ...editingGroup, joueurs: editingGroup.joueurs.filter(j => j.id !== playerId) });
  };

  const handlePlayerChange = (playerId, field, value) => {
    setEditingGroup({
      ...editingGroup,
      joueurs: editingGroup.joueurs.map(j =>
        j.id === playerId ? { ...j, [field]: value } : j
      )
    });
  };

  const syncPlayerFromDndBeyond = async (playerId, url) => {
    setSyncingPlayerId(playerId);
    setSyncError({});
    setSyncSuccess({});
    try {
      const res = await fetch(`http://localhost:4000/dndbeyond?url=${encodeURIComponent(url)}`);
      if (!res.ok) throw new Error('Erreur lors de la récupération');
      const data = await res.json();
      setEditingGroup(prev => ({
        ...prev,
        joueurs: prev.joueurs.map(j =>
          j.id === playerId
            ? {
                ...j,
                nom: data.name || j.nom,
                pvMax: data.hp || j.pvMax,
                pv: data.hpCurrent || data.hp || j.pv,
                ca: data.ac || j.ca,
                classes: data.classes || j.classes,
              }
            : j
        )
      }));
      setSyncSuccess({ [playerId]: true });
    } catch (err) {
      setSyncError({ [playerId]: true });
    } finally {
      setSyncingPlayerId(null);
    }
  };

  const handleImportDndBeyondJson = (playerId, jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const updatedGroup = {
        ...editingGroup,
        joueurs: editingGroup.joueurs.map(j =>
          j.id === playerId
            ? {
                ...j,
                nom: data.name || j.nom,
                pvMax: parseInt(data.hp) || j.pvMax,
                pv: parseInt(data.hpCurrent) || parseInt(data.hp) || j.pv,
                ca: parseInt(data.ac) || j.ca,
                classes: data.classes || j.classes,
                niveau: data.level || j.niveau,
                dateImport: new Date().toISOString()
              }
            : j
        )
      };

      // Mettre à jour le groupe
      setEditingGroup(updatedGroup);

      // Sauvegarder les données JSON importées
      const updatedImportJson = {
        ...importJson,
        [playerId]: {
          json: jsonString,
          dateImport: new Date().toISOString()
        }
      };
      setImportJson(updatedImportJson);
    } catch (e) {
      alert('JSON invalide');
    }
  };

  const handleGroupClick = (groupe) => {
    setSelectedGroup(groupe);
    setShowGroupDetails(true);
  };

  const handleUpdateGroup = (updatedGroup) => {
    const updatedGroups = groups.map(g => 
      g.id === updatedGroup.id ? updatedGroup : g
    );
    updateGroup(updatedGroup);
    setShowGroupDetails(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users /> 
          {showOnlyFavorites ? 'Groupes favoris' : 'Groupes de joueurs'}
        </h1>
        <button
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            showOnlyFavorites 
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Star size={18} fill={showOnlyFavorites ? "currentColor" : "none"} />
          {showOnlyFavorites ? 'Voir tous les groupes' : 'Voir les favoris'}
        </button>
      </div>

      {!editing && (
        <>
          {!showOnlyFavorites && (
            <button
              className="mb-4 px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700"
              onClick={() => { setEditingGroup(emptyGroup()); setEditing(true); }}
            >
              <Plus size={18} /> Nouveau groupe
            </button>
          )}
          <div className="grid gap-4">
            {filteredGroups.length === 0 && (
              <div className="text-gray-500 text-center py-8">
                {showOnlyFavorites 
                  ? "Aucun groupe favori. Cliquez sur l'étoile à côté d'un groupe pour l'ajouter aux favoris."
                  : "Aucun groupe enregistré."}
              </div>
            )}
            {filteredGroups.map(groupe => (
              <div 
                key={groupe.id} 
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleGroupClick(groupe)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{groupe.nom}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(groupe.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Star
                        size={20}
                        className={favoriteGroups.includes(groupe.id) ? "text-yellow-400 fill-yellow-400" : "text-gray-400"}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditGroup(groupe);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Pencil size={20} className="text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteGroup(groupe.id);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Trash2 size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {groupe.joueurs.length} joueur(s)
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {editing && editingGroup && (
        <div className="bg-white rounded shadow p-6 border border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom du groupe</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={editingGroup.nom}
              onChange={e => setEditingGroup({ ...editingGroup, nom: e.target.value })}
              placeholder="Nom du groupe"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Joueurs</label>
            <div className="space-y-3">
              {editingGroup.joueurs.map((joueur, idx) => (
                <div key={joueur.id} className="flex flex-row items-end gap-4 bg-gray-50 p-2 rounded">
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Nom du joueur</label>
                    <input
                      type="text"
                      className="p-2 border rounded w-32"
                      value={joueur.nom}
                      onChange={e => handlePlayerChange(joueur.id, 'nom', e.target.value)}
                      placeholder={`Nom du joueur`}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Classe(s)</label>
                    <input
                      type="text"
                      className="p-2 border rounded w-32"
                      value={joueur.classes || ''}
                      onChange={e => handlePlayerChange(joueur.id, 'classes', e.target.value)}
                      placeholder="Classe(s)"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-600 mb-1">CA</label>
                    <input
                      type="number"
                      min={0}
                      className="p-2 border rounded w-16"
                      value={joueur.ca || ''}
                      onChange={e => handlePlayerChange(joueur.id, 'ca', parseInt(e.target.value) || '')}
                      placeholder="CA"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-600 mb-1">PV max</label>
                    <input
                      type="number"
                      min={1}
                      className="p-2 border rounded w-24"
                      value={joueur.pvMax || ''}
                      onChange={e => handlePlayerChange(joueur.id, 'pvMax', parseInt(e.target.value) || '')}
                      placeholder="PV max"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-xs font-medium text-gray-600 mb-1">PV</label>
                    <input
                      type="number"
                      min={0}
                      className="p-2 border rounded w-20"
                      value={joueur.pv || ''}
                      onChange={e => handlePlayerChange(joueur.id, 'pv', parseInt(e.target.value) || '')}
                      placeholder="PV"
                    />
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    <button
                      className="px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-xs"
                      onClick={() => {
                        const json = prompt('Collez ici le JSON extrait depuis la fiche D&D Beyond (via le bookmarklet) :', importJson[joueur.id]?.json || '');
                        if (json) handleImportDndBeyondJson(joueur.id, json);
                      }}
                      title="Importer JSON D&D Beyond"
                    >
                      Importer JSON
                    </button>
                    {importJson[joueur.id] && (
                      <button
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
                        onClick={() => alert(importJson[joueur.id].json)}
                        title="Voir le dernier JSON importé"
                      >
                        Voir dernier JSON
                      </button>
                    )}
                    <button className="p-1 bg-red-100 rounded hover:bg-red-300 mt-1" onClick={() => handleRemovePlayer(joueur.id)} title="Retirer"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-3 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 flex items-center gap-1" onClick={handleAddPlayer}><Plus size={14} /> Ajouter un joueur</button>
          </div>
          <div className="flex gap-2 mt-4">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2" onClick={() => handleSaveGroup(editingGroup)}><Save size={16} /> Sauvegarder</button>
            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400" onClick={() => { setEditingGroup(null); setEditing(false); }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Modal Détails du Groupe */}
      {showGroupDetails && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Détails du Groupe</h3>
              <button onClick={() => setShowGroupDetails(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom du groupe</label>
                <input
                  type="text"
                  value={selectedGroup.nom}
                  onChange={(e) => setSelectedGroup({...selectedGroup, nom: e.target.value})}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div>
                <h4 className="font-medium mb-2">Joueurs</h4>
                <div className="space-y-2">
                  {selectedGroup.joueurs.map((joueur, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="flex-1">
                        <div className="font-medium">{joueur.nom}</div>
                        <div className="text-sm text-gray-600">
                          {joueur.classes} niveau {joueur.niveau}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const updatedJoueurs = selectedGroup.joueurs.filter((_, i) => i !== index);
                          setSelectedGroup({...selectedGroup, joueurs: updatedJoueurs});
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowGroupDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                >
                  Annuler
                </button>
                <button
                  onClick={() => handleUpdateGroup(selectedGroup)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton retour au menu */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2 shadow-lg"
        >
          <Home size={18} />
          Retour au menu
        </button>
      </div>
    </div>
  );
} 