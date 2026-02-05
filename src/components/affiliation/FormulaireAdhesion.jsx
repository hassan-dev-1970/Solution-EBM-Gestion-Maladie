import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BulletinAdhesionPreview from './BulletinAdhesionPreview';
import SignaturePad from "./SignaturePad";

import "./FormulaireAdhesion.css";

// Icône simple en inline SVG
const Icon = ({ name }) => {
  const icons = {
    person: "👤",
    heart: "🩺",
    child: "🧒",
    gift: "🎁",
    chevron: "▸",
  };
  return <span className="icon">{icons[name] || "•"}</span>;
};

// Composant d’en-tête d’accordéon
const AccordionHeader = ({ title, open, onClick, rightElement, activeSection }) => (
  <button
    type="button"
    className={`acc-header ${open ? "open" : ""} ${activeSection ? "active-section" : ""}`}
    onClick={onClick}
    aria-expanded={open}
  >
    <div className="acc-left">
      <span className="acc-chevron">{open ? "▴" : "▾"}</span>
      <span className="acc-title">{title}</span>
    </div>
    <div className="acc-right">{rightElement}</div>
  </button>
);

const FormulaireAdhesion = ({
  contexte,
  canEdit = false,
  canSubmit = false,
  canPrint = false,
  canValidate = false
}) => {
  // ---------- STATES pour options dynamiques ----------
  const [contrats, setContrats] = useState([]);
  const [clients, setClients] = useState([]);
  const [souscripteursFiltres, setSouscripteursFiltres] = useState([]);
  const [policesParContrat, setPolicesParContrat] = useState([]);
  const [searchRaison, setSearchRaison] = useState('');
  const [error, setError] = useState('');
  const [pays, setPays] = useState([]);
  const [villes, setVilles] = useState([]);
  const navigate = useNavigate();
  const [typeBenef, setTypeBenef] = useState(""); 
  const [beneficiaires, setBeneficiaires] = useState([]);
  const [signature, setSignature] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // Determine user role from context or localStorage
  const isAdmin = contexte === "admin";
  const isAdherentDistant = contexte === "client" && canSubmit;
  const isSouscripteurDistant = contexte === "client" && canValidate;

 

const [modalEnfant, setModalEnfant] = useState({
  isOpen: false,
  benefIndex: null // index du bénéficiaire concerné
});
// ---------- END STATES pour options dynamiques ------------------------------------------
// ========================================================================================

// Helper pour déterminer si un champ est éditable ou non
 const isFieldEditable = (fieldOwner) => {
  if (isAdmin) return true;

  if (fieldOwner === "adherent") {
    return isAdherentDistant;
  }

  if (fieldOwner === "souscripteur") {
    return isSouscripteurDistant;
  }

  return false;
};



  // ---------- STATES formulaire ----------
  const [sections, setSections] = useState({
    assure: false,
    conjoint: false,
    enfants: false,
    beneficiaires: false,
    questionnaire: false,
    notes: false,
  });

  const toggle = (key) => setSections((s) => ({ ...s, [key]: !s[key] }));

  const [assure, setAssure] = useState({
    compagnie: "",
    souscripteur: "",
    num_police: "",
    type_adhesion: "",
    date_adhesion: "",
    num_adhesion: "",
    sexe: "",
    nom: "",
    prenom: "",
    date_naissance: "",
    profession: "",
    adresse: "",
    ville: "",
    pays: "",
    email: "",
    tel: "",
    type_identite_assure: "",
    num_identite_assure: "",
    num_cnss: "",
    situation_familiale: "",
    nationalite: "",
    rib: "",
    cat_perso: "",
    cat_pro: "",
    salaire_annuel_brut: "",
    matricule_ste: "",
    date_embauche: "",
    regime_base: "",
    notes: "",
    statut_adhesion: "",
    situation_adhesion: ""
  });

  
  const [conjoint, setConjoint] = useState([{nom: "", prenom: "", sexe_conj: "", date_naissance: "", type_identite_conj: "", num_identite_conj: "", profession: "", date_adh_conj: "" }]);
  const [enfants, setEnfants] = useState([{nom: "", prenom: "", date_naissance: "", sexe_enf: "", scolarise: "", handicap: "", date_adh_enf: "" }]);
  const [questionnaire, setQuestionnaire] = useState({
    adherent: {
      emploi_occupe: "",
      benef_assur_mald_anterieur: "",
      cie_assur_mald_anterieur: "",
      consulte_medecin_5ans: "",
      motif_consultation: "",
      traitement_en_cours: "",
      traitement_details: "",
      operation_chirurgicale: "",
      operation_details: "",
      maladies_graves: "",
      maladies_graves_details: "",
      infirmite: "",
      infirmite_details: "",
      defaut_vue: "",
      grossesse: "",
      grossesse_mois: "",
      taille: "",
      poids: "",
    },
    conjoint: {
      emploi: "",
      emploi_occupe: "",
      benef_assur_maladie: "",
      cie_assur_maladie: "",
      benef_assur_mald_anterieur: "",
      cie_assur_mald_anterieur: "",
      consulte_medecin_5ans: "",
      motif_consultation: "",
      traitement_en_cours: "",
      traitement_details: "",
      operation_chirurgicale: "",
      operation_details: "",
      maladies_graves: "",
      maladies_graves_details: "",
      infirmite: "",
      infirmite_details: "",
      defaut_vue: "",
      grossesse: "",
      grossesse_mois: "",
      taille: "",
      poids: "",
    },
  });
  const [notes, setNotes] = useState("");

  // ---------- EFFECTS pour charger options ----------
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setError("Token non trouvé. Veuillez vous reconnecter.");
        const res = await axios.get('/api/clients', { headers: { Authorization: `Bearer ${token}` } });
        setClients(res.data);
      } catch (err) {
        console.error('Erreur chargement clients', err);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    const fetchContrats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setError("Token non trouvé. Veuillez vous reconnecter.");
        const res = await axios.get('/api/contrats', { headers: { Authorization: `Bearer ${token}` } });
        setContrats(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Erreur chargement contrats', err);
        setError("Erreur chargement contrats");
      }
    };
    fetchContrats();
  }, []);

// Met à jour les clients disponibles selon la compagnie sélectionnée ----------
      useEffect(() => {
        if (!assure.compagnie) {
          setSouscripteursFiltres([]);
          return;
        }

        // 1️⃣ Contrats de la compagnie sélectionnée
        const contratsParCompagnie = contrats.filter(
          c => c.compagnie === assure.compagnie
        );

        // 2️⃣ IDs clients uniques
        const idsClients = [...new Set(
          contratsParCompagnie.map(c => Number(c.id_client))
        )];

        // 3️⃣ Clients correspondants
        const clientsFiltres = clients.filter(client =>
          idsClients.includes(Number(client.id_client))
        );

        setSouscripteursFiltres(clientsFiltres);

      }, [assure.compagnie, contrats, clients]);


      // Met à jour les polices disponibles lorsque searchRaison change
      useEffect(() => {
        if (searchRaison) {
          const filtered = contrats
            .filter(c => Number(c.id_client) === Number(searchRaison))
            .map(c => c.police);
          setPolicesParContrat(filtered);
        } else {
          setPolicesParContrat([]);
        }
      }, [searchRaison, contrats]);
   

