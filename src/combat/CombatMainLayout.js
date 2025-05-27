import React from 'react';
import './combat.css';
import CombatLeftPanel from './CombatLeftPanel';
import CombatRightPanel from './CombatRightPanel';

export default function CombatMainLayout({
  combatants,
  selectedMonster,
  onUpdateCombatant,
  onRenameCombatant,
  onConfirm,
  onNavigate,
  currentMonsterIndex,
  monstersList,
  currentTurnIndex,
  currentRound,
  onNextTurn,
  onPrevTurn,
  activeCombatant,
  onSelectCombatant,
  rightPanelContent,
  phase
}) {
  return (
    <div className="combat-parchment-bg">
      <div className="combat-main-layout">
        {/* Colonne gauche */}
        <div className="combat-left-panel" style={{position: 'relative'}}>
          {/* Carte Round/Tour */}
          <div className="combat-card" style={{marginBottom: 18, display: 'flex', alignItems: 'center', gap: 24, justifyContent: 'space-between', padding: '18px 24px'}}>
            <div style={{fontSize: '1.2em', color: 'var(--bento-accent2)', fontWeight: 'bold'}}>
              Round {currentRound} • Tour {currentTurnIndex + 1}
            </div>
            {activeCombatant && (
              <div style={{fontSize: '1.1em', color: 'var(--bento-accent)', fontWeight: 'bold'}}>
                Actif : <span style={{color: 'var(--bento-accent2)'}}>{activeCombatant.nom}</span>
              </div>
            )}
          </div>
          {/* Carte Affrontement/Initiative */}
          <div className="combat-card" style={{marginBottom: 18, padding: '18px 24px'}}>
            <h1 style={{fontSize: '1.5em', color: 'var(--bento-accent2)', fontWeight: 800, marginBottom: 2}}>Affrontement</h1>
            <div style={{fontSize: '1.1em', color: 'var(--bento-accent)', marginBottom: 0}}>Initiative</div>
          </div>
          {/* Tableau d'initiative et sidebar sticky */}
          <div style={{display: 'flex', alignItems: 'flex-start', gap: 24}}>
            <div style={{flex: 1}}>
              <CombatLeftPanel
                combatants={combatants}
                onUpdateCombatant={onUpdateCombatant}
                onRenameCombatant={onRenameCombatant}
                activeIndex={currentTurnIndex}
                onSelectCombatant={onSelectCombatant}
                hideConfirmButton={true}
                hideSidebar={true}
                phase={phase}
              />
              {/* Boutons navigation sous le tableau */}
              <div style={{display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 12}}>
                <button className="combat-btn" onClick={onPrevTurn}>◀ Précédent</button>
                <button className="combat-btn green" onClick={onNextTurn}>Suivant ▶</button>
              </div>
            </div>
            {/* Sidebar sticky (desktop) */}
            <div className="combat-sidebar" style={{position: 'sticky', top: 32, minWidth: 180, maxHeight: '60vh', overflowY: 'auto'}}>
              {combatants.map((c, idx) => (
                <div
                  key={c.id}
                  className={`combat-sidebar-item${currentTurnIndex === idx ? ' combatant-active-row' : ''}${c.type === 'Monstre' ? ' combat-sidebar-monster' : ''}`}
                  style={{ cursor: c.type === 'Monstre' ? 'pointer' : 'default' }}
                  onClick={() => c.type === 'Monstre' && onSelectCombatant && onSelectCombatant(idx)}
                >
                  <span className={`combat-sidebar-indicator ${c.pv/c.pvMax > 0.7 ? 'green' : c.pv/c.pvMax > 0.3 ? 'yellow' : 'red'}`}></span>
                  <span>{c.nom}</span>
                  <span style={{fontSize: '0.95em', color: '#888', marginLeft: 6}}>PV: {c.pv}/{c.pvMax}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Colonne droite : fiche monstre */}
        <div className="combat-right-panel" style={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', boxShadow: '0 8px 32px #0002'}}>
          {rightPanelContent && (
            <div style={{flex: 1, width: '100%', overflowY: 'auto'}}>{rightPanelContent}</div>
          )}
        </div>
      </div>
    </div>
  );
} 