// src/components/affiliation/BulletinAdhesionPreview.jsx
import React from "react";
import "./BulletinAdhesion.css";

const getClientName = (id, clients = []) => {
  if (!id || !Array.isArray(clients)) return "-";
  return (
    clients.find(c => Number(c.id_client) === Number(id))?.raison_sociale || "-"
  );
};

const getVilleName = (id, villes = []) => {
  if (!id || !Array.isArray(villes)) return "-";
  return (
    villes.find(v => Number(v.id_ville) === Number(id))?.nom_ville || "-"
  );
};

const getPaysName = (id, pays = []) => {
  if (!id || !Array.isArray(pays)) return "-";
  return (
    pays.find(p => Number(p.id_pays) === Number(id))?.nom_pays || "-"
  );
};


const yesNo = (v) =>
  v === "Oui" ? "Oui" :
  v === "Non" ? "Non" :
  "-";

  const formatDateFR = (date) => {
  if (!date) return "-";

  const d = new Date(date);
  if (isNaN(d)) return "-";

  const jour = String(d.getDate()).padStart(2, "0");
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const annee = d.getFullYear();

  return `${jour}/${mois}/${annee}`;
};

const BulletinAdhesionPreview = React.forwardRef(
({ assure, conjoint, enfants, beneficiaires, questionnaire, clients, villes, pays }, ref) => {
  return (
    <><div>
      <div ref={ref} className="bulletin-a4-print">

        {/* ===== EN-TÊTE ===== */}
        <header className="pdf-header">
          <table className="preview-table-header">
            <tbody>
              <tr>
                <td style={{ width: "25%" }}>
                  <img src="/Images/wafa-logo.png" alt="WAFA Assurance" height="40" />
                </td>
                <td style={{ textAlign: "center", fontWeight: "bold" }}>
                  BULLETIN D’ADHÉSION<br />
                  ASSURANCE MALADIE
                </td>
                <td style={{ width: "25%", textAlign: "right" }}>
                  Date : {new Date().toLocaleDateString()}
                </td>
              </tr>
            </tbody>
          </table>
        </header>


        {/* ===== INFORMATIONS GÉNÉRALES CONTRAT ===== */}
        <section className="preview-section">
          <h3>Informations du contrat</h3>

          <table className="preview-table">
            <tbody>
              <tr>
                <td className="td-titre">Compagnie</td>
                <td>{assure.compagnie}</td>
                <td className="td-titre">N° Police</td>
                <td>{assure.num_police}</td>
              </tr>
              <tr>
                <td className="td-titre">Souscripteur</td>
                <td colSpan="3">{getClientName(assure.souscripteur, clients)}</td>
              </tr>
              <tr>
                <td className="td-titre">Date d’adhésion</td>
                <td>{formatDateFR(assure.date_adhesion)}</td>
                <td className="td-titre">Type d’adhésion</td>
                <td>{assure.type_adhesion}</td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* ===== ASSURÉ ===== */}
        <section className="preview-section">
          <h3>Identification de l’adhérent</h3>

          <table className="preview-table">
            <tbody>
              <tr>
                <td className="td-titre">Nom</td>
                <td colSpan='2'>{assure.nom}</td>
                <td className="td-titre">Prénom</td>
                <td colSpan='4'>{assure.prenom}</td>
              </tr>
              <tr>
                <td className="td-titre">Sexe</td>
                <td colSpan='2'>{assure.sexe}</td>
                <td className="td-titre">Date de naissance</td>
                <td colSpan='4'>{formatDateFR(assure.date_naissance)}</td>
              </tr>
              <tr>
                <td className="td-titre">Type d’identité</td>
                <td colSpan='2'>{assure.type_identite_assure}</td>
                <td className="td-titre">N° Identité</td>
                <td>{assure.num_identite_assure}</td>
                <td className="td-titre">Nationalité</td>
                <td colSpan='4'>{assure.nationalite}</td>
              </tr>
              <tr>
                <td className="td-titre">CNSS</td>
                <td colSpan='2'>{assure.num_cnss || "-"}</td>
                <td className="td-titre">Situation familiale</td>
                <td colSpan='4'>{assure.situation_familiale}</td>
              </tr>
              <tr>
                <td className="td-titre">Numéro de compte bancaire(RIB)</td>
                <td colSpan="8">{assure.rib || "-"}</td>
              </tr>
              <tr>
                <td className="td-titre">Tél&eacute;phone</td>
                <td colSpan='2'>{assure.tel || "-"}</td>
                <td className="td-titre">Email</td>
                <td colSpan='4'>{assure.email || "-"}</td>
              </tr>
              <tr>
                <td className="td-titre">Adresse</td>
                <td colSpan="2">{assure.adresse || "-"}</td>
                <td className="td-titre">Ville</td>
                <td colSpan='2'>{getVilleName(assure.ville, villes) || "-"}</td>
                <td className="td-titre">Pays</td>
                <td colSpan='2'>{getPaysName(assure.pays, pays) || "-"}</td>
              </tr>
              <tr>
                <td className="td-titre">Catégorie personnelle</td>
                <td>{assure.cat_perso || "-"}</td>
                <td className="td-titre">Catégorie professionnelle</td>
                <td>{assure.cat_pro || "-"}</td>
                <td className="td-titre">Fonction</td>
                <td colSpan="3">{assure.profession || "-"}</td>
              </tr>
              <tr>
                <td className="td-titre">Matricule société</td>
                <td colSpan='2'>{assure.matricule_ste || "-"}</td>
                <td className="td-titre">Date d'embauche</td>
                <td colSpan='4'>{formatDateFR(assure.date_embauche || "-")}</td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* ===== CONJOINT ===== */}
        {conjoint.length > 0 && (
          <section className="preview-section">
            <h3>Conjoint(s)</h3>

            <table className="preview-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Sexe</th>
                  <th>Date naissance</th>
                </tr>
              </thead>
              <tbody>
                {conjoint.map((c, i) => (
                  <tr key={i}>
                    <td>{c.nom}</td>
                    <td>{c.prenom}</td>
                    <td>{c.sexe_conj}</td>
                    <td>{formatDateFR(c.date_naissance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}


        {/* ===== ENFANTS A CHRAGES ===== */}
        {enfants.length > 0 && (
          <section className="preview-section">
            <h3>Enfants à charge</h3>

            <table className="preview-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date naissance</th>
                  <th>Sexe</th>
                  <th>Scolarité</th>
                  <th>Handicapé</th>
                </tr>
              </thead>
              <tbody>
                {enfants.map((e, i) => (
                  <tr key={i}>
                    <td>{e.nom}</td>
                    <td>{e.prenom}</td>
                    <td>{formatDateFR(e.date_naissance)}</td>
                    <td>{e.sexe_enf}</td>
                    <td>{e.scolarise}</td>
                    <td>{e.handicap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}


        {/* ===== BENEFICIAIRES ===== */}
        {beneficiaires?.length > 0 && (
          <section className="preview-section">
            <h3>Bénéficiaires en cas décès</h3>
            <table className="preview-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prenom</th>
                  <th>Date naissance</th>
                  <th>Lien de parenté</th>
                </tr>
              </thead>
              <tbody>
                {beneficiaires.map((b, i) => (
                  <tr key={i}>
                    <td>{b.nom}</td>
                    <td>{b.prenom}</td>
                    <td>{formatDateFR(b.date_naissance)}</td>
                    <td>{b.lien}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}


        {/* ===== VISAS CLIENT ET SOUSCRIPTEUR ===== */}
        <section className="preview-section">
          <table className="preview-table">
            <tbody>
              <tr>
                <td className="td-visas">
                  Visa du souscripteur
                </td>
                <td className="td-visas">
                  Visa & Cachet de l'assureur
                </td>
                <td className="td-visas">
                  Signature de l'adhérent
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ===== QUESTIONNAIRE MÉDICAL ADHÉRENT ===== */}
        <div className="page-break"></div>
        <section className="preview-section">
          <h3>Questionnaire médical — Adhérent</h3>

          <table className="preview-table">
            <tbody>

              {/* Assurance Maladie */}
              <tr>
                <td>Avez-vous bénéficié d’une assurance maladie ?</td>
                <td>{yesNo(questionnaire.adherent.benef_assur_mald_anterieur)}</td>
                {questionnaire.adherent.benef_assur_mald_anterieur === "Oui" && (
                  <><td>Auprès de quelle Compagnie ?</td>
                    <td>{questionnaire.adherent.cie_assur_mald_anterieur || "-"}</td></>
                )}
              </tr>

              {/* Consultation 5 ans */}
              <tr>
                <td>Avez-vous consulté un médecin les 5 dernières années ?</td>
                <td>{yesNo(questionnaire.adherent.consulte_medecin_5ans)}</td>
                {questionnaire.adherent.consulte_medecin_5ans === "Oui" && (
                  <><td>Motif</td>
                  <td>{questionnaire.adherent.motif_consultation || "-"}</td></>
                )}
              </tr>

              {/* Traitement en cours */}
              <tr>
                <td>Traitement en cours ?</td>
                <td>{yesNo(questionnaire.adherent.traitement_en_cours)}</td>
                {questionnaire.adherent.traitement_en_cours === "Oui" && (
                  <><td>Détails traitement</td>
                  <td>{questionnaire.adherent.traitement_details || "-"}</td></>
                )}
              </tr>

              {/* Maladies graves / chroniques */}
              <tr>
                <td>Avez-vous atteint de maladies chroniques ou graves ?</td>
                <td>{yesNo(questionnaire.adherent.maladies_graves)}</td>
                {questionnaire.adherent.maladies_graves === "Oui" && (
                  <><td>Lequelles ?</td>
                    <td>{questionnaire.adherent.maladies_graves_details || "-"}</td></>
                )}
              </tr>

              {/* Interventions chirurgicales */}
              <tr>
                <td>Avez-vous subi des interventions chirurgicales ?</td>
                <td>{yesNo(questionnaire.adherent.operation_chirurgicale)}</td>
                {questionnaire.adherent.operation_chirurgicale === "Oui" && (
                  <><td>Détails des opérations chirurgicales</td>
                    <td>{questionnaire.adherent.operation_details || "-"}</td></>
                )}
              </tr>

              {/* Infirmité / handicap */}
              <tr>
                <td>Êtes-vous atteint d’une infirmité ou d’un handicap ?</td>
                <td>{yesNo(questionnaire.adherent.infirmite)}</td>
                {questionnaire.adherent.infirmite === "Oui" && (
                  <><td>Détails infirmité</td>
                    <td>{questionnaire.adherent.infirmite_details || "-"}</td></>
                )}
              </tr>

              {/* Défaut de la vue */}
              <tr>
                <td>Avez-vous un défaut de la vue ?</td>
                <td>{yesNo(questionnaire.adherent.defaut_vue)}</td>

                {questionnaire.adherent.defaut_vue === "Oui" && (
                  <><td>Détails du défaut de la vue</td>
                    <td>{"-"}</td></>
                )}
              </tr>

              {/* Grossesse en cours */}
              <tr>
                <td>Êtes-vous en état de grossesse ?</td>

                {/* Valeur grossesse */}
                <td>
                  {assure.sexe === "Homme"
                    ? "Non concerné"
                    : questionnaire.adherent.grossesse || "Non concerné"}
                </td>

                {/* Durée grossesse */}
                <td>Durée de la grossesse</td>
                <td> {assure.sexe === "Homme" ? "Non concerné"
                  : questionnaire.adherent.grossesse === "Oui"
                    ? `${questionnaire.adherent.grossesse_mois || "-"} mois`
                    : "Non concerné"}
                </td>
              </tr>


              {/* Taille / Poids */}
              <tr>
                <td>Taille</td>
                <td>{questionnaire.adherent.taille || "-"} cm</td>
                <td>Poids</td>
                <td>{questionnaire.adherent.poids || "-"} kg</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ===== QUESTIONNAIRE MÉDICAL CONJOINT ===== */}
        {conjoint?.length > 0 && (
          <section className="preview-section">
            <h3>Questionnaire médical — Conjoint</h3>

            <table className="preview-table">
              <tbody>

                {/* Emploi ou activités */}
                <tr>
                  <td>Emploi ou activités</td>
                  <td>{yesNo(questionnaire.conjoint.emploi || "-")}</td>
                  <td>{"-"}</td>
                </tr>

                {/* Assurance Maladie actuelle */}
                <tr>
                  <td>Bénéficiez-vous d’une assurance maladie ?</td>
                  <td>{yesNo(questionnaire.conjoint.benef_assur_maladie)}</td>
                  {questionnaire.conjoint.benef_assur_maladie === "Oui" && (
                    <><td>Auprès de quelle Compagnie ?</td>
                      <td>{questionnaire.conjoint.cie_assur_maladie || "-"}</td></>
                  )}
                </tr>

                {/* Assurance Maladie Antérieur */}
                <tr>
                  <td>Avez-vous bénéficié d’une assurance maladie ?</td>
                  <td>{yesNo(questionnaire.conjoint.benef_assur_mald_anterieur)}</td>
                  {questionnaire.conjoint.benef_assur_mald_anterieur === "Oui" && (
                    <><td>Auprès de quelle Compagnie ?</td>
                      <td>{questionnaire.conjoint.cie_assur_mald_anterieur || "-"}</td></>
                  )}
                </tr>

                {/* Consultation 5 ans */}
                <tr>
                  <td>Avez-vous consulté un médecin les 5 dernières années ?</td>
                  <td>{yesNo(questionnaire.conjoint.consulte_medecin_5ans)}</td>
                  {questionnaire.conjoint.consulte_medecin_5ans === "Oui" && (
                    <><td>Motif</td>
                      <td>{questionnaire.conjoint.motif_consultation || "-"}</td></>
                  )}
                </tr>

                {/* Traitement en cours */}
                <tr>
                  <td>Traitement en cours ?</td>
                  <td>{yesNo(questionnaire.conjoint.traitement_en_cours)}</td>
                  {questionnaire.conjoint.traitement_en_cours === "Oui" && (
                    <><td>Détails traitement</td>
                      <td>{questionnaire.conjoint.traitement_details || "-"}</td></>
                  )}
                </tr>

                {/* Maladies graves / chroniques */}
                <tr>
                  <td>Avez-vous atteint de maladies chroniques ou graves ?</td>
                  <td>{yesNo(questionnaire.conjoint.maladies_graves)}</td>
                  {questionnaire.conjoint.maladies_graves === "Oui" && (
                    <><td>Lequelles ?</td>
                      <td>{questionnaire.conjoint.maladies_graves_details || "-"}</td></>
                  )}
                </tr>

                {/* Interventions chirurgicales */}
                <tr>
                  <td>Avez-vous subi des interventions chirurgicales ?</td>
                  <td>{yesNo(questionnaire.conjoint.operation_chirurgicale)}</td>
                  {questionnaire.conjoint.operation_chirurgicale === "Oui" && (
                    <><td>Détails des opérations chirurgicales</td>
                      <td>{questionnaire.conjoint.operation_details || "-"}</td></>
                  )}
                </tr>

                {/* Détails infirmité */}
                <tr>
                  <td>Êtes-vous atteint d’une infirmité ou d’un handicap ?</td>
                  <td>{yesNo(questionnaire.conjoint.infirmite)}</td>
                  {questionnaire.conjoint.infirmite === "Oui" && (
                    <><td>Détails infirmité</td>
                      <td>{questionnaire.conjoint.infirmite_details || "-"}</td></>
                  )}
                </tr>

                {/* Défaut de la vue */}
                <tr>
                  <td>Avez-vous un défaut de la vue ?</td>
                  <td>{yesNo(questionnaire.conjoint.defaut_vue)}</td>
                  {questionnaire.conjoint.defaut_vue === "Oui" && (
                    <><td>Détails du défaut de la vue</td>
                      <td>{"-"}</td></>
                  )}
                </tr>

                {/* Grossesse en cours */}
                <tr>
                  <td>Êtes-vous en état de grossesse ?</td>

                  {/* Valeur grossesse */}
                  <td>
                    {conjoint?.[0]?.sexe_conj?.toLowerCase() === "homme"
                      ? "Non concerné"
                      : questionnaire.conjoint.grossesse || "Non concerné"}
                  </td>

                  {/* Durée grossesse */}
                  <td>Durée de la grossesse</td>
                  <td>
                    {conjoint?.[0]?.sexe_conj?.toLowerCase() === "homme"
                      ? "Non concerné"
                      : questionnaire.conjoint.grossesse === "Oui"
                        ? `${questionnaire.conjoint.grossesse_mois || "-"} mois`
                        : "Non concerné"}
                  </td>
                </tr>


                {/* Taille / Poids */}
                <tr>
                  <td>Taille</td>
                  <td>{questionnaire.conjoint.taille || "-"} cm</td>
                  <td>Poids</td>
                  <td>{questionnaire.conjoint.poids || "-"} kg</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}


        {/* ===== DECLARATION ET SIGNATURES ===== */}
        <section className="preview-section">
          <table className="preview-table">
            <tbody>
              <tr>
                <td className="td-visas">
                  Déclaration de l’adhérent<br /><br />
                  Signature :
                </td>
                <td className="td-visas">
                  Signature de l'adhérent
                </td>
              </tr>
            </tbody>
          </table>
        </section>

      
    
    <footer className="print-footer">
        <span className="footer-left">
          Bulletin d’adhésion — édité le {new Date().toLocaleDateString("fr-FR")}
        </span>

        <span className="footer-right">
          Page <span className="pageNumber"></span> 
        </span>
      </footer>
     
     
     
      </div>
   </div></>
  );
});
export default BulletinAdhesionPreview;
