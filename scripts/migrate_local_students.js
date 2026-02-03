// Migrate local data/students.json into /api/signup
const fs = require('fs');
const fetch = require('node-fetch');
(async () => {
  const data = JSON.parse(fs.readFileSync('data/students.json'));
  for (const s of data) {
    const payload = {
      nom: s.nom || s.Nom || '',
      prenom: s.prenom || s.Prenom || '',
      num: s.num || s.id || null,
      filiere: s.filiere || '',
      email_academique: s.email_academique || s.email || '',
      deviceId: s.deviceId || ''
    };
    try {
      const r = await fetch('http://localhost:3005/api/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const json = await r.json();
      console.log('Migrated', payload.email_academique, json);
    } catch (e) { console.error('Error migrating', payload.email_academique, e); }
  }
})();