import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Sword, Heart, Eye, 
  SkipForward, AlertCircle, X, Clock,
  ChevronLeft, ChevronRight, Plus, Minus, Edit, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Liste des conditions D&D 5e (exemple)
const CONDITIONS_DND = [
  'Aveuglé', 'Assourdi', 'Charmé', 'Effrayé', 'Empoisonné', 'Entravé',
  'Etourdi', 'Grapplé', 'Inconscient', 'Invisible', 'Paralysé', 'Pétrifié',
  'Prone', 'Ralenti', 'Restrained', 'Sonné', 'Surpris'
];

function formatCaracs(monstre) {
  // Affiche les caractéristiques principales si elles existent
  const caracs = [
    { label: 'FOR', value: monstre.for },
    { label: 'DEX', value: monstre.dex },
    { label: 'CON', value: monstre.con },
    { label: 'INT', value: monstre.int },
    { label: 'SAG', value: monstre.sag },
    { label: 'CHA', value: monstre.cha },
  ];
  return caracs.filter(c => c.value !== undefined).map(c => `${c.label}: ${c.value}`).join(' | ');
}

function CombatPage() {
  // États pour la gestion du combat
  const [initiative, setInitiative] = useState([]);
  const [tourActuel, setTourActuel] = useState(0);
  const [numeroTour, setNumeroTour] = useState(1);
  const [round, setRound] = useState(1);
  const [monstreDetailVisible, setMonstreDetailVisible] = useState(null);
  const [showConditionsModal, setShowConditionsModal] = useState(null);
  const [editNomIndex, setEditNomIndex] = useState(null);
  const [editNomValue, setEditNomValue] = useState('');
  const [selectedMonstre, setSelectedMonstre] = useState(null);
  const [ordreConfirme, setOrdreConfirme] = useState(false);
  const navigate = useNavigate();
  const [showReportModal, setShowReportModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [historiqueCombats, setHistoriqueCombats] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);

  // Charger l'initiative depuis le localStorage au démarrage
  useEffect(() => {
    const savedInitiative = JSON.parse(localStorage.getItem('dnd-initiative') || '[]');
    if (savedInitiative.length > 0) {
      setInitiative(savedInitiative);
    }
  }, []);

  // Sauvegarder l'initiative dans le localStorage à chaque modification
  useEffect(() => {
    if (initiative.length > 0) {
      localStorage.setItem('dnd-initiative', JSON.stringify(initiative));
    }
  }, [initiative]);

  // Charger l'historique au démarrage
  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem('dnd-historique-combat') || '[]');
    setHistoriqueCombats(hist);
  }, []);

  // Handlers pour édition du nom
  const handleEditNom = (index) => {
    setEditNomIndex(index);
    setEditNomValue(initiative[index].nom);
  };
  const handleNomChange = (e) => setEditNomValue(e.target.value);
  const handleNomSave = (index) => {
    const nouvelleInitiative = [...initiative];
    nouvelleInitiative[index].nom = editNomValue;
    setInitiative(nouvelleInitiative);
    setEditNomIndex(null);
    setEditNomValue('');
  };

  // Fonction pour lancer l'initiative
  const lancerInitiative = (index) => {
    const nouvelleInitiative = [...initiative];
    nouvelleInitiative[index].initiative = Math.floor(Math.random() * 20) + 1;
    setInitiative(nouvelleInitiative);
  };

  // Fonction pour modifier les PV
  const modifierPV = (index, value) => {
    const nouvelleInitiative = [...initiative];
    nouvelleInitiative[index].pv = Math.max(0, Math.min(Number(value), nouvelleInitiative[index].pvMax));
    setInitiative(nouvelleInitiative);
  };

  // Fonction pour confirmer l'ordre d'initiative
  const confirmerOrdre = () => {
    // Trier par initiative décroissante
    const sorted = [...initiative].sort((a, b) => b.initiative - a.initiative);
    setInitiative(sorted);
    setOrdreConfirme(true);
    setTourActuel(0);
    setRound(1);
  };

  // Navigation tour
  const tourSuivant = () => {
    if (tourActuel === initiative.length - 1) {
      setTourActuel(0);
      setRound(round + 1);
    } else {
      setTourActuel(tourActuel + 1);
    }
    setNumeroTour(numeroTour + 1);
  };
  const tourPrecedent = () => {
    if (tourActuel === 0) {
      if (round > 1) {
        setTourActuel(initiative.length - 1);
        setRound(round - 1);
      }
    } else {
      setTourActuel(tourActuel - 1);
    }
    setNumeroTour(numeroTour - 1);
  };

  // Sélection d'un monstre pour résumé/iframe
  const handleSelectMonstre = (entite) => {
    setSelectedMonstre(entite);
  };

  // Générer l'URL Aidedd si c'est un monstre (id ou nom)
  const getAideddUrl = (entite) => {
    if (!entite || !entite.nom) return '';
    // Nettoyer le nom pour l'URL
    const nom = entite.nom.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `https://aidedd.org/dnd/monstres.php?vo=${encodeURIComponent(nom)}`;
  };

  // Ajout/Retrait de conditions
  const toggleCondition = (entiteIdx, condition) => {
    const nouvelleInitiative = [...initiative];
    if (!nouvelleInitiative[entiteIdx].conditions) nouvelleInitiative[entiteIdx].conditions = [];
    if (nouvelleInitiative[entiteIdx].conditions.includes(condition)) {
      nouvelleInitiative[entiteIdx].conditions = nouvelleInitiative[entiteIdx].conditions.filter(c => c !== condition);
    } else {
      nouvelleInitiative[entiteIdx].conditions.push(condition);
    }
    setInitiative(nouvelleInitiative);
  };

  // Générer le rapport de combat
  const rapportCombat = () => {
    return (
      <div>
        <h3 className="font-bold mb-2">Rapport du combat</h3>
        <div className="mb-2 text-sm">Round final : {round}</div>
        <table className="w-full text-xs mb-2">
          <thead>
            <tr className="border-b">
              <th className="text-left">Nom</th>
              <th>PV</th>
              <th>Conditions</th>
            </tr>
          </thead>
          <tbody>
            {initiative.map(entite => (
              <tr key={entite.id} className="border-b">
                <td>{entite.nom}</td>
                <td className="text-center">{entite.pv} / {entite.pvMax}</td>
                <td className="text-center">{entite.conditions && entite.conditions.length > 0 ? entite.conditions.join(', ') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="text-xs text-gray-500">Tour actuel : {tourActuel + 1}</div>
      </div>
    );
  };

  // Générer le rapport texte pour export
  const rapportTexte = () => {
    let txt = `Rapport du combat\nRound final : ${round}\n`;
    txt += 'Nom\tPV\tConditions\n';
    initiative.forEach(entite => {
      txt += `${entite.nom}\t${entite.pv} / ${entite.pvMax}\t${entite.conditions && entite.conditions.length > 0 ? entite.conditions.join(', ') : '-'}\n`;
    });
    txt += `Tour actuel : ${tourActuel + 1}\n`;
    return txt;
  };

  // Copier dans le presse-papier
  const copierRapport = () => {
    navigator.clipboard.writeText(rapportTexte());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Sauvegarder le combat dans l'historique
  const sauvegarderHistorique = () => {
    const now = new Date();
    const resume = {
      date: now.toLocaleString(),
      round,
      tour: tourActuel + 1,
      participants: initiative.map(entite => ({
        nom: entite.nom,
        pv: entite.pv,
        pvMax: entite.pvMax,
        conditions: entite.conditions || []
      }))
    };
    const hist = [resume, ...historiqueCombats];
    setHistoriqueCombats(hist);
    localStorage.setItem('dnd-historique-combat', JSON.stringify(hist));
  };

  // Appeler la sauvegarde à l'ouverture du rapport (une seule fois par combat)
  const handleOpenReport = () => {
    sauvegarderHistorique();
    setShowReportModal(true);
  };

  // Modale d'historique
  const renderHistoryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => { setShowHistoryModal(false); setSelectedHistory(null); }}>
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-lg relative" onClick={e => e.stopPropagation()}>
        <button className="absolute top-2 right-2" onClick={() => { setShowHistoryModal(false); setSelectedHistory(null); }}><X size={20} /></button>
        <h3 className="font-bold mb-4">Historique des combats</h3>
        {selectedHistory ? (
          <div>
            <div className="mb-2 text-sm text-gray-700">Date : {selectedHistory.date}</div>
            <div className="mb-2 text-sm">Round final : {selectedHistory.round} | Tour : {selectedHistory.tour}</div>
            <table className="w-full text-xs mb-2">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Nom</th>
                  <th>PV</th>
                  <th>Conditions</th>
                </tr>
              </thead>
              <tbody>
                {selectedHistory.participants.map((p, i) => (
                  <tr key={i} className="border-b">
                    <td>{p.nom}</td>
                    <td className="text-center">{p.pv} / {p.pvMax}</td>
                    <td className="text-center">{p.conditions && p.conditions.length > 0 ? p.conditions.join(', ') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button className="mt-2 px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 w-full" onClick={() => setSelectedHistory(null)}>Retour à la liste</button>
          </div>
        ) : (
          <div>
            {historiqueCombats.length === 0 ? (
              <div className="text-gray-500 text-center py-8">Aucun combat enregistré</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {historiqueCombats.map((combat, idx) => (
                  <div key={idx} className="border rounded p-3 cursor-pointer hover:bg-yellow-50" onClick={() => setSelectedHistory(combat)}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">Combat du {combat.date}</div>
                      <span className="text-xs text-gray-500">Round : {combat.round}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <div>Participants : {combat.participants.map(p => p.nom).join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-end mb-4">
        <button onClick={() => navigate('/')} className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center">
          <Home className="mr-2" size={16} /> Retour au menu
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colonne gauche : Table d'initiative éditable */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Initiative</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-2 py-1 text-left">Nom</th>
                  <th className="px-2 py-1">Initiative</th>
                  <th className="px-2 py-1">Cond.</th>
                  <th className="px-2 py-1">PV</th>
                  <th className="px-2 py-1">Renommer</th>
                </tr>
              </thead>
              <tbody>
                {initiative.map((entite, idx) => (
                  <tr key={entite.id} className={idx === tourActuel ? 'bg-yellow-200 border-l-4 border-yellow-700' : ''}>
                    {/* Nom */}
                    <td className="px-2 py-1">
                      {editNomIndex === idx ? (
                        <input
                          type="text"
                          value={editNomValue}
                          onChange={e => setEditNomValue(e.target.value)}
                          onBlur={() => handleNomSave(idx)}
                          onKeyDown={e => { if (e.key === 'Enter') handleNomSave(idx); }}
                          className="border rounded px-1 py-0.5 w-28"
                          autoFocus
                        />
                      ) : (
                        <span>{entite.nom}</span>
                      )}
                    </td>
                    {/* Initiative */}
                    <td className="px-2 py-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={entite.initiative}
                          onChange={e => {
                            const nouvelleInitiative = [...initiative];
                            nouvelleInitiative[idx].initiative = Number(e.target.value);
                            setInitiative(nouvelleInitiative);
                          }}
                          className="border rounded px-1 py-0.5 w-12"
                          disabled={ordreConfirme}
                        />
                        <button
                          onClick={() => lancerInitiative(idx)}
                          className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                          disabled={ordreConfirme}
                        >
                          <SkipForward size={14} />
                        </button>
                      </div>
                    </td>
                    {/* Conditions */}
                    <td className="px-2 py-1">
                      <button
                        onClick={() => setShowConditionsModal(idx)}
                        className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <AlertCircle size={16} />
                      </button>
                      {/* Affichage des conditions actives */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {entite.conditions && entite.conditions.map(cond => (
                          <span key={cond} className="bg-yellow-200 text-yellow-900 rounded px-1 text-xs">{cond}</span>
                        ))}
                      </div>
                    </td>
                    {/* PV */}
                    <td className="px-2 py-1">
                      <input
                        type="number"
                        value={entite.pv}
                        min={0}
                        max={entite.pvMax}
                        onChange={e => modifierPV(idx, e.target.value)}
                        className="border rounded px-1 py-0.5 w-16"
                      />
                      <span className="text-xs text-gray-500 ml-1">/ {entite.pvMax}</span>
                    </td>
                    {/* Renommer */}
                    <td className="px-2 py-1">
                      <button
                        onClick={() => handleEditNom(idx)}
                        className="p-1 bg-gray-100 rounded hover:bg-gray-200"
                      >
                        <Edit size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="mt-4 px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800"
            onClick={confirmerOrdre}
            disabled={ordreConfirme}
          >
            Confirmer
          </button>
        </div>

        {/* Colonne droite : Résumé, navigation, monstre, iframe */}
        <div className="bg-white rounded-lg shadow-lg p-6 flex flex-col h-full">
          {/* Affichage du round et du tour actif */}
          <div className="mb-4 flex flex-col items-center">
            <div className="text-lg font-bold text-yellow-900 mb-1">Round {round}</div>
            <div className="text-sm text-gray-700 mb-1">Tour {tourActuel + 1} / {initiative.length}</div>
            {initiative[tourActuel] && (
              <div className="flex items-center gap-2 bg-yellow-200 px-3 py-1 rounded shadow text-yellow-900 font-semibold">
                <span>Actif :</span>
                <span className="text-base">{initiative[tourActuel].nom}</span>
              </div>
            )}
          </div>

          {/* Résumé d'initiative (ordre du tour) */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Ordre du tour</h3>
            <ul className="border rounded bg-yellow-50 divide-y">
              {initiative.map((entite, idx) => (
                <li
                  key={entite.id}
                  className={`flex items-center gap-2 px-2 py-1 cursor-pointer ${idx === tourActuel ? 'bg-yellow-300 font-bold border-l-4 border-yellow-700' : ''}`}
                  onClick={() => setTourActuel(idx)}
                  onMouseEnter={() => handleSelectMonstre(entite)}
                >
                  {idx === tourActuel && <span className="inline-block w-2 h-2 bg-yellow-700 rounded-full mr-1" />}
                  <span>{entite.nom}</span>
                  <span className="text-xs text-gray-600 ml-2">|</span>
                  <span className="text-xs">PV: {entite.pv}/{entite.pvMax}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex gap-2 mb-4 justify-center">
            <button onClick={tourPrecedent} className="flex-1 bg-yellow-600 text-white rounded px-2 py-2 hover:bg-yellow-700 font-semibold shadow">◀ Annuler</button>
            <button onClick={tourSuivant} className="flex-1 bg-yellow-600 text-white rounded px-2 py-2 hover:bg-yellow-700 font-semibold shadow">Suivant ▶</button>
          </div>
          <div className="flex gap-2 mb-4 justify-center">
            <button className="flex-1 bg-yellow-100 rounded px-2 py-1 hover:bg-yellow-200" onClick={() => navigate('/')}>Retour</button>
            <button className="flex-1 bg-yellow-100 rounded px-2 py-1 hover:bg-yellow-200" onClick={handleOpenReport}>Rapport</button>
            <button className="flex-1 bg-yellow-100 rounded px-2 py-1 hover:bg-yellow-200" onClick={() => setShowHistoryModal(true)}>Historique</button>
          </div>

          {/* Résumé du monstre sélectionné */}
          {selectedMonstre && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2 text-lg flex items-center gap-2">
                <span>{selectedMonstre.nom}</span>
                {selectedMonstre.type && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{selectedMonstre.type}</span>}
              </h4>
              {/* Image ou icône */}
              <div className="mb-2 flex justify-center">
                <img
                  src={`https://www.aidedd.org/dnd/images/monstres/${selectedMonstre.nom.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`}
                  alt={selectedMonstre.nom}
                  className="h-24 object-contain rounded shadow"
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
              <div className="bg-yellow-50 border rounded p-2 text-xs whitespace-pre-line max-h-40 overflow-y-auto mb-2">
                <div><b>CA</b> : {selectedMonstre.ca ?? '—'}</div>
                <div><b>PV</b> : {selectedMonstre.pvMax ?? selectedMonstre.pv ?? '—'}</div>
                {selectedMonstre.vitesse && <div><b>Vitesse</b> : {selectedMonstre.vitesse}</div>}
                {selectedMonstre.immunites && <div><b>Immunités</b> : {selectedMonstre.immunites}</div>}
                {selectedMonstre.sens && <div><b>Sens</b> : {selectedMonstre.sens}</div>}
                {selectedMonstre.langues && <div><b>Langues</b> : {selectedMonstre.langues}</div>}
                {selectedMonstre.puissance && <div><b>Puissance</b> : {selectedMonstre.puissance}</div>}
                {formatCaracs(selectedMonstre) && <div className="mt-1"><b>Caractéristiques</b> : {formatCaracs(selectedMonstre)}</div>}
                {selectedMonstre.description && <div className="mt-2">{selectedMonstre.description}</div>}
              </div>
              <div className="text-xs text-gray-500 mb-1">Fiche complète :</div>
              <div className="flex-1 overflow-auto">
                <iframe
                  title="Fiche Aidedd"
                  src={getAideddUrl(selectedMonstre)}
                  className="w-full h-64 border rounded"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Conditions */}
      {showConditionsModal !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowConditionsModal(null)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2" onClick={() => setShowConditionsModal(null)}><X size={20} /></button>
            <h3 className="text-lg font-semibold mb-4">Conditions</h3>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {CONDITIONS_DND.map(cond => (
                <label key={cond} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={initiative[showConditionsModal]?.conditions?.includes(cond) || false}
                    onChange={() => toggleCondition(showConditionsModal, cond)}
                  />
                  <span>{cond}</span>
                </label>
              ))}
            </div>
            <button className="mt-2 px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 w-full" onClick={() => setShowConditionsModal(null)}>Fermer</button>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative" onClick={e => e.stopPropagation()}>
            <button className="absolute top-2 right-2" onClick={() => setShowReportModal(false)}><X size={20} /></button>
            {rapportCombat()}
            <button className="mt-2 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 w-full" onClick={copierRapport}>Exporter</button>
            {copied && <div className="text-green-700 text-xs mt-1 text-center">Copié dans le presse-papier !</div>}
            <button className="mt-4 px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-800 w-full" onClick={() => setShowReportModal(false)}>Fermer</button>
          </div>
        </div>
      )}

      {showHistoryModal && renderHistoryModal()}
    </div>
  );
}

export default CombatPage; 