const express = require('express');
const router = express.Router();
const db = require('../config/db');
const verifierToken = require('../middleware/verifierToken');
const ExcelJS = require("exceljs");

// Promisified query function
const queryAsync = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error("❌ SQL Error:", err);
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

// =============== CONTRATS ===============================================================================

// ➕ Ajouter un contrat avec catégories
router.post('/', verifierToken, (req, res) => {
  const {
    id_client, compagnie, police, type_contrat, date_debut, date_fin,
    taux_remb, plafond,
    taux_prime_mald, taux_prime_incap, taux_prime_deces, taux_prime_deces_accidentel,
    taux_prime_gros_risque, taux_prime_retraite, taux_prime_expatries,
    age_limite_adh, age_limite_conj, age_limite_enf, age_limite_enf_scol, age_limite_enf_handicap,
    garantie_maladie, garantie_incapacite_invalidite_temporaire,
    garantie_deces_invalidite_totale, garantie_deces_accidentel,
    garantie_gros_risque, garantie_maladie_retraite, garantie_maladie_expatries,
    mode_remb, circuit, statut, 
    categories = []
  } = req.body;

  const user_id = req.user.id;

  const contratSql = `
    INSERT INTO contrats (
      id_client, compagnie, police, type_contrat, date_debut, date_fin,
      taux_remb, plafond,
      taux_prime_mald, taux_prime_incap, taux_prime_deces, taux_prime_deces_accidentel,
      taux_prime_gros_risque, taux_prime_retraite, taux_prime_expatries,
      age_limite_adh, age_limite_conj, age_limite_enf, age_limite_enf_scol, age_limite_enf_handicap,
      garantie_maladie, garantie_incapacite_invalidite_temporaire,
      garantie_deces_invalidite_totale, garantie_deces_accidentel, garantie_gros_risque, garantie_maladie_retraite, garantie_maladie_expatries,
      mode_remb, circuit, statut,
      user_id, date_creat
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
  `;

  const values = [
    id_client, compagnie, police, type_contrat, date_debut, date_fin,
    taux_remb, plafond,
    taux_prime_mald, taux_prime_incap, taux_prime_deces, taux_prime_deces_accidentel,
    taux_prime_gros_risque, taux_prime_retraite, taux_prime_expatries,
    age_limite_adh, age_limite_conj, age_limite_enf, age_limite_enf_scol, age_limite_enf_handicap,
    garantie_maladie, garantie_incapacite_invalidite_temporaire,
    garantie_deces_invalidite_totale, garantie_deces_accidentel, garantie_gros_risque, garantie_maladie_retraite, garantie_maladie_expatries,
    mode_remb, circuit, statut,
    user_id
  ];

  db.query(contratSql, values, (err, result) => {
    if (err) {
      console.error("❌ Erreur insertion contrat :", err);
      return res.status(500).json({ message: "Erreur lors de l'enregistrement du contrat" });
    }

    const id_contrat = result.insertId;

    // 🔄 Insérer les catégories liées sans doublons
    const uniqueCategories = [...new Set(categories)];
    if (uniqueCategories.length > 0) {
      const sqlCat = `INSERT INTO contrat_categorie_personnel (contrat_id, categorie_id) VALUES ?`;
      const valuesCat = uniqueCategories.map(id => [id_contrat, id]);

      db.query(sqlCat, [valuesCat], (errCat) => {
        if (errCat) {
          console.error("❌ Erreur insertion des catégories :", errCat);
          return res.status(500).json({ message: "Contrat créé, mais erreur lors de l'association des catégories." });
        }

        res.status(201).json({ message: "Contrat et catégories ajoutés avec succès." });
      });
    } else {
      res.status(201).json({ message: "Contrat ajouté sans catégories." });
    }
  });
});

//=======================================================================================================================

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
    WHERE cl.raison_sociale LIKE ? AND c.statut = 'Actif'
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

// 🗑️ Supprimer un contrat
router.delete('/:id_contrat', verifierToken, (req, res) => {
  const { id_contrat } = req.params;

  const deleteCatSQL = 'DELETE FROM contrat_categorie_personnel WHERE contrat_id = ?';
  const deleteContratSQL = 'DELETE FROM contrats WHERE id_contrat = ?';

  db.query(deleteCatSQL, [id_contrat], (errCat) => {
    if (errCat) {
      console.error('❌ Erreur suppression catégories liées au contrat :', errCat);
      return res.status(500).json({ message: "Erreur lors de la suppression des catégories du contrat." });
    }

    db.query(deleteContratSQL, [id_contrat], (err) => {
      if (err) {
        console.error('❌ Erreur suppression contrat :', err);
        return res.status(500).json({ message: "Erreur lors de la suppression du contrat." });
      }

      res.status(200).json({ message: "Contrat supprimé avec succès." });
    });
  });
});

//=======================================================================================================================


