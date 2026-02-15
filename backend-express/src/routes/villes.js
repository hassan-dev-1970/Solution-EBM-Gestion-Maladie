// routes/adhesions.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');


// 📋 Liste des VILLES
router.get('/', verifierToken, (req, res) => {  
    const sql = ` SELECT * FROM table_ville`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur récupération villes' });
    res.json(results);
  });
});
module.exports = router;
