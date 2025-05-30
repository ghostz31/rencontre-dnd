import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Users, Shield, Sword, Heart, Eye, Save, Download, Trash2, Dice6, FileText, Home, SkipForward, AlertCircle, X, Shuffle, Clock } from 'lucide-react';
import { MONSTRES_DATABASE, TYPES_MONSTRE, CRS_DISPONIBLES } from './data/monsters';
import { CONDITIONS_DND } from './data/conditions';
import { RENCONTRES_ALEATOIRES } from './data/rules';
import { calculerDifficulte, genererInitiative } from './utils/encounterUtils';
import { ModalDetailCondition, ModalDetailMonstre } from './components/Modals';
import PlayerGroupsPage from './PlayerGroupsPage';
import CombatPage from './CombatPage';
import { useNavigate, Routes, Route } from 'react-router-dom';
import usePlayerGroups from './hooks/usePlayerGroups';
import './combat/combat.css';
import { ENVIRONNEMENTS, getMonstresAdaptes } from './data/environments';

function AccueilPage() {
  const navigate = useNavigate();
  // Tous les états et useEffect de l'accueil/configuration
  const [nombrePJ, setNombrePJ] = useState(4);
  const [niveauPJ, setNiveauPJ] = useState(1);
  const [rechercheMonster, setRechercheMonster] = useState('');
  const [filtreType, setFiltreType] = useState('Tous');
  const [filtreCR, setFiltreCR] = useState('Tous');
  const [monstresSelectionnes, setMonstresSelectionnes] = useState([]);
  const [initiative, setInitiative] = useState([]);
  const [tourActuel, setTourActuel] = useState(0);
  const [numeroTour, setNumeroTour] = useState(1);
  const [rencontresSauvegardees, setRencontresSauvegardees] = useState([]);
  const [nomRencontre, setNomRencontre] = useState('');
  const [monstreDetailVisible, setMonstreDetailVisible] = useState(null);
  const [showConditionsModal, setShowConditionsModal] = useState(null);
  const [showGenerateurModal, setShowGenerateurModal] = useState(false);
  const [historiqueCombat, setHistoriqueCombat] = useState([]);
  const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
  const { groups: playerGroups, isLoading } = usePlayerGroups();
  const [selectedPlayerGroupId, setSelectedPlayerGroupId] = useState('');
  const selectedPlayerGroup = playerGroups.find(g => g.id === selectedPlayerGroupId);
  const [showGroupesFavoris, setShowGroupesFavoris] = useState(false);

  // Filtrage des monstres
  const monstresFiltrés = MONSTRES_DATABASE.filter(monstre => {
    const matchNom = monstre.nom.toLowerCase().includes(rechercheMonster.toLowerCase());
    const matchType = filtreType === 'Tous' || monstre.type.toLowerCase() === filtreType.toLowerCase();
    const matchCR = filtreCR === 'Tous' || monstre.cr.toString() === filtreCR;
    return matchNom && matchType && matchCR;
  });

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

  const demarrerAffrontement = () => {
    const initListe = [];
    if (selectedPlayerGroup) {
      selectedPlayerGroup.joueurs.forEach((j, idx) => {
        initListe.push({
          id: j.id || `pj-${idx + 1}`,
          nom: j.nom || `Joueur ${idx + 1}`,
          type: 'PJ',
          initiative: j.initiative || 0,
          pv: j.pv || j.pvMax || 20,
          pvMax: j.pvMax || 20,
          ca: j.ca || 10,
          niveau: j.niveau || 1,
          avatar: j.avatar || '',
          classes: j.classes || '',
          concentration: false,
          conditions: []
        });
      });
    } else {
      for (let i = 1; i <= nombrePJ; i++) {
        initListe.push({
          id: `pj-${i}`,
          nom: `Joueur ${i}`,
          type: 'PJ',
          initiative: 0,
          pv: 20 + (niveauPJ * 5),
          pvMax: 20 + (niveauPJ * 5),
          concentration: false,
          conditions: []
        });
      }
    }
    monstresSelectionnes.forEach(monstre => {
      for (let i = 1; i <= monstre.quantite; i++) {
        initListe.push({
          ...monstre,
          id: `${monstre.id}-${i}`,
          nom: monstre.quantite > 1 ? `${monstre.nom} ${i}` : monstre.nom,
          type: 'Monstre',
          initiative: 0,
          pv: monstre.pv !== undefined ? monstre.pv : 15,
          pvMax: monstre.pv !== undefined ? monstre.pv : 15,
          concentration: false,
          conditions: []
        });
      }
    });
    localStorage.setItem('dnd-initiative', JSON.stringify(initListe));
    navigate('/combat');
  };

  console.log('localStorage groupes:', localStorage.getItem('dnd-groupes-joueurs'));

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 max-w-6xl mx-auto">
        {/* En-tête principal */}
        <div className="md:col-span-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Encounter Builder D&D 5e</h1>
              <p className="text-blue-100 text-lg">Créez et gérez vos rencontres en français</p>
            </div>
            <Shield className="w-20 h-20 text-blue-200" />
          </div>
        </div>

        {/* Nouvelle Rencontre - Grande carte */}
        <div className="md:col-span-4 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <button
            onClick={() => navigate('/config')}
            className="w-full h-full"
          >
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-4 rounded-xl">
                <Plus className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Nouvelle Rencontre</h3>
                <p className="text-gray-600">Créez une rencontre de A à Z avec notre outil intuitif</p>
              </div>
            </div>
          </button>
        </div>

        {/* Créer un groupe - Carte moyenne */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <button
            onClick={() => navigate('/groupes')}
            className="w-full h-full"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-indigo-100 p-4 rounded-xl mb-4">
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Créer un groupe</h3>
              <p className="text-gray-600 text-sm">Définir un nouveau groupe de joueurs</p>
            </div>
          </button>
        </div>

        {/* Rencontres Sauvegardées - Carte moyenne */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <button
            onClick={() => navigate('/sauvegardes')}
            className="w-full h-full"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-green-100 p-4 rounded-xl mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Rencontres Sauvegardées</h3>
              <p className="text-gray-600 text-sm">{rencontresSauvegardees.length} rencontre(s)</p>
            </div>
          </button>
        </div>

        {/* Générateur Aléatoire - Carte moyenne */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <button
            onClick={() => navigate('/generateur')}
            className="w-full h-full"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-100 p-4 rounded-xl mb-4">
                <Shuffle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Générateur Aléatoire</h3>
              <p className="text-gray-600 text-sm">Rencontres par environnement</p>
            </div>
          </button>
        </div>

        {/* Historique - Carte moyenne */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow">
          <button
            onClick={() => navigate('/historique')}
            className="w-full h-full"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-amber-100 p-4 rounded-xl mb-4">
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Historique</h3>
              <p className="text-gray-600 text-sm">{historiqueCombat.length} combat(s)</p>
            </div>
          </button>
        </div>

        {/* ... Ajoute ici le reste de ton JSX d'accueil/configuration (filtres, monstres, groupes, etc.) ... */}
      </div>
      {/* ... Ajoute ici les modals, etc. ... */}
    </div>
  );
}

function ConfigPage() {
  // États et logique de la configuration de rencontre
  const [nombrePJ, setNombrePJ] = useState(4);
  const [niveauPJ, setNiveauPJ] = useState(1);
  const [rechercheMonster, setRechercheMonster] = useState('');
  const [filtreType, setFiltreType] = useState('Tous');
  const [filtreCR, setFiltreCR] = useState('Tous');
  const [monstresSelectionnes, setMonstresSelectionnes] = useState([]);
  const [monstreDetailVisible, setMonstreDetailVisible] = useState(null);
  const navigate = useNavigate();
  const { groups: playerGroups, isLoading } = usePlayerGroups();
  const [selectedPlayerGroupId, setSelectedPlayerGroupId] = useState('');
  const selectedPlayerGroup = playerGroups.find(g => g.id === selectedPlayerGroupId);
  const [nomRencontre, setNomRencontre] = useState("");
  const [messageSauvegarde, setMessageSauvegarde] = useState("");

  // Filtrage des monstres
  const monstresFiltres = MONSTRES_DATABASE.filter(monstre => {
    const matchNom = monstre.nom.toLowerCase().includes(rechercheMonster.toLowerCase());
    const matchType = filtreType === 'Tous' || monstre.type.toLowerCase() === filtreType.toLowerCase();
    const matchCR = filtreCR === 'Tous' || monstre.cr.toString() === filtreCR;
    return matchNom && matchType && matchCR;
  });

  const ajouterMonstre = (monstre) => {
    const existant = monstresSelectionnes.find(m => m.id === monstre.id);
    if (existant) {
      setMonstresSelectionnes(prev => prev.map(m => m.id === monstre.id ? { ...m, quantite: m.quantite + 1 } : m));
    } else {
      setMonstresSelectionnes(prev => [...prev, { ...monstre, quantite: 1 }]);
    }
  };

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

  const demarrerAffrontement = () => {
    const initListe = [];
    if (selectedPlayerGroup) {
      selectedPlayerGroup.joueurs.forEach((j, idx) => {
        initListe.push({
          id: j.id || `pj-${idx + 1}`,
          nom: j.nom || `Joueur ${idx + 1}`,
          type: 'PJ',
          initiative: j.initiative || 0,
          pv: j.pv || j.pvMax || 20,
          pvMax: j.pvMax || 20,
          ca: j.ca || 10,
          niveau: j.niveau || 1,
          avatar: j.avatar || '',
          classes: j.classes || '',
          concentration: false,
          conditions: []
        });
      });
    } else {
      for (let i = 1; i <= nombrePJ; i++) {
        initListe.push({
          id: `pj-${i}`,
          nom: `Joueur ${i}`,
          type: 'PJ',
          initiative: 0,
          pv: 20 + (niveauPJ * 5),
          pvMax: 20 + (niveauPJ * 5),
          concentration: false,
          conditions: []
        });
      }
    }
    monstresSelectionnes.forEach(monstre => {
      for (let i = 1; i <= monstre.quantite; i++) {
        initListe.push({
          ...monstre,
          id: `${monstre.id}-${i}`,
          nom: monstre.quantite > 1 ? `${monstre.nom} ${i}` : monstre.nom,
          type: 'Monstre',
          initiative: 0,
          pv: monstre.pv !== undefined ? monstre.pv : 15,
          pvMax: monstre.pv !== undefined ? monstre.pv : 15,
          concentration: false,
          conditions: []
        });
      }
    });
    localStorage.setItem('dnd-initiative', JSON.stringify(initListe));
    navigate('/combat');
  };

  // Nouvelle fonction de sauvegarde
  const sauvegarderRencontre = () => {
    if (!nomRencontre.trim()) {
      setMessageSauvegarde("Veuillez donner un nom à la rencontre.");
      return;
    }
    const rencontre = {
      id: Date.now(),
      nom: nomRencontre,
      nombrePJ,
      niveauPJ,
      monstres: monstresSelectionnes,
      groupe: selectedPlayerGroup || null,
      dateCreation: new Date().toLocaleString(),
    };
    const existantes = JSON.parse(localStorage.getItem('dnd-rencontres') || '[]');
    localStorage.setItem('dnd-rencontres', JSON.stringify([...existantes, rencontre]));
    setMessageSauvegarde("Rencontre sauvegardée !");
    setNomRencontre("");
    setTimeout(() => setMessageSauvegarde(""), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center">
          <Home className="mr-2" size={16} /> Retour au menu
        </button>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Configuration de la rencontre</h1>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Configuration groupe */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Users className="mr-2" /> Groupe
          </h2>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Chargement des groupes...</div>
          ) : (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Sélectionner un groupe de joueurs</label>
                <select
                  value={selectedPlayerGroupId}
                  onChange={e => setSelectedPlayerGroupId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">-- Aucun groupe sélectionné --</option>
                  {playerGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.nom}</option>
                  ))}
                </select>
              </div>
              {selectedPlayerGroup ? (
                <div className="space-y-2 mb-2">
                  {selectedPlayerGroup.joueurs.map(j => (
                    <div key={j.id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1">
                      <span className="font-medium">{j.nom}</span>
                      <span className="text-xs text-gray-500">Niv {j.niveau}</span>
                      <span className="text-xs text-gray-500">PV {j.pv}/{j.pvMax}</span>
                      <span className="text-xs text-gray-500">CA {j.ca}</span>
                    </div>
                  ))}
                  <button
                    className="mt-2 px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-xs"
                    onClick={() => setSelectedPlayerGroupId('')}
                  >
                    Désélectionner
                  </button>
                </div>
              ) : (
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
              )}
            </>
          )}
        </div>
        {/* Recherche monstres */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Search className="mr-2" /> Monstres
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={rechercheMonster}
              onChange={e => setRechercheMonster(e.target.value)}
              className="p-2 border rounded-md"
            />
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
          <div className="max-h-96 overflow-y-auto">
            {monstresFiltres.map(monstre => (
              <div key={monstre.id} className="flex items-center justify-between p-3 border-b hover:bg-gray-50">
                <div className="flex-1">
                  <div className="font-medium">{monstre.nom}</div>
                  <div className="text-sm text-gray-500">
                    CR {monstre.cr} • {monstre.xp} XP • {monstre.type}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setMonstreDetailVisible(monstre)}
                    className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => ajouterMonstre(monstre)}
                    className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Rencontre */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Sword className="mr-2" /> Rencontre
          </h2>
          {monstresSelectionnes.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucun monstre sélectionné</p>
          ) : (
            <div className="space-y-2">
              {monstresSelectionnes.map(monstre => (
                <div key={monstre.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium">{monstre.nom}</div>
                    <div className="text-sm text-gray-500">
                      CR {monstre.cr} • Quantité: {monstre.quantite}
                    </div>
                  </div>
                  <button
                    onClick={() => retirerMonstre(monstre.id)}
                    className="bg-red-500 text-white p-1 rounded hover:bg-red-600"
                  >
                    <Minus size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
          {monstresSelectionnes.length > 0 && (
            <>
              <div className="my-4">
                <label className="block text-sm font-medium mb-1">Nom de la rencontre</label>
                <input
                  type="text"
                  value={nomRencontre}
                  onChange={e => setNomRencontre(e.target.value)}
                  className="w-full p-2 border rounded-md mb-2"
                  placeholder="Ex: Orcs embusqués dans la forêt"
                />
                <button
                  onClick={sauvegarderRencontre}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold mb-2"
                >
                  Sauvegarder la rencontre
                </button>
                {messageSauvegarde && (
                  <div className="text-green-700 text-sm mt-1">{messageSauvegarde}</div>
                )}
              </div>
              <button
                onClick={demarrerAffrontement}
                className="w-full mt-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold"
              >
                Démarrer l'Affrontement
              </button>
            </>
          )}
        </div>
      </div>
      {/* Modal détail monstre */}
      {monstreDetailVisible && (
        <ModalDetailMonstre
          monstre={monstreDetailVisible}
          onClose={() => setMonstreDetailVisible(null)}
        />
      )}
    </div>
  );
}

function SauvegardesPage() {
  console.log('SauvegardesPage monté');
  const [rencontresSauvegardees, setRencontresSauvegardees] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('dnd-rencontres') || '[]');
    setRencontresSauvegardees(data);
  }, []);

  const jouerRencontre = (rencontre) => {
    // Génère la liste des participants comme dans demarrerAffrontement
    const initListe = [];
    if (rencontre.groupe && rencontre.groupe.joueurs) {
      rencontre.groupe.joueurs.forEach((j, idx) => {
        initListe.push({
          id: j.id || `pj-${idx + 1}`,
          nom: j.nom || `Joueur ${idx + 1}`,
          type: 'PJ',
          initiative: j.initiative || 0,
          pv: j.pv || j.pvMax || 20,
          pvMax: j.pvMax || 20,
          ca: j.ca || 10,
          niveau: j.niveau || 1,
          avatar: j.avatar || '',
          classes: j.classes || '',
          concentration: false,
          conditions: []
        });
      });
    } else {
      for (let i = 1; i <= rencontre.nombrePJ; i++) {
        initListe.push({
          id: `pj-${i}`,
          nom: `Joueur ${i}`,
          type: 'PJ',
          initiative: 0,
          pv: 20 + (rencontre.niveauPJ * 5),
          pvMax: 20 + (rencontre.niveauPJ * 5),
          concentration: false,
          conditions: []
        });
      }
    }
    // DEBUG : afficher les monstres de la rencontre
    alert('Jouer rencontre !');
    console.log('Rencontre complète:', rencontre);
    console.log('Monstres de la rencontre:', rencontre.monstres);
    rencontre.monstres.forEach(monstre => {
      for (let i = 1; i <= monstre.quantite; i++) {
        initListe.push({
          ...monstre,
          id: `${monstre.id}-${i}`,
          nom: monstre.quantite > 1 ? `${monstre.nom} ${i}` : monstre.nom,
          type: 'Monstre',
          initiative: 0,
          pv: monstre.pv !== undefined ? monstre.pv : 15,
          pvMax: monstre.pv !== undefined ? monstre.pv : 15,
          concentration: false,
          conditions: []
        });
      }
    });
    localStorage.setItem('dnd-initiative', JSON.stringify(initListe));
    navigate('/combat');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center">
          <Home className="mr-2" size={16} /> Retour au menu
        </button>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Rencontres Sauvegardées</h1>
      </div>
      {rencontresSauvegardees.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune rencontre sauvegardée</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rencontresSauvegardees.map(rencontre => (
            <div key={rencontre.id} className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{rencontre.nom}</h3>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div>👥 {rencontre.nombrePJ} PJ niveau {rencontre.niveauPJ}</div>
                <div>👹 {rencontre.monstres.length} type(s) de monstre</div>
                <div>📅 {rencontre.dateCreation}</div>
              </div>
              {console.log('Bouton Jouer rendu pour', rencontre.nom)}
              <div className="flex space-x-2">
                <button
                  onClick={() => jouerRencontre(rencontre)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 font-semibold"
                >
                  Jouer
                </button>
                <button
                  onClick={() => {
                    const nouvelles = rencontresSauvegardees.filter(r => r.id !== rencontre.id);
                    setRencontresSauvegardees(nouvelles);
                    localStorage.setItem('dnd-rencontres', JSON.stringify(nouvelles));
                  }}
                  className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function GenerateurPage() {
  const navigate = useNavigate();
  const { groups: playerGroups, isLoading } = usePlayerGroups();
  const envKeys = Object.keys(ENVIRONNEMENTS);
  const [selectedPlayerGroupId, setSelectedPlayerGroupId] = useState('');
  const selectedPlayerGroup = playerGroups.find(g => g.id === selectedPlayerGroupId);
  const [env, setEnv] = useState(envKeys[0] || 'Forêt');
  const [diff, setDiff] = useState('Moyenne');
  const [nombrePJ, setNombrePJ] = useState(4);
  const [niveauPJ, setNiveauPJ] = useState(3);
  const [rencontreGeneree, setRencontreGeneree] = useState(null);
  const [nomRencontre, setNomRencontre] = useState("");
  const [message, setMessage] = useState("");

  // Calcule le niveau moyen du groupe sélectionné
  const niveauMoyenGroupe = selectedPlayerGroup && selectedPlayerGroup.joueurs.length > 0
    ? Math.round(selectedPlayerGroup.joueurs.reduce((acc, j) => acc + (j.niveau || 1), 0) / selectedPlayerGroup.joueurs.length)
    : niveauPJ;
  const nbPJGroupe = selectedPlayerGroup ? selectedPlayerGroup.joueurs.length : nombrePJ;

  // Génère une rencontre aléatoire adaptée
  const genererRencontre = () => {
    const resultat = getMonstresAdaptes(env, niveauMoyenGroupe, diff);
    console.log('Rencontre générée:', resultat);
    setRencontreGeneree({
      monstres: resultat.monstres,
      xpTotal: resultat.xpTotal,
      env,
      diff,
      nombrePJ: nbPJGroupe,
      niveauPJ: niveauMoyenGroupe,
      dateCreation: new Date().toLocaleString(),
      groupe: selectedPlayerGroup || null,
      description: resultat.description
    });
  };

  // Sauvegarde la rencontre générée
  const sauvegarderRencontre = () => {
    if (!nomRencontre.trim() || !rencontreGeneree) {
      setMessage("Donnez un nom à la rencontre générée.");
      return;
    }
    console.log('Monstres sauvegardés:', rencontreGeneree.monstres);
    const rencontre = {
      id: Date.now(),
      nom: nomRencontre,
      nombrePJ: nbPJGroupe,
      niveauPJ: niveauMoyenGroupe,
      monstres: rencontreGeneree.monstres,
      groupe: selectedPlayerGroup || null,
      dateCreation: rencontreGeneree.dateCreation,
    };
    const existantes = JSON.parse(localStorage.getItem('dnd-rencontres') || '[]');
    localStorage.setItem('dnd-rencontres', JSON.stringify([...existantes, rencontre]));
    setMessage("Rencontre sauvegardée !");
    setNomRencontre("");
    setTimeout(() => setMessage(""), 2500);
  };

  // Joue la rencontre générée
  const jouerRencontre = () => {
    if (!rencontreGeneree) return;
    // Génère la liste des participants (PJ + monstres)
    const initListe = [];
    if (selectedPlayerGroup && selectedPlayerGroup.joueurs.length > 0) {
      selectedPlayerGroup.joueurs.forEach((j, idx) => {
        initListe.push({
          id: j.id || `pj-${idx + 1}`,
          nom: j.nom || `Joueur ${idx + 1}`,
          type: 'PJ',
          initiative: j.initiative || 0,
          pv: j.pv || j.pvMax || 20,
          pvMax: j.pvMax || 20,
          ca: j.ca || 10,
          niveau: j.niveau || 1,
          avatar: j.avatar || '',
          classes: j.classes || '',
          concentration: false,
          conditions: []
        });
      });
    } else {
      for (let i = 1; i <= nbPJGroupe; i++) {
        initListe.push({
          id: `pj-${i}`,
          nom: `Joueur ${i}`,
          type: 'PJ',
          initiative: 0,
          pv: 20 + (niveauMoyenGroupe * 5),
          pvMax: 20 + (niveauMoyenGroupe * 5),
          concentration: false,
          conditions: []
        });
      }
    }
    rencontreGeneree.monstres.forEach(monstre => {
      for (let i = 1; i <= monstre.quantite; i++) {
        initListe.push({
          ...monstre,
          id: `${monstre.id}-${i}`,
          nom: monstre.quantite > 1 ? `${monstre.nom} ${i}` : monstre.nom,
          type: 'Monstre',
          initiative: 0,
          pv: monstre.pv !== undefined ? monstre.pv : 15,
          pvMax: monstre.pv !== undefined ? monstre.pv : 15,
          concentration: false,
          conditions: []
        });
      }
    });
    localStorage.setItem('dnd-initiative', JSON.stringify(initListe));
    navigate('/combat');
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center">
          <Home className="mr-2" size={16} /> Retour au menu
        </button>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Générateur de Rencontres</h1>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Groupe de joueurs</label>
          <select
            value={selectedPlayerGroupId}
            onChange={e => setSelectedPlayerGroupId(e.target.value)}
            className="w-full p-2 border rounded-md mb-2"
          >
            <option value="">-- Aucun groupe sélectionné --</option>
            {playerGroups.map(g => (
              <option key={g.id} value={g.id}>{g.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Environnement</label>
          <select className="w-full p-2 border rounded-md" value={env} onChange={e => setEnv(e.target.value)}>
            {envKeys.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <p className="text-sm text-gray-600 mt-1">{ENVIRONNEMENTS[env] ? ENVIRONNEMENTS[env].description : ''}</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Difficulté</label>
          <select className="w-full p-2 border rounded-md" value={diff} onChange={e => setDiff(e.target.value)}>
            <option value="Faible">Faible</option>
            <option value="Moyenne">Moyenne</option>
            <option value="Difficile">Difficile</option>
            <option value="Mortelle">Mortelle</option>
          </select>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Nombre de PJ</label>
            <input type="number" min={1} max={8} value={nbPJGroupe} onChange={e => setNombrePJ(Number(e.target.value))} className="w-full p-2 border rounded-md" disabled={!!selectedPlayerGroup} readOnly={!!selectedPlayerGroup} />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Niveau des PJ</label>
            <input type="number" min={1} max={20} value={niveauMoyenGroupe} onChange={e => setNiveauPJ(Number(e.target.value))} className="w-full p-2 border rounded-md" disabled={!!selectedPlayerGroup} readOnly={!!selectedPlayerGroup} />
          </div>
        </div>
        <button onClick={genererRencontre} className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 font-semibold mt-2">Générer</button>
        {rencontreGeneree && (
          <div className="mt-6 bg-white rounded-lg shadow p-4">
            <h2 className="text-lg font-bold mb-2">Rencontre générée</h2>
            <div className="mb-2 text-sm text-gray-600">
              <p className="italic mb-2">{rencontreGeneree.description}</p>
              <p>Environnement : <b>{env}</b> • Difficulté : <b>{diff}</b> • XP total : <b>{rencontreGeneree.xpTotal}</b></p>
            </div>
            <div className="space-y-2 mb-2">
              {rencontreGeneree.monstres.map(m => (
                <div key={m.id} className="flex items-center justify-between border-b pb-1">
                  <span>{m.nom} <span className="text-xs text-gray-500">(CR {m.cr})</span></span>
                  <span className="font-mono">x{m.quantite}</span>
                  <span className="text-xs text-gray-500">{m.xp} XP</span>
                </div>
              ))}
            </div>
            <div className="my-2">
              <label className="block text-sm font-medium mb-1">Nom de la rencontre</label>
              <input
                type="text"
                value={nomRencontre}
                onChange={e => setNomRencontre(e.target.value)}
                className="w-full p-2 border rounded-md mb-2"
                placeholder="Ex: Embuscade dans la forêt sombre"
              />
              <button
                onClick={sauvegarderRencontre}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold mb-2"
              >
                Sauvegarder la rencontre
              </button>
              {message && (
                <div className="text-green-700 text-sm mt-1">{message}</div>
              )}
            </div>
            <button
              onClick={jouerRencontre}
              className="w-full mt-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              Jouer cette rencontre
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function HistoriquePage() {
  const [historiqueCombat, setHistoriqueCombat] = useState([]);
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center">
          <Home className="mr-2" size={16} /> Retour au menu
        </button>
      </div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Historique des Combats</h1>
      </div>
      {historiqueCombat.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucun combat enregistré</p>
      ) : (
        <div className="space-y-3">
          {historiqueCombat.map((entree, idx) => (
            <div key={idx} className="border rounded p-3">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{entree.rencontre || 'Combat'}</h4>
                <span className="text-xs text-gray-500">{entree.date}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Round final : {entree.round}</div>
                <div>Participants : {entree.participants && entree.participants.map(p => p.nom).join(', ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EncounterBuilder() {
  return (
    <Routes>
      <Route path="/" element={<AccueilPage />} />
      <Route path="/config" element={<ConfigPage />} />
      <Route path="/groupes" element={<PlayerGroupsPage showFavorites={false} />} />
      <Route path="/sauvegardes" element={<SauvegardesPage />} />
      <Route path="/generateur" element={<GenerateurPage />} />
      <Route path="/historique" element={<HistoriquePage />} />
      <Route path="/combat" element={<CombatPage />} />
    </Routes>
  );
}

export default EncounterBuilder; 