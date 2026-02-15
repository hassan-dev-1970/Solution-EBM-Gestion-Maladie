// src/middleware/verifierToken.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const util = require('util');
require('dotenv').config();

const query = util.promisify(db.query).bind(db);

async function verifierToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: 'Token requis' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Utiliser 'id' car c'est le nom dans le token
    const userId = parseInt(decoded.id, 10);
    if (isNaN(userId)) {
      return res.status(403).json({ message: 'ID utilisateur invalide' });
    }

    // ✅ Requête avec id_utilisateur = ?
    const rows = await query(
      'SELECT id_client FROM utilisateurs WHERE id_utilisateur = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Utilisateur non trouvé en base' });
    }

    req.user = {
      id_utilisateur: userId,        // 👈 standardisez ici
      role: decoded.role,
      permissions: decoded.permissions || [],
      id_client: rows[0].id_client
    };

    console.log("✅ Utilisateur authentifié :", req.user);
    next();
  } catch (err) {
    console.error("❌ Erreur vérification token :", err.message);
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Token invalide' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expiré' });
    }
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

module.exports = verifierToken;