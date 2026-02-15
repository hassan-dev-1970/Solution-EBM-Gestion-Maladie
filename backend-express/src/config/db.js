// 📁 backend/config/db.js
const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bddebm'
});

db.connect((err) => {
  if (err) {
    console.error('❌ Erreur de connexion MySQL :', err);
    return;
  }
  console.log('✅ Connecté à MySQL');
});

module.exports = db;