// 📝 Modification d'un contrat (avec les catégories)
router.put('/:id_contrat', verifierToken, (req, res) => {
  const { id_contrat } = req.params;

  const {
    id_client, compagnie, police, type_contrat, date_debut, date_fin,
    taux_remb, plafond,
    taux_prime_mald, taux_prime_incap, taux_prime_deces, taux_prime_deces_accidentel,
    taux_prime_gros_risque, taux_prime_retraite, taux_prime_expatries,
    age_limite_adh, age_limite_conj, age_limite_enf,
    age_limite_enf_scol, age_limite_enf_handicap,
    garantie_maladie, garantie_incapacite_invalidite_temporaire,
    garantie_deces_invalidite_totale, garantie_deces_accidentel,
    garantie_gros_risque, garantie_maladie_retraite, garantie_maladie_expatries,
    mode_remb, circuit, statut, date_resiliation, 
    // Catégories liées (IDs)
    categorie_ids = []
  } = req.body;

  const user_id = req.user.id;
  const user_id_edit = req.user.id;

  const updateContratSQL = `
    UPDATE contrats SET
      id_client = ?, compagnie = ?, police = ?, type_contrat = ?,
      date_debut = ?, date_fin = ?, taux_remb = ?, plafond = ?,
      taux_prime_mald = ?, taux_prime_incap = ?, taux_prime_deces = ?,
      taux_prime_deces_accidentel = ?, taux_prime_gros_risque = ?,
      taux_prime_retraite = ?, taux_prime_expatries = ?,
      age_limite_adh = ?, age_limite_conj = ?, age_limite_enf = ?,
      age_limite_enf_scol = ?, age_limite_enf_handicap = ?,
      garantie_maladie = ?, garantie_incapacite_invalidite_temporaire = ?,
      garantie_deces_invalidite_totale = ?, garantie_deces_accidentel = ?,
      garantie_gros_risque = ?, garantie_maladie_retraite = ?, garantie_maladie_expatries = ?, mode_remb = ?, circuit = ?, statut = ?,
      date_resiliation = ?,
      user_id = ?, user_id_edit = ?, date_modif = NOW()
    WHERE id_contrat = ?
  `;
// ✅ Nettoyer la date_resiliation (ne garder que 'YYYY-MM-DD')
const date_resiliation_formatted = date_resiliation
  ? date_resiliation.split('T')[0]
  : null;

  const values = [
    id_client, compagnie, police, type_contrat, date_debut, date_fin,
    taux_remb, plafond,
    taux_prime_mald, taux_prime_incap, taux_prime_deces, taux_prime_deces_accidentel,
    taux_prime_gros_risque, taux_prime_retraite, taux_prime_expatries,
    age_limite_adh, age_limite_conj, age_limite_enf,
    age_limite_enf_scol, age_limite_enf_handicap,
    garantie_maladie, garantie_incapacite_invalidite_temporaire,
    garantie_deces_invalidite_totale, garantie_deces_accidentel,
    garantie_gros_risque, garantie_maladie_retraite, garantie_maladie_expatries,
    mode_remb, circuit, statut, date_resiliation_formatted,
    user_id, user_id_edit,
    id_contrat
  ];

  db.query(updateContratSQL, values, (err) => {
    if (err) {
      console.error("❌ Erreur mise à jour contrat :", err);
      return res.status(500).json({ message: "Erreur lors de la mise à jour du contrat" });
    }

    // 🔄 Mettre à jour les catégories
    const deleteCatSQL = 'DELETE FROM contrat_categorie_personnel WHERE contrat_id = ?';
    db.query(deleteCatSQL, [id_contrat], (errCat) => {
      if (errCat) {
        console.error("❌ Erreur suppression des anciennes catégories :", errCat);
        return res.status(500).json({ message: "Erreur lors de la suppression des catégories du contrat." });
      }

      const cleanedCatIds = categorie_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (cleanedCatIds.length > 0) {
        const insertSQL = 'INSERT INTO contrat_categorie_personnel (contrat_id, categorie_id) VALUES ?';
        const insertValues = cleanedCatIds.map(catId => [id_contrat, catId]);

        db.query(insertSQL, [insertValues], (errInsert) => {
          if (errInsert) {
            console.error("❌ Erreur insertion catégories :", errInsert);
            return res.status(500).json({ message: "Contrat mis à jour, mais erreur sur les catégories." });
          }
          return res.status(200).json({ message: "Contrat et catégories mis à jour avec succès." });
        });
      } else {
        return res.status(200).json({ message: "Contrat mis à jour sans catégories." });
      }
    });
  });
});
//=======================================================================================================================


