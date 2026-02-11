import React from 'react';
import ReadOnlyField from './ReadOnlyField';
import SignaturePad from './SignaturePad';

// Helper sécurisé pour accéder aux propriétés imbriquées
const safeGet = (obj, path, defaultValue = "") => {
  if (!obj || typeof obj !== 'object') return defaultValue;
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined) ? o[p] : defaultValue, obj);
};

const Icon = ({ name }) => {
  const icons = { person: "👤", heart: "🩺", child: "🧒", gift: "🎁" };
  return <span className="icon">{icons[name] || "•"}</span>;
};

const AccordionHeader = ({ title, open, onClick, rightElement }) => (
  <button type="button" className={`acc-header ${open ? "open" : ""}`} onClick={onClick}>
    <div className="acc-left">
      <span className="acc-chevron">{open ? "▴" : "▾"}</span>
      <span className="acc-title">{title}</span>
    </div>
    <div className="acc-right">{rightElement}</div>
  </button>
);

const AdhesionFormCore = ({
  readOnly = false,
  assure = {},
  conjoint = [],
  enfants = [],
  beneficiaires = [],
  typeBenef = "",
  questionnaire = { adherent: {}, conjoint: {} },
  notes = "",
  signature = null,
  clients = [],
  villes = [],
  pays = [],
  // Handlers
  onAssureChange,
  onConjointChange,
  onEnfantsChange,
  onBeneficiairesChange,
  onTypeBenefChange,
  onQuestionnaireChange,
  onNotesChange,
  onSignatureChange,
  onAddConjoint,
  onRemoveConjoint,
  onAddEnfant,
  onRemoveEnfant,
  onAddBenef,
  onRemoveBenef,
  isFieldEditable = () => true,
  sections,
  toggleSection
}) => {
  const formatDateFR = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleDateString('fr-FR');
  };

  // Helper pour afficher un champ
  const renderField = (label, value, onChange, type = "text", options = null) => {
    if (readOnly) {
      return <ReadOnlyField label={label} value={value} />;
    }
    if (type === "select") {
      return (
        <label>
          <span className="lbl">{label}</span>
          <select value={value || ""} onChange={onChange} disabled={!isFieldEditable()}>
            <option value="">-- sélectionner --</option>
            {options?.map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        </label>
      );
    }
    return (
      <label>
        <span className="lbl">{label}</span>
        <input
          type={type}
          value={value || ""}
          onChange={onChange}
          disabled={!isFieldEditable()}
        />
      </label>
    );
  };

  // Options statiques
  const compagnies = [
    "Sanlam Maroc", "AXA", "Wafa Assurance", "RMA", "MCMA", 
    "La Marocaine Vie", "Allianz Maroc", "AtlantaSanad"
  ];

  return (
    <>
      {/* ASSURÉ */}
      <section className={`card ${sections.assure ? "active-section" : ""}`}>
        <AccordionHeader
          title="Informations de l'assuré principal"
          open={sections.assure}
          onClick={() => toggleSection("assure")}
          rightElement={<small>1/6 Obligatoire</small>}
        />
        {sections.assure && (
          <div className="card-body">
            {/* Informations d’adhésion */}
            <div className="field-group">
              <h4 className="title-groupe-section">Informations d’adhésion</h4>
              <div className="grid-2">
                {renderField(
                  "Compagnie d'assurance",
                  safeGet(assure, 'compagnie'),
                  (e) => onAssureChange?.(e),
                  "select",
                  compagnies.map(c => ({ value: c, label: c }))
                )}
                {renderField(
                  "Souscripteur *",
                  clients.find(c => c.id_client == safeGet(assure, 'souscripteur'))?.raison_sociale || safeGet(assure, 'souscripteur'),
                  (e) => onAssureChange?.(e),
                  "select",
                  clients.map(c => ({ value: c.id_client, label: c.raison_sociale }))
                )}
                {renderField(
                  "Numéro de police",
                  safeGet(assure, 'num_police'),
                  (e) => onAssureChange?.(e)
                )}
                {renderField(
                  "Type d’adhésion",
                  safeGet(assure, 'type_adhesion'),
                  (e) => onAssureChange?.(e),
                  "select",
                  [{ value: "Nouvelle", label: "Nouvelle" }, { value: "Rectificatif", label: "Rectificatif" }]
                )}
                {renderField(
                  "Date d’adhésion",
                  safeGet(assure, 'date_adhesion'),
                  (e) => onAssureChange?.(e),
                  "date"
                )}
                {renderField(
                  "Numéro d’adhésion",
                  safeGet(assure, 'num_adhesion'),
                  (e) => onAssureChange?.(e),
                  "number"
                )}
              </div>
            </div>

            {/* Informations personnelles */}
            <div className="field-group">
              <h4 className="title-groupe-section">Informations personnelles</h4>
              <div className="grid-2">
                {renderField(
                  "Sexe",
                  safeGet(assure, 'sexe'),
                  (e) => onAssureChange?.(e),
                  "select",
                  [{ value: "Homme", label: "Homme" }, { value: "Femme", label: "Femme" }]
                )}
                {renderField("Nom *", safeGet(assure, 'nom'), (e) => onAssureChange?.(e))}
                {renderField("Prénom *", safeGet(assure, 'prenom'), (e) => onAssureChange?.(e))}
                {renderField("Date de naissance *", safeGet(assure, 'date_naissance'), (e) => onAssureChange?.(e), "date")}
                {renderField(
                  "Situation familiale",
                  safeGet(assure, 'situation_familiale'),
                  (e) => onAssureChange?.(e),
                  "select",
                  ["Célibataire", "Marié(e)", "Divorcé(e)", "Veuf(ve)"].map(s => ({ value: s, label: s }))
                )}
                {renderField(
                  "Type identité nationale",
                  safeGet(assure, 'type_identite_assure'),
                  (e) => onAssureChange?.(e),
                  "select",
                  ["CIN", "Passeport", "Permis", "Carte de séjour"].map(t => ({ value: t, label: t }))
                )}
                {renderField("N° d'identité nationale *", safeGet(assure, 'num_identite_assure'), (e) => onAssureChange?.(e))}
                {renderField("Matricule CNSS (12 chiffres)", safeGet(assure, 'num_cnss'), (e) => onAssureChange?.(e))}
                {renderField(
                  "Nationalité",
                  pays.find(p => p.id_pays == safeGet(assure, 'nationalite'))?.nationalite || safeGet(assure, 'nationalite'),
                  (e) => onAssureChange?.(e),
                  "select",
                  pays.map(p => ({ value: p.id_pays, label: p.nationalite }))
                )}
                {renderField("RIB (24 chiffres)", safeGet(assure, 'rib'), (e) => onAssureChange?.(e))}
              </div>
            </div>

            {/* Informations professionnelles */}
            <div className="field-group">
              <h4 className="title-groupe-section">Informations professionnelles</h4>
              <div className="grid-2">
                {renderField(
                  "Catégorie du personnel",
                  safeGet(assure, 'cat_perso'),
                  (e) => onAssureChange?.(e),
                  "select",
                  ["Cadre", "Non cadre", "Ouvrier(ère)", "Temporaire"].map(c => ({ value: c, label: c }))
                )}
                {renderField(
                  "Catégorie professionnelle",
                  safeGet(assure, 'cat_pro'),
                  (e) => onAssureChange?.(e),
                  "select",
                  ["Actif(ve)", "Retraité(e)"].map(c => ({ value: c, label: c }))
                )}
                {renderField("Profession", safeGet(assure, 'profession'), (e) => onAssureChange?.(e))}
                {renderField("Salaire annuel brut", safeGet(assure, 'salaire_annuel_brut'), (e) => onAssureChange?.(e), "number")}
                {renderField("Matricule société", safeGet(assure, 'matricule_ste'), (e) => onAssureChange?.(e), "number")}
                {renderField("Date d’embauche", safeGet(assure, 'date_embauche'), (e) => onAssureChange?.(e), "date")}
              </div>
            </div>

            {/* Coordonnées */}
            <div className="field-group">
              <h4 className="title-groupe-section">Coordonnées</h4>
              <div className="grid-2">
                {renderField("Téléphone", safeGet(assure, 'tel'), (e) => onAssureChange?.(e))}
                {renderField("Email", safeGet(assure, 'email'), (e) => onAssureChange?.(e), "email")}
                {renderField("Adresse", safeGet(assure, 'adresse'), (e) => onAssureChange?.(e))}
                {renderField(
                  "Ville",
                  villes.find(v => v.id_ville == safeGet(assure, 'ville'))?.nom_ville || safeGet(assure, 'ville'),
                  (e) => onAssureChange?.(e),
                  "select",
                  villes.map(v => ({ value: v.id_ville, label: v.nom_ville }))
                )}
                {renderField(
                  "Pays",
                  pays.find(p => p.id_pays == safeGet(assure, 'pays'))?.nom_pays || safeGet(assure, 'pays'),
                  (e) => onAssureChange?.(e),
                  "select",
                  pays.map(p => ({ value: p.id_pays, label: p.nom_pays }))
                )}
              </div>
            </div>

            {/* Informations assurance */}
            <div className="field-group">
              <h4 className="title-groupe-section">Informations assurance</h4>
              <div className="grid-2">
                {renderField("Régime assurance de base", safeGet(assure, 'regime_base'), (e) => onAssureChange?.(e))}
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
          onClick={() => toggleSection("conjoint")}
          rightElement={<small>2/6 Obligatoire pour les mariés</small>}
        />
        {sections.conjoint && (
          <div className="card-body">
            {readOnly ? (
              conjoint.length === 0 ? (
                <p className="muted">Aucun conjoint enregistré.</p>
              ) : (
                conjoint.map((c, i) => (
                  <div key={i} className="row-item">
                    <div className="mini-grid" style={{ height: '180px' }}>
                      <ReadOnlyField label="Nom" value={safeGet(c, 'nom')} />
                      <ReadOnlyField label="Prénom" value={safeGet(c, 'prenom')} />
                      <ReadOnlyField label="Sexe" value={safeGet(c, 'sexe_conj')} />
                      <ReadOnlyField label="Date de naissance" value={safeGet(c, 'date_naissance')} />
                      <ReadOnlyField label="Type identité" value={safeGet(c, 'type_identite_conj')} />
                      <ReadOnlyField label="N° identité" value={safeGet(c, 'num_identite_conj')} />
                      <ReadOnlyField label="Profession" value={safeGet(c, 'profession')} />
                      <ReadOnlyField label="Date d’adhésion" value={safeGet(c, 'date_adh_conj')} />
                    </div>
                  </div>
                ))
              )
            ) : (
              <>
                <button type="button" className="btn-sm" onClick={onAddConjoint}>+ Ajouter un conjoint</button><br /><br />
                {conjoint.length === 0 && <p className="muted">Aucun conjoint enregistré.</p>}
                {conjoint.map((c, i) => (
                  <div key={i} className="row-item">
                    <div className="mini-grid" style={{ height: '180px' }}>
                      <label>
                        <span className="lbl">Nom</span>
                        <input value={safeGet(c, 'nom')} onChange={(e) => onConjointChange?.(i, "nom", e.target.value.toUpperCase())} />
                      </label>
                      <label>
                        <span className="lbl">Prénom</span>
                        <input value={safeGet(c, 'prenom')} onChange={(e) => onConjointChange?.(i, "prenom", e.target.value.toUpperCase())} />
                      </label>
                      <label>
                        <span className="lbl">Sexe</span>
                        <select value={safeGet(c, 'sexe_conj')} onChange={(e) => onConjointChange?.(i, "sexe_conj", e.target.value)}>
                          <option value="">-- sélectionner --</option>
                          <option value="homme">Homme</option>
                          <option value="femme">Femme</option>
                        </select>
                      </label>
                      <label>
                        <span className="lbl">Date de naissance</span>
                        <input type="date" value={safeGet(c, 'date_naissance')} onChange={(e) => onConjointChange?.(i, "date_naissance", e.target.value)} />
                      </label>
                      <label>
                        <span className="lbl">Type identité</span>
                        <select value={safeGet(c, 'type_identite_conj')} onChange={(e) => onConjointChange?.(i, "type_identite_conj", e.target.value)}>
                          <option value="">-- sélectionner --</option>
                          <option value="CIN">CIN</option>
                          <option value="Passeport">Passeport</option>
                          <option value="Permis">Permis</option>
                          <option value="Carte de séjour">Carte de séjour</option>
                        </select>
                      </label>
                      <label>
                        <span className="lbl">N° identité</span>
                        <input value={safeGet(c, 'num_identite_conj')} onChange={(e) => onConjointChange?.(i, "num_identite_conj", e.target.value.toUpperCase())} />
                      </label>
                      <label>
                        <span className="lbl">Profession</span>
                        <input value={safeGet(c, 'profession')} onChange={(e) => onConjointChange?.(i, "profession", e.target.value)} />
                      </label>
                      <label>
                        <span className="lbl">Date d’adhésion</span>
                        <input type="date" value={safeGet(c, 'date_adh_conj')} onChange={(e) => onConjointChange?.(i, "date_adh_conj", e.target.value)} disabled={!isFieldEditable("souscripteur")} />
                      </label>
                    </div>
                    <button type="button" className="btn-del" onClick={() => onRemoveConjoint?.(i)}><span>&#x1F5D1;</span></button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* ENFANTS */}
      <section className={`card ${sections.enfants ? "active-section" : ""}`}>
        <AccordionHeader
          title="Enfants à charge"
          open={sections.enfants}
          onClick={() => toggleSection("enfants")}
          rightElement={<small>3/6 Obligatoire pour les enfants à charge</small>}
        />
        {sections.enfants && (
          <div className="card-body">
            {readOnly ? (
              enfants.length === 0 ? (
                <p className="muted">Aucun enfant enregistré.</p>
              ) : (
                enfants.map((e, i) => (
                  <div key={i} className="row-item">
                    <div className="mini-grid">
                      <ReadOnlyField label="Nom" value={safeGet(e, 'nom')} />
                      <ReadOnlyField label="Prénom" value={safeGet(e, 'prenom')} />
                      <ReadOnlyField label="Date de naissance" value={safeGet(e, 'date_naissance')} />
                      <ReadOnlyField label="Sexe" value={safeGet(e, 'sexe_enf')} />
                      <ReadOnlyField label="Scolarisé" value={safeGet(e, 'scolarise') === "oui" ? "Oui" : "Non"} />
                      <ReadOnlyField label="Handicap" value={safeGet(e, 'handicap') === "oui" ? "Oui" : "Non"} />
                      <ReadOnlyField label="Date d’adhésion" value={safeGet(e, 'date_adh_enf')} />
                    </div>
                  </div>
                ))
              )
            ) : (
              <>
                <button type="button" className="btn-sm" onClick={onAddEnfant}>+ Ajouter un enfant</button><br /><br />
                {enfants.length === 0 && <p className="muted">Aucun enfant enregistré.</p>}
                {enfants.map((e, i) => (
                  <div key={i} className="row-item">
                    <div className="mini-grid">
                      <label>
                        <span className="lbl">Nom</span>
                        <input placeholder="Nom" value={safeGet(e, 'nom')} onChange={(e) => onEnfantsChange?.(i, "nom", e.target.value.toUpperCase())} />
                      </label>
                      <label>
                        <span className="lbl">Prénom</span>
                        <input placeholder="Prénom" value={safeGet(e, 'prenom')} onChange={(e) => onEnfantsChange?.(i, "prenom", e.target.value.toUpperCase())} />
                      </label>
                      <label>
                        <span className="lbl">Date de naissance</span>
                        <input type="date" value={safeGet(e, 'date_naissance')} onChange={(e) => onEnfantsChange?.(i, "date_naissance", e.target.value)} />
                      </label>
                      <label>
                        <span className="lbl">Sexe</span>
                        <select value={safeGet(e, 'sexe_enf')} onChange={(e) => onEnfantsChange?.(i, "sexe_enf", e.target.value)}>
                          <option value="">-- sélectionner --</option>
                          <option value="masculin">Masculin</option>
                          <option value="féminin">Féminin</option>
                        </select>
                      </label>
                      <label>
                        <span className="lbl">Scolarisé</span>
                        <select value={safeGet(e, 'scolarise')} onChange={(e) => onEnfantsChange?.(i, "scolarise", e.target.value)}>
                          <option value="">-- sélectionner --</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </label>
                      <label>
                        <span className="lbl">Handicap</span>
                        <select value={safeGet(e, 'handicap')} onChange={(e) => onEnfantsChange?.(i, "handicap", e.target.value)}>
                          <option value="">-- sélectionner --</option>
                          <option value="oui">Oui</option>
                          <option value="non">Non</option>
                        </select>
                      </label>
                      <label>
                        <span className="lbl">Date d’adhésion</span>
                        <input type="date" value={safeGet(e, 'date_adh_enf')} onChange={(e) => onEnfantsChange?.(i, "date_adh_enf", e.target.value)} disabled={!isFieldEditable("souscripteur")} />
                      </label>
                    </div>
                    <button type="button" className="btn-del" onClick={() => onRemoveEnfant?.(i)}><span>&#x1F5D1;</span></button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </section>

      {/* BÉNÉFICIAIRES */}
      <section className={`card ${sections.beneficiaires ? "active-section" : ""}`}>
        <AccordionHeader
          title="Bénéficiaires en cas de décès"
          open={sections.beneficiaires}
          onClick={() => toggleSection("beneficiaires")}
          rightElement={<small>4/6 Obligatoire</small>}
        />
        {sections.beneficiaires && (
          <div className="card-body">
            {readOnly ? (
              <>
                <ReadOnlyField label="Type" value={
                  typeBenef === "ayants_droits" ? "Ayants droits" :
                  typeBenef === "heritiers_legaux" ? "Héritiers légaux" :
                  "Personne désignée"
                } />
                {typeBenef === "personne_designee" && beneficiaires.map((b, i) => (
                  <div key={i} className="row-item">
                    <div className="mini-grid" style={{ height: '170px' }}>
                      <ReadOnlyField label="Lien" value={safeGet(b, 'lien')} />
                      <ReadOnlyField label="Nom" value={safeGet(b, 'nom')} />
                      <ReadOnlyField label="Prénom" value={safeGet(b, 'prenom')} />
                      <ReadOnlyField label="Date de naissance" value={safeGet(b, 'date_naissance')} />
                      <ReadOnlyField label="Pourcentage" value={`${safeGet(b, 'pourcentage')}%`} />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="card">
                  <h4 className="title-groupe-section">Catégorie des bénéficiaires</h4>
                  <div className="radio-group">
                    <label className="radio-line">
                      <input
                        type="radio"
                        name="type_benef"
                        checked={typeBenef === "ayants_droits"}
                        onChange={() => onTypeBenefChange?.("ayants_droits")}
                      />
                      Ayants droits
                    </label>
                    <label className="radio-line">
                      <input
                        type="radio"
                        name="type_benef"
                        checked={typeBenef === "heritiers_legaux"}
                        onChange={() => onTypeBenefChange?.("heritiers_legaux")}
                      />
                      Héritiers légaux
                    </label>
                    <label className="radio-line">
                      <input
                        type="radio"
                        name="type_benef"
                        checked={typeBenef === "personne_designee"}
                        onChange={() => onTypeBenefChange?.("personne_designee")}
                      />
                      Personne désignée
                    </label>
                  </div>
                </div>
                {typeBenef === "personne_designee" && (
                  <>
                    <button type="button" className="btn-sm" onClick={onAddBenef}>+ Ajouter un bénéficiaire</button><br /><br />
                    {beneficiaires.length === 0 && <p className="muted">Aucune personne désignée.</p>}
                    {beneficiaires.map((b, i) => (
                      <div key={i} className="row-item">
                        <div className="mini-grid" style={{ height: '170px' }}>
                          <label>
                            <span className="lbl">Type de lien</span>
                            <select value={safeGet(b, 'lien')} onChange={(e) => onBeneficiairesChange?.(i, "lien", e.target.value)}>
                              <option value="">-- sélectionner --</option>
                              <option value="parent">Parent</option>
                              <option value="conjoint">Conjoint</option>
                              <option value="enfant">Enfant</option>
                              <option value="autre">Autre</option>
                            </select>
                          </label>
                          <label>
                            <span className="lbl">Nom</span>
                            <input value={safeGet(b, 'nom')} onChange={(e) => onBeneficiairesChange?.(i, "nom", e.target.value.toUpperCase())} />
                          </label>
                          <label>
                            <span className="lbl">Prénom</span>
                            <input value={safeGet(b, 'prenom')} onChange={(e) => onBeneficiairesChange?.(i, "prenom", e.target.value.toUpperCase())} />
                          </label>
                          <label>
                            <span className="lbl">Date de naissance</span>
                            <input type="date" value={safeGet(b, 'date_naissance')} onChange={(e) => onBeneficiairesChange?.(i, "date_naissance", e.target.value)} />
                          </label>
                          <label>
                            <span className="lbl">Pourcentage</span>
                            <input type="number" value={safeGet(b, 'pourcentage')} onChange={(e) => onBeneficiairesChange?.(i, "pourcentage", e.target.value)} disabled={!isFieldEditable("souscripteur")} />
                          </label>
                        </div>
                        <button type="button" className="btn-del" onClick={() => onRemoveBenef?.(i)}><span>&#x1F5D1;</span></button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </section>

      {/* QUESTIONNAIRE MÉDICAL */}
      <section className={`card ${sections.questionnaire ? "active-section" : ""}`}>
        <AccordionHeader
          title="Questionnaire médical"
          open={sections.questionnaire}
          onClick={() => toggleSection("questionnaire")}
          rightElement={<small>5/6 Obligatoire</small>}
        />
        {sections.questionnaire && (
          <div className="card-body">
            <div className="sub-card">
              <h4 className="title-groupe-section">Adhérent</h4>
              <div className="grid-2">
                {readOnly ? (
                  <>
                    <ReadOnlyField label="Assurance maladie antérieure" value={safeGet(questionnaire, 'adherent.benef_assur_mald_anterieur')} />
                    {safeGet(questionnaire, 'adherent.benef_assur_mald_anterieur') === "Oui" && (
                      <ReadOnlyField label="Compagnie" value={safeGet(questionnaire, 'adherent.cie_assur_mald_anterieur')} />
                    )}
                    <ReadOnlyField label="Consultation médecin 5 ans" value={safeGet(questionnaire, 'adherent.consulte_medecin_5ans')} />
                    {safeGet(questionnaire, 'adherent.consulte_medecin_5ans') === "Oui" && (
                      <ReadOnlyField label="Motif" value={safeGet(questionnaire, 'adherent.motif_consultation')} />
                    )}
                    {/* ... ajoutez tous les champs comme ci-dessus ... */}
                  </>
                ) : (
                  <>
                    <label>
                      <span className="lbl">Avez-vous bénéficié d’une assurance maladie ?</span>
                      <select value={safeGet(questionnaire, 'adherent.benef_assur_mald_anterieur')} onChange={(e) => onQuestionnaireChange?.("adherent", "benef_assur_mald_anterieur", e.target.value)}>
                        <option value="">--</option>
                        <option>Oui</option>
                        <option>Non</option>
                      </select>
                    </label>
                    {/* ... autres champs ... */}
                  </>
                )}
              </div>
            </div>
            {/* ... section conjoint ... */}
          </div>
        )}
      </section>

      {/* NOTES */}
      <section className={`card ${sections.notes ? "active-section" : ""}`}>
        <AccordionHeader
          title="Notes / Observations"
          onClick={() => toggleSection("notes")}
          rightElement={<small>6/6 Facultatif</small>}
        />
        {sections.notes && (
          <div className="card-body">
            <label>
              <span className="lbl">Notes / Observations</span>
              {readOnly ? (
                <ReadOnlyField value={notes} />
              ) : (
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange?.(e.target.value)}
                  rows="4"
                  placeholder="Ajouter des notes..."
                ></textarea>
              )}
            </label>
          </div>
        )}
      </section>

      {/* SIGNATURE */}
      <section className="card signature-section">
        <h3>Signature électronique</h3>
        {readOnly ? (
          signature ? (
            <div className="signature-confirmed">
              <img src={safeGet(signature, 'image')} alt="Signature" className="signature-preview" />
            </div>
          ) : (
            <p className="muted">Aucune signature enregistrée.</p>
          )
        ) : (
          <>
            {!signature ? (
              <SignaturePad onChange={onSignatureChange} />
            ) : (
              <div className="signature-confirmed">
                <img src={safeGet(signature, 'image')} alt="" className="signature-preview" />
              </div>
            )}
            {signature && (
              <button type="button" onClick={() => onSignatureChange?.(null)}>
                Refaire la signature
              </button>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default AdhesionFormCore;