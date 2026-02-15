// routes/roles.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /api/roles - Retourne tous les rôles
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM roles ORDER BY nom';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des rôles :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }

    res.status(200).json(results);
  });
});

module.exports = router;