// Charger les pays
  useEffect(() => {
    const fetchPays = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setError("Token non trouvé. Veuillez vous reconnecter.");
        const res = await axios.get('/api/pays', { headers: { Authorization: `Bearer ${token}` } });
        setPays(res.data);
      } catch (err) {
        console.error('Erreur chargement pays', err);
      }
    };
    fetchPays();
  }, []);

  // Charger les villes
  useEffect(() => {
    const fetchVille = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setError("Token non trouvé. Veuillez vous reconnecter.");
        const res = await axios.get('/api/villes', { headers: { Authorization: `Bearer ${token}` } });
        setVilles(res.data);
      } catch (err) {
        console.error('Erreur chargement villes', err);
      }
    };
    fetchVille();
  }, []);

  // ---------- HANDLERS état --------------------------------
const handleAssure = (e) => {
  const { name, value } = e.target;

  let newValue = value;

  // 🟦 Majuscule uniquement pour certains champs
  const upperFields = ["nom", "prenom", "adresse", "ville", "profession", "nationalite", "num_identite_assure"];

  if (upperFields.includes(name)) {
    newValue = newValue.toUpperCase();
  }

  if (name === "compagnie") {
  setAssure(prev => ({
    ...prev,
    compagnie: value,
    souscripteur: "",
    num_police: ""
  }));
}

  setAssure((prev) => ({
    ...prev,
    [name]: newValue
  }));
};


  const addEnfant = () => setEnfants((arr) => [...arr, { nom: "", prenom: "", date_naissance: "", sexe_enf: "", scolarise: "", handicap: "", date_adh_enf: "" }]);
  const removeEnfant = (i) => setEnfants((arr) => arr.filter((_, idx) => idx !== i));
  const updateEnfant = (i, field, value) => setEnfants((arr) => {
    const copy = [...arr];
    copy[i] = { ...copy[i], [field]: value };
    return copy;
  });


// state

// helpers
const addBenef = () => setBeneficiaires((arr) => [
  ...arr,
  {
    nom: "",
    prenom: "",
    date_naissance: "",
    lien: "",
    pourcentage: null,
    // ne pas envoyer type_benef ici — on construit l'objet final au submit
  }
]);

const removeBenef = (i) =>
  setBeneficiaires((arr) => arr.filter((_, idx) => idx !== i));

// Met à jour un champ spécifique d’un bénéficiaire dans le tableau
const updateBenef = (index, field, value) => {
  setBeneficiaires(prev =>
    prev.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    )
  );
};

// Renvoie les IDs (index) des enfants déjà utilisés comme bénéficiaires
const getEnfantsDejaSelectionnes = () => {
  return beneficiaires
    .filter(b => b.lien === "enfant")
    .map(b => {
      // On identifie l'enfant par nom + prénom + date (ou juste l'index si vous stockez l'id)
      return `${b.nom}-${b.prenom}-${b.date_naissance}`;
    });
};

const handleLienChange = (index, value) => {
  if (value === "enfant" && enfants.length > 0) {
    // Ouvrir la modale
    setModalEnfant({ isOpen: true, benefIndex: index });
  } else {
    // Mettre à jour normalement
    updateBenef(index, "lien", value);
    // Optionnel : vider les champs si besoin
    if (value !== "enfant") {
      updateBenef(index, "nom", "");
      updateBenef(index, "prenom", "");
      updateBenef(index, "date_naissance", "");
    }
  }
};


  const addconjoint = () => setConjoint((arr) => [...arr, { nom: "", prenom: "", sexe_conj: "", date_naissance: "", type_identite_conj: "", num_identite_conj: "", profession: "", date_adh_conj: "" }]);
  const removeconjoint = (i) => setConjoint((arr) => arr.filter((_, idx) => idx !== i));
  const updateconjoint = (i, field, value) => setConjoint((arr) => {
    const copy = [...arr];
    copy[i] = { ...copy[i], [field]: value };
    return copy;
  });

  const handleQuestionnaire = (who, field, value) => setQuestionnaire((q) => ({ ...q, [who]: { ...q[who], [field]: value } }));


  // ---------- VALIDATION ----------
  const validateBeforeSend = () => {
  if (!assure.nom || !assure.prenom || !assure.num_identite_assure) {
    alert("Veuillez remplir au minimum le nom, prénom et numéro de document de l'assuré.");
    return false;
  }
  // Si Personne désignée doit avoir au moins 1 bénéficiaire
  if (typeBenef === "personne_designee" && (!beneficiaires || beneficiaires.length === 0)) {
    alert("Vous avez choisi 'Personne désignée' : ajoutez au moins une personne.");
    return false;
  }
  // Optionnel : vérifier que % total n'excède pas 100
  if (typeBenef === "personne_designee") {
    const total = beneficiaires.reduce((s, b) => s + (parseFloat(b.pourcentage) || 0), 0);
    if (total > 100) {
      alert("Le total des pourcentages des bénéficiaires dépasse 100%.");
      return false;
    }
  }
  return true;
};
  // ---------- API helper ----------
  const apiPost = async (url, data) => {
    const token = localStorage.getItem('token');
    return axios.post(url, data, {
      headers: { Authorization: token ? `Bearer ${token}` : "",  "Content-Type": "application/json" },
      timeout: 20000
    });
  };
  // ---------- SAVE adhesion (single endpoint) ----------
const saveAdhesion = async (payload) => {
  // 🔥 payload vient désormais de handleSubmit()
  if (!payload) throw new Error("Payload vide — handleSubmit n’a rien envoyé");

  const {
    assure,
    conjoint,
    enfants,
    beneficiaires,
    questionnaire,
    notes
  } = payload;

  // Construction finale pour l'API
  const finalPayload = {
    assure,
    conjoint,
    enfants,
    beneficiaires,
    questionnaire,
    notes: notes || "",
    signature: payload.signature
  };

  // 🔥 Envoi au backend
  const res = await apiPost("http://localhost:5000/api/adhesions", finalPayload);

  const id_adhesion =
    res?.data?.id_adhesion ||
    res?.data?.id ||
    null;

  if (!id_adhesion) {
    console.error("Réponse API :", res.data);
    throw new Error("id_adhesion introuvable après enregistrement");
  }

  return id_adhesion;
};

const user = JSON.parse(localStorage.getItem('user') || '{}');

const getSignatureObject = (image) => ({
  image,
  date: new Date().toISOString(),
  role: user.role,
  signataire: `${user.nom} ${user.prenom}`
});

// Helper to format dates in French locale for display (used by modal child selection)
const formatDateFR = (date) => {
  if (!date) return "";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return String(date);
  try {
    return d.toLocaleDateString('fr-FR');
  } catch {
    // simple fallback dd/mm/yyyy
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

// ---------- HANDLE SUBMIT ----------
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateBeforeSend()) return; 

  const payload = {
    assure,
    conjoint,
    enfants,
    beneficiaires: beneficiairesPayload,
    questionnaire,
    notes,
    signature: getSignatureObject(signature)
  };

  try {
    const id = await saveAdhesion(payload);

    if (canSubmit && contexte === "client") {
        alert("Votre bulletin d’adhésion a été soumis avec succès.");
        navigate("/espace-client");
      } else {
        alert(`Adhésion enregistrée avec succès. ID = ${id}`);
        navigate("/listeadhesions");
      }


  } catch (err) {
    console.error("Erreur complète :", err);
    const serverMsg = err?.response?.data || err?.message;
    alert(
      "Erreur lors de l'enregistrement — voir console.\n" +
      JSON.stringify(serverMsg)
    );
  }
};

