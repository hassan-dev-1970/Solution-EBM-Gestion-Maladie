
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');
const verifierToken = require('../middleware/verifierToken');

// ✅ Récupérer les permissions d'un rôle
router.get('/roles/:roleId/permissions', verifierToken, (req, res) => {
  const roleId = req.params.roleId;

  const sql = `
    SELECT p.id_permission, p.nom, 
      CASE WHEN rp.permission_id IS NOT NULL THEN 1 ELSE 0 END AS active
    FROM permissions p
    LEFT JOIN role_permissions rp 
      ON p.id_permission = rp.permission_id AND rp.role_id = ?
    ORDER BY p.nom;
  `;

  db.query(sql, [roleId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erreur serveur' });
    res.json(rows);
  });
});

// ✅ Mettre à jour les permissions d'un rôle
router.post('/roles/:roleId/permissions', verifierToken, (req, res) => {
  const roleId = req.params.roleId;
  const permissionIds = req.body.permissions;

  if (!Array.isArray(permissionIds)) {
    return res.status(400).json({ message: 'Format de données invalide' });
  }

  const deleteSql = 'DELETE FROM role_permissions WHERE role_id = ?';
  db.query(deleteSql, [roleId], (err) => {
    if (err) return res.status(500).json({ message: 'Erreur suppression' });

    if (permissionIds.length === 0) {
      return res.json({ message: 'Permissions mises à jour (aucune)' });
    }

    const insertSql = 'INSERT INTO role_permissions (role_id, permission_id) VALUES ?';
    const values = permissionIds.map(pid => [roleId, pid]);

    db.query(insertSql, [values], (err) => {
      if (err) return res.status(500).json({ message: 'Erreur insertion' });
      res.json({ message: 'Permissions mises à jour' });
    });
  });
});

module.exports = router;
