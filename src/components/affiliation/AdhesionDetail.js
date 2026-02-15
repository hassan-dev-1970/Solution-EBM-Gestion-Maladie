import axios from "axios";
import html2pdf from "html2pdf.js";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BulletinAdhesionPreview from "../affiliation/BulletinAdhesionPreview";
import "./FormulaireAdhesion.css";


const ASSURE_ADHESION_LABELS = {
  compagnie: "Compagnie d’assurance",
  souscripteur: "Souscripteur",
  num_police: "Numéro de police",
  type_adhesion: "Type d’adhésion",
  date_adhesion: "Date d’adhésion",
  num_adhesion: "Numéro d’adhésion",
};

const ASSURE_PERSONNEL_LABELS = {
  sexe: "Sexe",
  nom: "Nom",
  prenom: "Prénom",
  date_naissance: "Date de naissance",
  situation_familiale: "Situation familiale",
  type_identite_assure: "Type d’identité",
  num_identite_assure: "N° d’identité nationale",
  num_cnss: "Matricule CNSS",
  nationalite: "Nationalité",
  rib: "RIB",
};

const ASSURE_PRO_LABELS = {
  cat_perso: "Catégorie du personnel",
  cat_pro: "Catégorie professionnelle",
  profession: "Profession",
  salaire_annuel_brut: "Salaire annuel brut",
  matricule_ste: "Matricule société",
  date_embauche: "Date d’embauche",
};

const ASSURE_CONTACT_LABELS = {
  tel: "Téléphone",
  email: "Email",
  adresse: "Adresse",
  ville: "Ville",
  pays: "Pays",
};

const ASSURE_ASSURANCE_LABELS = {
  regime_base: "Régime assurance de base",
};

// ---------------- RENOMMAGE LABELS CONJOINTS----------------
const CONJOINT_LABELS = {
  nom: "Nom",
  prenom: "Prénom",
  sexe_conj: "Sexe",
  date_naissance: "Date de naissance",
  type_identite_conj: "Type d’identité",
  num_identite_conj: "N° d’identité",
  profession: "Profession",
  date_adh_conj: "Date d’adhésion",
};

// ---------------- RENOMMAGE LABELS ENFANTS----------------
const ENFANT_LABELS = {
  nom: "Nom",
  prenom: "Prénom",
  date_naissance: "Date de naissance",
  sexe_enf: "Sexe",
  scolarise: "Scolarisé",
  handicap: "Handicap",
  date_adh_enf: "Date d’adhésion",
};

// ---------------- RENOMMAGE LABELS BENEFICIAIRES----------------
const BENEF_LABELS = {
  lien: "Lien",
  nom: "Nom",
  prenom: "Prénom",
  date_naissance: "Date de naissance",
  pourcentage: "Pourcentage (%)",
};

// ---------------- RENOMMAGE LABELS QUESTIONNAIRE ADHERENT----------------
const QUESTIONNAIRE_ADHERENT_LABELS = {
  benef_assur_mald_anterieur: "Assurance maladie antérieure",
  cie_assur_mald_anterieur: "Compagnie",
  consulte_medecin_5ans: "Consultation médecin (5 ans)",
  motif_consultation: "Motif",
  traitement_en_cours: "Traitement en cours",
  traitement_details: "Détails traitement",
  maladies_graves: "Maladies graves",
  maladies_graves_details: "Détails maladies",
  operation_chirurgicale: "Opération chirurgicale",
  operation_details: "Détails opérations",
  infirmite: "Infirmité / handicap",
  infirmite_details: "Détails infirmité",
  defaut_vue: "Défaut de la vue",
  grossesse: "Grossesse",
  grossesse_mois: "Âge grossesse (mois)",
  taille: "Taille (cm)",
  poids: "Poids (kg)",
};

