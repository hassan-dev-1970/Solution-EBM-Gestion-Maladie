const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../config/db');

const router = express.Router();

/**
 * ================================
 * 🔎 Vérification email (pré-connexion)
 * ================================
 */
router.post('/connexion/check-email', (req, res) => {
  const { email } = req.body;

  const sql = `
    SELECT 
      u.id_utilisateur,
      u.nom,
      u.prenom,
      u.login,
      u.role_id,
      r.nom AS role
    FROM utilisateurs u
    JOIN roles r ON u.role_id = r.id_role
    WHERE u.login = ?
  `;

  db.query(sql, [email], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({
        exists: false,
        message: 'Cet utilisateur n’existe pas.'
      });
    }

    const user = results[0];

    res.status(200).json({
      exists: true,
      user: {
        id: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        login: user.login,
        role_id: user.role_id,
        role: user.role // ✅ nom du rôle
      }
    });
  });
});

/**
 * ================================
 * 🔐 Connexion utilisateur
 * ================================
 */
router.post('/connexion', (req, res) => {
  const { email, pass } = req.body;

  const sqlUser = `
    SELECT 
      u.*,
      r.nom AS role
    FROM utilisateurs u
    JOIN roles r ON  r.id_role = u.role_id
    WHERE u.login = ?
  `;

  db.query(sqlUser, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(401).json({ message: 'Utilisateur introuvable' });
    }

    const user = results[0];

    const isPasswordValid = await bcrypt.compare(pass, user.pass);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    /**
     * 🔑 Charger les permissions du rôle
     */
    const sqlPermissions = `
      SELECT p.nom
      FROM permissions p
      JOIN role_permissions rp ON p.id_permission = rp.permission_id
      WHERE rp.role_id = ?
    `;

    db.query(sqlPermissions, [user.role_id], (err2, rows) => {
      if (err2) {
        console.error(err2);
        return res.status(500).json({ message: 'Erreur chargement permissions' });
      }

      const permissions = rows.map(r => r.nom);

      /**
       *  Génération du token JWT
       */
      const token = jwt.sign(
        {
          id: user.id_utilisateur,
          role: user.role,        // ✅ nom du rôle
          permissions
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );
      res.status(200).json({
        token,
        user: {
          id: user.id_utilisateur,
          nom: user.nom,
          prenom: user.prenom,
          login: user.login,
          role_id: user.role_id,  // ✅ ID du rôle
          role: user.role,        // ✅ nom du rôle
          permissions
        }
      });
    });
  });
});

module.exports = router;
