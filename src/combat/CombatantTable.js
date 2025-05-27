import React, { useState } from 'react';
import { Edit3 } from 'lucide-react';
import { genererInitiative } from '../utils/encounterUtils';

// Mapping des conditions D&D 5e avec description (source Aidedd) et émoji
const CONDITIONS_LIST = [
  { nom: 'Aveuglé', desc: "Ne voit pas, rate tout jet nécessitant la vue. Les attaques contre elle ont avantage, ses attaques ont désavantage.", icon: '🕶️', color: '#1e293b' },
  { nom: 'Assourdi', desc: "N'entend pas, rate tout jet nécessitant l'ouïe.", icon: '🔇', color: '#334155' },
  { nom: 'Charmé', desc: "Ne peut attaquer le charmeur, le charmeur a avantage aux interactions sociales.", icon: '💖', color: '#be185d' },
  { nom: 'Effrayé', desc: "Désavantage aux jets de carac/attaque si la source est visible. Ne peut s'en approcher.", icon: '😱', color: '#0ea5e9' },
  { nom: 'Empoisonné', desc: "Désavantage aux jets d'attaque et de caractéristique.", icon: '☠️', color: '#4b5563' },
  { nom: 'Entravé', desc: "Vitesse 0, ne bénéficie d'aucun bonus de vitesse. Attaques contre elle ont avantage, ses attaques ont désavantage.", icon: '⛓️', color: '#6d28d9' },
  { nom: 'Étourdi', desc: "Incapable d'agir, ne peut bouger, parle de façon hésitante. Rate jets de sauvegarde FOR/DEX. Attaques contre elle ont avantage.", icon: '💫', color: '#f59e42' },
  { nom: 'Grapplé', desc: "Vitesse 0, ne bénéficie d'aucun bonus de vitesse. Se termine si l'agrippeur ne peut plus agir ou hors de portée.", icon: '🪢', color: '#7c3aed' },
  { nom: 'Inconscient', desc: "Incapable d'agir, ne peut bouger ni parler, inconscient. Lâche ce qu'elle tient, tombe à terre. Rate jets de sauvegarde FOR/DEX. Attaques contre elle ont avantage et sont critiques à 1,5m.", icon: '💤', color: '#64748b' },
  { nom: 'Invisible', desc: "Ne peut être vue sans magie/sens spécial. Attaques contre elle ont désavantage, ses attaques ont avantage.", icon: '👻', color: '#475569' },
  { nom: 'Paralysé', desc: "Incapable d'agir, ne peut bouger ni parler. Rate jets de sauvegarde FOR/DEX. Attaques contre elle ont avantage et sont critiques à 1,5m.", icon: '🧊', color: '#0ea5e9' },
  { nom: 'Pétrifié', desc: "Transformée en substance inanimée. Incapable d'agir, ne peut bouger ni parler, inconsciente. Attaques contre elle ont avantage. Résistance à tous dégâts, immunisée poison/maladie.", icon: '🪨', color: '#78716c' },
  { nom: 'Prone', desc: "Ne peut que ramper sauf si elle se relève. Désavantage à l'attaque. Attaques contre elle ont avantage à 1,5m sinon désavantage.", icon: '🤸', color: '#f59e42' },
  { nom: 'Ralenti', desc: "Vitesse réduite, pénalité aux jets d'attaque et DEX, perte de réactions.", icon: '🐢', color: '#16a34a' },
  { nom: 'Restrained', desc: "Vitesse 0, ne bénéficie d'aucun bonus de vitesse. Attaques contre elle ont avantage, ses attaques ont désavantage. Désavantage aux jets de sauvegarde DEX.", icon: '🪢', color: '#7c3aed' },
  { nom: 'Sonné', desc: "Incapable d'agir, ne peut bouger, parle de façon hésitante. Rate jets de sauvegarde FOR/DEX. Attaques contre elle ont avantage.", icon: '🥴', color: '#fbbf24' },
  { nom: 'Surpris', desc: "Ne peut pas agir au premier tour du combat.", icon: '😮', color: '#f59e42' },
];

