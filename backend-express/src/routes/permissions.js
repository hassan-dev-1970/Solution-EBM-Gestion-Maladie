const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Récupérer toutes les permissions
router.get('/', (req, res) => {
  db.query('SELECT * FROM permissions ORDER BY nom', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(rows);
  });
});

router.post('/', (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ message: 'Nom requis.' });

  const sql = 'INSERT INTO permissions (nom) VALUES (?)';
  db.query(sql, [nom], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.status(201).json({ message: 'Permission ajoutée.' });
  });
});
// Mettre à jour une permission
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;

  if (!nom) return res.status(400).json({ message: 'Nom requis.' });

  const sql = 'UPDATE permissions SET nom = ? WHERE id_permission = ?';
  db.query(sql, [nom, id], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.status(200).json({ message: 'Permission mise à jour.' });
  });
});
module.exports = router;
