import React, { useState, useEffect } from 'react';
import { 
  Users, Shield, Sword, Heart, Eye, 
  SkipForward, AlertCircle, X, Clock,
  ChevronLeft, ChevronRight, Plus, Minus, Edit, Home
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CombatMainLayout from './combat/CombatMainLayout';
import MonsterStatBlock from './combat/MonsterStatBlock';
import { genererInitiative } from './utils/encounterUtils';

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

const defaultCombatants = [
  { id: 'pj-1', nom: 'PJ 1', initiative: 0, condition: false, pv: 100, pvMax: 100 },
  { id: 'pj-2', nom: 'PJ 2', initiative: 0, condition: false, pv: 100, pvMax: 100 },
  { id: 'pj-3', nom: 'PJ 3', initiative: 0, condition: false, pv: 100, pvMax: 100 },
  { id: 'pj-4', nom: 'PJ 4', initiative: 0, condition: false, pv: 100, pvMax: 100 },
  { id: 'androsphinx-1', nom: 'Androsphinx 1', initiative: 0, condition: false, pv: 199, pvMax: 199 },
  { id: 'bec-hache-1', nom: 'Bec de hache 1', initiative: 0, condition: false, pv: 19, pvMax: 19 },
  { id: 'behir-1', nom: 'Béhir 1', initiative: 0, condition: false, pv: 168, pvMax: 168 },
  { id: 'cheval-guerre-1', nom: 'Cheval de guerre 1', initiative: 0, condition: false, pv: 19, pvMax: 19 },
  { id: 'chien-infernal-1', nom: 'Chien de chasse infernal 1', initiative: 0, condition: false, pv: 45, pvMax: 45 },
];

const monstersList = [
  {
    id: 'behir-1',
    nom: 'Béhir',
    type: 'Monstruosité de taille TG, neutre mauvais',
    ca: 17,
    pvMax: 168,
    pvFormula: '16d12+64',
    vitesse: '15m/12m escalade',
    competences: 'Discrétion +7, Perception +6',
    immunites: 'foudre',
    sens: 'vision noir 27m',
    langues: 'draconique',
    puissance: '11 (7200 PX)',
    for: 23, dex: 16, con: 18, int: 7, sag: 14, cha: 12,
    image: 'https://www.aidedd.org/dnd/images/monstres/behir.jpg',
  },
  {
    id: 'androsphinx-1',
    nom: 'Androsphinx',
    type: 'Monstruosité de taille G, neutre',
    ca: 17, pvMax: 199, vitesse: '12m, vol 18m',
    competences: 'Perception +13, Intuition +10',
    immunites: 'psychique',
    sens: 'vision vraie 36m',
    langues: 'toutes, télépathie 36m',
    puissance: '17 (18000 PX)',
    for: 22, dex: 10, con: 20, int: 16, sag: 22, cha: 18,
    image: 'https://www.aidedd.org/dnd/images/monstres/androsphinx.jpg',
  },
];

function normalizeName(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/ /g, '-');
}

// Fonction pour extraire l'ID du personnage D&D Beyond
function extractDndBeyondId(url) {
  if (!url) return null;
  // Format attendu : https://www.dndbeyond.com/characters/12345678
  const match = url.match(/\/characters\/(\d+)/);
  return match ? match[1] : null;
}

// Fonction pour récupérer les données du personnage via l'API
async function fetchDndBeyondCharacter(characterId) {
  try {
    // Utilisation de notre proxy local
    const response = await fetch(`http://localhost:3001/api/character/${characterId}`);
    if (!response.ok) throw new Error('Erreur lors de la récupération des données');
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    return null;
  }
}

