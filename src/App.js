import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import EncounterBuilder from './EncounterBuilder';
import './combat/combat.css';

function App() {
  return (
    <BrowserRouter>
      <EncounterBuilder />
    </BrowserRouter>
  );
}

export default App;