// 📝 Détail d’un contrat (avec utilisateurs + catégories liées) pour l'affichge de la fiche technique du contrat
// c = 'contrats'
// cl = 'clients'
// cp = 'categorie_personnel'
// ccp = 'contrat_categorie_personnel'
router.get('/:id_contrat', verifierToken, (req, res) => {
  const { id_contrat } = req.params;

  const sql = `
    SELECT c.*, 
           cl.raison_sociale AS nom_client, cl.agence AS agence,
           c.police AS numero_police,
           CONCAT(u.nom, ' ', u.prenom) AS cree_par,
           CONCAT(u2.nom, ' ', u2.prenom) AS modifie_par,
           GROUP_CONCAT(DISTINCT cp.nom SEPARATOR ', ') AS categories
    FROM contrats c
    LEFT JOIN clients cl ON c.id_client = cl.id_client
    LEFT JOIN utilisateurs u ON c.user_id = u.id_utilisateur
    LEFT JOIN utilisateurs u2 ON c.user_id_edit = u2.id_utilisateur
    LEFT JOIN contrat_categorie_personnel ccp ON c.id_contrat = ccp.contrat_id
    LEFT JOIN categorie_personnel cp ON ccp.categorie_id = cp.id_categorie
    WHERE c.id_contrat = ?
    GROUP BY c.id_contrat
  `;

  db.query(sql, [id_contrat], (err, results) => {
    if (err) {
      console.error("❌ Erreur chargement détail contrat :", err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Contrat non trouvé' });
    }

    const contrat = results[0];

    // ➕ Charger les ID des catégories liées (utile si besoin)
    const catIdSql = `
      SELECT categorie_id FROM contrat_categorie_personnel WHERE contrat_id = ?
    `;

    db.query(catIdSql, [id_contrat], (err2, rows) => {
      if (err2) {
        console.error("❌ Erreur chargement catégories associées :", err2);
        return res.status(500).json({ message: 'Erreur chargement des catégories liées' });
      }

      contrat.categorie_ids = rows.map(r => r.categorie_id);

      res.json(contrat);
    });
  });
});


//=======================================================================================================================
// =============== PRESTATIONS CONTRATS ===============================================================================
//=======================================================================================================================


// Vérifier si un contrat a déjà des prestations
router.get('/:id_contrat/has-prestations', verifierToken, (req, res) => {
  const { id_contrat } = req.params;

  const sql = `SELECT COUNT(*) AS total FROM contrat_prestations WHERE id_contrat = ?`;

  db.query(sql, [id_contrat], (err, results) => {
    if (err) {
      console.error("❌ Erreur vérification prestations :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    const hasPrestations = results[0].total > 0;
    res.json({ hasPrestations });
  });
});


// Ajouter des prestations à un contrat
router.post('/:id_contrat/prestations', verifierToken, (req, res) => {
  const { id_contrat } = req.params;
  const prestations = req.body.prestations;

  if (!Array.isArray(prestations)) {
    return res.status(400).json({ message: "Format invalide (attendu: tableau)" });
  }

  // 🔎 Étape 1 : Récupérer l'id_client depuis le contrat
  const sqlClient = "SELECT id_client FROM contrats WHERE id_contrat = ?";
  db.query(sqlClient, [id_contrat], (err, result) => {
    if (err) {
      console.error("❌ Erreur récupération client :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "Contrat introuvable" });
    }

    const id_client = result[0].id_client;

    // 🔎 Étape 2 : Préparer les valeurs
    const values = prestations.map(p => [
      id_client,  // ✅ auto-récupéré
      id_contrat,
      p.type_prestation,

      // Maladie
      p.code_prestat_mald || null,
      p.libelle_prestat_mald || null,
      p.date_debut_prestat_mald || null,
      p.plafond_prestat_mald || null,
      p.taux_remb_prestat_mald || null,
      p.valeur_d || null,
      p.valeur_k || null,
      p.periode_prestat_mald || null,
      p.age_limit_prestat_mald || null,

      // Incapacité
      p.garantie_incapacite || null,
      p.duree_max_incap || null,
      p.franchise_incap || null,
      p.taux_indem_incap || null,
      p.garantie_invalidite || null,
      p.regle_garantie_invalidite || null,
      p.duree_max_inv || null,
      p.base_salaire || null,
      p.beneficiaire || null,
      p.mode_indem || null,

      // Décès
      p.taux_celibataire || null,
      p.taux_marie_sans_enfant || null,
      p.maj_enfant_mineur || null,
      p.taux_max || null,
      p.base_traitement || null,
      p.date_debut_prestat_deces || null,
      p.periodicite || null,

      // Infos techniques
      req.user.id
    ]);

    // 🔎 Étape 3 : Insertion
    const sqlInsert = `
      INSERT INTO contrat_prestations (
        id_client, id_contrat, type_prestation,
        code_prestat_mald, libelle_prestat_mald, date_debut_prestat_mald, plafond_prestat_mald,
        taux_remb_prestat_mald, valeur_d, valeur_k, periode_prestat_mald, age_limit_prestat_mald,
        garantie_incapacite, duree_max_incap, franchise_incap, taux_indem_incap,
        garantie_invalidite, regle_garantie_invalidite, duree_max_inv, base_salaire,
        beneficiaire, mode_indem,
        taux_celibataire, taux_marie_sans_enfant, maj_enfant_mineur,
        taux_max, base_traitement, date_debut_prestat_deces, periodicite,
        user_id
      ) VALUES ?
    `;

    db.query(sqlInsert, [values], (err) => {
      if (err) {
        console.error("❌ Erreur insertion prestations :", err);
        return res.status(500).json({ message: "Erreur serveur" });
      }
      res.status(201).json({ message: "✅ Prestations enregistrées avec succès" });
    });
  });
});


// ✅ Récupérer toutes les prestations d’un contrat
router.get('/:id_contrat/prestations', verifierToken, (req, res) => {
  const { id_contrat } = req.params;

  const sql = `SELECT * FROM contrat_prestations WHERE id_contrat = ?`;

  db.query(sql, [id_contrat], (err, results) => {
    if (err) {
      console.error("❌ Erreur récupération prestations :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }

    res.json(results);
  });
});



//===============================================================================================
//======== Mise à jour d'une prestation =========================================================
//===============================================================================================
// Formater une date au format MySQL 'YYYY-MM-DD HH:MM:SS'
function formatDateForMySQL(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // ✅ Sans heure, pas de décalage
}


// 🔄 Mise à jour d’une prestation
router.put('/:id_contrat/prestations/:id_prestation', verifierToken, (req, res) => {
  const { id_contrat, id_prestation } = req.params;
  const prestation = req.body;

  // Liste des champs autorisés à la mise à jour
  const fields = {
    id_client: prestation.id_client || null,
    type_prestation: prestation.type_prestation || null,

    // Maladie
    code_prestat_mald: prestation.code_prestat_mald || null,
    libelle_prestat_mald: prestation.libelle_prestat_mald || null,
    date_debut_prestat_mald: formatDateForMySQL(prestation.date_debut_prestat_mald) ?? null,
    plafond_prestat_mald: prestation.plafond_prestat_mald ?? null,
    taux_remb_prestat_mald: prestation.taux_remb_prestat_mald ?? null,
    valeur_d: prestation.valeur_d ?? null,
    valeur_k: prestation.valeur_k ?? null,
    periode_prestat_mald: prestation.periode_prestat_mald ?? null,
    age_limit_prestat_mald: prestation.age_limit_prestat_mald ?? null,

    // Incapacité
    garantie_incapacite: prestation.garantie_incapacite || null,
    duree_max_incap: prestation.duree_max_incap ?? null,
    franchise_incap: prestation.franchise_incap ?? null,
    taux_indem_incap: prestation.taux_indem_incap ?? null,
    garantie_invalidite: prestation.garantie_invalidite || null,
    regle_garantie_invalidite: prestation.regle_garantie_invalidite || null,
    duree_max_inv: prestation.duree_max_inv ?? null,
    base_salaire: prestation.base_salaire || null,
    beneficiaire: prestation.beneficiaire || null,
    mode_indem: prestation.mode_indem || null,

    // Décès
    taux_celibataire: prestation.taux_celibataire ?? null,
    taux_marie_sans_enfant: prestation.taux_marie_sans_enfant ?? null,
    maj_enfant_mineur: prestation.maj_enfant_mineur ?? null,
    taux_max: prestation.taux_max ?? null,
    base_traitement: prestation.base_traitement ?? null,
    date_debut_prestat_deces: formatDateForMySQL(prestation.date_debut_prestat_deces) ?? null,
    periodicite: prestation.periodicite ?? null,

    // Audit
    user_modif: req.user.id,
    date_modif: formatDateForMySQL(new Date()),
  };

  const sql = `
    UPDATE contrat_prestations
    SET ?
    WHERE id_contrat = ? AND id_prestation = ?
  `;

  db.query(sql, [fields, id_contrat, id_prestation], (err, result) => {
    if (err) {
      console.error("❌ Erreur update prestation :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: "✅ Prestation mise à jour avec succès" });
  });
});



// 🔹 Suppression d’une prestation
router.delete('/prestations/:id_prestation', verifierToken, (req, res) => {
  const { id_prestation } = req.params;

  const sql = `DELETE FROM contrat_prestations WHERE id_prestation = ?`;

  db.query(sql, [id_prestation], (err, result) => {
    if (err) {
      console.error("❌ Erreur suppression prestation :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.json({ message: "✅ Prestation supprimée avec succès" });
  });
});

// ➕ INSERT nouvelle prestation
router.post('/:id_contrat/prestations', verifierToken, (req, res) => {
  const { id_contrat } = req.params;
  const prestation = req.body;

  const sql = `
    INSERT INTO contrat_prestations (
      id_client, id_contrat, type_prestation,
      code_prestat_mald, libelle_prestat_mald, date_debut_prestat_mald, plafond_prestat_mald,
      taux_remb_prestat_mald, valeur_d, valeur_k, periode_prestat_mald, age_limit_prestat_mald,
      garantie_incapacite, duree_max_incap, franchise_incap, taux_indem_incap,
      garantie_invalidite, regle_garantie_invalidite, duree_max_inv, base_salaire,
      beneficiaire, mode_indem,
      taux_celibataire, taux_marie_sans_enfant, maj_enfant_mineur,
      taux_max, base_traitement, date_debut_prestat_deces, periodicite,
      user_id
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `;

  const values = [
    prestation.id_client || null,
    id_contrat,
    prestation.type_prestation || null,
    prestation.code_prestat_mald || null,
    prestation.libelle_prestat_mald || null,
    prestation.date_debut_prestat_mald || null,
    prestation.plafond_prestat_mald ?? null,
    prestation.taux_remb_prestat_mald ?? null,
    prestation.valeur_d ?? null,
    prestation.valeur_k ?? null,
    prestation.periode_prestat_mald ?? null,
    prestation.age_limit_prestat_mald ?? null,
    prestation.garantie_incapacite || null,
    prestation.duree_max_incap ?? null,
    prestation.franchise_incap ?? null,
    prestation.taux_indem_incap ?? null,
    prestation.garantie_invalidite || null,
    prestation.regle_garantie_invalidite || null,
    prestation.duree_max_inv ?? null,
    prestation.base_salaire || null,
    prestation.beneficiaire || null,
    prestation.mode_indem || null,
    prestation.taux_celibataire ?? null,
    prestation.taux_marie_sans_enfant ?? null,
    prestation.maj_enfant_mineur ?? null,
    prestation.taux_max ?? null,
    prestation.base_traitement || null,
    prestation.date_debut_prestat_deces ?? null,
    prestation.periodicite ?? null,
    req.user.id
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Erreur insertion prestation :", err);
      return res.status(500).json({ message: "Erreur serveur" });
    }
    res.status(201).json({ 
      message: "✅ Nouvelle prestation ajoutée avec succès",
      id_prestation: result.insertId
    });
  });
});



//=======================================================================================================================
// =============== EXPORTS EXCEL ===============================================================================
//=======================================================================================================================

router.get('/:id_contrat/export-prevoyance-excel', verifierToken,
   async (req, res) => {
    const { id_contrat } = req.params;
    try {

      /* =====================================================
         1️⃣ CONTRAT + CLIENT
      ===================================================== */
      const contrats = await queryAsync(`
        SELECT 
            c.*,
            cl.raison_sociale AS souscripteur,
            cl.agence AS agence,
            cl.adresse AS adresse,
            GROUP_CONCAT(cp.nom SEPARATOR ', ') AS categorie_nom
          FROM contrats c
          LEFT JOIN clients cl 
            ON c.id_client = cl.id_client
          LEFT JOIN contrat_categorie_personnel ccp 
            ON c.id_contrat = ccp.contrat_id
          LEFT JOIN categorie_personnel cp 
            ON ccp.categorie_id = cp.id_categorie
          WHERE c.id_contrat = ?
          GROUP BY c.id_contrat
      `, 
      [id_contrat]);

      if (contrats.length === 0) {
        return res.status(404).json({ message: "Contrat introuvable" });
      }

      const contrat = contrats[0];

      /* =====================================================
         2️⃣ EFFECTIF
      ===================================================== */
      const [effectif] = await queryAsync(`
        SELECT
          (SELECT COUNT(*) FROM adhesion_assure WHERE id_contrat = ?) AS collaborateurs,
          (SELECT COUNT(*) FROM adhesion_conjoints WHERE id_contrat = ?) AS conjoints,
          (SELECT COUNT(*) FROM adhesion_enfants WHERE id_contrat = ?) AS enfants
      `, [id_contrat, id_contrat, id_contrat]);

      const totalAssure =
        effectif.collaborateurs +
        effectif.conjoints +
        effectif.enfants;

      /* =====================================================
         3️⃣ PRESTATIONS (TABLE UNIQUE)
      ===================================================== */
      const prestations = await queryAsync(`
        SELECT * 
        FROM contrat_prestations
        WHERE id_contrat = ?
      `, [id_contrat]);

      const prestationsMaladie = prestations.filter(
        p => (p.type_prestation || '').toLowerCase() === 'maladie'
      );

      const prestationsDeces = prestations.filter(
        p => (p.type_prestation || '').toLowerCase() === 'deces'
      );

      const prestationsIncapacite = prestations.filter(
        p => (p.type_prestation || '').toLowerCase().includes('incap')
      );

   /* =====================================================
   5️⃣ GÉNÉRATION FICHIER EXCEL (EXCELJS)
===================================================== */

const workbook = new ExcelJS.Workbook();
const sheet = workbook.addWorksheet("Fiche Contrat");

// 🎨 PALETTE CORPORATE PREMIUM
const NAVY = "FF0F2D4A";
const CORPORATE_BLUE = "FF1F4E78";
const SOFT_BLUE = "FFE8F1FA";
const LIGHT_GRAY = "FFF5F7FA";
const WHITE = "FFFFFFFF";
const DARK_TEXT = "FF1F2937";

// ===== TITRE PRINCIPAL =====
const titleStyle = {
  font: {
    bold: true,
    size: 18,
    color: { argb: WHITE }
  },
  alignment: {
    horizontal: "center",
    vertical: "middle"
  },
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: NAVY }
  }
};

// ===== SECTION TITLE =====
const sectionStyle = {
  font: {
    bold: true,
    size: 13,
    color: { argb: CORPORATE_BLUE }
  },
  alignment: {
  horizontal: "center",
  vertical: "middle"
  },
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: SOFT_BLUE }
  }
};

// ===== LABEL STYLE =====
const labelStyle = {
  font: {
    bold: true,
    color: { argb: DARK_TEXT }
  },
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: LIGHT_GRAY }
  }
};

// ===== VALUE STYLE =====
const valueStyle = {
  font: {
    color: { argb: DARK_TEXT }
  }
};

// ===== TABLE HEADER STYLE =====
const tableHeaderStyle = {
  font: {
    bold: true,
    color: { argb: WHITE }
  },
  alignment: {
    horizontal: "center",
    vertical: "middle"
  },
  fill: {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: CORPORATE_BLUE }
  }
};

// ===== NUMERIC STYLE =====
const numericStyle = {
  alignment: {
    horizontal: "right"
  }
};

const applyBorder = (cell) => {
  cell.border = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" }
  };
};


// Ajustement automatique des largeurs des colonnes à leur contenu
const autoFitColumns = (worksheet, minWidth = 10, maxWidth = 60) => {
  worksheet.columns.forEach(column => {
    let maxLength = 0;

    column.eachCell({ includeEmpty: true }, cell => {
      const cellValue = cell.value;

      if (cellValue === null || cellValue === undefined) return;

      let text = "";

      if (typeof cellValue === "string") {
        text = cellValue;
      } else if (typeof cellValue === "number") {
        text = cellValue.toString();
      } else if (cellValue instanceof Date) {
        text = cellValue.toLocaleDateString("fr-FR");
      } else if (typeof cellValue === "object" && cellValue.richText) {
        text = cellValue.richText.map(rt => rt.text).join("");
      } else {
        text = cellValue.toString();
      }

      maxLength = Math.max(maxLength, text.length);
    });

    column.width = Math.min(
      Math.max(maxLength + 2, minWidth),
      maxWidth
    );
  });
};

// Ajustement automatique des largeurs des colonnes à leur contenu
const wrapLongTextCells = (worksheet, maxLength = 40) => {
  worksheet.eachRow(row => {
    row.eachCell(cell => {
      if (
        typeof cell.value === "string" &&
        cell.value.length > maxLength
      ) {
        cell.alignment = {
          wrapText: true,
          horizontal: "left",
          vertical: "top"
        };
      }
    });
  });
};

// Fonction utilitaire pour formater une valeur en chiffre avec séparateur de milliers
const formatNumber = (num) => {
  if (num == null || isNaN(num)) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};

// Fonction utilitaire pour convertir une date en format Excel
const toExcelDate = (value) => {
  if (!value) return null;
  // Cas 1 : déjà un objet Date
  if (value instanceof Date && !isNaN(value)) {
    return new Date(
      value.getFullYear(),
      value.getMonth(),
      value.getDate(),
      12
    );
  }

  // Cas 2 : string MySQL (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
  if (typeof value === "string") {
    const clean = value.split("T")[0]; // enlève l'heure si présente
    const parts = clean.split("-");

    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);

      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d, 12);
      }
    }
  }

  // Sécurité finale
  return null;
};


