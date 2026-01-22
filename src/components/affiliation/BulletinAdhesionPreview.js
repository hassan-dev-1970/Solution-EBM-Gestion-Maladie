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

// ===== NORMALISATION BENEFICIAIRES =====
let typeBenef = null;
let listeBenef = [];

// Nouveau format (objet)
if (beneficiaires && typeof beneficiaires === "object" && !Array.isArray(beneficiaires)) {
  typeBenef = beneficiaires.type_beneficiaire || null;
  listeBenef = Array.isArray(beneficiaires.liste) ? beneficiaires.liste : [];
}

// Ancien format (tableau direct = personnes désignées)
if (Array.isArray(beneficiaires)) {
  typeBenef = "personne_designee";
  listeBenef = beneficiaires;
}

// Normalisation du type
const normalizedType = typeBenef
  ? typeBenef
      .toLowerCase()
      .replace(/[_\s]/g, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
  : null;




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

          <table className="preview-table">
            <tbody>
              <tr>
                <td className="titre-questionnaire" colSpan="4">Informations du contrat</td>
              </tr>

              <tr>
                <td className="td-titre">Compagnie</td>
                <td className="no-border-right">{assure.compagnie}</td>
                <td className="td-titre">N° Police</td>
                <td>{assure.num_police}</td>
              </tr>
              <tr className="no-border">
                <td className="td-titre">Souscripteur</td>
                <td colSpan="3">{getClientName(assure.souscripteur, clients)}</td>
              </tr>
              <tr>
                <td className="td-titre">Date d’adhésion</td>
                <td className="no-border-right">{formatDateFR(assure.date_adhesion)}</td>
                <td className="td-titre">Type d’adhésion</td>
                <td>{assure.type_adhesion}</td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* ===== ASSURÉ ===== */}
        <section className="preview-section">

          <table className="preview-table">
            <tbody>
              <tr>
                <td className="titre-questionnaire" colSpan="8">Identification de l'adhérent</td>
              </tr>

              <tr>
                <td className="td-titre">Nom</td>
                <td colSpan='2' className="no-border-right">{assure.nom}</td>
                <td className="td-titre">Prénom</td>
                <td colSpan='4'>{assure.prenom}</td>
              </tr>
              <tr className="no-border">
                <td className="td-titre">Sexe</td>
                <td colSpan='2' className="no-border-right">{assure.sexe}</td>
                <td className="td-titre">Date de naissance</td>
                <td colSpan='4'>{formatDateFR(assure.date_naissance)}</td>
              </tr>
              <tr>
                <td className="td-titre">Type d’identité</td>
                <td colSpan='2' className="no-border-right">{assure.type_identite_assure}</td>
                <td className="td-titre">N° Identité</td>
                <td className="no-border-right">{assure.num_identite_assure}</td>
                <td className="td-titre">Nationalité</td>
                <td colSpan='4'>{assure.nationalite}</td>
              </tr>
              <tr className="no-border">
                <td className="td-titre">CNSS</td>
                <td colSpan='2' className="no-border-right">{assure.num_cnss || "-"}</td>
                <td className="td-titre">Situation familiale</td>
                <td colSpan='4'>{assure.situation_familiale}</td>
              </tr>
              <tr>
                <td className="td-titre">Numéro de compte bancaire(RIB)</td>
                <td colSpan="8">{assure.rib || "-"}</td>
              </tr>
              <tr className="no-border">
                <td className="td-titre">Tél&eacute;phone</td>
                <td colSpan='2' className="no-border-right">{assure.tel || "-"}</td>
                <td className="td-titre">Email</td>
                <td colSpan='4'>{assure.email || "-"}</td>
              </tr>
              <tr>
                <td className="td-titre">Adresse</td>
                <td colSpan="2" className="no-border-right">{assure.adresse || "-"}</td>
                <td className="td-titre">Ville</td>
                <td colSpan='2' className="no-border-right">{getVilleName(assure.ville, villes) || "-"}</td>
                <td className="td-titre">Pays</td>
                <td colSpan='2'>{getPaysName(assure.pays, pays) || "-"}</td>
              </tr>
              <tr className="no-border">
                <td className="td-titre">Catégorie personnelle</td>
                <td className="no-border-right">{assure.cat_perso || "-"}</td>
                <td className="td-titre">Catégorie professionnelle</td>
                <td className="no-border-right">{assure.cat_pro || "-"}</td>
                <td className="td-titre">Fonction</td>
                <td colSpan="3">{assure.profession || "-"}</td>
              </tr>
              <tr>
                <td className="td-titre">Matricule société</td>
                <td colSpan='2' className="no-border-right">{assure.matricule_ste || "-"}</td>
                <td className="td-titre">Date d'embauche</td>
                <td colSpan='4'>{formatDateFR(assure.date_embauche || "-")}</td>
              </tr>
            </tbody>
          </table>
        </section>


        {/* ===== CONJOINT ===== */}
        {conjoint.length > 0 && (
          <section className="preview-section">

            <table className="preview-table">
              <thead>
                 <tr>
                <td className="titre-questionnaire" colSpan="4">Conjoint(s)</td>
              </tr>
                <tr>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Nom</th>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Prénom</th>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Sexe</th>
                  <th style={{borderBottom: "0"}}>Date naissance</th>
                </tr>
              </thead>
              <tbody>
                {conjoint.map((c, i) => (
                  <tr key={i}>
                    <td style={{borderRight: "0"}}>{c.nom}</td>
                    <td style={{borderRight: "0"}}>{c.prenom}</td>
                    <td style={{borderRight: "0"}}>{c.sexe_conj}</td>
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

            <table className="preview-table">              
              <thead>
                <tr>
                <td className="titre-questionnaire" colSpan="6">Enfants à charge</td>
              </tr>
                <tr>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Nom</th>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Prénom</th>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Date naissance</th>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Sexe</th>
                  <th style={{borderBottom: "0", borderRight: "0"}}>Scolarité</th>
                  <th style={{borderBottom: "0"}}>Handicapé</th>
                </tr>
              </thead>
              <tbody>
                {enfants.map((e, i) => (
                  <tr key={i}>
                    <td style={{borderRight: "0"}}>{e.nom}</td>
                    <td style={{borderRight: "0"}}>{e.prenom}</td>
                    <td style={{borderRight: "0"}}>{formatDateFR(e.date_naissance)}</td>
                    <td style={{borderRight: "0"}}>{e.sexe_enf}</td>
                    <td style={{borderRight: "0"}}>{e.scolarise}</td>
                    <td>{e.handicap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}


          {/* ===== BENEFICIAIRES ===== */}
          <section className="preview-section">
  <table className="preview-table">
    <tbody>

      {/* ===== AYANTS DROITS ===== */}
      {normalizedType === "ayantsdroits" && (
        <tr>
          <td colSpan="4">
            Les bénéficiaires sont les <strong>ayants droits légaux</strong>.
          </td>
        </tr>
      )}

      {/* ===== HÉRITIERS LÉGAUX ===== */}
      {normalizedType === "heritierslegaux" && (
        <tr>
          <td colSpan="4">
            Les bénéficiaires sont les <strong>héritiers légaux</strong>.
          </td>
        </tr>
      )}

      {/* ===== PERSONNES DÉSIGNÉES ===== */}
      {normalizedType === "personnedesignee" && (
        <>
          <tr>
            <td className="titre-questionnaire" colSpan="4">
              Bénéficiaires en cas de décès
            </td>
          </tr>

          {listeBenef.length > 0 ? (
            <>
              <tr>
                <th>Nom</th>
                <th>Prénom</th>
                <th>Date de naissance</th>
                <th>Lien</th>
              </tr>

              {listeBenef.map((b, i) => (
                <tr key={i}>
                  <td>{b.nom || "-"}</td>
                  <td>{b.prenom || "-"}</td>
                  <td>{formatDateFR(b.date_naissance)}</td>
                  <td>{b.lien || "-"}</td>
                </tr>
              ))}
            </>
          ) : (
            <tr>
              <td colSpan="4">Aucune personne désignée renseignée.</td>
            </tr>
          )}
        </>
      )}

      {/* ===== AUCUN CHOIX ===== */}
      {!normalizedType && (
        <tr>
          <td colSpan="4">Aucun bénéficiaire sélectionné.</td>
        </tr>
      )}

    </tbody>
  </table>
</section>



        {/* ===== VISAS CLIENT ET SOUSCRIPTEUR ===== */}
        <section className="preview-section" style={{marginTop: "50px"}}>
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

          <table className="preview-table">
            <tbody>
              <tr>
                <td className="titre-questionnaire" colSpan="4">Questionnaire médical — Adhérent</td>
              </tr>

              {/* Assurance Maladie */}
              <tr>
                <td className="no-border-right">Avez-vous bénéficié d’une assurance maladie ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.benef_assur_mald_anterieur)}</td>
                <td className="no-border-right">Auprès de quelle Compagnie ?</td>
                <td>
                  {questionnaire.adherent.benef_assur_mald_anterieur === "Oui"
                    ? questionnaire.adherent.cie_assur_mald_anterieur || "-":"-"}
                </td>
              </tr>

              {/* Consultation 5 ans */}
              <tr className="no-border">
                <td className="no-border-right">Avez-vous consulté un médecin les 5 dernières années ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.consulte_medecin_5ans)}</td>
                  <td className="no-border-right">Motif</td>
                  <td>
                  {questionnaire.adherent.consulte_medecin_5ans === "Oui" 
                  ? questionnaire.adherent.motif_consultation || "-":"-"}
                  </td>               
              </tr>

              {/* Traitement en cours */}
              <tr>
                <td className="no-border-right">Traitement en cours ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.traitement_en_cours)}</td>
                  <td className="no-border-right">Détails traitement</td>
                  <td>
                    {questionnaire.adherent.traitement_en_cours === "Oui" ?
                    questionnaire.adherent.traitement_details || "-" : "-"}
                  </td>
              </tr>

              {/* Maladies graves / chroniques */}
              <tr className="no-border">
                <td className="no-border-right">Avez-vous atteint de maladies chroniques ou graves ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.maladies_graves)}</td>                            
                  <td className="no-border-right">Lequelles ?</td>
                  <td>
                  {questionnaire.adherent.maladies_graves === "Oui" ?
                   questionnaire.adherent.maladies_graves_details || "-" : "-"}
                </td>
              </tr>

              {/* Interventions chirurgicales */}
              <tr>
                <td className="no-border-right">Avez-vous subi des interventions chirurgicales ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.operation_chirurgicale)}</td>
                <td className="no-border-right">Détails des opérations chirurgicales</td>
                <td>
                {questionnaire.adherent.operation_chirurgicale === "Oui" ?
                  questionnaire.adherent.operation_details || "-" : "-"}
                </td>
              </tr>

              {/* Infirmité / handicap */}
              <tr className="no-border">
                <td className="no-border-right">Êtes-vous atteint d’une infirmité ou d’un handicap ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.infirmite)}</td>
                  <td className="no-border-right">Détails infirmité</td>
                    <td>
                    {questionnaire.adherent.infirmite === "Oui" ?
                     questionnaire.adherent.infirmite_details || "-" : "-"}
                    </td>  
                 </tr>               

              {/* Défaut de la vue */}
              <tr>
                <td className="no-border-right">Avez-vous un défaut de la vue ?</td>
                <td className="no-border-right">{yesNo(questionnaire.adherent.defaut_vue)}</td>
                 
                    <td className="no-border-right">Détails du défaut de la vue</td>
                    <td>
                      {questionnaire.adherent.defaut_vue === "Oui" 
                        ? questionnaire.adherent.defaut_vue_details || "-"
                        : "-"}
                      </td>                  
                 </tr>

              {/* Grossesse en cours */}
              <tr className="no-border">
                <td className="no-border-right">Êtes-vous en état de grossesse ?</td>

                {/* Valeur grossesse */}
                <td className="no-border-right">
                  {assure.sexe === "Homme"
                    ? "Non concerné"
                    : questionnaire.adherent.grossesse || "Non concerné"}
                </td>

                {/* Durée grossesse */}
                <td className="no-border-right">Durée de la grossesse</td>
                <td> {assure.sexe === "Homme" ? "Non concerné"
                  : questionnaire.adherent.grossesse === "Oui"
                    ? `${questionnaire.adherent.grossesse_mois || "-"} mois`
                    : "Non concerné"}
                </td>
              </tr>


              {/* Taille / Poids */}
              <tr>
                <td className="no-border-right">Taille</td>
                <td>{questionnaire.adherent.taille || "-"} cm</td>
                <td className="no-border-right">Poids</td>
                <td>{questionnaire.adherent.poids || "-"} kg</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ===== QUESTIONNAIRE MÉDICAL CONJOINT ===== */}
        {conjoint?.length > 0 && (
          <section className="preview-section">

            <table className="preview-table">
              <tbody>
              <tr>
                <td className="titre-questionnaire" colSpan="4">Questionnaire médical — Conjoint</td>
              </tr>

                {/* Emploi ou activités */}
                <tr>
                  <td className="no-border-right">Emploi ou activités</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.emploi || "-")}</td>
                  <td className="no-border-right">Profession</td>
                  <td>
                    {questionnaire.conjoint.emploi === "Oui" ? 
                    questionnaire.conjoint.profession || "-": "-"}</td>
                </tr>                  

                {/* Assurance Maladie actuelle */}
                <tr className="no-border">
                  <td className="no-border-right">Bénéficiez-vous d’une assurance maladie ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.benef_assur_maladie)}</td>
                  <td className="no-border-right">Auprès de quelle Compagnie ?</td>
                  <td>{questionnaire.conjoint.benef_assur_maladie === "Oui" ?
                       questionnaire.conjoint.cie_assur_maladie || "-": "-"}
                  </td>                  
                </tr>

                {/* Assurance Maladie Antérieur */}
                <tr>
                  <td className="no-border-right">Avez-vous bénéficié d’une assurance maladie ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.benef_assur_mald_anterieur)}</td>
                  <td className="no-border-right">Auprès de quelle Compagnie ?</td>
                  <td>{questionnaire.conjoint.benef_assur_mald_anterieur === "Oui" ?
                    questionnaire.conjoint.cie_assur_mald_anterieur || "-" : "-"}
                  </td>                  
                </tr>

                {/* Consultation 5 ans */}
                <tr className="no-border"> 
                  <td className="no-border-right">Avez-vous consulté un médecin les 5 dernières années ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.consulte_medecin_5ans)}</td>
                    <td className="no-border-right">Motif</td>
                      <td>{questionnaire.conjoint.consulte_medecin_5ans === "Oui" ?
                        questionnaire.conjoint.motif_consultation || "-" : "-"}
                        </td>
                    </tr>

                {/* Traitement en cours */}
                <tr>
                  <td className="no-border-right">Traitement en cours ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.traitement_en_cours)}</td>
                    <td className="no-border-right">Détails traitement</td>
                      <td>{questionnaire.conjoint.traitement_en_cours === "Oui" ?
                        questionnaire.conjoint.traitement_details || "-" : "-"}
                      </td>                
                </tr>

                {/* Maladies graves / chroniques */}
                <tr className="no-border">
                  <td className="no-border-right">Avez-vous atteint de maladies chroniques ou graves ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.maladies_graves)}</td>
                    <td className="no-border-right">Lequelles ?</td>
                      <td>{questionnaire.conjoint.maladies_graves === "Oui" ?
                        questionnaire.conjoint.maladies_graves_details || "-" : "-"}
                        </td>                  
                  </tr>

                {/* Interventions chirurgicales */}
                <tr>
                  <td className="no-border-right">Avez-vous subi des interventions chirurgicales ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.operation_chirurgicale)}</td>
                  <td className="no-border-right">Détails des opérations chirurgicales</td>
                  <td>{questionnaire.conjoint.operation_chirurgicale === "Oui" ?
                    questionnaire.conjoint.operation_details || "-" : "-"}
                    </td>                  
                </tr>

                {/* Détails infirmité */}
                <tr className="no-border">
                  <td className="no-border-right">Êtes-vous atteint d’une infirmité ou d’un handicap ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.infirmite)}</td>
                    <td className="no-border-right">Détails infirmité</td>
                      <td>{questionnaire.conjoint.infirmite === "Oui" ?
                        questionnaire.conjoint.infirmite_details || "-" : "-"}
                      </td>                  
                </tr>

                {/* Défaut de la vue */}
                <tr>
                  <td className="no-border-right">Avez-vous un défaut de la vue ?</td>
                  <td className="no-border-right">{yesNo(questionnaire.conjoint.defaut_vue)}</td>
                  <td className="no-border-right">Détails du défaut de la vue</td>
                  <td>{questionnaire.conjoint.defaut_vue === "Oui" ?
                      questionnaire.conjoint.defaut_vue_details || "-" : "-"}
                  </td>                  
                </tr>

                {/* Grossesse en cours */}
                <tr className="no-border">
                  <td className="no-border-right">Êtes-vous en état de grossesse ?</td>
                  {/* Valeur grossesse */}
                  <td className="no-border-right">
                    {conjoint?.[0]?.sexe_conj?.toLowerCase() === "homme"
                      ? "Non concerné"
                      : questionnaire.conjoint.grossesse || "Non concerné"}
                  </td>

                  {/* Durée grossesse */}
                  <td className="no-border-right">Durée de la grossesse</td>
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
                  <td className="no-border-right">Taille</td>
                  <td className="no-border-right">{questionnaire.conjoint.taille || "-"} cm</td>
                  <td className="no-border-right">Poids</td>
                  <td>{questionnaire.conjoint.poids || "-"} kg</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}


        {/* ===== DECLARATION ET SIGNATURES ===== */}
        <section className="preview-section" style={{marginTop: "40px"}}>
          <table className="preview-table">
            <tbody>
              <tr>
                {/* <td className="td-visas">
                  Déclaration de l’adhérent<br /><br />
                  Signature :
                </td>*/}
                <td className="td-visas" style={{float: "right"}}>
                  Signature de l'adhérent:
                </td>
              </tr>
            </tbody>
          </table>
        </section>

      
    
    {/* <footer className="print-footer">
        <span className="footer-left">
          Bulletin d’adhésion — édité le {new Date().toLocaleDateString("fr-FR")}
        </span>

        <span className="footer-right">
          Page <span className="pageNumber"></span> 
        </span>
      </footer>*/}
     
     
     
      </div>
   </div></>
  );
});
export default BulletinAdhesionPreview;
