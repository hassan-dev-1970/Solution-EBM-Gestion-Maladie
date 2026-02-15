
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');

// 📋 GET - Liste des catégories de personnel
router.get('/', verifierToken, (req, res) => {
  const sql = 'SELECT * FROM categorie_personnel ORDER BY nom';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur récupération catégories', error: err });
    res.json(results);
  });
});

// ➕ POST - Ajouter une catégorie
router.post('/', verifierToken, (req, res) => {
  const { nom } = req.body;
  if (!nom) return res.status(400).json({ message: 'Le nom est requis' });

  const sql = 'INSERT INTO categorie_personnel (nom) VALUES (?)';
  db.query(sql, [nom], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur ajout', error: err });
    res.status(201).json({ message: 'Catégorie ajoutée', id: result.insertId });
  });
});

// ✏️ PUT - Modifier une catégorie
router.put('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const { nom } = req.body;
  const sql = 'UPDATE categorie_personnel SET nom = ? WHERE id = ?';

  db.query(sql, [nom, id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur modification', error: err });
    res.json({ message: 'Catégorie modifiée' });
  });
});

// 🗑️ DELETE - Supprimer une catégorie
router.delete('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM categorie_personnel WHERE id = ?';

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur suppression', error: err });
    res.json({ message: 'Catégorie supprimée' });
  });
});

module.exports = router;