// ---------------- RENOMMAGE LABELS QUESTIONNAIRE CONJOINT----------------
const QUESTIONNAIRE_CONJOINT_LABELS = {
  emploi: "Emploi",
  emploi_occupe: "Emploi occupé",
  benef_assur_mald_anterieur: "Assurance maladie antérieure",
  cie_assur_mald_anterieur: "Compagnie",
  benef_assur_maladie: "Assurance maladie actuelle",
  cie_assur_maladie: "Compagnie actuelle",
  consulte_medecin_5ans: "Consultation médecin (5 ans)",
  motif_consultation: "Motif",
  traitement_en_cours: "Traitement en cours",
  traitement_details: "Détails traitement",
  maladies_graves: "Maladies graves",
  maladies_graves_details: "Détails maladies",
  operation_chirurgicale: "Opération chirurgicale",
  operation_details: "Détails opérations",
  infirmite: "Infirmité / handicap",
  infirmite_details: "Détails infirmité",
  defaut_vue: "Défaut de la vue",
  grossesse: "Grossesse",
  grossesse_mois: "Âge grossesse (mois)",
  taille: "Taille (cm)",
  poids: "Poids (kg)",
};


// ---------------- ICON ----------------
const Icon = ({ name }) => {
  const icons = {
    person: "👤",
    heart: "🩺",
    child: "🧒",
    gift: "🎁",
  };
  return <span className="icon">{icons[name] || "•"}</span>;
};

// ---------------- ACCORDION ----------------
const AccordionHeader = ({ title, open, onClick, rightElement }) => (
  <button
    type="button"
    className={`acc-header ${open ? "open" : ""}`}
    onClick={onClick}
  >
    <div className="acc-left">
      <span className="acc-chevron">{open ? "▴" : "▾"}</span>
      <span className="acc-title">{title}</span>
    </div>
    <div className="acc-right">{rightElement}</div>
  </button>
);


const DetailAdhesion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const printRef = useRef(null);
  const [clients, setClients] = useState([]);
  const [pays, setPays] = useState([]);
  const [villes, setVilles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [assure, setAssure] = useState({});
  const [conjoint, setConjoint] = useState([]);
  const [enfants, setEnfants] = useState([]);
  const [beneficiaires, setBeneficiaires] = useState(null);
  const [questionnaire, setQuestionnaire] = useState({});
  const [notes, setNotes] = useState("");
  const [signature, setSignature] = useState(null);

  const [sections, setSections] = useState({
    assure: true,
    conjoint: false,
    enfants: false,
    beneficiaires: false,
    questionnaire: false,
    notes: false,
    signature: false,
  });

  const toggle = (key) =>
    setSections((s) => ({ ...s, [key]: !s[key] }));

  // ---------------- FETCH ----------------
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
    const fetchPays = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setError("Token non rencontré. Veuillez vous reconnecter.");
        const res = await axios.get('/api/pays', { headers: { Authorization: `Bearer ${token}` } });
        setPays(res.data);
      } catch (err) {
        console.error('Erreur chargement pays', err);
      }
    };
    fetchPays();
  }, []);

  useEffect(() => {
    const fetchVille = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return setError("Token non rencontré. Veuillez vous reconnecter.");
        const res = await axios.get('/api/villes', { headers: { Authorization: `Bearer ${token}` } });
        setVilles(res.data);
      } catch (err) {
        console.error('Erreur chargement villes', err);
      }
    };
    fetchVille();
  }, []);

  useEffect(() => {
    const fetchAdhesion = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/adhesions/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAssure(res.data.assure || {});
        setConjoint(res.data.conjoint || []);
        setEnfants(res.data.enfants || []);
        setBeneficiaires(res.data.beneficiaires || null);
        setQuestionnaire(res.data.questionnaire || {});
        setNotes(res.data.notes || "");
        setSignature(res.data.signature || null);
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement de l’adhésion");
      } finally {
        setLoading(false);
      }
    };

    fetchAdhesion();
  }, [id]);

  if (loading) return <p className="muted">Chargement…</p>;
  if (error) return <p className="form-error">{error}</p>;
  

const formatDateFR = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d)) return date;
  return d.toLocaleDateString("fr-FR");
};

