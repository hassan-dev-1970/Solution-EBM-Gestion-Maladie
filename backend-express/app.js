// 📁 backend/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

// 📁 backend/config/db.js
const connexionRoutes = require('./src/routes/connexion');
const utilisateursRoutes = require('./src/routes/utilisateurs');
const verifierToken = require('./src/middleware/verifierToken');
const clientsRoutes = require('./src/routes/clients');
const rolesRoutes = require('./src/routes/roles');
const permissionsRoutes = require('./src/routes/permissions');
const rolePermissionsRoutes = require('./src/routes/rolePermissions');
const typesPrestationsRoutes = require('./src/routes/typesPrestations');
const contratsRoutes = require('./src/routes/contrats');
const contratsResiliesRoutes = require('./src/routes/contrats-resilies'); 
const categorieRoutes = require('./src/routes/categorie-personnel');
const medicamentsRoutes = require('./src/routes/medicaments');
const adhesionRoutes = require('./src/routes/adhesions');
const paysRoutes = require('./src/routes/pays');
const villesRoutes = require('./src/routes/villes');


const app = express();
const PORT = process.env.PORT || 5000;

// 🔧 Middleware
global.__basedir = __dirname;
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// 📦 Routes
app.use('/api', connexionRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);
app.use('/api/clients', clientsRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api', rolePermissionsRoutes); // pour les permissions des rôles
app.use('/api/types-prestations', typesPrestationsRoutes);
app.use('/api/contrats', contratsRoutes);
app.use('/api/categorie-personnel', categorieRoutes);
app.use('/api/contrats-resilies', contratsResiliesRoutes); // Uncomment if needed
app.use('/api/medicaments', medicamentsRoutes);
app.use('/api/adhesions', adhesionRoutes);
app.use('/api/pays', paysRoutes);
app.use('/api/villes', villesRoutes);

// 🔐 Middleware de vérification du token
// 🔐 Route protégée
app.get('/api/protected', verifierToken, (req, res) => {
  res.json({ message: `Bienvenue, ${req.user.email}` });
});

app.get('/api/utilisateurs', verifierToken, (req, res) => {
  console.log("👤 Permissions reçues dans req.user :", req.user?.permissions);

  if (!req.user?.permissions?.includes('administration:voir')) {
    return res.status(403).json({ message: 'Permission refusée' });
  }

  const sql = 'SELECT id_utilisateur, nom, prenom, login, date FROM utilisateurs';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error("❌ Erreur SQL :", err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }
    res.json(rows);
  });
});

// 🚀 Démarrer le serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur Express en cours sur le port ${PORT}`);
});

// 🛑 Fermeture propre de MySQL
const db = require('./src/config/db');
process.on('SIGINT', () => {
  db.end((err) => {
    if (err) {
      console.error('❌ Erreur fermeture MySQL :', err);
    } else {
      console.log('✅ Connexion MySQL fermée');
    }
    process.exit();
  });
});

module.exports = app;