import React from 'react';

// Utilitaire pour normaliser le nom du monstre pour l'URL Aidedd
function normalizeName(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // retire accents
    .replace(/[^a-z0-9 ]/g, '') // retire caractères spéciaux
    .replace(/ /g, '-'); // espaces en tirets
}

export default function MonsterStatBlock({ nom }) {
  if (!nom) return null;
  const url = `http://localhost:3001/aidedd?vf=${normalizeName(nom)}`;
  return (
    <iframe
      title={nom}
      src={url}
      style={{ width: '100%', height: '70vh', border: '2px solid #a67c52', borderRadius: 12, background: '#fff', display: 'block' }}
    />
  );
} 