const addSection = (title) => {
  const row = sheet.addRow([title]);
  sheet.mergeCells(`A${row.number}:B${row.number}`);
  row.getCell(1).style = sectionStyle;
  row.height = 25;
};

// ===== TITRE =====
sheet.mergeCells("A1:B1");
sheet.getCell("A1").value = "FICHE CONTRAT – PRÉVOYANCE SOCIALE";
sheet.getCell("A1").style = titleStyle;
sheet.getRow(1).height = 30;


// ===== INFOS CONTRAT =====
const addInfoRow = (label, value, isDate = false) => {
  const row = sheet.addRow([label, value]);

  row.getCell(1).style = labelStyle;
  row.getCell(2).style = valueStyle;

  if (isDate) {
    row.getCell(2).numFmt = "dd/mm/yyyy";
  } 

  applyBorder(row.getCell(1));
  applyBorder(row.getCell(2));
};

addInfoRow("Souscripteur", contrat.souscripteur);
addInfoRow("Adresse de quérabilité", contrat.adresse);
addInfoRow("Numéro de police", contrat.police);
addInfoRow("Compagnie", contrat.compagnie);
addInfoRow("Agence", contrat.agence);
addInfoRow("Type de contrat", contrat.type_contrat);
addInfoRow("Statut", contrat.statut);
addInfoRow("Plafond général", formatNumber(contrat.plafond));
addInfoRow("Taux de remboursement", contrat.taux_remb + "%");
addInfoRow("Date d'effet", toExcelDate(contrat.date_debut), true);
addInfoRow("Catégorie du personnel", contrat.categorie_nom);
// 🔹 ESPACE VISUEL
sheet.addRow([]);