function getConditionDesc(nom) {
  const c = CONDITIONS_LIST.find(x => x.nom === nom);
  return c ? c.desc : '';
}
function getConditionIcon(nom) {
  const c = CONDITIONS_LIST.find(x => x.nom === nom);
  return c ? c.icon : null;
}
function getConditionColor(nom) {
  const c = CONDITIONS_LIST.find(x => x.nom === nom);
  return c ? c.color : '#334155';
}

export default function CombatantTable({ combatants, onUpdateCombatant, onRenameCombatant, activeIndex, onSelectCombatant, phase }) {
  const [openMenu, setOpenMenu] = useState(null); // id du combattant dont le menu est ouvert
  const [hoveredCond, setHoveredCond] = useState(null); // nom de la condition survolée
  const [degatsSoinsVals, setDegatsSoinsVals] = useState({});

  // Fonction pour randomiser l'initiative
  const randomizeInitiative = (id) => {
    const combatant = combatants.find(c => c.id === id);
    if (!combatant) return;
    const value = genererInitiative(combatant);
    onUpdateCombatant(id, { initiative: value });
  };

  // Ajoute/retire une condition pour un combattant
  const toggleCondition = (id, cond) => {
    const combatant = combatants.find(c => c.id === id);
    if (!combatant) return;
    const current = combatant.conditions || [];
    const has = current.includes(cond);
    const next = has ? current.filter(c => c !== cond) : [...current, cond];
    onUpdateCombatant(id, { conditions: next });
  };

  return (
    <table className="combat-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Initiative</th>
          <th>PV</th>
          <th>{phase === 'combat' ? 'Condition' : 'Renommer'}</th>
        </tr>
      </thead>
      <tbody>
        {combatants.map((c, idx) => (
          <tr
            key={c.id}
            className={activeIndex === idx ? 'combatant-active-row' : ''}
            onClick={() => onSelectCombatant && onSelectCombatant(idx)}
            style={{cursor: onSelectCombatant ? 'pointer' : undefined}}
          >
            <td>
              {activeIndex === idx && <span title="Actif" style={{color:'#a67c52', fontWeight:'bold', marginRight:4}}>▶</span>}
              {c.nom}
            </td>
            <td style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <input
                type="number"
                className="combat-input"
                value={c.initiative}
                onChange={e => onUpdateCombatant(c.id, { initiative: Number(e.target.value) })}
                style={{width: 60}}
              />
              <button
                className="combat-btn"
                style={{padding: '4px 10px', fontSize: '1em'}}
                onClick={e => { e.stopPropagation(); randomizeInitiative(c.id); }}
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
                onChange={e => onUpdateCombatant(c.id, { pv: Math.max(0, Math.min(Number(e.target.value), c.pvMax)) })}
                style={{width: 220, marginRight: 4, appearance: 'textfield', MozAppearance: 'textfield', WebkitAppearance: 'none', textAlign: 'center', fontFamily: 'monospace'}}
                inputMode="numeric"
              />
              /
              <input
                type="number"
                className="combat-input"
                value={c.pvMax}
                min={1}
                onChange={e => onUpdateCombatant(c.id, { pvMax: Math.max(1, Number(e.target.value)) })}
                style={{width: 220, marginLeft: 4, appearance: 'textfield', MozAppearance: 'textfield', WebkitAppearance: 'none', textAlign: 'center', fontFamily: 'monospace'}}
                inputMode="numeric"
              />
              {/* Système de dégâts/soins */}
              <span style={{display: 'inline-flex', alignItems: 'center', marginLeft: 8, gap: 2}}>
                <button
                  style={{background: '#e53e3e', color: 'white', border: 'none', borderRadius: 6, width: 28, height: 28, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 2, cursor: c.pv === 0 ? 'not-allowed' : 'pointer', opacity: c.pv === 0 ? 0.5 : 1}}
                  title="Infliger des dégâts"
                  disabled={c.pv === 0 || !(degatsSoinsVals[c.id] > 0)}
                  onClick={e => {
                    e.stopPropagation();
                    const val = Number((degatsSoinsVals[c.id] || 0));
                    if (!isNaN(val) && val > 0) {
                      onUpdateCombatant(c.id, { pv: Math.max(0, c.pv - val) });
                      setDegatsSoinsVals(v => ({ ...v, [c.id]: '' }));
                    }
                  }}
                >-</button>
                <input
                  type="number"
                  min={1}
                  value={degatsSoinsVals[c.id] || ''}
                  onClick={e => e.stopPropagation()}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '' || (Number(v) > 0 && Number.isFinite(Number(v)))) {
                      setDegatsSoinsVals(vals => ({ ...vals, [c.id]: v.replace(/^0+/, '') }));
                    }
                  }}
                  style={{width: 36, textAlign: 'center', border: '1px solid #bbb', borderRadius: 6, margin: '0 2px'}}
                  placeholder="0"
                />
                <button
                  style={{background: '#38a169', color: 'white', border: 'none', borderRadius: 6, width: 28, height: 28, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 2, cursor: c.pv === c.pvMax ? 'not-allowed' : 'pointer', opacity: c.pv === c.pvMax ? 0.5 : 1}}
                  title="Soigner"
                  disabled={c.pv === c.pvMax || !(degatsSoinsVals[c.id] > 0)}
                  onClick={e => {
                    e.stopPropagation();
                    const val = Number((degatsSoinsVals[c.id] || 0));
                    if (!isNaN(val) && val > 0) {
                      onUpdateCombatant(c.id, { pv: Math.min(c.pvMax, c.pv + val) });
                      setDegatsSoinsVals(v => ({ ...v, [c.id]: '' }));
                    }
                  }}
                >+</button>
              </span>
            </td>
            <td>
              {phase === 'combat' ? (
                <div style={{display: 'flex', alignItems: 'center', gap: 6, position: 'relative'}}>
                  {/* Badges des conditions actives */}
                  {Array.isArray(c.conditions) && c.conditions.length > 0 && c.conditions.map(cond => (
                    <span
                      key={cond}
                      title={getConditionDesc(cond)}
                      style={{
                        background: '#e0edf7',
                        color: '#232323',
                        borderRadius: 8,
                        padding: '2px 10px',
                        fontSize: '1.2em',
                        marginRight: 4,
                        cursor: 'help',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        position: 'relative',
                        border: '1.5px solid #b3d0e7',
                      }}
                      onMouseEnter={() => setHoveredCond(cond)}
                      onMouseLeave={() => setHoveredCond(null)}
                    >
                      {getConditionIcon(cond)}
                      {hoveredCond === cond && (
                        <span style={{
                          position: 'absolute',
                          left: '100%',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: '#232323',
                          color: '#fff',
                          borderRadius: 6,
                          padding: '2px 10px',
                          marginLeft: 8,
                          fontSize: '0.98em',
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                          boxShadow: '0 2px 8px #0003',
                        }}>{cond}</span>
                      )}
                    </span>
                  ))}
                  {/* Bouton pour ouvrir le menu */}
                  <button className="combat-btn" style={{padding: '4px 10px'}} title="Gérer les conditions"
                    onClick={e => { e.stopPropagation(); setOpenMenu(openMenu === c.id ? null : c.id); }}>
                    ⚡
                  </button>
                  {/* Menu déroulant des conditions */}
                  {openMenu === c.id && (
                    <div style={{position:'absolute', zIndex:100, background:'#fff', border:'1.5px solid #c28840', borderRadius:8, boxShadow:'0 2px 8px #0002', padding:10, minWidth:180, marginTop:32}} onClick={e => e.stopPropagation()}>
                      <div style={{fontWeight:'bold', color:'#a67c52', marginBottom:6}}>Conditions</div>
                      {CONDITIONS_LIST.map(cond => (
                        <div key={cond.nom} style={{display:'flex', alignItems:'center', gap:6, marginBottom:4, cursor:'pointer'}}
                          onClick={() => toggleCondition(c.id, cond.nom)}>
                          <input type="checkbox" readOnly checked={Array.isArray(c.conditions) && c.conditions.includes(cond.nom)} />
                          <span style={{display:'inline-flex', alignItems:'center', gap:4, fontSize:'1.2em'}}>{cond.icon} <span style={{fontSize:'0.98em'}}>{cond.nom}</span></span>
                        </div>
                      ))}
                      <button className="combat-btn" style={{marginTop:8, width:'100%'}} onClick={() => setOpenMenu(null)}>Fermer</button>
                    </div>
                  )}
                </div>
              ) : (
                <button className="combat-btn" style={{padding: '4px 10px'}} onClick={e => { e.stopPropagation(); onRenameCombatant(c.id); }}>
                  <Edit3 size={16} />
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
} 