const formatMoney = (value) => {
  if (!value) return "—";
  return new Intl.NumberFormat("fr-FR").format(value) + " DH";
};

const formatYesNo = (value) => {
  if (value === "oui" || value === "Oui" || value === 1) return "Oui";
  if (value === "non" || value === "Non" || value === 0) return "Non";
  return value;
};



const createFieldFormatters = (clients, villes, pays) => ({  
  souscripteur: (val) =>
    clients?.find(c => Number(c.id_client) === Number(val))
      ?.raison_sociale,

  ville: (val) =>
    villes?.find(v => Number(v.id_ville) === Number(val))
      ?.nom_ville,

  pays: (val) =>
    pays?.find(p => Number(p.id_pays) === Number(val))
      ?.nom_pays,

  nationalite: (val) =>
    pays?.find(p => Number(p.id_pays) === Number(val))
      ?.nom_pays,

  salaire_annuel_brut: (val) => formatMoney(val),

  type_beneficiaire: (val) => {
  const map = {
    personne_designee: "Personne(s) désignée(s)",
    heritiers_legaux: "Héritiers légaux",
    ayants_droits: "Ayants droit légaux"
  };

  return map[val] || val;
},

});
const FIELD_FORMATTERS = createFieldFormatters(clients, villes, pays);

  const formatValue = (key, value) => {
    if (value === null || value === undefined || value === "")
      return "—";

  // 🔹 Beneficiaires automatique
  const BENEF_MAP = {
    personne_designee: "Personne(s) désignée(s)",
    heritiers_legaux: "Héritiers légaux",
    ayants_droits: "Ayants droit légaux"
  };

  if (BENEF_MAP[value]) {
    return BENEF_MAP[value];
  }
    // 🔹 Formatter spécifique
    if (FIELD_FORMATTERS[key]) {
      return FIELD_FORMATTERS[key](value) || value;
    }

    // 🔹 Date automatique
    if (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return formatDateFR(value);
    }

    // 🔹 Oui / Non automatique
    if (
      ["oui", "non", "Oui", "Non", 0, 1].includes(value)
    ) {
      return formatYesNo(value);
    }
    return value;
  };