// ===== EFFECTIF =====

addSection("COMPOSITION DE L'EFFECTIF");
addInfoRow("Collaborateurs", formatNumber(effectif.collaborateurs));
addInfoRow("Conjoints", formatNumber(effectif.conjoints));
addInfoRow("Enfants à charge", formatNumber(effectif.enfants));
addInfoRow("Effectif total assuré", formatNumber(totalAssure));
// 🔹 ESPACE VISUEL
sheet.addRow([]);


// ===== DÉCÈS =====
addSection("Décès avec continuité de garanties");

if (prestationsDeces.length > 0) {
  const d = prestationsDeces[0];
  addInfoRow("Célibataire", d.taux_celibataire + "%" || "");
  addInfoRow("Marié sans enfants", d.taux_marie_sans_enfant + "%" || "");
  addInfoRow("Enfant à charge", d.maj_enfant_mineur + "%" || "");
  addInfoRow("Maximum", d.taux_max + "%" || "");
} else {
  addInfoRow("Aucune garantie décès définie");
}
// 🔹 ESPACE VISUEL
sheet.addRow([]);


// ===== INCAPACITÉ =====
addSection("Incapacité Totale Temporaire // longue maladie");

if (prestationsIncapacite.length > 0) {
  const i = prestationsIncapacite[0];
  addInfoRow("Durée", i.duree_max_incap + "(s)" || "");
  addInfoRow("Franchise", i.franchise_incap + " jours" || "");
  addInfoRow(
    "Invalidité",
    i.regle_garantie_invalidite ||
    "50% si IPP ≥ 66% / 3N/2 si 33% ≤ IPP < 66% / Néant < 33%"
  );
  addInfoRow("Taux", i.taux_indem_incap + "%" || "");
} else {
  addInfoRow("Aucune garantie incapacité définie");
}
// 🔹 ESPACE VISUEL
sheet.addRow([]);


