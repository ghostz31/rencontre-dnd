import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Save, Trash2, Heart, ArrowLeft, RefreshCw } from 'lucide-react';
import usePlayerGroups from './hooks/usePlayerGroups';
import './combat/combat.css';

// Fonction utilitaire pour extraire le niveau depuis la chaîne de classes
function extractLevelFromClasses(classesString) {
  if (!classesString) return 1;
  
  // Recherche d'un nombre dans la chaîne (ex: "Paladin 8" -> 8)
  const match = classesString.match(/\d+/);
  return match ? parseInt(match[0]) : 1;
}

export default function PlayerGroupsPage() {
  const navigate = useNavigate();
  const {
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
  } = usePlayerGroups();

  const [editingGroup, setEditingGroup] = useState(null);
  const [editingPlayer, setEditingPlayer] = useState(null);

  // Gestion des groupes
  const handleAddGroup = useCallback(() => {
    const newGroup = createEmptyGroup();
    addGroup(newGroup);
    setEditingGroup(newGroup.id);
  }, [addGroup, createEmptyGroup]);

  const handleSaveGroup = useCallback((group) => {
    if (!group.nom.trim()) return;
    updateGroup(group);
    setEditingGroup(null);
  }, [updateGroup]);

  const handleDeleteGroup = useCallback((groupId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce groupe ?')) {
      deleteGroup(groupId);
    }
  }, [deleteGroup]);

  // Gestion des joueurs
  const handleAddPlayer = useCallback((groupId) => {
    addPlayerToGroup(groupId);
  }, [addPlayerToGroup]);

  const handleRemovePlayer = useCallback((groupId, playerId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce joueur ?')) {
      removePlayerFromGroup(groupId, playerId);
    }
  }, [removePlayerFromGroup]);

  const handleUpdatePlayer = useCallback((groupId, playerId, updates) => {
    updatePlayer(groupId, playerId, updates);
  }, [updatePlayer]);

  // Fonction pour parser le JSON et mettre à jour les informations du joueur
  const handleJsonUpdate = useCallback((groupId, playerId, jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      const classes = data.classes || '';
      const updates = {
        json: jsonString,
        nom: data.name || '',
        niveau: extractLevelFromClasses(classes),
        pvMax: data.hp || 20,
        pv: data.hpCurrent || data.hp || 20,
        ca: data.ac || 10,
        initiative: data.initiative || 0,
        classes: classes
      };
      updatePlayer(groupId, playerId, updates);
    } catch (error) {
      console.error('Erreur lors du parsing du JSON:', error);
      // En cas d'erreur, on sauvegarde juste le JSON brut
      updatePlayer(groupId, playerId, { json: jsonString });
    }
  }, [updatePlayer]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-600">Chargement des groupes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Groupes de joueurs</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Retour
            </button>
            <button
              onClick={handleAddGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus size={16} />
              Nouveau groupe
            </button>
          </div>
        </div>

        {/* Liste des groupes */}
        <div className="space-y-6">
          {groups.map(group => (
            <div key={group.id} className="bg-white rounded-lg shadow p-6">
              {/* En-tête du groupe */}
              <div className="flex items-center justify-between mb-4">
                {editingGroup === group.id ? (
                  <input
                    type="text"
                    value={group.nom}
                    onChange={e => updateGroup({ ...group, nom: e.target.value })}
                    onBlur={() => handleSaveGroup(group)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleSaveGroup(group);
                    }}
                    className="text-xl font-bold border-b-2 border-blue-500 focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold">{group.nom}</h2>
                    <button
                      onClick={() => setEditingGroup(group.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✏️
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(group.id)}
                    className={`p-2 rounded-full ${
                      favoriteGroups.includes(group.id)
                        ? 'text-red-500 hover:text-red-600'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Heart size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-full"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Liste des joueurs */}
              <div className="space-y-4">
                {group.joueurs.map(player => (
                  <div key={player.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {editingPlayer === player.id ? (
                      <div className="flex-1 grid grid-cols-2 gap-4">
                        <input
                          type="text"
                          value={player.nom}
                          onChange={e => handleUpdatePlayer(group.id, player.id, { nom: e.target.value })}
                          placeholder="Nom du joueur"
                          className="p-2 border rounded"
                        />
                        <input
                          type="number"
                          value={player.niveau}
                          onChange={e => handleUpdatePlayer(group.id, player.id, { niveau: parseInt(e.target.value) || 1 })}
                          placeholder="Niveau"
                          className="p-2 border rounded"
                        />
                        <input
                          type="number"
                          value={player.pvMax}
                          onChange={e => handleUpdatePlayer(group.id, player.id, { 
                            pvMax: parseInt(e.target.value) || 20,
                          })}
                          placeholder="PV max"
                          className="p-2 border rounded"
                        />
                        <input
                          type="text"
                          value={player.dndbeyondUrl || ''}
                          onChange={e => handleUpdatePlayer(group.id, player.id, { dndbeyondUrl: e.target.value })}
                          placeholder="Lien DND Beyond"
                          className="p-2 border rounded col-span-2"
                        />
                        <input
                          type="number"
                          value={player.ca}
                          onChange={e => handleUpdatePlayer(group.id, player.id, { ca: parseInt(e.target.value) || 10 })}
                          placeholder="CA"
                          className="p-2 border rounded"
                        />
                        <input
                          type="text"
                          value={player.classes}
                          onChange={e => handleUpdatePlayer(group.id, player.id, { classes: e.target.value })}
                          placeholder="Classes"
                          className="p-2 border rounded"
                        />
                        <textarea
                          value={player.json || ''}
                          onChange={e => handleJsonUpdate(group.id, player.id, e.target.value)}
                          placeholder="JSON du personnage"
                          className="p-2 border rounded h-24 resize-none"
                        />
                        <div className="col-span-2 flex justify-end gap-2">
                          {player.json && (
                            <button
                              onClick={() => handleJsonUpdate(group.id, player.id, player.json)}
                              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
                              title="Mettre à jour les informations depuis le JSON"
                            >
                              <RefreshCw size={16} />
                              Mettre à jour
                            </button>
                          )}
                          <button
                            onClick={() => setEditingPlayer(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                          >
                            Annuler
                          </button>
                          <button
                            onClick={() => setEditingPlayer(null)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
                          >
                            <Save size={16} />
                            Enregistrer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium">{player.nom || 'Joueur sans nom'}</div>
                          <div className="text-sm text-gray-500">
                            Niv {player.niveau} • PV {player.pv}/{player.pvMax} • CA {player.ca}
                            {player.classes && ` • ${player.classes}`}
                            {player.json && <span className="ml-2 text-blue-500">[JSON]</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingPlayer(player.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleRemovePlayer(group.id, player.id)}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-full"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {/* Bouton pour ajouter un joueur */}
                <button
                  onClick={() => handleAddPlayer(group.id)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Ajouter un joueur
                </button>
              </div>
            </div>
          ))}

          {/* Message si aucun groupe */}
          {groups.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500 mb-4">Aucun groupe de joueurs</p>
              <button
                onClick={handleAddGroup}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <Plus size={16} />
                Créer un groupe
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 