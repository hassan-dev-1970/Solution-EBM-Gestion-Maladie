const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');


// =============== CONTRATS ===============================================================================

// 📄 Liste des contrats
// 📄 Récupérer tous les contrats avec pagination et recherche
router.get('/', verifierToken, (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
// c = 'contrats'
// cl = 'clients'
// cp = 'categorie_personnel'
// ccp = 'contrat_categorie_personnel'
  const sql = `
    SELECT c.*, cl.raison_sociale AS client, cl.agence AS agence,
    GROUP_CONCAT(DISTINCT cp.nom SEPARATOR ', ') AS categories,
    GROUP_CONCAT(DISTINCT cp.id_categorie) AS categories_ids
    FROM contrats c
    LEFT JOIN clients cl ON c.id_client = cl.id_client
    LEFT JOIN contrat_categorie_personnel ccp ON c.id_contrat = ccp.contrat_id
    LEFT JOIN categorie_personnel cp ON ccp.categorie_id = cp.id_categorie
    WHERE cl.raison_sociale LIKE ? AND c.statut = 'Résilié'
    GROUP BY c.id_contrat
    ORDER BY c.date_creat DESC
    LIMIT ? OFFSET ?
  `;

  db.query(sql, [`%${search}%`, limit, offset], (err, results) => {
    if (err) {
      console.error('❌ Erreur récupération contrats :', err);
      return res.status(500).json({ message: 'Erreur récupération des contrats' });
    }

    // Transforme la chaîne des IDs "1,3,5" en tableau [1, 3, 5]
    const formattedResults = results.map(contrat => ({
      ...contrat,
      categories_ids: contrat.categories_ids
        ? contrat.categories_ids.split(',').map(id => parseInt(id))
        : []
    }));

    res.json(formattedResults);
  });
});





module.exports = router;