// ===== MALADIE =====
addSection("Prestations Maladie");

const headerRow = sheet.addRow([
  "Prestation",
  "Date d'effet",
  "Plafond",
  "Taux",
  "Valeur D",
  "Valeur K",
  "Période",
  "Âge limite"
]);

headerRow.eachCell(cell => {
  cell.style = tableHeaderStyle;
  applyBorder(cell);
});


if (prestationsMaladie.length === 0) {
  sheet.addRow(["Aucune prestation maladie définie"]);
} else {
  prestationsMaladie.forEach(p => {
const row = sheet.addRow([
  p.libelle_prestat_mald,
  toExcelDate(p.date_debut_prestat_mald),
  formatNumber(p.plafond_prestat_mald),
  p.taux_remb_prestat_mald + "%",
  p.valeur_d,
  p.valeur_k,
  p.periode_prestat_mald,
  p.age_limit_prestat_mald
]);

// 🔹 ALIGNEMENT NUMÉRIQUE
row.getCell(3).alignment = numericStyle.alignment; // Plafond
row.getCell(4).alignment = numericStyle.alignment; // Taux
// 🔹 BORDURES
row.eachCell(cell => applyBorder(cell));
  });
}

autoFitColumns(sheet);
sheet.getColumn(1).width = 28;
wrapLongTextCells(sheet);

// empêcher le scroll horizontal gênant
sheet.views = [
  { state: "frozen", ySplit: 1 }
];

