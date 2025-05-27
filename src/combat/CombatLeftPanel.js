import React from 'react';
import CombatantTable from './CombatantTable';

export default function CombatLeftPanel({ combatants, onUpdateCombatant, onRenameCombatant, onConfirm, activeIndex, onSelectCombatant, hideConfirmButton, hideSidebar, phase }) {
  // Sidebar participants (liste verticale)
  return (
    <div>
      <header style={{marginBottom: 24}}>
        <h1 style={{fontFamily: 'Cinzel Decorative', fontSize: '2rem', color: '#7c4a03', marginBottom: 2}}>Affrontement</h1>
        <div style={{fontSize: '1.1rem', color: '#a67c52'}}>Initiative</div>
      </header>
      <CombatantTable
        combatants={combatants}
        onUpdateCombatant={onUpdateCombatant}
        onRenameCombatant={onRenameCombatant}
        activeIndex={activeIndex}
        onSelectCombatant={onSelectCombatant}
        phase={phase}
      />
      {!hideConfirmButton && (
        <button className="combat-btn brown" style={{marginTop: 18, width: '100%'}} onClick={onConfirm}>Confirmer</button>
      )}
      {(!hideSidebar) && (
        <div className="combat-sidebar">
          {combatants.map((c, idx) => (
            <div
              key={c.id}
              className={`combat-sidebar-item${activeIndex === idx ? ' combatant-active-row' : ''}${c.type === 'Monstre' ? ' combat-sidebar-monster' : ''}`}
              style={{ cursor: c.type === 'Monstre' ? 'pointer' : 'default', background: activeIndex === idx ? '#f9f5e7' : undefined }}
              onClick={() => c.type === 'Monstre' && onSelectCombatant && onSelectCombatant(idx)}
            >
              <span className={`combat-sidebar-indicator ${c.pv/c.pvMax > 0.7 ? 'green' : c.pv/c.pvMax > 0.3 ? 'yellow' : 'red'}`}></span>
              <span>{c.nom}</span>
              <span style={{fontSize: '0.95em', color: '#888', marginLeft: 6}}>PV: {c.pv}/{c.pvMax}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 