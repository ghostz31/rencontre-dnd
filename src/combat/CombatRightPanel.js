import React from 'react';
import MonsterSummary from './MonsterSummary';

export default function CombatRightPanel({ monster, onNavigate, currentMonsterIndex, monstersList, onSelectMonster, rightPanelContent }) {
  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 16, gap: 8}}>
        <button className="combat-btn" onClick={() => onNavigate('prev')}>&#x25C0; Annuler</button>
        <button className="combat-btn green" onClick={() => onNavigate('next')}>Suivant &#x25B6;</button>
        <button className="combat-btn brown" onClick={() => onNavigate('back')}>Retour</button>
        <button className="combat-btn red" onClick={() => onNavigate('report')}>Rapport</button>
      </div>
      {rightPanelContent ? (
        <div style={{marginBottom: 18}}>{rightPanelContent}</div>
      ) : (
        monster && <MonsterSummary monster={monster} />
      )}
      {/* Navigation entre monstres sélectionnés */}
      {monstersList && monstersList.length > 1 && (
        <div style={{marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          {monstersList.map((m, idx) => (
            <button
              key={m.id}
              className={`combat-btn ${idx === currentMonsterIndex ? 'green' : 'brown'}`}
              onClick={() => onSelectMonster(idx)}
              style={{fontSize: '0.95em'}}
            >
              {m.nom}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 