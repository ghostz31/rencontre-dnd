import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import EncounterBuilder from './EncounterBuilder';

function App() {
  return (
    <BrowserRouter>
      <EncounterBuilder />
    </BrowserRouter>
  );
}

export default App;