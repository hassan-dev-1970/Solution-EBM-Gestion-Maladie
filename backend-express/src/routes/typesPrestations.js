// 📁 backend/routes/typesPrestations.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');

// 🔍 Obtenir tous les types de prestations
router.get('/', verifierToken, (req, res) => {
  const sql = 'SELECT * FROM prestations_catalogue ORDER BY id_prestation_std ASC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(results);
  });
});

// ➕ Ajouter un type de prestation
router.post('/', verifierToken, (req, res) => {
  const { libelle, description } = req.body;
  if (!libelle) return res.status(400).json({ message: 'Le libellé est requis.' });

  const sql = 'INSERT INTO prestations_catalogue (libelle_prestation, description) VALUES (?, ?)';
  db.query(sql, [libelle, description], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de l\'ajout' });
    res.status(201).json({ message: 'Type de prestation ajouté', id_prestation_std: result.insertId });
  });
});

// ✏️ Modifier un type de prestation
router.put('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const { libelle, description } = req.body;
  const sql = 'UPDATE prestations_catalogue SET libelle_prestation = ?, description = ? WHERE id_prestation_std = ?';
  db.query(sql, [libelle, description, id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la mise à jour' });
    res.status(200).json({ message: 'Type de prestation mis à jour' });
  });
});

// ❌ Supprimer un type (optionnel)
router.delete('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM prestations_catalogue WHERE id_prestation_std = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur lors de la suppression' });
    res.status(200).json({ message: 'Type de prestation supprimé' });
  });
});

module.exports = router;
