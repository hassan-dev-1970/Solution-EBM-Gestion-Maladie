import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
//import { toast } from 'react-toastify';
import '../contrats/Styles-contrats/PrestationsMaladie.css';

const PrestationsMaladie = ({ data, onChange }) => {
  const { id } = useParams();
  const token = localStorage.getItem('token');

  const [typePrestations, setTypePrestations] = useState([]);

  // Charger les prestations standards
  useEffect(() => {
    const fetchData = async () => {
      let tauxContrat = 0;
      let Client_id = '';
      const dateDebut = `${new Date().getFullYear()}-01-01`;

      try {
        if (id) {
          const resContrat = await axios.get(`/api/contrats/${id}/`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          tauxContrat = resContrat.data.taux_remb || 0;
          Client_id = resContrat.data.id_client || '';
        }
      } catch (err) {
        console.error("❌ Erreur chargement contrat :", err);
      }

      try {
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

        // ⚠️ si data est vide (premier chargement), on initialise
        if (!data || Object.keys(data).length === 0) {
          onChange(initialState);
        }

        setTypePrestations(resTypes.data);
      } catch (err) {
        console.error("❌ Erreur chargement types prestations :", err);
      }
    };

    fetchData();
  }, [token, id, data, onChange]);

  // Fonction pour cocher/décocher toutes les prestations
  const areAllChecked = () =>
    Object.values(data || {}).every(d => d.checked);

  const handleCheckAll = (checked) => {
    const updated = {};
    for (const id in data) {
      updated[id] = { ...data[id], checked };
    }
    onChange(updated);
  };

  // Gestion des champs
  const handleChange = (id, field, value) => {
    const updated = {
      ...data,
      [id]: {
        ...data[id],
        [field]: value
      }
    };

    // Si on décoche, reset les champs
    if (field === 'checked' && value === false) {
      updated[id] = {
        ...data[id],
        checked: false,
        plafond: '',
        age_limite: '',
        valeur_D: '',
        valeur_K: '',
      };
    }

    onChange(updated); // 🔼 on remonte au parent
  };

  return (
    <div className="prestation-tab">

      <div className="header-prestations">
        <h3>Prestations Maladie</h3>
      </div>
      
      <div className="table-container">
        <table className="table-prestations">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
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
              <tr
                key={prestation.id_prestation_std}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={data?.[prestation.id_prestation_std]?.checked || false}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'checked', e.target.checked)}
                  />
                </td>
                <td>{prestation.libelle_prestation}</td>
                <td>
                  <input
                    type="number"
                    value={data?.[prestation.id_prestation_std]?.taux || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'taux', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={data?.[prestation.id_prestation_std]?.plafond || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'plafond', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={data?.[prestation.id_prestation_std]?.age_limite || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'age_limite', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={data?.[prestation.id_prestation_std]?.valeur_D || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'valeur_D', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={data?.[prestation.id_prestation_std]?.valeur_K || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'valeur_K', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={data?.[prestation.id_prestation_std]?.periodicite || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'periodicite', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={data?.[prestation.id_prestation_std]?.date_debut || ''}
                    onChange={(e) => handleChange(prestation.id_prestation_std, 'date_debut', e.target.value)}
                    disabled={!data?.[prestation.id_prestation_std]?.checked}
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