// 🔐 PROTECTION FEUILLE (LECTURE SEULE)
await sheet.protect("Contrat2025", {
  selectLockedCells: true,
  selectUnlockedCells: false,
  formatCells: false,
  formatColumns: false,
  formatRows: false,
  insertColumns: false,
  insertRows: false,
  deleteColumns: false,
  deleteRows: false,
  sort: false,
  autoFilter: false,
  pivotTables: false
});


// 📤 Envoi fichier
res.setHeader(
  "Content-Disposition",
  `attachment; filename=Fiche_Contrat_${contrats.police}.xlsx`
);
res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);

await workbook.xlsx.write(res);
res.end();


    } catch (error) {
      console.error("❌ Export prévoyance :", error);
      res.status(500).json({ message: "Erreur export fiche contrat" });
    }
  }
);






//=======================================================================================================================
// =============== EXPORT PDF ===============================================================================
//=======================================================================================================================
router.get(
  "/:id_contrat/export-prevoyance-pdf",
  verifierToken,
  async (req, res) => {
    const { id_contrat } = req.params;

    try {
      // 1️⃣ RÉCUPÉRATION DONNÉES (exactement comme Excel)
      // -------------------------------------------------
      const contrats = await queryAsync(`
            SELECT 
              c.*,
              cl.raison_sociale AS souscripteur,
              cl.agence AS agence,
              cl.adresse AS adresse,
              GROUP_CONCAT(cp.nom SEPARATOR ', ') AS categorie_nom
            FROM contrats c
            LEFT JOIN clients cl 
              ON c.id_client = cl.id_client
            LEFT JOIN contrat_categorie_personnel ccp 
              ON c.id_contrat = ccp.contrat_id
            LEFT JOIN categorie_personnel cp 
              ON ccp.categorie_id = cp.id_categorie
            WHERE c.id_contrat = ?
            GROUP BY c.id_contrat
          `, 
          [id_contrat]);

          if (contrats.length === 0) {
            return res.status(404).json({ message: "Contrat introuvable" });
          }

          const contrat = contrats[0];

          const [effectif] = await queryAsync(`
            SELECT
              (SELECT COUNT(*) FROM adhesion_assure WHERE id_contrat = ?) AS collaborateurs,
              (SELECT COUNT(*) FROM adhesion_conjoints WHERE id_contrat = ?) AS conjoints,
              (SELECT COUNT(*) FROM adhesion_enfants WHERE id_contrat = ?) AS enfants
          `, [id_contrat, id_contrat, id_contrat]);

          effectif.total =
            effectif.collaborateurs +
            effectif.conjoints +
            effectif.enfants;

        const prestations = await queryAsync(`
            SELECT *
            FROM contrat_prestations
            WHERE id_contrat = ?
          `, [id_contrat]);

          const prestationsMaladie = prestations.filter(
            p => (p.type_prestation || "").toLowerCase() === "maladie"
          );

          const prestationsDeces = prestations.filter(
            p => (p.type_prestation || "").toLowerCase() === "deces"
          );

          const prestationsIncapacite = prestations.filter(
            p => (p.type_prestation || "").toLowerCase().includes("incapacite")
          );

const formatNumber = (num) => {
  if (num == null || isNaN(num)) return "";
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
};
const toExcelDate = (value) => {
  if (!value) return "";
  // Cas 1 : déjà un objet Date
  if (value instanceof Date && !isNaN(value)) {
    return `${String(value.getDate()).padStart(2, "0")}/` +
           `${String(value.getMonth() + 1).padStart(2, "0")}/` +
           `${value.getFullYear()}`;
  }

  // Cas 2 : string MySQL (YYYY-MM-DD ou YYYY-MM-DDTHH:mm:ss)
  if (typeof value === "string") {
    const clean = value.split("T")[0]; // enlève l'heure si présente
    const parts = clean.split("-");

    if (parts.length === 3) {
      const y = Number(parts[0]);
      const m = Number(parts[1]);
      const d = Number(parts[2]);

      if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return `${String(d).padStart(2, "0")}/` +
               `${String(m).padStart(2, "0")}/` +
               `${y}`;
      }
    }
  }

  // Sécurité finale
  return "";
};

      // 2️⃣ HTML → PDF
      // -------------------------------------------------
      const puppeteer = require("puppeteer");
      const browser = await puppeteer.launch({
        headless: "new",
        args: ["--no-sandbox", "--disable-setuid-sandbox"]
      });

      const page = await browser.newPage();

      const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<style>
  * {
    box-sizing: border-box;
  }

  body {
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 12px;
    margin: 40px;
    color: #1f2937;
    background: #ffffff;
  }

  /* ===== HEADER ===== */

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 2px solid #1F4E78;
    padding-bottom: 10px;
    margin-bottom: 20px;
  }

  .header-title {
    font-size: 22px;
    font-weight: 700;
    color: #1F4E78;
    letter-spacing: 1px;
  }

  .header-subtitle {
    font-size: 12px;
    color: #6b7280;
    margin-top: 3px;
  }

  .header-meta {
    text-align: right;
    font-size: 11px;
    color: #5e6269;
  }

  /* ===== SECTION TITLE ===== */

  .section-title {
    margin-top: 25px;
    margin-bottom: 12px;
    padding-left: 10px;
    border-left: 4px solid #1F4E78;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: #1F4E78;
  }

  /* ===== CARD STYLE ===== */

  .card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 15px;
    margin-bottom: 25px;
  }

  /* ===== TABLE ===== */

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 7px 10px;
    text-align: left;
    vertical-align: top;
  }

  th {
    width: 230px;
    font-weight: 600;
    color: #374151;
  }

  td {
    color: #111827;
  }

  tr {
    border-bottom: 1px solid #e5e7eb;
  }

  tr:last-child {
    border-bottom: none;
  }

  /* ===== PRESTATIONS TABLE ===== */

  .table-prestations {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
  }

  .table-prestations th {
    background: #1F4E78;
    color: #ffffff;
    font-weight: 600;
    border-bottom: none;
  }

  .table-prestations td {
    border-bottom: 1px solid #f0f2f5;
  }

  .table-prestations tr:last-child td {
    border-bottom: none;
  }

  /* ===== NUMERIC ALIGNMENT ===== */

  .text-right {
    text-align: right;
  }

  /* ===== FOOTER ===== */

  .footer {
    margin-top: 60px;
    font-size: 10px;
    color: #6b7280;
    text-align: center;
    border-top: 1px solid #e5e7eb;
    padding-top: 10px;
  }
