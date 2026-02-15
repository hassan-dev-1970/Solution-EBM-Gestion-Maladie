// 📁 backend/routes/utilisateurs.js
const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');

const router = express.Router();

// 🔐 Liste des utilisateurs protégée par token + permission
router.get('/', verifierToken, (req, res) => {
  // ✅ Vérifie si l'utilisateur a la permission nécessaire
  if (!req.user?.permissions?.includes('administration:voir')) {
    console.log("Accès refusé : permission manquante", req.user?.permissions);
    return res.status(403).json({ message: 'Permission refusée' });
  }

  // ✅ Si permission OK, exécute la requête
const sql = `
    SELECT u.*, r.nom AS role
    FROM utilisateurs u
    LEFT JOIN roles r ON u.role_id = r.id_role
    ORDER BY u.nom ASC
  `;    db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Erreur SQL :", err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    console.log("👤 Utilisateurs SQL renvoyés :", rows);
     res.json(rows);
  });
});

// =============================================================================================
// création d'un nouvel utilisateur
// =============================================================================================
router.post('/', verifierToken, async (req, res) => {
  const { nom, prenom, login, role_id, password, id_client } = req.body; // ← ajout de id_client

  if (!nom || !prenom || !login || !role_id || !password) {
    return res.status(400).json({ message: 'Champs manquants.' });
  }

  // 🔑 Rôles qui nécessitent un client
  const rolesDistant = ['user_distant-souscripteur', 'user_distant-adherent'];
  
  // Récupérer le nom du rôle pour vérification
  const roleRows = await new Promise((resolve, reject) => {
    db.query('SELECT nom FROM roles WHERE id_role = ?', [role_id], (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });

  if (roleRows.length === 0) {
    return res.status(400).json({ message: 'Rôle invalide.' });
  }

  const roleName = roleRows[0].nom;

  // ✅ Validation : si rôle distant, id_client est obligatoire
  if (rolesDistant.includes(roleName) && (!id_client || id_client <= 0)) {
    return res.status(400).json({ 
      message: `Le rôle "${roleName}" nécessite un client associé.` 
    });
  }

  // ✅ Pour les autres rôles, id_client doit être null
  const clientIdToSave = rolesDistant.includes(roleName) ? id_client : null;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO utilisateurs (nom, prenom, login, role_id, pass, id_client) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [nom, prenom, login, role_id, hashedPassword, clientIdToSave], (err) => {
      if (err) {
        console.error("Erreur SQL :", err);
        return res.status(500).json({ message: 'Erreur serveur' });
      }
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    });
  } catch (err) {
    console.error("Erreur de hachage du mot de passe :", err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// =============================================================================================

// suppression d'un utilisateur
router.delete('/:id', verifierToken, (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM utilisateurs WHERE id_utilisateur = ?';
  db.query(sql, [id], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  });
});

// =============================================================================================

// mise à jour d'un utilisateur
router.put('/:id', verifierToken, async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, login, pass, role_id, id_client } = req.body; // ← ajout de id_client

  try {
    // 🔑 Récupérer le nom du rôle pour validation
    const roleRows = await new Promise((resolve, reject) => {
      db.query('SELECT nom FROM roles WHERE id_role = ?', [role_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });

    if (roleRows.length === 0) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }

    const roleName = roleRows[0].nom;
    const rolesDistant = ['user_distant-souscripteur', 'user_distant-adherent'];

    // ✅ Validation : si rôle distant, id_client est obligatoire
    let clientIdToSave;
    if (rolesDistant.includes(roleName)) {
      if (!id_client || id_client <= 0) {
        return res.status(400).json({ 
          message: `Le rôle "${roleName}" nécessite un client associé.` 
        });
      }
      clientIdToSave = id_client;
    } else {
      // Pour les autres rôles, forcer NULL
      clientIdToSave = null;
    }

    // 🔧 Préparer la requête SQL
    const updateFields = [
      'nom = ?',
      'prenom = ?',
      'login = ?',
      'role_id = ?',
      'id_client = ?' // ← toujours mettre à jour
    ];
    const values = [nom, prenom, login, role_id, clientIdToSave];

    if (pass) {
      updateFields.push('pass = ?');
      values.push(pass);
    }

    const sql = `UPDATE utilisateurs SET ${updateFields.join(', ')} WHERE id_utilisateur = ?`;
    values.push(id);

    db.query(sql, values, (err) => {
      if (err) {
        console.error("Erreur mise à jour :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }

      // 🔁 Récupérer rôle + client pour réponse
      const queries = [
        new Promise((resolve) => {
          db.query('SELECT nom FROM roles WHERE id_role = ?', [role_id], (err, rows) =>
            resolve(rows[0]?.nom || null)
          );
        }),
        new Promise((resolve) => {
          db.query('SELECT raison_sociale FROM clients WHERE id_client = ?', [clientIdToSave], (err, rows) =>
            resolve(rows[0]?.raison_sociale || null)
          );
        })
      ];

      Promise.all(queries).then(([roleNom, clientNom]) => {
        res.json({
          utilisateur: {
            id_utilisateur: parseInt(id),
            nom,
            prenom,
            login,
            role_id,
            role: roleNom,
            id_client: clientIdToSave,
            client: clientNom
          }
        });
      });
    });
  } catch (err) {
    console.error("Erreur serveur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