const printRef = useRef(null);

// ---------- IPRESSION AVEC html2pdf ----------
const handleDownloadPDF = async () => {
  const element = printRef.current;
  if (!element) return;

// 🔥 attendre que l'image signature soit chargée
  if (!signature) {
    alert("Veuillez signer avant de télécharger le bulletin.");
    return;
  }
  // Indique qu’on va générer le PDF → force le re-rendu avec la signature
  setIsGeneratingPDF(true);
};
  useEffect(() => {
  if (isGeneratingPDF && signature) {
    // Laisser un tick au DOM pour s’assurer que le composant est à jour
    const timer = setTimeout(() => {
      const element = printRef.current;
      if (element) {
        const opt = {
          margin: 10,
          filename: `Bulletin_Adhesion_${assure.nom}_${assure.prenom}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2, 
            useCORS: true,
            allowTaint: true 
          },
          jsPDF: { unit: 'mm', format: 'a4' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(element).save();
      }
      setIsGeneratingPDF(false); // réinitialiser
    }, 50); // délai court pour garantir le rendu

    return () => clearTimeout(timer);
  }
}, [isGeneratingPDF, signature, assure]);


const handleValidation = () => {
  alert("Adhésion validée par le souscripteur");
  // plus tard : appel API pour changer le statut
};

// ===============================
// NORMALISATION BENEFICIAIRES (GLOBAL)
// ===============================
const beneficiairesPayload = (() => {
  if (!typeBenef) return null;

  // ayants droits / héritiers légaux
  if (typeBenef === "ayants_droits" || typeBenef === "heritiers_legaux") {
    return {
      type_beneficiaire: typeBenef,
      liste: []
    };
  }

  // personnes désignées
  if (typeBenef === "personne_designee") {
    return {
      type_beneficiaire: "personne_designee",
      liste: beneficiaires.map(b => ({
        nom: b.nom || null,
        prenom: b.prenom || null,
        date_naissance: b.date_naissance || null,
        lien: b.lien || null,
        pourcentage: b.pourcentage ? Number(b.pourcentage) : null
      }))
    };
  }

  return null;
})();


  return (
    <> 

    <div className="fa-header-wrapper">
      <header className="fa-header">
        <div className="fa-title">
          <Icon name="person" />
          <div>
            <h1>Formulaire — Adhésion</h1>
            <p className="sub">Nouvelle adhésion</p>
          </div>
        </div>  
        {error && <div className="form-error" role="alert">{error}</div>}
      </header>

    </div>


    <div className="fa-wrapper">
      <div className='fa-scroll-container'>   
        
      <form id="adhesion-form" className="fa-form" onSubmit={handleSubmit}>

    {/*=========================================================================== */}
          {/*========== Barre de navigation basique des boutons ========== */}
    {/*=========================================================================== */}
          <div className="btn-group right">
                  {/* 🧾 ESPACE CLIENT – ADHÉRENT DISTANT */}
                  {contexte === "client" && canSubmit && (
                    <>
                      {canPrint && (
                        <button type="button" className="btn-ghost" onClick={handleDownloadPDF} disabled={!signature}>Aperçu / PDF</button>
                      )}

                      <button type="submit" className="btn btn-success">Soumettre le bulletin</button>
                    </>
                  )}

                  {/* 🏢 ESPACE CLIENT – SOUSCRIPTEUR DISTANT */}
                  {contexte === "client" && canValidate && (
                    <>
                      {canPrint && (
                        <button type="button"  className="btn-ghost" onClick={handleDownloadPDF} disabled={!signature}>Télécharger le bulletin</button>
                      )}

                      <button type="button" className="btn-success" onClick={handleValidation}>Valider l’adhésion</button>
                    </>
                  )}

                  {/* 🛠️ ADMIN / BACKOFFICE */}
                  {contexte === "admin" && (
                    <>
                      <button type="submit" className="btn btn-success">Enregistrer l’adhésion</button>

                      <button type="button" className="btn btn-annuler"  onClick={() => window.location.reload()}> Annuler</button>
                    
                      <button type="button" className="btn btn-close" onClick={() => navigate("/listeadhesions")}>Fermer</button>
                    </>
                  )}
          </div>
    {/*==================================================================================================================== */}

        {/* ASSURÉ */}
        <section className={`card ${sections.assure ? "active-section" : ""}`}>
                <AccordionHeader
                  title="Informations de l'assuré principal"
                  open={sections.assure}
                  onClick={() => toggle("assure")}
                  rightElement={<small>1/6 Obligatoire</small>}
                />
                {sections.assure && (
                  <div className="card-body">

                    {/* === Informations d’adhésion === */}
                    <div className="field-group">
                      <h4 className="title-groupe-section">Informations d’adhésion</h4>
                      <div className="grid-2">

                    {/* Compagnie d'assurance */}
                    <label >
                    <span className="lbl">Compagnie d'assurance</span>
                    <select name="compagnie" value={assure.compagnie}
                    onChange={handleAssure} >
                       <option value="">-- Compagnie --</option>
                        <option value="Sanlam Maroc">Sanlam Maroc</option>
                        <option value="AXA">AXA Assurance Maroc</option>
                        <option value="Wafa Assurance">Wafa Assurance</option>
                        <option value="RMA">RMA</option>
                        <option value="MCMA">MCMA</option>
                        <option value="La Marocaine Vie">La Marocaine Vie</option>
                        <option value="Allianz Maroc">Allianz Maroc</option>
                        <option value="AtlantaSanad">AtlantaSanad</option>
                    </select>
                  </label>

                        {/* Souscripteur */}
                        <label>
                          <span className="lbl">Souscripteur *</span>
                          <select
                            name="souscripteur"
                            value={assure.souscripteur}
                            onChange={(e) => {
                              handleAssure(e);
                              setSearchRaison(e.target.value);
                            }}
                            disabled={!assure.compagnie} // ⛔ bloqué tant que compagnie non choisie
                          >
                            <option value="">
                              {assure.compagnie
                                ? "-- Sélectionner un client --"
                                : "-- Choisissez d’abord une compagnie --"}
                            </option>

                            {souscripteursFiltres.map((client) => (
                              <option key={client.id_client} value={client.id_client}>
                                {client.raison_sociale}
                              </option>
                            ))}
                          </select>
                        </label>

                        
                        {/* Numéro de police */}
                        <label>
                          <span className="lbl">Numéro de police</span>
                          <select name="num_police" value={assure.num_police} onChange={handleAssure}>
                            <option value="">-- N° Police --</option>
                            {policesParContrat.map((police, index) => (
                              <option key={index} value={police}>{police}</option>
                            ))}
                          </select>
                        </label>

                          {/* Type d’adhésion */}                        
                        <label>
                          <span className="lbl">Type d’adhésion</span>
                          <select name="type_adhesion" value={assure.type_adhesion} onChange={handleAssure}>
                            <option value="">-- sélectionner --</option>
                            <option value="Nouvelle">Nouvelle</option>
                            <option value="Rectificatif">Rectificatif</option>
                          </select>
                        </label>
                          {/* Date d’adhésion */}
                        <label>
                          <span className="lbl">Date d’adhésion</span>
                          <input type="date" name="date_adhesion" value={assure.date_adhesion} onChange={handleAssure} 
                          disabled={!isFieldEditable("souscripteur")}/>
                        </label>
                        
                        {/* Numéro d’adhésion */}
                        <label>
                          <span className="lbl">Numéro d’adhésion</span>
                          <input type="number" name="num_adhesion" value={assure.num_adhesion} onChange={handleAssure} 
                          disabled={!isFieldEditable("souscripteur")}/>
                        </label>
                      </div>
                    </div>

                    {/* === Informations personnelles === */}
                    <div className="field-group">
                      <h4 className="title-groupe-section">Informations personnelles</h4>
                      <div className="grid-2">

                        {/* Sexe */}
                        <label>
                          <span className="lbl">Sexe</span>
                          <select name="sexe" value={assure.sexe} onChange={handleAssure}>
                            <option value="">-- sélectionner --</option>
                            <option>Homme</option>
                            <option>Femme</option>
                          </select>
                        </label>

                        {/* Nom */}
                        <label>
                          <span className="lbl">Nom *</span>
                          <input name="nom" value={assure.nom} onChange={handleAssure} placeholder="" />
                        </label>

                          {/* Prénom */}
                        <label>
                          <span className="lbl">Prénom *</span>
                          <input name="prenom" value={assure.prenom} onChange={handleAssure} placeholder="" />
                        </label>

                          {/* Date de naissance */}
                        <label>
                          <span className="lbl">Date de naissance *</span>
                          <input type="date" name="date_naissance" value={assure.date_naissance} onChange={handleAssure} />
                        </label>

                          {/* Situation familiale */}
                        <label>
                          <span className="lbl">Situation familiale</span>
                          <select name="situation_familiale" value={assure.situation_familiale} onChange={handleAssure}>
                            <option value="">-- sélectionner --</option>
                            <option value="Célibataire">Célibataire</option>
                            <option value="Marié(e)">Marié(e)</option>
                            <option value="Divorcé(e)">Divorcé(e)</option>
                            <option value="Veuf(ve)">Veuf(ve)</option>
                          </select>
                        </label>
                        
                          {/* Type d’identité nationale */}
                        <label>
                          <span className="lbl">Type identité nationale</span>
                          <select name="type_identite_assure" value={assure.type_identite_assure} onChange={handleAssure}>
                            <option value="">-- Selectionner un type d'identité --</option>
                            <option value="CIN">CIN</option>
                            <option value="Passeport">Passeport</option>
                            <option value="Permis">Permis</option>
                            <option value="Carte de séjour">Carte de séjour</option>
                          </select>
                        </label>

                          {/* Numéro d’identité nationale */}
                        <label>
                          <span className="lbl">N° d'identité nationale *</span>
                          <input name="num_identite_assure" value={assure.num_identite_assure} onChange={handleAssure} placeholder="Ex : AB123456" />
                        </label>

                          {/* Matricule CNSS */}
                        <label>
                          <span className="lbl">Matricule CNSS (12 chiffres)</span>
                          <input type="text" name="num_cnss" value={assure.num_cnss}
                                onChange={(e) => {
                                  const value = e.target.value.replace(/\D/g, ""); // 🔥 supprime tout sauf les chiffres
                                  handleAssure({ target: { name: "num_cnss", value } });
                                }}
                                maxLength="12"   // 👉 mets la longueur que tu veux (ex. 10)
                                placeholder="Ex: 123456789012"/>
                        </label>

                          {/* Nationalité */}
                        <label>
                          <span className="lbl">Nationalité</span>
                          <select name="nationalite" value={assure.nationalite} onChange={handleAssure}>
                            <option value="">-- Nationalité --</option>
                              {pays.map((index) => (
                                <option key={index.id_pays} value={index.id_pays}>
                                  {index.nationalite}
                                </option>
                              ))}
                          </select>
                        </label>
                        
                        {/* RIB */}
                        <label>
                          <span className="lbl">RIB (24 chiffres)</span>
                          <input type="text" name="rib" value={assure.rib}onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              handleAssure({ target: { name: "rib", value } });                              
                            }}
                            maxLength="24"
                            placeholder="Ex: 123456789012345678901234"
                          />
                        </label>
                      </div>
                    </div>

                    {/* === Informations professionnelles === */}
                    <div className="field-group">
                      <h4 className="title-groupe-section">Informations professionnelles</h4>
                      <div className="grid-2">

                        {/* Catégorie du personnel */}
                        <label>
                          <span className="lbl">Catégorie du personnel</span>
                          <select name="cat_perso" value={assure.cat_perso} onChange={handleAssure}>
                            <option value="">-- sélectionner --</option>
                            <option value="Cadre">Cadre</option>
                            <option value="Non cadre">Non cadre</option>
                            <option value="Ouvrier(ère)">Ouvrier(ère)</option>
                            <option value="Temporaire">Temporaire</option>
                          </select>
                        </label>

                        {/* Catégorie professionnelle */}
                        <label>
                          <span className="lbl">Catégorie professionnelle</span>
                          <select name="cat_pro" value={assure.cat_pro} onChange={handleAssure}>
                            <option value="">-- sélectionner --</option>
                            <option value="Actif(ve)">Actif(ve)</option>
                            <option value="Retraité(e)">Retraité(e)</option>
                          </select>
                        </label>

                        {/* Profession */}
                        <label>
                          <span className="lbl">Profession</span>
                          <input name="profession" value={assure.profession} onChange={handleAssure} />
                        </label>
                        <label>
                          <span className="lbl">Salaire annuel brut</span>
                          <input type="number" name="salaire_annuel_brut" value={assure.salaire_annuel_brut} onChange={handleAssure} />
                        </label>

                        {/* Matricule société */}
                        <label>
                          <span className="lbl">Matricule société</span>
                          <input type="number" name="matricule_ste" value={assure.matricule_ste} onChange={handleAssure} />
                        </label>

                        {/* Date d'embauche */}
                        <label>
                          <span className="lbl">Date d’embauche</span>
                          <input type="date" name="date_embauche" value={assure.date_embauche} onChange={handleAssure} />
                        </label>
                      </div>
                    </div>

                    {/* === Coordonnées === */}
                    <div className="field-group">
                      <h4 className="title-groupe-section">Coordonnées</h4>
                      <div className="grid-2">

                        {/* Téléphone */}
                        <label>
                          <span className="lbl">Téléphone</span>
                          <input name="tel" value={assure.tel} onChange={handleAssure} />
                        </label>

                        {/* Email */}
                        <label>
                          <span className="lbl">Email</span>
                          <input type="email" name="email" value={assure.email} onChange={handleAssure} />
                        </label>

                        {/* Adresse */}
                        <label>
                          <span className="lbl">Adresse</span>
                          <input name="adresse" value={assure.adresse} onChange={handleAssure} />
                        </label>

                        {/* Ville */}
                        <label>
                          <span className="lbl">Ville</span>
                          <select name="ville" value={assure.ville} onChange={handleAssure}>
                            <option value="">-- selectionner une ville --</option>
                              {villes.map((ville) => (
                                <option key={ville.id_ville} value={ville.id_ville}>
                                  {ville.nom_ville}
                                </option>
                              ))}
                          </select>
                        </label>

                        {/* Pays */}
                        <label>
                          <span className="lbl">Pays</span>
                          <select name="pays" value={assure.pays} onChange={handleAssure}>
                            <option value="">-- selectionner un pays --</option>
                              {pays.map((index) => (
                                <option key={index.id_pays} value={index.id_pays}>
                                  {index.nom_pays}
                                </option>
                              ))}
                          </select>
                        </label>
                      </div>
                    </div>

                    {/* === Informations assurance de base === */}
                    <div className="field-group">
                      <h4 className="title-groupe-section">Informations assurance</h4>
                      <div className="grid-2">

                        {/* Régime assurance de base */}
                        <label>
                          <span className="lbl">Régime assurance de base</span>
                          <input name="regime_base" value={assure.regime_base} onChange={handleAssure} placeholder="CNSS / Privé ..." />
                        </label>
                        
                      </div>
                    </div>

                  </div>
                )}
              </section>

        {/* CONJOINT */}
        <section className={`card ${sections.conjoint ? "active-section" : ""}`}>
          <AccordionHeader
            title="Conjoint(e)"
            open={sections.conjoint}
            onClick={() => toggle("conjoint")}
            rightElement={<small>2/6 Obligatoire pour les mariés</small>}
          />
          {sections.conjoint && (
            <div className="card-body">
            <button type="button" className="btn-sm" onClick={addconjoint}>+ Ajouter un conjoint</button><br /><br />
            {conjoint.length === 0 && <p className="muted">Aucun conjoint enregistré.</p>}
            {conjoint.map((conjoint, i) => (
              <div className="row-item" key={i}>
                <div className="mini-grid" style={{ height: '180px'}}>

                {/* Nom */}
                <label>
                  <span className="lbl">Nom</span>
                  <input value={conjoint.nom} onChange={(e) => updateconjoint(i, "nom", e.target.value.toUpperCase())} />
                </label>

                  {/* Prénom */}
                <label>
                  <span className="lbl">Prénom</span>
                  <input value={conjoint.prenom} onChange={(e) => updateconjoint(i, "prenom", e.target.value.toUpperCase())} />
                </label>

                {/* Sexe */}
                <label>
                  <span className="lbl">Sexe</span>
                  <select name="sexe_conj" value={conjoint.sexe_conj} onChange={(e) => updateconjoint (i, "sexe_conj", e.target.value)}>
                    <option value="">-- sélectionner --</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                  </select>
                </label>

                {/* Date de naissance */}
                <label>
                  <span className="lbl">Date de naissance</span>
                  <input type="date" value={conjoint.date_naissance} onChange={(e) => updateconjoint(i, "date_naissance", e.target.value)} />
                </label>

                {/* Type d’identité nationale */}
                <label>
                  <span className="lbl">Type identité nationale</span>
                  <select value={conjoint.type_identite_conj} onChange={(e) => updateconjoint(i, "type_identite_conj", e.target.value)}>
                    <option value="">-- Selectionner un type d'identité --</option>                    
                    <option value="CIN">CIN</option>
                    <option value="Passeport">Passeport</option>
                    <option value="Permis">Permis</option>
                    <option value="Carte de séjour">Carte de séjour</option>
                  </select>
                </label>

                {/* Numéro d’identité nationale */}
                <label>
                  <span className="lbl">N° d'identité nationale *</span>
                  <input value={conjoint.num_identite_conj} onChange={(e) => updateconjoint(i, "num_identite_conj", e.target.value.toUpperCase())} />
                </label>

                {/* Date d’adhésion */}
                <label>
                  <span className="lbl">Date d’adhésion</span>
                  <input type="date" value={conjoint.date_adh_conj} onChange={(e) => updateconjoint(i, "date_adh_conj", e.target.value)}
                    placeholder="jj/mm/aaaa" pattern="\d{2}/\d{2}/\d{4}"  disabled={!isFieldEditable("souscripteur")}/>
                </label>
                
                {/* Profession */}
                <label style={{ marginBottom: '20px'}}>
                  <span className="lbl">Profession</span>
                  <input value={conjoint.profession} onChange={(e) => updateconjoint(i, "profession", e.target.value)} />
                </label>
              </div>

              {/* Bouton Supprimer */}
              <button type="button" className="btn-del" onClick={() => removeconjoint(i)}><span>&#x1F5D1;</span></button>
             
              </div>

              ))}
            </div>
          )}
        </section>

        {/* ENFANTS */}
        <section className={`card ${sections.enfants ? "active-section" : ""}`}>
          <AccordionHeader
            title="Enfants à charge"
            open={sections.enfants}
            onClick={() => toggle("enfants")}
            rightElement={<small>3/6 Obligatoire pour les enfants à charge</small>}
          />
          {sections.enfants && (
            <div className="card-body">              
              <button type="button" className="btn-sm" onClick={addEnfant}>+ Ajouter un enfant</button><br /><br />
              {enfants.length === 0 && <p className="muted">Aucun enfant enregistré.</p>}
              {enfants.map((enf, i) => (
                <div className="row-item" key={i}>
                  <div className="mini-grid">

                    {/* Nom */ }
                    <label> 
                    <span className="lbl">Nom</span> 
                    <input placeholder="Nom" value={enf.nom} onChange={(e) => updateEnfant(i, "nom", e.target.value.toUpperCase())} />
                   </label>

                    {/* Prénom */ }
                    <label>
                      <span className="lbl">Prénom</span>
                    <input placeholder="Prénom" value={enf.prenom} onChange={(e) => updateEnfant(i, "prenom", e.target.value.toUpperCase())} />
                   </label>
                   
                    {/* Date de naissance */ }
                  <label> 
                    <span className="lbl">Date de naissance</span> 
                    <input type="date" value={enf.date_naissance} onChange={(e) => updateEnfant(i, "date_naissance", e.target.value)} />
                 </label>

                 {/* Sexe */ }
                 <label>
                  <span className="lbl">Sexe</span>
                  <select name="sexe_enf" value={enf.sexe_enf} onChange={(e) => updateEnfant (i, "sexe_enf", e.target.value)}>
                    <option value="">-- sélectionner --</option>
                    <option value="masculin">Masculin</option>
                    <option value="féminin">Féminin</option>
                  </select>
                </label>
                 
                  {/* Scolarisé */ }
                 <label>
                  <span className="lbl">Scolarisé</span>
                  <select name="scolarise" value={enf.scolarise} onChange={(e) => updateEnfant (i, "scolarise", e.target.value)}>
                    <option value="">-- sélectionner --</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </label>
                
                 {/* Handicap */ }
                 <label>
                  <span className="lbl">Handicap</span>
                  <select name="handicap" value={enf.handicap} onChange={(e) => updateEnfant (i, "handicap", e.target.value)}>
                    <option value="">-- sélectionner --</option>
                    <option value="oui">Oui</option>
                    <option value="non">Non</option>
                  </select>
                </label> 

                  {/* Date d’adhésion */ }
                  <label> 
                    <span className="lbl">Date d’adhésion</span> 
                    <input type="date" value={enf.date_adh_enf} onChange={(e) => updateEnfant(i, "date_adh_enf", e.target.value)} 
                      placeholder="jj/mm/aaaa" pattern="\d{2}/\d{2}/\d{4}" disabled={!isFieldEditable("souscripteur")}/>
                  </label>
                  </div>

                  {/* Bouton supprimer */ }                  
                  <button type="button" className="btn-del" onClick={() => removeEnfant(i)}><span>&#x1F5D1;</span></button>
               
                </div>
              ))}
            </div>
          )}
        </section>

          {/* BÉNÉFICIAIRES */}
          <section className={`card ${sections.beneficiaires ? "active-section" : ""}`}>
            <AccordionHeader
              title="Bénéficiaires en cas de décès (désignation des personnes)"
              open={sections.beneficiaires}
              onClick={() => toggle("beneficiaires")}
              rightElement={<small>4/6 Obligatoire</small>}
            />
            {sections.beneficiaires && (
              <div className="card-body">
                <div className="card">
                  <h4 className="title-groupe-section">Catégorie des bénéficiaires</h4>
                  <div className="radio-group">
                    <label className="radio-line">
                      <input
                        type="radio"
                        name="type_benef"
                        value="ayants_droits"
                        checked={typeBenef === "ayants_droits"}
                        onChange={() => setTypeBenef("ayants_droits")}
                      />
                      Ayants droits
                    </label>

                    <label className="radio-line">
                      <input
                        type="radio"
                        name="type_benef"
                        value="heritiers_legaux"
                        checked={typeBenef === "heritiers_legaux"}
                        onChange={() => setTypeBenef("heritiers_legaux")}
                      />
                      Héritiers légaux
                    </label>

                    <label className="radio-line">
                      <input
                        type="radio"
                        name="type_benef"
                        value="personne_designee"
                        checked={typeBenef === "personne_designee"}
                        onChange={() => setTypeBenef("personne_designee")}
                      />
                      Personne désignée
                    </label>
                  </div>
                </div>

                {typeBenef === "personne_designee" && (
                  <>
                    <button type="button" className="btn-sm" onClick={addBenef}>+ Ajouter un bénéficiaire</button><br /><br />
                    {beneficiaires.length === 0 && <p className="muted">Aucune personne désignée.</p>}

                    {beneficiaires.map((b, i) => (
                      <div className="row-item" key={i}>
                        <div className="mini-grid" style={{ height: '170px'}}>

                          {/* Type de lien */}
                          <label>
                            <span className="lbl">Type de lien</span>
                            <select name="lien" value={b.lien} onChange={(e) => handleLienChange(i, e.target.value)}>
                              <option value="">-- sélectionner --</option>
                              <option value="parent">Parent</option>
                              <option value="conjoint">Conjoint</option>
                              <option value="enfant">Enfant</option>
                              <option value="autre">Autre</option>
                            </select>
                          </label>

                           {/* Nom */}
                          <label>
                            <span className="lbl">Nom</span>
                            <input value={b.nom} readOnly={b.lien === "enfant"}
                            onChange={(e) => updateBenef(i, "nom", e.target.value.toUpperCase())} />
                          </label>

                          {/* Prénom */}
                          <label>
                            <span className="lbl">Prénom</span>
                            <input value={b.prenom} onChange={(e) => updateBenef(i, "prenom", e.target.value.toUpperCase())} />
                          </label>

                          {/* Date de naissance */}
                          <label>
                            <span className="lbl">Date de naissance</span>
                            <input type="date" value={b.date_naissance} onChange={(e) => updateBenef(i, "date_naissance", e.target.value)} />
                          </label>

                          {/* Pourcentage */}
                          <label>
                            <span className="lbl">Pourcentage</span>
                            <input type="number" value={b.pourcentage ?? ""} onChange={(e) => updateBenef(i, "pourcentage", e.target.value)} 
                            placeholder="ex: 50" disabled={!isFieldEditable("souscripteur")}/>
                          </label>
                        </div>

                        {/* Bouton supprimer */}
                        <button type="button" className="btn-del" onClick={() => removeBenef(i)}><span>&#x1F5D1;</span></button>
                      
                      </div>
                    ))}
                  </>
                )}

              </div>
            )}
          </section>


        {/* QUESTIONNAIRE MÉDICAL */}
        <section className={`card ${sections.questionnaire ? "active-section" : ""}`}>
          <AccordionHeader
            title="Questionnaire médical (Adhérent / Conjoint)"
            open={sections.questionnaire}
            onClick={() => toggle("questionnaire")}
            rightElement={<small>5/6 Obligatoire</small>}
          />
          {sections.questionnaire && (
            <div className="card-body">
              <div className="sub-card">
                <h4 className="title-groupe-section">Adhérent</h4>
                <div className="grid-2">

                  {/* Assurance Maladie */ }
                  <label>
                    <span className="lbl">Avez-vous bénéficié d’une assurance maladie ?</span>
                    <select value={questionnaire.adherent.benef_assur_mald_anterieur} onChange={(e) => 
                      handleQuestionnaire("adherent", "benef_assur_mald_anterieur", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.adherent.benef_assur_mald_anterieur === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Quelle compagnie (si oui)</span>
                    <select value={questionnaire.adherent.cie_assur_mald_anterieur} onChange={(e) => 
                      handleQuestionnaire("adherent", "cie_assur_mald_anterieur", e.target.value)}>
                       <option value="">-- Compagnie --</option>
                        <option value="Sanlam Maroc">Sanlam Maroc</option>
                        <option value="AXA">AXA Assurance Maroc</option>
                        <option value="Wafa Assurance">Wafa Assurance</option>
                        <option value="RMA">RMA</option>
                        <option value="MCMA">MCMA</option>
                        <option value="La Marocaine Vie">La Marocaine Vie</option>
                        <option value="Allianz Maroc">Allianz Maroc</option>
                        <option value="AtlantaSanad">AtlantaSanad</option>
                    </select>
                  </label>

                  {/* Consultation 5 ans */ }
                  <label>
                    <span className="lbl">Avez-vous consulté un médecin les 5 dernières années ?</span>
                    <select value={questionnaire.adherent.consulte_medecin_5ans} onChange={(e) => handleQuestionnaire("adherent", "consulte_medecin_5ans", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.adherent.consulte_medecin_5ans === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Motif (si oui)</span>
                    <input placeholder="Ex: hypertension" value={questionnaire.adherent.motif_consultation} onChange={(e) => handleQuestionnaire("adherent", "motif_consultation", e.target.value)} />
                  </label>

                  {/* Traitement */ }
                  <label>
                    <span className="lbl">Traitement en cours ?</span>
                    <select value={questionnaire.adherent.traitement_en_cours} onChange={(e) => handleQuestionnaire("adherent", "traitement_en_cours", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.adherent.traitement_en_cours === "Oui" ? 
                    "show-field" : "hide-field"}         >
                    <span className="lbl">Détails traitement</span>
                    <input placeholder="Médicaments / fréquence" value={questionnaire.adherent.traitement_details} onChange={(e) => handleQuestionnaire("adherent", "traitement_details", e.target.value)} />
                  </label>

                  {/* Maladies Graves */ }
                   <label>
                    <span className="lbl">Avez-vous atteint de maladies chroniques ou graves ?</span>
                    <select value={questionnaire.adherent.maladies_graves} onChange={(e) => handleQuestionnaire("adherent", "maladies_graves", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>                
                  </label>
                  <label className={questionnaire.adherent.maladies_graves === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails maladies graves</span>
                    <input placeholder="Maladie / fréquence" value={questionnaire.adherent.maladies_graves_details} onChange={(e) => 
                      handleQuestionnaire("adherent", "maladies_graves_details", e.target.value)} />
                  </label>

                  {/* Chirurgies */ }
                  <label>
                    <span className="lbl">Avez-vous subi des opérations chirurgicales ?</span>
                    <select value={questionnaire.adherent.operation_chirurgicale} onChange={(e) => handleQuestionnaire("adherent", "operation_chirurgicale", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.adherent.operation_chirurgicale === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails des opérations chirurgicales</span>
                    <input value={questionnaire.adherent.operation_details} onChange={(e) => handleQuestionnaire("adherent", "operation_details", e.target.value)} />
                  </label>

                  {/* Infirmité */ }
                  <label>
                    <span className="lbl">Êtes-vous atteint d’une infirmité ou d’un handicap ?</span>
                    <select value={questionnaire.adherent.infirmite} onChange={(e) => handleQuestionnaire("adherent", "infirmite", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.adherent.infirmite === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails infirmité</span>
                    <input value={questionnaire.adherent.infirmite_details} onChange={(e) => handleQuestionnaire("adherent", "infirmite_details", e.target.value)} />
                  </label>

                  {/* Défaut de la vue */ }
                  <label>
                    <span className="lbl">Avez-vous un défaut de la vue ?</span>
                    <select value={questionnaire.adherent.defaut_vue} onChange={(e) => handleQuestionnaire("adherent", "defaut_vue", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label><br /><br />

                    {/* Grossesse */ }
                  {assure.sexe === "Femme" && (
                    <><label>
                      <span className="lbl">Êtes-vous en état de grossesse ?</span>
                      <select value={questionnaire.adherent.grossesse} onChange={(e) => handleQuestionnaire("adherent", "grossesse", e.target.value)}>
                        <option value="">--</option>
                        <option>Oui</option>
                        <option>Non</option>
                      </select>
                    </label>

                    <label className={questionnaire.adherent.grossesse === "Oui" ? 
                    "show-field" : "hide-field"}               
                    >
                      <span className="lbl">Age de la grossesse</span>
                      <input value={questionnaire.adherent.grossesse_mois} onChange={(e) => handleQuestionnaire("adherent", "grossesse_mois", e.target.value)} />
                    </label>
                    </>
                  )}                 

                  {/* Taille */ }
                  <label>
                    <span className="lbl">Taille (cm)</span>
                    <input value={questionnaire.adherent.taille} onChange={(e) => handleQuestionnaire("adherent", "taille", e.target.value)} />
                  </label>

                  {/* Poids */ }
                  <label>
                    <span className="lbl">Poids (kg)</span>
                    <input value={questionnaire.adherent.poids} onChange={(e) => handleQuestionnaire("adherent", "poids", e.target.value)} />
                  </label>
                </div>
              </div>


              {/* ================  Conjoint================================== */ }
              <div className="sub-card">
                <h4 className="title-groupe-section">Conjoint</h4>
                <div className="grid-2">

                  {/* Type personne 
                  <label>
                    <span className="lbl">Type de personne</span>
                    <input value={questionnaire.conjoint.type_personne} 
                    onChange={(e) => handleQuestionnaire("conjoint", "type_personne", e.target.value)} />
                  </label> */ }

                  {/* Emploi */ }
                  <label>
                    <span className="lbl">Avez-vous un emploi ?</span>
                    <select value={questionnaire.conjoint.emploi} onChange={(e) => handleQuestionnaire("conjoint", "emploi", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.emploi === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Emploi occupé</span>
                    <input placeholder="" 
                    value={questionnaire.conjoint.emploi_occupe} onChange={(e) => handleQuestionnaire("conjoint", "emploi_occupe", e.target.value)} />
                  </label>

                  {/* Assurance Maladie Antérieure */ }
                  <label>
                    <span className="lbl">Avez-vous bénéficié d’une assurance maladie ?</span>
                    <select value={questionnaire.conjoint.benef_assur_mald_anterieur} onChange={(e) => 
                      handleQuestionnaire("conjoint", "benef_assur_mald_anterieur", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.benef_assur_mald_anterieur === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Quelle compagnie (si oui)</span>
                    <select value={questionnaire.conjoint.cie_assur_mald_anterieur} onChange={(e) => 
                      handleQuestionnaire("conjoint", "cie_assur_mald_anterieur", e.target.value)}>
                       <option value="">-- Compagnie --</option>
                        <option value="Sanlam Maroc">Sanlam Maroc</option>
                        <option value="AXA">AXA Assurance Maroc</option>
                        <option value="Wafa Assurance">Wafa Assurance</option>
                        <option value="RMA">RMA</option>
                        <option value="MCMA">MCMA</option>
                        <option value="La Marocaine Vie">La Marocaine Vie</option>
                        <option value="Allianz Maroc">Allianz Maroc</option>
                        <option value="AtlantaSanad">AtlantaSanad</option>
                    </select>
                  </label>

                  {/* Assurance Maladie Actuelle */ }
                  <label>
                    <span className="lbl">Bénéficiez-vous d’une assurance maladie ?</span>
                    <select value={questionnaire.conjoint.benef_assur_maladie} onChange={(e) => 
                      handleQuestionnaire("conjoint", "benef_assur_maladie", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.benef_assur_maladie === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Quelle compagnie (si oui)</span>
                    <select value={questionnaire.conjoint.cie_assur_maladie} onChange={(e) => 
                      handleQuestionnaire("conjoint", "cie_assur_maladie", e.target.value)}>
                       <option value="">-- Compagnie --</option>
                        <option value="Sanlam Maroc">Sanlam Maroc</option>
                        <option value="AXA">AXA Assurance Maroc</option>
                        <option value="Wafa Assurance">Wafa Assurance</option>
                        <option value="RMA">RMA</option>
                        <option value="MCMA">MCMA</option>
                        <option value="La Marocaine Vie">La Marocaine Vie</option>
                        <option value="Allianz Maroc">Allianz Maroc</option>
                        <option value="AtlantaSanad">AtlantaSanad</option>
                    </select>
                  </label>

                  {/* Consultation 5 ans */ }
                  <label>
                    <span className="lbl">Avez-vous consulté un médecin les 5 dernières années ? </span>
                    <select value={questionnaire.conjoint.consulte_medecin_5ans} onChange={(e) => 
                      handleQuestionnaire("conjoint", "consulte_medecin_5ans", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.consulte_medecin_5ans === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Motif (si oui)</span>
                    <input placeholder="Ex: suivi" value={questionnaire.conjoint.motif_consultation} onChange={(e) => 
                      handleQuestionnaire("conjoint", "motif_consultation", e.target.value)} />
                  </label>

                  {/* Traitement en cours */ }
                  <label>
                    <span className="lbl">Traitement en cours ?</span>
                    <select value={questionnaire.conjoint.traitement_en_cours} onChange={(e) => 
                      handleQuestionnaire("conjoint", "traitement_en_cours", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.traitement_en_cours === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails traitement</span>
                    <input value={questionnaire.conjoint.traitement_details} onChange={(e) => 
                      handleQuestionnaire("conjoint", "traitement_details", e.target.value)} />
                  </label>

                  {/* Maladies Graves */ }
                   <label>
                    <span className="lbl">Avez-vous atteint de maladies chroniques ou graves ?</span>
                    <select value={questionnaire.conjoint.maladies_graves} onChange={(e) => 
                      handleQuestionnaire("conjoint", "maladies_graves", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>                
                  </label>
                  <label className={questionnaire.conjoint.maladies_graves === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails maladies graves</span>
                    <input placeholder="Maladie / fréquence" value={questionnaire.conjoint.maladies_graves_details} onChange={(e) => 
                      handleQuestionnaire("conjoint", "maladies_graves_details", e.target.value)} />
                  </label>

                  {/* Chirurgies */ }
                  <label>
                    <span className="lbl">Avez-vous subi des opérations chirurgicales ?</span>
                    <select value={questionnaire.conjoint.operation_chirurgicale} onChange={(e) => 
                      handleQuestionnaire("conjoint", "operation_chirurgicale", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.operation_chirurgicale === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails des opérations chirurgicales</span>
                    <input value={questionnaire.conjoint.operation_details_details} onChange={(e) => 
                      handleQuestionnaire("conjoint", "operation_details", e.target.value)} />
                  </label>

                  {/* Infirmité */ }
                  <label>
                    <span className="lbl">Êtes-vous atteint d’une infirmité ou d’un handicap ?</span>
                    <select value={questionnaire.conjoint.infirmite} onChange={(e) => handleQuestionnaire("conjoint", "infirmite", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label>
                  <label className={questionnaire.conjoint.infirmite === "Oui" ? 
                    "show-field" : "hide-field"}>
                    <span className="lbl">Détails infirmité</span>
                    <input value={questionnaire.conjoint.infirmite_details} onChange={(e) => handleQuestionnaire("conjoint", "infirmite_details", e.target.value)} />
                  </label>                  

                  {/* Défaut de la vue */ }
                  <label>
                    <span className="lbl">Avez-vous un défaut de la vue ?</span>
                    <select value={questionnaire.conjoint.defaut_vue} onChange={(e) => handleQuestionnaire("conjoint", "defaut_vue", e.target.value)}>
                      <option value="">--</option>
                      <option>Oui</option>
                      <option>Non</option>
                    </select>
                  </label><br /><br />

                  {/* GROSSESSE – Affichée seulement si le conjoint est une femme */}
                    {conjoint[0]?.sexe_conj === "femme" && (
                      <>
                        <label>
                          <span className="lbl">Êtes-vous en état de grossesse ?</span>
                          <select
                            value={questionnaire.conjoint.grossesse}
                            onChange={(e) =>
                              handleQuestionnaire("conjoint", "grossesse", e.target.value)
                            }
                          >
                            <option value="">--</option>
                            <option value="Oui">Oui</option>
                            <option value="Non">Non</option>
                          </select>
                        </label>

                        {/* Âge de la grossesse affiché seulement si grossesse = Oui */}
                        <label
                          className={questionnaire.conjoint.grossesse === "Oui"
                              ? "show-field" : "hide-field" }>
                          <span className="lbl">Âge de la grossesse (mois)</span>
                          <input type="number"
                            min="1"
                            max="9"
                            value={questionnaire.conjoint.grossesse_mois}
                            onChange={(e) =>
                              handleQuestionnaire("conjoint", "grossesse_mois", e.target.value)
                            }
                            placeholder="Ex : 3"
                          />
                        </label>
                      </>
                    )}

                  {/* Taille */ }
                  <label>
                    <span className="lbl">Taille (cm)</span>
                    <input value={questionnaire.conjoint.taille} onChange={(e) => handleQuestionnaire("conjoint", "taille", e.target.value)} />
                  </label>

                  {/* Poids */ }
                  <label>
                    <span className="lbl">Poids (kg)</span>
                    <input value={questionnaire.conjoint.poids} onChange={(e) => handleQuestionnaire("conjoint", "poids", e.target.value)} />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>  

        {/* Notes / Observations */}   
        <section className={`card ${sections.notes ? "active-section" : ""}`}>
          <AccordionHeader
            title="Notes / Observations"
            onClick={() => toggle("notes")}
             rightElement={<small>6/6 Facultatif</small>}
          />
          {sections.notes && (
            <div className="card-body">
              <label>
                <span className="lbl">Notes / Observations</span>
                <textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)}
                  rows="4"
                  placeholder="Ajouter des notes ou des observations supplémentaires ici..."
                ></textarea>
              </label>    
            </div>
          )}
        </section>
     
        {/* ================= SIGNATURE ================= */}
        <section className="card signature-section">
          <h3>Signature électronique</h3>

          {/* Zone de signature */}
          {!signature ? (
            <SignaturePad onChange={(imgData) => setSignature(getSignatureObject(imgData))}/>
          ) : (
            <div className="signature-confirmed">
              <img
                src={signature}
                alt=""
                className="signature-preview"
              />
            </div>
          )}

          {/* Boutons de la section signature */}
          <div className="signature-actions">

            {!signature && (
              <p className="muted">
                Veuillez signer avant de soumettre.
              </p>
            )}

            {signature && (
              <>
                <button type="button" onClick={() => setSignature(null)}>
                  Refaire la signature
                </button>

                <button type="submit" className="btn-primary" >
                  Signer et soumettre
                </button>
              </>
            )}

          </div>
        </section>

      </form>
    </div>
    </div>  

    {/* 🔥 ICI — rendu caché pour impression / PDF */}
      <div style={{
        position: 'absolute',
        left: '-10000px',
        top: '-10000px',
        width: '160mm'
      }}>
        <BulletinAdhesionPreview
          ref={printRef}
          assure={assure}
          conjoint={conjoint}
          enfants={enfants}
          beneficiaires={beneficiairesPayload}
          questionnaire={questionnaire}
          clients={clients}
          villes={villes}
          pays={pays}
          typeBenef={typeBenef}
          signature={signature}
        />
      </div>




          {/* MODALE SÉLECTION ENFANT */}
          {modalEnfant.isOpen && (
            <div className="modal-overlay-enfant" onClick={() => setModalEnfant({ isOpen: false, benefIndex: null })}>
              <div className="modal-content-enfant" onClick={(e) => e.stopPropagation()}>
                <div className='modal-header-enfant'>
                <h3>Sélectionner un enfant</h3>
                </div>
                {enfants.length === 0 ? (
                  <p>Aucun enfant déclaré.</p>
                ) : (() => {
                  const dejaSelectionnes = getEnfantsDejaSelectionnes();
                  const enfantsDisponibles = enfants.filter((e, idx) => {
                    const key = `${e.nom}-${e.prenom}-${e.date_naissance}`;
                    return !dejaSelectionnes.includes(key);
                  });

                  if (enfantsDisponibles.length === 0) {
                    return <p>Tous les enfants ont déjà été désignés comme bénéficiaires.</p>;
                  }

                  return (
                    <div className="modal-list-enfant">
                      {enfants.map((e, idx) => {
                        const key = `${e.nom}-${e.prenom}-${e.date_naissance}`;
                        const estDisponible = !dejaSelectionnes.includes(key);
                        
                        return (
                          <div
                            key={idx}
                            className={`modal-list-item ${!estDisponible ? 'disabled' : ''}`}
                            onClick={() => {
                              if (!estDisponible) return;
                              const index = modalEnfant.benefIndex;
                              updateBenef(index, "nom", e.nom || "");
                              updateBenef(index, "prenom", e.prenom || "");
                              updateBenef(index, "date_naissance", e.date_naissance || "");
                              updateBenef(index, "lien", "enfant");
                              setModalEnfant({ isOpen: false, benefIndex: null });
                            }}
                          >
                            {e.prenom} {e.nom} — {formatDateFR(e.date_naissance)}
                            {!estDisponible && <span style={{ marginLeft: '8px', color: '#999' }}>(déjà sélectionné)</span>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              <div className="btn-group bottom"> 
                <button type="button" className="btn btn-close"
                  onClick={() => setModalEnfant({ isOpen: false, benefIndex: null })}>Fermer</button>
                  </div>
              </div>
            </div>
          )}
    </>
  );
};

export default FormulaireAdhesion;
