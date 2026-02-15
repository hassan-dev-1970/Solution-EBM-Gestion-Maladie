const express = require('express');
const router = express.Router();
const db = require('../config/db');
const util = require('util');
const verifierToken = require('../middleware/verifierToken');

// Promisify MySQL functions
const query = util.promisify(db.query).bind(db);
const beginTransaction = util.promisify(db.beginTransaction).bind(db);
const commit = util.promisify(db.commit).bind(db);
const rollback = util.promisify(db.rollback).bind(db);

// -----------------------------
// Helpers
// -----------------------------
const normSex = (v) => {
  if (!v) return null;
  const s = v.toString().toLowerCase();
  if (["h", "homme", "m"].includes(s)) return "Homme";
  if (["f", "femme"].includes(s)) return "Femme";
  return null;
};

const normChildSex = (v) => {
  if (!v) return null;
  const s = v.toString().toLowerCase();
  if (["m", "masculin"].includes(s)) return "masculin";
  if (["f", "feminin", "féminin"].includes(s)) return "féminin";
  return null;
};

const yesNo = (v) => {
  if (["Oui", "1", 1, true].includes(v)) return 1;
  if (["Non", "0", 0, false].includes(v)) return 0;
  return null;
};

// Récupérer le contrat actif d'un client
const getContratActifByClient = async (id_client) => {
  const rows = await query(
    `SELECT id_contrat
     FROM contrats
     WHERE id_client = ? AND statut = 'Actif'
     LIMIT 1`,
    [id_client]
  );
  return rows.length ? rows[0].id_contrat : null;
};

// ------------------------------------------------------------------
// Routes générales pour les adhésions
// ------------------------------------------------------------------
router.get('/', verifierToken, async (req, res) => {
  const search = req.query.search || '';
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const sql = `
    SELECT 
      a.*, 
      c.type_contrat, c.compagnie, cl.id_client, cl.raison_sociale
    FROM adhesion_assure a
    LEFT JOIN contrats c 
      ON a.num_police = c.police
    LEFT JOIN clients cl 
      ON a.souscripteur = cl.id_client
    WHERE a.num_adhesion LIKE ?
       OR a.nom LIKE ?
       OR a.prenom LIKE ?
       OR a.num_police LIKE ?
    ORDER BY a.date_adhesion DESC
    LIMIT ? OFFSET ?
  `;

  db.query(
    sql,
    [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      limit,
      offset
    ],
    (err, results) => {
      if (err) {
        console.error("❌ Erreur SQL SELECT adhésions :", err);
        return res.status(500).json({ message: 'Erreur récupération adhésions' });
      }
      res.json(results);
    }
  );
});

