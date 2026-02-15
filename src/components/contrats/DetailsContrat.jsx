import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import FicheContratButton from './FicheContratButton';
import './Styles-contrats/DetailsContrat.css';

const DetailsContrat = () => {
  const { id_contrat } = useParams();
  const [contrat, setContrat] = useState(null);
  const navigate = useNavigate();  
  const location = useLocation();


  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`/api/contrats/${id_contrat}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => setContrat(res.data))
      .catch((err) => console.error("Erreur chargement contrat", err));
  }, [id_contrat]);

  if (!contrat) return <p>Chargement...</p>;

 const handleRetour = () => {
  if (location.state?.from) {
    navigate(location.state.from);
  } else if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate("/listecontrats");
  }
};



  return (
    <div className="details-contrat-container">
      <div className="ajouter-contrat-header">
        <h2 className='titre-VC'>Fiche contrat</h2>        
      </div>
        <div className="header-actions-details">
          <FicheContratButton idContrat={id_contrat} />
          <button onClick={handleRetour} className='btn btn-retour' style={{height: '39px'}}>Retour</button>
        </div>
      

      <fieldset>
        <legend>Informations générales</legend>
        <div className="grid">
          <div><strong>Client :</strong> {contrat.nom_client}</div>
          <div><strong>N°.Police :</strong> {contrat.police}</div>
          <div><strong>Compagnie :</strong> {contrat.compagnie}</div>
          <div><strong>Type de contrat :</strong> {contrat.type_contrat}</div>
          <div><strong>Circuit :</strong> {contrat.circuit}</div>
          <div><strong>Catégorie du personnel assuré :</strong> {contrat.categories || 'Aucune catégorie sélectionnée'}</div>
          <div><strong>Statut :</strong> {contrat.statut}</div>
          <div><strong>Agence :</strong> {contrat.agence}</div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Période de couverture</legend>
        <div className="grid">
          <div><strong>Date début :</strong> {new Date(contrat.date_debut).toLocaleDateString()}</div>
          <div><strong>Date fin :</strong> {new Date(contrat.date_fin).toLocaleDateString()}</div>
          <div><strong>Date de résiliation :</strong> {contrat.date_resiliation ? new Date(contrat.date_resiliation).toLocaleDateString() : 'Aucune'}</div>

        </div>
      </fieldset>

      <fieldset>
        <legend>Garanties</legend>
        <div className="grid">
          <div><strong>Maladie-Maternité :</strong>{' '}{contrat.garantie_maladie ? 
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
          <div><strong>Incapacité :</strong> {contrat.garantie_incapacite_invalidite_temporaire ?
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
          <div><strong>Décès :</strong> {contrat.garantie_deces_invalidite_totale ?
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
          <div><strong>Décès Accidentel :</strong> {contrat.garantie_deces_accidentel ?
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
          <div><strong>Gros Risque :</strong> {contrat.garantie_gros_risque ?
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
          <div><strong>Retraités :</strong> {contrat.garantie_maladie_retraite ?
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
          <div><strong>Expatriés :</strong> {contrat.garantie_maladie_expatries ?
          (<span className='valide'><img src="/Images/edit/check-1.png" alt="" /></span>) : '🔴'}</div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Conditions tarifaires / Taux de prime</legend>
        <div className="grid">
          <div><strong>Maladie :</strong> {contrat.taux_prime_mald ? `${contrat.taux_prime_mald}%` : '🔴'}</div>
          <div><strong>Incapacité :</strong> {contrat.taux_prime_incap ? `${contrat.taux_prime_incap}%` : '🔴'}</div>
          <div><strong>Décès :</strong> {contrat.taux_prime_deces ? `${contrat.taux_prime_deces}%` : '🔴'}</div>
          <div><strong>Décès Accidentel:</strong> {contrat.taux_prime_deces_accidentel ? `${contrat.taux_prime_deces_accidentel}%` : '🔴'}</div>
          <div><strong>Gros Risque :</strong> {contrat.taux_prime_gros_risque ? `${contrat.taux_prime_gros_risque}%` : '🔴'}</div>
          <div><strong>Retraités :</strong> {contrat.taux_prime_retraite ? `${contrat.taux_prime_retraite}%` : '🔴'}</div>
          <div><strong>Expatriés :</strong> {contrat.taux_prime_expatries ? `${contrat.taux_prime_expatries}%` : '🔴'}</div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Règles de remboursement</legend>
        <div className="grid">
          <div><strong>Taux remboursement :</strong> {contrat.taux_remb}%</div>
          <div><strong>Plafond :</strong> {contrat.plafond}</div>
          <div><strong>Mode remboursement :</strong> {contrat.mode_remb}</div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Âges Limites</legend>
        <div className="grid">
          <div><strong>Adhérent :</strong> {contrat.age_limite_adh} ans</div>
          <div><strong>Conjoint :</strong> {contrat.age_limite_conj} ans</div>
          <div><strong>Enfant :</strong> {contrat.age_limite_enf} ans</div>
          <div><strong>Enfant Scolarisé :</strong> {contrat.age_limite_enf_scol} ans</div>
          <div><strong>Enfant Handicapé :</strong> {contrat.age_limite_enf_handicap ? `${contrat.age_limite_enf_handicap} ans` :'🔴'}</div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Informations Techniques</legend>
        <div className="grid">
          <div><strong>Date de création :</strong> {new Date(contrat.date_creat).toLocaleDateString()}</div>
          <div><strong>Créé par :</strong> {contrat.cree_par}</div>

          <div><strong>Date de modification :</strong> {new Date(contrat.date_modif).toLocaleDateString()}</div>
          <div><strong>Modifié par :</strong> {contrat.modifie_par}</div>
      </div>
      </fieldset>
    </div>
  );
};

export default DetailsContrat;