</style>

</head>

<body>


<div class="header">
  <div>
    <div class="header-title">FICHE CONTRAT</div>
    <div class="header-subtitle">PRÉVOYANCE SOCIALE</div>
  </div>

  <div class="header-meta">
    Police : ${contrat.police}<br>
    Compagnie : ${contrat.compagnie}
  </div>
</div>

<div class="section-title">Identification</div>
<div class="card">
  <table>
  <tr><th>Souscripteur</th><td>${contrat.souscripteur}</td></tr>
  <tr></tr><th>Adresse de quérabilité</th><td>${contrat.adresse}</td></tr>
  <tr><th>Police</th><td>${contrat.police}</td></tr>
  <tr><th>Compagnie</th><td>${contrat.compagnie}</td></tr>
  <tr><th>Agence</th><td>${contrat.agence}</td></tr>
  <tr></tr><th>Type de contrat</th><td>${contrat.type_contrat}</td></tr>
  <tr><th>Statut</th><td>${contrat.statut}</td></tr>
  <tr><th>Plafond</th><td>${formatNumber(contrat.plafond)}</td></tr>
  <tr><th>Taux</th><td>${contrat.taux_remb + "%"}</td></tr>
  <tr><th>Date d'effet</th><td>${toExcelDate(contrat.date_debut)}</td></tr>
  <tr><th>Catégorie du personnel</th><td>${contrat.categorie_nom}</td></tr>
  </table>
</div>

<div class="section-title">Composition de l' Effectif</div>
<div class="card">
<table>
  <tr><th class="col-colonne">Collaborateurs</th><td>${effectif.collaborateurs}</td></tr>
  <tr><th>Conjoints</th><td>${effectif.conjoints}</td></tr>
  <tr><th>Enfants à charge</th><td>${effectif.enfants}</td></tr>
  <tr><th>Effectif total assuré</th><td>${effectif.total}</td></tr>
</table>
</div>

<div class="section-title">Décès avec Continuité de Garanties</div>
<div class="card">
<table>
  ${
prestationsDeces.length === 0
  ? `<tr><td>Aucune garantie décès définie</td></tr>`
  : prestationsDeces.map(p => `
      <tr><th class="col-colonne">Célibataire</th><td>${p.taux_celibataire + "%"}</td></tr>
      <tr><th>Marié sans enfants</th><td>${p.taux_marie_sans_enfant + "%"}</td></tr>
      <tr><th>Enfant à charge</th><td>${p.maj_enfant_mineur + "%"}</td></tr>
      <tr><th>Maximum</th><td>${p.taux_max + "%"}</td></tr>
    `).join("")
  }
</table>
</div>

<div class="section-title">Incapacité Totale Temporaire/Longue Maladie</div>
<div class="card">
<table>
  ${
    prestationsIncapacite.length === 0
      ? `<tr><td>Aucune garantie incapacité définie</td></tr>`
      : prestationsIncapacite.map(p => `
          <tr><th>Durée</th><td>${p.duree_max_incap + "(s)"}</td></tr>
          <tr><th>Franchise</th><td>${p.franchise_incap + " jours"}</td></tr>
          <tr><th>Invalidité</th><td>${p.regle_garantie_invalidite}</td></tr>
          <tr><th>Taux</th><td>${p.taux_indem_incap + "%"}</td></tr>
        `).join("")
  }
</table>
</div>

<div class="section-title" style="margin-top: 50px;">Prestations Maladie</div>
<table class="table-prestations">  
  <tr>
    <th>Prestation</th>
    <th>Plafond</th>
    <th>Taux</th>
    <th>Période</th>
    <th>Âge limite</th>
  </tr>

  ${
    prestationsMaladie.length === 0
      ? `<tr><td colspan="5">Aucune prestation maladie définie</td></tr>`
      : prestationsMaladie.map(p => `
          <tr>
            <td>${p.libelle_prestat_mald}</td>
            <td>${p.plafond_prestat_mald}</td>
            <td>${p.taux_remb_prestat_mald}</td>
            <td>${p.periode_prestat_mald}</td>
            <td>${p.age_limit_prestat_mald}</td>
          </tr>
        `).join("")
  }
 </table>
</div>

</body>
</html>
`;

      await page.setContent(html, { waitUntil: "networkidle0" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          bottom: "20mm",
          left: "15mm",
          right: "15mm"
        }
      });

      await browser.close();

      // 3️⃣ ENVOI PDF
      // -------------------------------------------------
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=Fiche_Contrat_${contrat.police}.pdf`
      );
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBuffer);

    } catch (error) {
      console.error("❌ Export PDF :", error);
      res.status(500).json({ message: "Erreur export PDF" });
    }
  }
);


module.exports = router;