// -----------------------------
// ROUTE PRINCIPALE : Création d'une adhésion
// -----------------------------
router.post('/', verifierToken, async (req, res) => {
  const { assure, conjoint, enfants, beneficiaires, questionnaire, notes, signature } = req.body;
  const id_utilisateur = req.user?.id_utilisateur || null;

  if (!assure?.nom || !assure?.prenom || !assure?.num_identite_assure) {
    return res.status(400).json({
      message: "Veuillez remplir au minimum le nom, prénom et numéro de document de l'assuré."
    });
  }

  // 🔑 DÉTERMINATION DU STATUT SELON LE RÔLE
  const userRole = req.user?.role;
  let statutAdhesion;

  if (userRole === 'user_distant-adherent') {
    statutAdhesion = 'soumis';
  } else if (userRole === 'user_distant-souscripteur') {
    statutAdhesion = 'valide_souscripteur';
  } else if (['gestionnaire_affiliation', 'agent_BO', 'admin'].includes(userRole)) {
    statutAdhesion = 'en_vigueur';
  } else {
    return res.status(403).json({ 
      message: "Rôle non autorisé à créer une adhésion." 
    });
  }

  try {
    await beginTransaction();

    // ---------------------------------
    // 0️⃣ Détermination id_client & id_contrat
    // ---------------------------------
    const id_client = assure.souscripteur || assure.id_client;
    if (!id_client) {
      return res.status(400).json({
        message: "Client non défini pour l’adhésion"
      });
    }

    const id_contrat = await getContratActifByClient(id_client);
    if (!id_contrat) {
      return res.status(400).json({
        message: "Aucun contrat actif trouvé pour ce client"
      });
    }

    // ---------------------------------
      // 1️⃣ INSERT ASSURÉ — avec traçabilité complète
      // ---------------------------------
      // Date courante au format MySQL DATETIME
      const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

      // Colonnes de base
      let colonnes = `
        id_client, id_contrat, type_adhesion, date_adhesion, num_adhesion, compagnie, num_police,
        souscripteur, nom, prenom, sexe, date_naissance, nationalite,
        type_identite, num_identite, num_cnss, situation_familiale,
        regime_base, matricule_ste, date_embauche, cat_perso, cat_pro,
        profession, salaire_annuel_brut, adresse, ville, pays, tel, email,
        rib, notes, statut_adhesion, user_creat, date_creat, date_soumis, signature
      `;

      let valeurs = [
        id_client,
        id_contrat,
        assure.type_adhesion || null,
        assure.date_adhesion || null,
        assure.num_adhesion || null,
        assure.compagnie || null,
        assure.num_police || null,
        assure.souscripteur || null,
        assure.nom || null,
        assure.prenom || null,
        normSex(assure.sexe),
        assure.date_naissance || null,
        assure.nationalite || null,
        assure.type_identite_assure || null,
        assure.num_identite_assure || null,
        assure.num_cnss || null,
        assure.situation_familiale || null,
        assure.regime_base || null,
        assure.matricule_ste || null,
        assure.date_embauche || null,
        assure.cat_perso || null,
        assure.cat_pro || null,
        assure.profession || null,
        assure.salaire_annuel_brut || null,
        assure.adresse || null,
        assure.ville || null,
        assure.pays || null,
        assure.tel || null,
        assure.email || null,
        assure.rib || null,
        notes || null,
        statutAdhesion,
        id_utilisateur,
        now, // date_creat
        now, // date_soumis
        req.body.signature ? JSON.stringify(req.body.signature) : null
      ];

      // ➕ Cas : souscripteur crée directement
      if (userRole === 'user_distant-souscripteur') {
        colonnes += `, date_validate_souscripteur, user_souscripteur`;
        valeurs.push(now); // date_validate_souscripteur
        valeurs.push(id_utilisateur); // user_souscripteur
      }

      // ➕ Cas : EBM ou ADMIN (gestionnaire_affiliation ou agent_BO) crée directement
      if (['gestionnaire_affiliation', 'agent_BO', 'admin'].includes(userRole)) {
        colonnes += `, date_en_vigueur, user_ebm`;
        valeurs.push(now); // date_en_vigueur
        valeurs.push(id_utilisateur); // user_ebm
      }

      // Construire la requête dynamique
      const placeholders = valeurs.map(() => '?').join(',');
      const sqlAssure = `INSERT INTO adhesion_assure (${colonnes}) VALUES (${placeholders})`;

      const resultAssure = await query(sqlAssure, valeurs);
      const id_adhesion = resultAssure.insertId;

      if (!id_adhesion) throw new Error("id_adhesion introuvable après insertion");



    // ---------------------------------
    // 2️⃣ INSERT CONJOINTS
    // ---------------------------------
    if (Array.isArray(conjoint)) {
      for (const c of conjoint) {
        await query(
          `INSERT INTO adhesion_conjoints
            (id_client, id_contrat, adhesion_id, nom, prenom, sexe_conj, date_naissance,
             type_identite_conj, num_identite_conj, profession, date_adh_conj, user_creat, date_creat)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
          [
            id_client,
            id_contrat,
            id_adhesion,
            c.nom || null,
            c.prenom || null,
            normSex(c.sexe_conj),
            c.date_naissance || null,
            c.type_identite_conj || null,
            c.num_identite_conj || null,
            c.profession || null,
            c.date_adh_conj || null,
            id_utilisateur
          ]
        );
      }
    }

    // ---------------------------------
    // 3️⃣ INSERT ENFANTS
    // ---------------------------------
    if (Array.isArray(enfants)) {
      for (const e of enfants) {
        await query(
          `INSERT INTO adhesion_enfants
            (id_client, id_contrat, adhesion_id, nom, prenom, date_naissance, sexe_enf,
             scolarise, handicap, date_adh_enf, user_creat, date_creat)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())`,
          [
            id_client,
            id_contrat,
            id_adhesion,
            e.nom || null,
            e.prenom || null,
            e.date_naissance || null,
            normChildSex(e.sexe_enf),
            yesNo(e.scolarise),
            yesNo(e.handicap),
            e.date_adh_enf || null,
            id_utilisateur
          ]
        );
      }
    }

    // ---------------------------------
    // 4️⃣ INSERT BENEFICIAIRES
    // ---------------------------------
    if (beneficiaires) {
      if (beneficiaires.type_beneficiaire === "personne_designee") {
        for (const b of beneficiaires.liste || []) {
          await query(
            `INSERT INTO adhesion_beneficiaires
            (adhesion_id, type_beneficiaire, nom, prenom, date_naissance, lien_avec_assure, pourcentage, user_creat, date_creat)
             VALUES (?,?,?,?,?,?,?,?,NOW())`,
            [
              id_adhesion,
              "personne_designee",
              b.nom || null,
              b.prenom || null,
              b.date_naissance || null,
              b.lien || null,
              b.pourcentage || null,
              id_utilisateur
            ]
          );
        }
      } else {
        await query(
          `INSERT INTO adhesion_beneficiaires
            (adhesion_id, type_beneficiaire, user_creat, date_creat)
           VALUES (?,?,?,NOW())`,
          [id_adhesion, beneficiaires.type_beneficiaire, id_utilisateur]
        );
      }
    }

    // ---------------------------------
    // 5️⃣ INSERT QUESTIONNAIRE
    // ---------------------------------
    const insertQ = async (type_personne, obj) => {
      if (!obj) return;
      await query(
        `INSERT INTO adhesion_questionnaire
         (adhesion_id, type_personne, emploi_occupe, benef_assur_maladie, cie_assur_maladie, benef_assur_mald_anterieure,
          cie_mald_anterieure, consult_medecin_5ans, consult_motif_5ans, traitement_en_cours, traitement_details, maladie_grave,
          maladie_grave_details, operation_chirurgicale, operation_details, infirmite, infirmite_details, 
          defaut_vue, grossesse, grossesse_mois,
          taille, poids, user_creat, date_creat)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW())`,
        [
          id_adhesion,
          type_personne,
          yesNo(obj.emploi_occupe),
          yesNo(obj.benef_assur_maladie),
          obj.cie_assur_maladie || null,
          yesNo(obj.benef_assur_mald_anterieur),
          obj.cie_assur_mald_anterieur || null,
          yesNo(obj.consulte_medecin_5ans),
          obj.motif_consultation || null,
          yesNo(obj.traitement_en_cours),
          obj.traitement_details || null,
          yesNo(obj.maladies_graves),
          obj.maladies_graves_details || null,
          yesNo(obj.operation_chirurgicale),
          obj.operation_details || null,
          yesNo(obj.infirmite),
          obj.infirmite_details || null,
          yesNo(obj.defaut_vue),
          yesNo(obj.grossesse),
          obj.grossesse_mois || null,
          obj.taille || null,
          obj.poids || null,
          id_utilisateur
        ]
      );
    };

    await insertQ("assure", questionnaire?.adherent);
    await insertQ("conjoint", questionnaire?.conjoint);

    // ---------------------------------
    // COMMIT
    // ---------------------------------
    await commit();

    res.json({
      message: "Adhésion enregistrée avec succès",
      id_adhesion,
      statut: statutAdhesion
    });

  } catch (err) {
    console.error("🔥 ERREUR ADHESION :", err);
    try { await rollback(); } catch {}
    res.status(500).json({
      message: "Erreur lors de l'enregistrement",
      error: err.message
    });
  }
});

// -------------------------------------------------------------
// Routes pour les actions spécifiques sur les adhésions
// -------------------------------------------------------------
router.patch('/:id/validate', verifierToken, async (req, res) => {
  const { role, id: userId } = req.user; // ⚠️ 'id' du token
  const { id } = req.params;

  // ✅ Autoriser admin ET souscripteur
  if (!['user_distant-souscripteur', 'admin'].includes(role)) {
  return res.status(403).json({ message: "Accès refusé : seul un souscripteur ou un administrateur peut valider." });
}

  try {
    const result = await query(
      `UPDATE adhesion_assure 
       SET statut_adhesion = 'valide_souscripteur', 
           user_souscripteur = ?,
           date_validate_souscripteur = NOW()
       WHERE id_adhesion = ? AND statut_adhesion = 'soumis'`,
      [userId, id] // ⚠️ utilisez 'userId', pas 'req.user.id_utilisateur'
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "Aucune adhésion à valider (statut incorrect ou ID invalide)."
      });
    }

    res.json({ message: "Adhésion validée avec succès.", id_adhesion: id });
  } catch (err) {
    console.error("❌ Erreur validation :", err);
    res.status(500).json({ message: "Échec de la validation." });
  }
});

router.patch('/:id/activate', verifierToken, async (req, res) => {
  const { role } = req.user;
  const { id } = req.params;

  if (!['gestionnaire_affiliation', 'agent_BO'].includes(role)) {
    return res.status(403).json({ message: "Accès refusé : seul le back-office peut activer une adhésion." });
  }

  try {
    const result = await query(
      `UPDATE adhesion_assure 
       SET statut_adhesion = 'en_vigueur', user_ebm = ?, date_en_vigueur = NOW()
       WHERE id_adhesion = ? AND statut_adhesion = 'valide_souscripteur'`,
      [req.user.id_utilisateur, id]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({
        message: "L’adhésion n’est pas dans l’état 'valide_souscripteur' ou n’existe pas."
      });
    }

    res.json({ message: "Adhésion activée avec succès.", id_adhesion: id });
  } catch (err) {
    console.error("Erreur activation EBM :", err);
    res.status(500).json({ message: "Erreur serveur lors de l’activation." });
  }
});


// Liste des adhesions en statut 'soumis' affichée pour le souscripteur pour validation
// Route pour le nombre d'adhesion non validées (statut 'soumis')
// Route /count/soumis
router.get('/count/soumis', verifierToken, async (req, res) => {
  const { role, id_client } = req.user;

  if (!['user_distant-souscripteur', 'admin'].includes(role)) {
    return res.status(403).json({ count: 0 });
  }

  try {
    let sql, params;
    if (role === 'admin') {
      sql = `SELECT COUNT(*) AS count FROM adhesion_assure WHERE statut_adhesion = 'soumis'`;
      params = [];
    } else {
      sql = `SELECT COUNT(*) AS count FROM adhesion_assure WHERE statut_adhesion = 'soumis' AND souscripteur = ?`;
      params = [id_client];
    }
    const result = await query(sql, params);
    res.json({ count: result[0].count || 0 });
  } catch (err) {
    console.error("Erreur comptage :", err);
    res.status(500).json({ count: 0 });
  }
  console.log("🔍 /count/soumis appelé");
console.log("   Rôle :", req.user.role);
console.log("   ID client :", req.user.id_client);
});
// -------------------------------------------------------------

// Route pour afficher la liste des adhésions en statut 'soumis' pour le souscripteur
// Route /soumis
router.get('/soumis', verifierToken, async (req, res) => {
  const { role, id_client } = req.user;

  if (!['user_distant-souscripteur', 'admin'].includes(role)) {
    return res.status(403).json([]);
  }

  try {
    let sql, params;
    if (role === 'admin') {
      sql = `
        SELECT 
          a.*,
          c.type_contrat,
          c.compagnie,
          cl.raison_sociale AS souscripteur_nom
        FROM adhesion_assure a
        LEFT JOIN contrats c ON a.num_police = c.police
        LEFT JOIN clients cl ON a.souscripteur = cl.id_client
        WHERE a.statut_adhesion = 'soumis'
        ORDER BY a.date_soumis DESC
      `;
      params = [];
    } else {
      sql = `
        SELECT 
          a.*,
          c.type_contrat,
          c.compagnie,
          cl.raison_sociale AS souscripteur_nom
        FROM adhesion_assure a
        LEFT JOIN contrats c ON a.num_police = c.police
        LEFT JOIN clients cl ON a.souscripteur = cl.id_client
        WHERE a.statut_adhesion = 'soumis' AND a.souscripteur = ?
        ORDER BY a.date_soumis DESC
      `;
      params = [id_client];
    }
    const rows = await query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error("Erreur liste :", err);
    res.status(500).json([]);
  }

  console.log("🔍 /soumis appelé");
console.log("   Rôle :", req.user.role);
console.log("   ID client :", req.user.id_client);
});
// -------------------------------------------------------------

// ==============================================================
// GET /api/adhesions/:id — charger une adhésion complète
// ==============================================================

router.get('/:id', verifierToken, async (req, res) => {
  const { id } = req.params;
  const { role, id_client } = req.user;

  try {
    // 🔒 Sécurité : vérifier que l'utilisateur a le droit d'accéder à cette adhésion
    let whereClause = "a.id_adhesion = ?";
    let params = [id];

    if (role !== 'admin') {
      whereClause += " AND a.souscripteur = ?";
      params.push(id_client);
    }

    // 1️⃣ Charger l'assuré
    const assureRows = await query(
      `SELECT 
        a.*,
        JSON_UNQUOTE(JSON_EXTRACT(a.signature, '$.image')) AS signature_image,
        JSON_UNQUOTE(JSON_EXTRACT(a.signature, '$.date')) AS signature_date,
        JSON_UNQUOTE(JSON_EXTRACT(a.signature, '$.role')) AS signature_role,
        JSON_UNQUOTE(JSON_EXTRACT(a.signature, '$.signataire')) AS signature_signataire
       FROM adhesion_assure a
       WHERE ${whereClause}`,
      params
    );

    if (assureRows.length === 0) {
      return res.status(404).json({ error: "Adhésion non trouvée" });
    }

    const a = assureRows[0];

    // 2️⃣ Charger conjoints
    const conjoints = await query(
      `SELECT * FROM adhesion_conjoints WHERE adhesion_id = ?`,
      [id]
    );

    // 3️⃣ Charger enfants
    const enfants = await query(
      `SELECT * FROM adhesion_enfants WHERE adhesion_id = ?`,
      [id]
    );

    // 4️⃣ Charger bénéficiaires
    let beneficiaires = null;
    const benefRows = await query(
      `SELECT type_beneficiaire FROM adhesion_beneficiaires WHERE adhesion_id = ? LIMIT 1`,
      [id]
    );

    if (benefRows.length > 0) {
      const type = benefRows[0].type_beneficiaire;
      if (type === 'personne_designee') {
        const liste = await query(
          `SELECT nom, prenom, date_naissance, lien_avec_assure AS lien, pourcentage 
           FROM adhesion_beneficiaires 
           WHERE adhesion_id = ? AND type_beneficiaire = 'personne_designee'`,
          [id]
        );
        beneficiaires = { type_beneficiaire: type, liste };
      } else {
        beneficiaires = { type_beneficiaire: type, liste: [] };
      }
    }

    // 5️⃣ Charger questionnaire
    const qRows = await query(
      `SELECT * FROM adhesion_questionnaire WHERE adhesion_id = ?`,
      [id]
    );
    const questionnaire = { adherent: null, conjoint: null };
    for (const q of qRows) {
      if (q.type_personne === 'assure') {
        questionnaire.adherent = {
          emploi_occupe: q.emploi_occupe ? "Oui" : "Non",
          benef_assur_mald_anterieur: q.benef_assur_mald_anterieure ? "Oui" : "Non",
          cie_assur_mald_anterieur: q.cie_mald_anterieure,
          consulte_medecin_5ans: q.consult_medecin_5ans ? "Oui" : "Non",
          motif_consultation: q.consult_motif_5ans,
          traitement_en_cours: q.traitement_en_cours ? "Oui" : "Non",
          traitement_details: q.traitement_details,
          maladies_graves: q.maladie_grave ? "Oui" : "Non",
          maladies_graves_details: q.maladie_grave_details,
          operation_chirurgicale: q.operation_chirurgicale ? "Oui" : "Non",
          operation_details: q.operation_details,
          infirmite: q.infirmite ? "Oui" : "Non",
          infirmite_details: q.infirmite_details,
          defaut_vue: q.defaut_vue ? "Oui" : "Non",
          grossesse: q.grossesse ? "Oui" : "Non",
          grossesse_mois: q.grossesse_mois,
          taille: q.taille,
          poids: q.poids
        };
      } else if (q.type_personne === 'conjoint') {
        questionnaire.conjoint = {
          emploi: q.emploi_occupe ? "Oui" : "Non",
          emploi_occupe: q.emploi_occupe ? "Oui" : "Non",
          benef_assur_maladie: q.benef_assur_maladie ? "Oui" : "Non",
          cie_assur_maladie: q.cie_assur_maladie,
          benef_assur_mald_anterieur: q.benef_assur_mald_anterieure ? "Oui" : "Non",
          cie_assur_mald_anterieur: q.cie_mald_anterieure,
          consulte_medecin_5ans: q.consult_medecin_5ans ? "Oui" : "Non",
          motif_consultation: q.consult_motif_5ans,
          traitement_en_cours: q.traitement_en_cours ? "Oui" : "Non",
          traitement_details: q.traitement_details,
          maladies_graves: q.maladie_grave ? "Oui" : "Non",
          maladies_graves_details: q.maladie_grave_details,
          operation_chirurgicale: q.operation_chirurgicale ? "Oui" : "Non",
          operation_details: q.operation_details,
          infirmite: q.infirmite ? "Oui" : "Non",
          infirmite_details: q.infirmite_details,
          defaut_vue: q.defaut_vue ? "Oui" : "Non",
          grossesse: q.grossesse ? "Oui" : "Non",
          grossesse_mois: q.grossesse_mois,
          taille: q.taille,
          poids: q.poids
        };
      }
    }

    // 6️⃣ Construire la réponse
    const result = {
      assure: {
        id_adhesion: a.id_adhesion,
        compagnie: a.compagnie,
        souscripteur: a.souscripteur,
        num_police: a.num_police,
        type_adhesion: a.type_adhesion,
        date_adhesion: a.date_adhesion,
        num_adhesion: a.num_adhesion,
        sexe: a.sexe,
        nom: a.nom,
        prenom: a.prenom,
        date_naissance: a.date_naissance,
        profession: a.profession,
        adresse: a.adresse,
        ville: a.ville,
        pays: a.pays,
        email: a.email,
        tel: a.tel,
        type_identite_assure: a.type_identite,
        num_identite_assure: a.num_identite,
        num_cnss: a.num_cnss,
        situation_familiale: a.situation_familiale,
        nationalite: a.nationalite,
        rib: a.rib,
        cat_perso: a.cat_perso,
        cat_pro: a.cat_pro,
        salaire_annuel_brut: a.salaire_annuel_brut,
        matricule_ste: a.matricule_ste,
        date_embauche: a.date_embauche,
        regime_base: a.regime_base,
        notes: a.notes,
        statut_adhesion: a.statut_adhesion
      },
      conjoint: conjoints.map(c => ({
        nom: c.nom,
        prenom: c.prenom,
        sexe_conj: c.sexe_conj,
        date_naissance: c.date_naissance,
        type_identite_conj: c.type_identite_conj,
        num_identite_conj: c.num_identite_conj,
        profession: c.profession,
        date_adh_conj: c.date_adh_conj
      })),
      enfants: enfants.map(e => ({
        nom: e.nom,
        prenom: e.prenom,
        date_naissance: e.date_naissance,
        sexe_enf: e.sexe_enf,
        scolarise: e.scolarise ? "oui" : "non",
        handicap: e.handicap ? "oui" : "non",
        date_adh_enf: e.date_adh_enf
      })),
      beneficiaires,
      questionnaire,
      notes: a.notes,
      signature: a.signature_image ? {
        image: a.signature_image,
        date: a.signature_date,
        role: a.signature_role,
        signataire: a.signature_signataire
      } : null
    };

    res.json(result);
  } catch (err) {
    console.error("❌ Erreur chargement adhésion :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


module.exports = router;