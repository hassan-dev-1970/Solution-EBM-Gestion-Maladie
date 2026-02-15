import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../contrats/Styles-contrats/PrestationsMaladie.css';



  const PrestationsMaladie = () => {
  const { id } = useParams();

  const token = localStorage.getItem('token');
  const [typePrestations, setTypePrestations] = useState([]);
  const [prestationsSelectionnees, setPrestationsSelectionnees] = useState({});
  const [activeRowId, setActiveRowId] = useState(null);



    
  // Fonction pour formater le libellé
  // Met en majuscule la première lettre et met le reste en minuscule
  const formatLibelle = (texte) => {
  if (!texte) return '';
  return texte.charAt(0).toUpperCase() + texte.slice(1).toLowerCase();
};  

  // Charger les prestations standards
useEffect(() => {
  const fetchData = async () => {
    let tauxContrat = 0;
    let Client_id = '';
    const dateDebut = `${new Date().getFullYear()}-01-01`;

    try {
      // 1️⃣ Charger le contrat
      if (id) {
        const resContrat = await axios.get(`/api/contrats/${id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        tauxContrat = resContrat.data.taux_remb || 0;
        Client_id = resContrat.data.id_client || '';
        console.log("✅ Taux du contrat :", tauxContrat);
      } else {
        console.warn("⚠️ contratId est vide. Pas de taux à appliquer.");
      }
    } catch (err) {
      console.error("❌ Erreur chargement contrat :", err);
    }

    try {
      // 2️⃣ Charger les types de prestations
      const resTypes = await axios.get('/api/types-prestations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const initialState = {};
      resTypes.data.forEach(p => {
        initialState[p.id_prestation_std] = {
          checked: false,
          client_id: Client_id,
          taux: tauxContrat,
          plafond: '',
          age_limite: '',
          valeur_D: '',
          valeur_K: '',
          periodicite: 365,
          date_debut: dateDebut
        };
      });

      setTypePrestations(resTypes.data);
      setPrestationsSelectionnees(initialState);
      console.log("✅ Types de prestations chargés :", resTypes.data);
    } catch (err) {
      console.error("❌ Erreur chargement types prestations :", err);
    }
  };

  fetchData();
}, [token, id]);


  const areAllChecked = () => {
    return Object.values(prestationsSelectionnees).every(data => data.checked); 
  };
const handleCheckAll = (checked) => {
  setPrestationsSelectionnees((prev) => {
    const updated = {};
    for (const id in prev) {
      updated[id] = {
        ...prev[id],
        checked: checked  // 👈 on ne modifie que la case à cocher
      };
    }
    return updated;
  });
};

  
  const handleChange = (id, field, value) => {
    const dateDebut = `${new Date().getFullYear()}-01-01`;
    const tauxContrat = prestationsSelectionnees[id]?.taux || 0;
  setPrestationsSelectionnees(prev => {
    // Si on décoche (checked === false), on vide les champs
    if (field === 'checked' && value === false) {
      return {
        ...prev,
        [id]: {
          checked: false,
          taux: tauxContrat,
          plafond: '',
          age_limite: '',
          valeur_D: '',
          valeur_K: '',
          periodicite: 365,
          date_debut: dateDebut
        }
      };
    }

    // Sinon, on met à jour normalement
    return {
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    };
  });
};


const handleSubmit = async () => {
  const prestations = Object.entries(prestationsSelectionnees)
    .filter(([_, data]) => data.checked)
    .map(([id, data]) => ({
      id_client_pm: data.client_id,
      code_prestat_m: parseInt(id),
      date_debut: data.date_debut,
      plafond_prestat_m: parseFloat(data.plafond),
      taux_remb_prestat: parseFloat(data.taux),
      valeur_d: parseFloat(data.valeur_D),
      valeur_k: parseFloat(data.valeur_K),
      periode_prestat: parseInt(data.periodicite),
      age_limit_prestat: parseInt(data.age_limite)
    }));

  if (prestations.length === 0) {
    alert("Veuillez sélectionner au moins une prestation.");
    return;
  }

  try {
    await axios.post(`/api/contrats/${id}/prestations-maladie`, { prestations }, {
      headers: { Authorization: `Bearer ${token}` }
    });
      toast.success('Prestations enregistrées avec succès !');

  } catch (err) {
    toast.error('Échec de l\'enregistrement des prestations.');
  }
};

  return (
    <div className="prestation-tab">

      <div className="btn-group right">
      <h3>Prestations Maladie</h3>
        <button className="btn btn-success" onClick={handleSubmit}>Enregistrer</button>
      </div>
      
      <div className="table-container">
      <table className="table-prestations">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                title="Sélectionner / désélectionner toutes les prestations"
                onChange={(e) => handleCheckAll(e.target.checked)}
                checked={areAllChecked()}
              />{' '}
            </th>
            <th>Libellé</th>
            <th>Taux (%)</th>
            <th>Plafond-Prestation</th>
            <th>Age-Limite</th>
            <th>Valeur-D</th>
            <th>Valeur-K</th>
            <th>Périodicité (jours)</th>
            <th>Date Début</th>
          </tr>
        </thead>
        <tbody>
          {typePrestations.map(prestation => (
              <tr key={prestation.id_prestation_std} className={activeRowId === prestation.id_prestation_std ? 'ligne-active' : ''}>              <td>
                <input
                  type="checkbox"
                  checked={prestationsSelectionnees[prestation.id_prestation_std]?.checked || false}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'checked', e.target.checked)}
                />
              </td>
              <td>{formatLibelle(prestation.libelle_prestation)}</td>
              <td>
                <input
                  type="number"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.taux || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'taux', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>
              <td>
                <input
                  type="number"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.plafond || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'plafond', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>
               <td>
                <input
                  type="number"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.age_limite || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'age_limite', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>
              <td>
                <input
                  type="number"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.valeur_D || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'valeur_D', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>

               <td>
                <input
                  type="number"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.valeur_K || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'valeur_K', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>
              <td>
                <input
                  type="number"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.periodicite || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'periodicite', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>
              <td>
                <input
                  type="date"
                  onFocus={() => setActiveRowId(prestation.id_prestation_std)}
                  onBlur={() => setActiveRowId(null)}
                  value={prestationsSelectionnees[prestation.id_prestation_std]?.date_debut || ''}
                  onChange={(e) => handleChange(prestation.id_prestation_std, 'date_debut', e.target.value)}
                  disabled={!prestationsSelectionnees[prestation.id_prestation_std]?.checked}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default PrestationsMaladie;