export default function CombatPage() {
  const [combatants, setCombatants] = useState([]);
  const [currentMonsterIndex, setCurrentMonsterIndex] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [selectedCombatant, setSelectedCombatant] = useState(null);
  const [phase, setPhase] = useState('setup'); // 'setup' ou 'combat'
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
  const [characterData, setCharacterData] = useState(null);
  const [loadingCharacter, setLoadingCharacter] = useState(false);

  useEffect(() => {
    const savedInitiative = JSON.parse(localStorage.getItem('dnd-initiative') || '[]');
    setCombatants(savedInitiative);
    setSelectedCombatant(savedInitiative[0] || null);
  }, []);

  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem('dnd-historique-combat') || '[]');
    setHistoriqueCombats(hist);
  }, []);

  // Liste des monstres présents dans l'affrontement
  const monstersList = combatants.filter(c => c.type === 'Monstre');
  const selectedMonster = monstersList[currentMonsterIndex] || monstersList[0] || null;

  // Callbacks pour édition
  const handleUpdateCombatant = (id, updates) => {
    setCombatants(prev => {
      const updated = prev.map(c => c.id === id ? { ...c, ...updates } : c);
      localStorage.setItem('dnd-initiative', JSON.stringify(updated));
      return updated;
    });
  };
  const handleRenameCombatant = (id) => {
    const newName = prompt('Nouveau nom ?');
    if (newName) handleUpdateCombatant(id, { nom: newName });
  };

  // PHASE SETUP : démarrer le combat
  const handleStartCombat = () => {
    const sorted = [...combatants].sort((a, b) => b.initiative - a.initiative);
    setCombatants(sorted);
    setPhase('combat');
    setCurrentTurnIndex(0);
    setCurrentRound(1);
    setSelectedCombatant(sorted[0] || null);
  };

  // PHASE COMBAT : navigation, sélection, etc.
  const handleNavigate = (action) => {
    if (!monstersList.length) return;
    if (action === 'next') setCurrentMonsterIndex(i => (i + 1) % monstersList.length);
    if (action === 'prev') setCurrentMonsterIndex(i => (i - 1 + monstersList.length) % monstersList.length);
    if (action === 'back') window.history.back();
    if (action === 'report') alert('Rapport !');
  };
  const handleSelectMonster = (idx) => setCurrentMonsterIndex(idx);

  // Sélection avancée de combattant (PJ ou monstre)
  const handleSelectCombatant = (idx) => {
    setSelectedCombatant(combatants[idx]);
    // Si c'est un monstre, mettre à jour l'index du monstre pour l'iframe
    if (combatants[idx] && combatants[idx].type === 'Monstre') {
      const monsterIdx = monstersList.findIndex(m => m.id === combatants[idx].id);
      if (monsterIdx !== -1) setCurrentMonsterIndex(monsterIdx);
    }
  };

  const handleNextTurn = () => {
    setCurrentTurnIndex(prev => {
      if (combatants.length === 0) return 0;
      const next = prev + 1;
      if (next >= combatants.length) {
        setCurrentRound(r => r + 1);
        setSelectedCombatant(combatants[0] || null);
        return 0;
      }
      setSelectedCombatant(combatants[next] || null);
      return next;
    });
  };
  const handlePrevTurn = () => {
    setCurrentTurnIndex(prev => {
      if (combatants.length === 0) return 0;
      if (prev === 0) {
        setCurrentRound(r => (r > 1 ? r - 1 : 1));
        setSelectedCombatant(combatants[combatants.length - 1] || null);
        return combatants.length - 1;
      }
      setSelectedCombatant(combatants[prev - 1] || null);
      return prev - 1;
    });
  };

  // Effet pour charger les données du personnage quand il est sélectionné
  useEffect(() => {
    async function loadCharacterData() {
      if (selectedCombatant?.dndbeyondUrl) {
        setLoadingCharacter(true);
        const characterId = extractDndBeyondId(selectedCombatant.dndbeyondUrl);
        if (characterId) {
          const data = await fetchDndBeyondCharacter(characterId);
          setCharacterData(data);
        }
        setLoadingCharacter(false);
      } else {
        setCharacterData(null);
      }
    }
    loadCharacterData();
  }, [selectedCombatant]);

  // Modification de l'affichage du panneau de droite
  let rightPanelContent = null;
  if (phase === 'combat' && selectedCombatant && selectedCombatant.nom) {
    if (selectedCombatant.type === 'Monstre') {
      rightPanelContent = (
        <MonsterStatBlock nom={selectedCombatant.nom} />
      );
    } else if (selectedCombatant.dndbeyondUrl) {
      rightPanelContent = (
        <div className="dndbeyond-container" style={{ 
          width: '100%', 
          height: 'calc(100vh - 100px)', 
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          overflow: 'auto'
        }}>
          {loadingCharacter ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Chargement de la fiche...
            </div>
          ) : characterData ? (
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '20px', color: '#333' }}>
                {characterData.name}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div>
                  <h4>Caractéristiques</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {Object.entries(characterData.stats).map(([stat, value]) => (
                      <div key={stat} style={{ textAlign: 'center', padding: '10px', backgroundColor: '#fff', borderRadius: '4px' }}>
                        <div style={{ fontWeight: 'bold' }}>{stat.toUpperCase()}</div>
                        <div>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>Informations</h4>
                  <div style={{ backgroundColor: '#fff', padding: '15px', borderRadius: '4px' }}>
                    <p>Niveau: {characterData.level}</p>
                    <p>Classe: {characterData.classes?.map(c => c.name).join(', ')}</p>
                    <p>Race: {characterData.race?.name}</p>
                    <p>Points de vie: {characterData.hitPoints}</p>
                    <p>Classe d'armure: {characterData.armorClass}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Impossible de charger la fiche. Vérifiez que l'URL est correcte.
            </div>
          )}
        </div>
      );
    } else {
      // Affiche le placeholder pour les joueurs sans dndbeyondUrl
      rightPanelContent = (
        <div style={{ width: '100%', height: '85vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', borderRadius: 12, border: '2px solid #a67c52' }}>
          <img src={process.env.PUBLIC_URL + '/images/TavernPatrons-1.jpg'} alt="Joueurs" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 12, objectFit: 'cover', boxShadow: '0 4px 24px #0002' }} />
        </div>
      );
    }
  }

  // PHASE SETUP : table éditable, bouton démarrer, pas de navigation ni fiche
  if (phase === 'setup') {
    return (
      <div className="combat-parchment-bg" style={{minHeight: '100vh', padding: 40, position: 'relative'}}>
        <div className="combat-main-layout">
          <div className="combat-left-panel" style={{width: '100%'}}>
            <div style={{marginBottom: 24}}>
              <h1 style={{fontFamily: 'Cinzel Decorative', fontSize: '2rem', color: '#7c4a03', marginBottom: 2}}>Configuration de l'initiative</h1>
              <div style={{fontSize: '1.1rem', color: '#a67c52', marginBottom: 12}}>Saisissez ou lancez les initiatives, puis démarrez le combat.</div>
            </div>
            <table className="combat-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Initiative</th>
                  <th>PV</th>
                  <th>Renommer</th>
                  {phase === 'combat' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {combatants.map((c, idx) => (
                  <tr key={c.id}>
                    <td>{c.nom}</td>
                    <td style={{display: 'flex', alignItems: 'center', gap: 6}}>
                      <input
                        type="number"
                        className="combat-input"
                        value={c.initiative}
                        onChange={e => handleUpdateCombatant(c.id, { initiative: Number(e.target.value) })}
                        style={{width: 60}}
                      />
                      <button
                        className="combat-btn"
                        style={{padding: '4px 10px', fontSize: '1em'}}
                        onClick={() => {
                          const combatant = combatants.find(comb => comb.id === c.id);
                          if (!combatant) return;
                          const value = genererInitiative(combatant);
                          handleUpdateCombatant(c.id, { initiative: value });
                        }}
                        title="Lancer un dé d'initiative (1d20)"
                      >
                        🎲
                      </button>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="combat-input"
                        value={c.pv}
                        min={0}
                        max={c.pvMax}
                        onChange={e => handleUpdateCombatant(c.id, { pv: Math.max(0, Math.min(Number(e.target.value), c.pvMax)) })}
                        style={{width: 50, marginRight: 4}}
                      />
                      /
                      <input
                        type="number"
                        className="combat-input"
                        value={c.pvMax}
                        min={1}
                        onChange={e => handleUpdateCombatant(c.id, { pvMax: Math.max(1, Number(e.target.value)) })}
                        style={{width: 50, marginLeft: 4}}
                      />
                    </td>
                    <td>
                      <button className="combat-btn" style={{padding: '4px 10px'}} onClick={() => handleRenameCombatant(c.id)}>
                        Renommer
                      </button>
                    </td>
                    {phase === 'combat' && (
                      <td>
                        <button
                          className="combat-btn"
                          title="Appliquer des dégâts"
                          onClick={() => {
                            const val = parseInt(prompt('Dégâts à appliquer ?'), 10);
                            if (!isNaN(val)) handleUpdateCombatant(c.id, { pv: Math.max(0, c.pv - val) });
                          }}
                        >💔</button>
                        <button
                          className="combat-btn"
                          title="Soigner"
                          onClick={() => {
                            const val = parseInt(prompt('Soins à appliquer ?'), 10);
                            if (!isNaN(val)) handleUpdateCombatant(c.id, { pv: Math.min(c.pvMax, c.pv + val) });
                          }}
                        >💚</button>
                        <button
                          className="combat-btn"
                          title="Lancer un sort (note)"
                          onClick={() => {
                            const sort = prompt('Nom/effet du sort ?');
                            if (sort) alert(`Sort lancé : ${sort}`);
                          }}
                        >✨</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              className="combat-btn green"
              style={{marginTop: 24, width: '100%', fontSize: '1.2em'}}
              onClick={handleStartCombat}
            >
              Démarrer le combat
            </button>
          </div>
        </div>
        <button
          className="combat-btn home-btn"
          style={{position: 'fixed', bottom: 32, right: 32, zIndex: 1000, borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 8px #0002', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
          onClick={() => navigate('/')}
          title="Retour au menu"
        >
          <Home size={32} />
        </button>
      </div>
    );
  }

  // PHASE COMBAT : interface complète
  return (
    <>
      <CombatMainLayout
        combatants={combatants}
        selectedMonster={selectedMonster}
        onUpdateCombatant={handleUpdateCombatant}
        onRenameCombatant={handleRenameCombatant}
        onConfirm={() => {}}
        onNavigate={handleNavigate}
        currentMonsterIndex={currentMonsterIndex}
        monstersList={monstersList}
        onSelectMonster={handleSelectMonster}
        currentTurnIndex={currentTurnIndex}
        currentRound={currentRound}
        onNextTurn={handleNextTurn}
        onPrevTurn={handlePrevTurn}
        activeCombatant={combatants[currentTurnIndex] || null}
        rightPanelContent={rightPanelContent}
        phase={phase}
      />
      <button
        className="combat-btn home-btn"
        style={{position: 'fixed', bottom: 32, right: 32, zIndex: 1000, borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 8px #0002', fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center'}}
        onClick={() => navigate('/')}
        title="Retour au menu"
      >
        <Home size={32} />
      </button>
    </>
  );
} 