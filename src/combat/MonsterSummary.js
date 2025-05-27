import React from 'react';

export default function MonsterSummary({ monster }) {
  if (!monster) return null;
  return (
    <div className="combat-monster-summary">
      <div className="combat-monster-header">{monster.nom || 'Béhir'}</div>
      <div className="combat-monster-sub">{monster.type || 'Monstruosité de taille TG, neutre mauvais'}</div>
      <div className="combat-monster-stats">
        <div className="combat-monster-stat"><b>CA</b> {monster.ca ?? 17}</div>
        <div className="combat-monster-stat"><b>PV</b> {monster.pvMax ?? 168} {monster.pvFormula ? `(${monster.pvFormula})` : '(16d12+64)'}</div>
        <div className="combat-monster-stat"><b>Vitesse</b> {monster.vitesse ?? '15m/12m escalade'}</div>
      </div>
      <div className="combat-monster-stats">
        <div className="combat-monster-stat"><b>Compétences</b> {monster.competences || 'Discrétion +7, Perception +6'}</div>
        <div className="combat-monster-stat"><b>Immunités</b> {monster.immunites || 'foudre'}</div>
        <div className="combat-monster-stat"><b>Sens</b> {monster.sens || 'vision noir 27m'}</div>
      </div>
      <div className="combat-monster-stats">
        <div className="combat-monster-stat"><b>Langues</b> {monster.langues || 'draconique'}</div>
        <div className="combat-monster-stat"><b>Puissance</b> {monster.puissance || '11 (7200 PX)'}</div>
      </div>
      <div className="combat-monster-caracs">
        <div className="combat-monster-carac">FOR {monster.for ?? 23} ({formatMod(monster.for ?? 23)})</div>
        <div className="combat-monster-carac">DEX {monster.dex ?? 16} ({formatMod(monster.dex ?? 16)})</div>
        <div className="combat-monster-carac">CON {monster.con ?? 18} ({formatMod(monster.con ?? 18)})</div>
        <div className="combat-monster-carac">INT {monster.int ?? 7} ({formatMod(monster.int ?? 7)})</div>
        <div className="combat-monster-carac">SAG {monster.sag ?? 14} ({formatMod(monster.sag ?? 14)})</div>
        <div className="combat-monster-carac">CHA {monster.cha ?? 12} ({formatMod(monster.cha ?? 12)})</div>
      </div>
    </div>
  );
}

function formatMod(val) {
  const mod = Math.floor((val - 10) / 2);
  return mod >= 0 ? `+${mod}` : mod;
} 