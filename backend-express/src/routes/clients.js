const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');

// ➕ Ajouter un client
router.post('/', verifierToken, (req, res) => {
  const { raison_sociale, adresse, ville, personne_contact, tel, mail, agence, commercial } = req.body;
  const id_utilisateur = req.user.id;

 const sql = `INSERT INTO clients (raison_sociale, adresse, ville, personne_contact, tel, mail, agence, commercial, id_utilisateur)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [raison_sociale, adresse, ville, personne_contact, tel, mail, agence, commercial, id_utilisateur], (err, result) => {
    if (err) { 
       console.error('❌ Erreur SQL :', err); // 🔍 Ajout ce log
      return res.status(500).json({ message: 'Erreur ajout client' });   
    }
    res.status(201).json({ message: 'Client ajouté avec succès', id_client: result.insertId });
  });
});

// 📋 Liste des clients avec recherche et pagination
router.get('/', verifierToken, (req, res) => {  
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT * FROM clients
    WHERE raison_sociale LIKE ?
    ORDER BY date_creation DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [`%${search}%`, limit, offset], (err, results) => {
    if (err) return res.status(500).json({ message: 'Erreur récupération clients' });
    res.json(results);
  });
});

// ✏️ Mise à jour d’un client
router.put('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const { raison_sociale, adresse, ville, personne_contact, tel, mail, agence, commercial } = req.body;

  const sql = `UPDATE clients SET raison_sociale = ?, adresse = ?, ville = ?, personne_contact = ?, tel = ?, mail = ?, 
  agence = ?, commercial = ? WHERE id_client = ?`;

  db.query(sql, [raison_sociale, adresse, ville, personne_contact, tel, mail, agence, commercial, id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur mise à jour client' });
    res.status(200).json({ message: 'Client mis à jour' });
  });
});

// 🗑️ Suppression
router.delete('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM clients WHERE id_client = ?`;

  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur suppression client' });
    res.status(200).json({ message: 'Client supprimé' });
  });
});

module.exports = router;
