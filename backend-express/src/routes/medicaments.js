// 📁 backend/routes/medicaments.js
const express = require('express');
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');

const router = express.Router();

// Liste des médicaments avec recherche et pagination
router.get('/', verifierToken, (req, res) => {  
  const search = req.query.search || '';
  const classification = req.query.classification || '';
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20; // 👈 dynamique
  const offset = (page - 1) * limit;

  // 1️⃣ Compter le nombre total de médicaments correspondant à la recherche
  const countSql = `
    SELECT COUNT(*) AS totalCount 
    FROM table_medicaments
    WHERE nom_commercial LIKE ?
    AND pp_gn LIKE ?
     `;
  db.query(countSql, [`%${search}%`, `%${classification}%`], (err, countResult) => {
    if (err) return res.status(500).json({ message: 'Erreur lors du comptage des médicaments' });

    const totalCount = countResult[0].totalCount;

    // 2️⃣ Récupérer les résultats de la page courante
    const sql = `
      SELECT * 
      FROM table_medicaments
      WHERE nom_commercial LIKE ?
      AND pp_gn LIKE ?
      ORDER BY id_medicament ASC
      LIMIT ? OFFSET ?
    `;
    db.query(sql, [`%${search}%`, `%${classification}%`, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ message: 'Erreur récupération medicaments' });

      // On renvoie les résultats + le totalCount
      res.json({
        results,
        totalCount
      });
    });
  });
});

// Compter le nombre total de médicaments
router.get('/total', verifierToken, (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM table_medicaments';
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur lors du comptage des médicaments' });
    res.json({ total: result[0].total });
  });
});


// Ajouter un médicament
router.post('/', verifierToken, (req, res) => {
  const { nom_commercial, statut_medicament, dosage, forme, classification, prix, presentation, remboursable} = req.body;

  const sql = 'INSERT INTO table_medicaments (nom_commercial, statut_medicament, dosage, forme, pp_gn, ppv, presentation, remboursable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [nom_commercial, statut_medicament, dosage, forme, classification, prix, presentation, remboursable], (err, result) => {
    if (err) return res.status(500).json({ message: 'Erreur ajout medicament' });
    res.status(201).json({ message: 'Medicament ajouté', id_medicament: result.insertId });
  });
});

// Mise à jour d’un médicament
router.put('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const { nom_commercial, statut_medicament, dosage, forme, pp_gn, ppv, presentation, remboursable } = req.body;

  const sql = 'UPDATE table_medicaments SET nom_commercial = ?, statut_medicament = ?, dosage = ?, forme = ?, pp_gn = ?, ppv = ?, presentation = ?, remboursable = ? WHERE id_medicament = ?';
  db.query(sql, [nom_commercial, statut_medicament, dosage, forme, pp_gn, ppv, presentation, remboursable, id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur mise à jour medicament' });
    res.status(200).json({ message: 'Medicament mis à jour' });
  });
});

// Suppression d’un médicament
router.delete('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM table_medicaments WHERE id_medicament = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur suppression medicament' });
    res.status(200).json({ message: 'Medicament supprimé' });
  });
});
module.exports = router;
