const fetch = require('node-fetch');

const url = 'https://www.aidedd.org/dnd/monstres.php?vf=cockatrice';
fetch(url)
  .then(res => res.text())
  .then(txt => console.log(txt.slice(0, 200)))
  .catch(e => console.error('Fetch error:', e));

const port = 3002;