// ---------------- CHAMPS DE RENDU ASSURE----------------
const RenderFields = ({
  data = {},
  labels = {},
  title,
  grid = "grid-2",
  mini_grid = "mini-grid"
}) => { 

  return (
    <div className="card-body">
      <div className="field-group">
        {title && <h4 className="title-groupe-section">{title}</h4>}

        <div className={`${grid} ${mini_grid}`}>
          {Object.entries(labels).map(([key, label]) => (
            <label key={key}>
              <span className="lbl">{label}</span>
              <input
                value={formatValue(key, data[key])}
                readOnly
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};


// ==============================================================================

// ---------------- CHAMPS DE RENDU ENFANTS + CONJOINTS ----------------
          const RenderMiniFields = ({ data = {}, labels = {} }) => {
            return (
              <>
                {Object.entries(labels).map(([key, label]) => (
                  <label key={key}>
                    <span className="lbl">{label}</span>
                    <input
                      value={formatValue(key, data[key])}
                      readOnly
                    />
                  </label>
                ))}
              </>
            );
          };

// ==============================================================================
const handleDownloadPDF = () => {
  const element = printRef.current;
  if (!element) {
    console.warn("PDF ref introuvable");
    return;
  }

  const opt = {
    margin: 8,
    filename: `Bulletin_Adhesion_${assure.nom}_${assure.prenom}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true
    },
    jsPDF: {
      unit: "mm",
      format: "a4",
      orientation: "portrait"
    },
    pagebreak: {
      mode: ["avoid-all", "css", "legacy"]
    }
  };

  html2pdf().set(opt).from(element).save();
};


// 🔐 Normalisation de la signature (anciens + nouveaux enregistrements)
let signatureImage = null;

if (signature?.image) {
  // Cas normal : data:image/...
  if (
    typeof signature.image === "string" &&
    signature.image.startsWith("data:image")
  ) {
    signatureImage = signature.image;
  }

  // Cas bug : image stockée en JSON stringifié
  else if (
    typeof signature.image === "string" &&
    signature.image.trim().startsWith("{")
  ) {
    try {
      const parsed = JSON.parse(signature.image);
      signatureImage = parsed?.image || null;
    } catch (e) {
      signatureImage = null;
    }
  }
}




  // ================== RENDU ==================
  return (
    <>
      {/* ================= HEADER ================= */}
      <div className="fa-header-wrapper">
        <header className="fa-header" style={{height: '100px'}}>
          <div className="fa-title">
            <Icon name="person" />
            <div>
              <h1>Détail — Adhésion</h1>
              <p className="sub">
                N° d'adhésion : {assure?.num_adhesion || "—"}
              </p>
              <p className="sub">
                Assuré : {assure?.nom && assure?.prenom
                  ? `${assure?.nom} ${assure?.prenom}`
                  : "—"}
              </p>
            </div>
          </div>

          <div className="btn-group right">
            <button className="btn btn-success">
              Imprimer
            </button>

            <button disabled={!assure?.nom}
            type="button" className="btn btn-telecharger" onClick={handleDownloadPDF}> 
              Télécharger le PDF</button>

            <button className="btn btn-retour" onClick={() => navigate(-1)}>
              Retour
            </button>
          </div>
        </header>
      </div>

      <div className="fa-wrapper">
        <div className="fa-scroll-container">
          <div className="fa-form">

            {/* ================= ASSURÉ ================= */}
            <section className={`card ${sections.assure ? "active-section" : ""}`}>
              <AccordionHeader
                title="Informations de l'assuré principal"
                open={sections.assure}
                onClick={() => toggle("assure")}
              />

              {sections.assure && (
                <div className="card-body">

                  <RenderFields
                    data={assure}
                    labels={ASSURE_ADHESION_LABELS}
                    title="Informations d’adhésion"
                  />

                  <RenderFields
                    data={assure}
                    labels={ASSURE_PERSONNEL_LABELS}
                    title="Informations personnelles"
                  />

                  <RenderFields
                    data={assure}
                    labels={ASSURE_PRO_LABELS}
                    title="Informations professionnelles"
                  />

                  <RenderFields
                    data={assure}
                    labels={ASSURE_CONTACT_LABELS}
                    title="Coordonnées"
                  />

                  <RenderFields
                    data={assure}
                    labels={ASSURE_ASSURANCE_LABELS}
                    title="Informations assurance"
                  />

                </div>
              )}
            </section>

            {/* ================= CONJOINT ================= */}
            <section className={`card ${sections.conjoint ? "active-section" : ""}`}>
              <AccordionHeader
                title="Conjoint(e)"
                open={sections.conjoint}
                onClick={() => toggle("conjoint")}
              />
              {sections.conjoint && (
                <div className="card-body">
                  {conjoint.length === 0 && (
                    <p className="muted">Aucun conjoint</p>
                  )}
                  {conjoint.map((c, i) => (
                    <div className="row-item" key={i}>
                      <div className="mini-grid">
                        <RenderMiniFields data={c} labels={CONJOINT_LABELS} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ================= ENFANTS ================= */}
            <section className={`card ${sections.enfants ? "active-section" : ""}`}>
              <AccordionHeader
                title="Enfants à charge"
                open={sections.enfants}
                onClick={() => toggle("enfants")}
              />
              {sections.enfants && (
                <div className="card-body">
                  {enfants.length === 0 && (
                    <p className="muted">Aucun enfant</p>
                  )}
                  {enfants.map((e, i) => (
                    <div className="row-item" key={i}>
                      <div className="row-header">
                    <span className="row-badge">Enfant : {i + 1}</span>
                   </div>
                      <div className="mini-grid">
                        <RenderMiniFields data={e} labels={ENFANT_LABELS} />
                      </div>
                    </div>
                  ))}

                </div>
              )}
            </section>

            {/* ================= BÉNÉFICIAIRES ================= */}
            <section className={`card ${sections.beneficiaires ? "active-section" : ""}`}>
                    <AccordionHeader
                      title="Bénéficiaires en cas de décès"
                      open={sections.beneficiaires}
                      onClick={() => toggle("beneficiaires")} />

                    {sections.beneficiaires && (
                      <div className="card-body">
                        <p className="muted" style={{fontSize: '14px', fontWeight: 'bold', color: 'darkblue', marginBottom: '10px'}}>
                          Type de bénéficiaire : {formatValue("type_beneficiaire", beneficiaires?.type_beneficiaire)}
                        </p>

                        {beneficiaires?.liste?.length === 0 && (
                          <p className="muted">Aucun bénéficiaire désigné</p>
                        )}

                        {beneficiaires?.liste?.map((b, i) => (
                          <div className="row-item" key={i}>
                            <div className="row-header">
                            <span className="row-badge">Beneficiaire : {i + 1}</span>
                          </div>
                            <div className="mini-grid">
                              <RenderMiniFields data={b} labels={BENEF_LABELS} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </section>


            {/* ================= QUESTIONNAIRE ================= */}
            <section className={`card ${sections.questionnaire ? "active-section" : ""}`}>
                <AccordionHeader
                  title="Questionnaire médical"
                  open={sections.questionnaire}
                  onClick={() => toggle("questionnaire")}
                />

                {sections.questionnaire && (
                  <div className="card-body">

                    <div className="sub-card">
                      <h4 className="title-groupe-section">Adhérent</h4>
                      <div className="grid-2">
                        <RenderMiniFields
                          data={questionnaire.adherent}
                          labels={QUESTIONNAIRE_ADHERENT_LABELS}
                        />
                      </div>
                    </div>

                    <div className="sub-card">
                      <h4 className="title-groupe-section">Conjoint</h4>
                      <div className="grid-2">
                        <RenderMiniFields
                          data={questionnaire.conjoint}
                          labels={QUESTIONNAIRE_CONJOINT_LABELS}
                        />
                      </div>
                    </div>

                  </div>
                )}
              </section>


            {/* ================= NOTES ================= */}
            <section className={`card ${sections.notes ? "active-section" : ""}`}>
              <AccordionHeader
                title="Notes / Observations"
                open={sections.notes}
                onClick={() => toggle("notes")}
              />
              {sections.notes && (
                <div className="card-body">
                  <textarea
                    value={notes}
                    rows={4}
                    readOnly
                  />
                </div>
              )}
            </section>

            {/* ================= SIGNATURE ================= */}
                      <section className="card">
                        <AccordionHeader
                          title="Signature"
                          open={sections.signature}
                          onClick={() => toggle("signature")}
                        />

                        {sections.signature && (
                          <div className="card-body">

                           {signatureImage ? (
                              <>
                                <img
                                  src={signatureImage}
                                  alt="Signature"
                                  className="signature-preview"
                                />

                                <p className="muted">
                                  Signé par <strong>{signature.signataire}</strong><br />
                                  Le{" "}
                                  {signature.date
                                    ? new Date(signature.date).toLocaleDateString("fr-FR")
                                    : "-"}
                                </p>
                              </>
                            ) : (
                              <p className="muted">Aucune signature enregistrée</p>
                            )}

                          </div>
                        )}
                      </section>


          </div>
        </div>
      </div>

          {/* 🔥 ICI — rendu caché pour impression / PDF */}
                  <div
              style={{
                position: "absolute",
                left: "-10000px",
                top: "-10000px",
                width: "210mm"
              }}
            >
              <BulletinAdhesionPreview
                ref={printRef}
                assure={assure}
                conjoint={conjoint}
                enfants={enfants}
                beneficiaires={beneficiaires}
                questionnaire={questionnaire}
                clients={clients}
                villes={villes}
                pays={pays}
                signature={signature}
              />
            </div>


    </>
  );
  };


export default DetailAdhesion;
