import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../contrats/Styles-contrats/ModifierContrat.css';
import ModalAjoutCategorie from './ModalAjoutCategorie';

const ModifierContrat = () => {
  const { id_contrat } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [form, setForm] = useState({
    id_client: '',
    compagnie: '',
    police: '',
    type_contrat: '',
    date_debut: '',
    date_fin: '',
    taux_remb: '',
    plafond: '',
    taux_prime_mald: '',
    taux_prime_incap: '',
    taux_prime_deces: '',
    taux_prime_deces_accidentel: '',
    taux_prime_gros_risque: '',
    taux_prime_retraite: '',
    taux_prime_expatries: '',
    age_limite_adh: '',
    age_limite_conj: '',
    age_limite_enf: '',
    age_limite_enf_scol: '',
    age_limite_enf_handicap: '',
    mode_remb: '',
    circuit: '',
    statut: '',
    date_resiliation: '',
    garantie_maladie: false,
    garantie_incapacite_invalidite_temporaire: false,
    garantie_deces_invalidite_totale: false,
    garantie_deces_accidentel: false,
    garantie_gros_risque: false,
    garantie_maladie_retraite: false,
    garantie_maladie_expatries: false,
    categorie_ids: []
  });

  const [clients, setClients] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('infos');
  const [isAjoutCategorieOpen, setIsAjoutCategorieOpen] = useState(false);

  // Convertit une date en format d'entrée de date HTML (YYYY-MM-DD)
  // Pour éviter les problèmes de fuseau horaire, on utilise toISOString et on enlève l'heure
  // car les champs de date HTML n'acceptent que la date sans l'heure.
  const toDateInputValue = (date) => {
  const d = new Date(date);
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};


  // Chargement du contrat à modifier
  useEffect(() => {
    const fetchContrat = async () => {
      try {
        const res = await axios.get(`/api/contrats/${id_contrat}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = res.data;
        setForm({ ...data, categorie_ids: (data.categorie_ids || []).map(Number), });
      } catch (err) {
        console.error("Erreur chargement contrat", err);
        toast.error("Erreur lors du chargement du contrat.");
        navigate('/ListeContrats'); // Redirige si l'erreur est critique
      }
    };

    fetchContrat();
  }, [id_contrat, token, navigate]);

  const fetchCategories = React.useCallback(() => {
    axios.get('/api/categorie-personnel', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setCategories(res.data))
      .catch(err => console.error("Erreur chargement catégories", err));
  }, [token]);

  useEffect(() => {
    axios.get('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setClients(res.data))
      .catch(err => console.error("Erreur chargement clients", err));

    fetchCategories();
  }, [fetchCategories, token]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const formatDate = (dateStr) => {
      const d = new Date(dateStr);
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 10);
    };

    const payload = {
      ...form,
      date_debut: formatDate(form.date_debut),
      date_fin: formatDate(form.date_fin),
      categorie_ids: form.categorie_ids.map((id) => parseInt(id, 10)) // ✅ convertit en int
    };

    await axios.put(`/api/contrats/${id_contrat}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });

    toast.success("Contrat modifié avec succès !");
    //navigate('/ListeContrats');
  } catch (err) {
    console.error("Erreur modification contrat", err);
    toast.error("Erreur lors de la modification du contrat.");    
  }
};


const renderTabContent = () => {
    switch (activeTab) {
      case 'infos':
        return (
          <>
            <label>Client :
              <select name="id_client" value={form.id_client} onChange={handleChange} required>
                <option value="">-- Sélectionner --</option>
                {clients.map(c => (
                  <option key={c.id_client} value={c.id_client}>{c.raison_sociale}</option>
                ))}
              </select>
            </label>
            <label>Police : <input name="police" value={form.police} onChange={handleChange} required /></label>
            <label>Compagnie : <input name="compagnie" value={form.compagnie} onChange={handleChange} /></label>
            <label>Type de contrat : <input name="type_contrat" value={form.type_contrat} onChange={handleChange} /></label>
            <label>Date début : <input type="date" name="date_debut" value={form.date_debut ? toDateInputValue(form.date_debut) : ''} onChange={handleChange} /></label>
            <label>Date fin : <input type="date" name="date_fin" value={form.date_fin ? toDateInputValue(form.date_fin) : ''} onChange={handleChange} /></label>
            <fieldset>
              <legend>Garanties</legend>
              <div className="checkbox-list">
                <label><input type="checkbox" name="garantie_maladie" checked={form.garantie_maladie} onChange={handleChange} /> Maladie</label>
                <label><input type="checkbox" name="garantie_incapacite_invalidite_temporaire" checked={form.garantie_incapacite_invalidite_temporaire} onChange={handleChange} /> Incapacité</label>
                <label><input type="checkbox" name="garantie_deces_invalidite_totale" checked={form.garantie_deces_invalidite_totale} onChange={handleChange} /> Décès</label>
                <label><input type="checkbox" name="garantie_deces_accidentel" checked={form.garantie_deces_accidentel} onChange={handleChange} /> Décès accidentel</label>
                <label><input type="checkbox" name="garantie_gros_risque" checked={form.garantie_gros_risque} onChange={handleChange} /> Gros risque</label>
                <label><input type="checkbox" name="garantie_maladie_retraite" checked={form.garantie_maladie_retraite} onChange={handleChange} /> Maladie Retraite</label>
                <label><input type="checkbox" name="garantie_maladie_expatries" checked={form.garantie_maladie_expatries} onChange={handleChange} /> Maladie Expatriés</label>
              </div>
            </fieldset>
            <label>Statut :
              <select name="statut" value={form.statut} onChange={handleChange} required>
                <option value="">-- Sélectionner --</option>
                <option value="Actif">Actif</option>
                <option value="Suspendu">Suspendu</option>
                <option value="Résilié">Résilié</option>
                <option value="Archivé">Archivé</option>
              </select>
            </label>
            <label>Date de résiliation : <input type="date" name="date_resiliation" value={form.date_resiliation ? toDateInputValue(form.date_resiliation) : ''} onChange={handleChange} /></label>
            <label>Agence : <input name="agence" value={form.agence} onChange={handleChange} disabled /></label>
          </>
        );

      case 'remb':
        return (
          <>
            <label>Taux remboursement : <input name="taux_remb" value={form.taux_remb} onChange={handleChange} /></label>
            <label>Plafond : <input name="plafond" value={form.plafond} onChange={handleChange} /></label>
            <label>Mode remboursement : <input name="mode_remb" value={form.mode_remb} onChange={handleChange} /></label>
            <label>Circuit : <input name="circuit" value={form.circuit} onChange={handleChange} /></label>
          </>
        );

      case 'tarifs':
        return (
          <>
            <label>Taux prime Maladie : <input name="taux_prime_mald" value={form.taux_prime_mald} onChange={handleChange} disabled={!form.garantie_maladie}/></label>
            <label>Taux prime Incapacité : <input name="taux_prime_incap" value={form.taux_prime_incap} onChange={handleChange} disabled={!form.garantie_incapacite_invalidite_temporaire}/></label>
            <label>Taux prime Décès : <input name="taux_prime_deces" value={form.taux_prime_deces} onChange={handleChange} disabled={!form.garantie_deces_invalidite_totale}/></label>
            <label>Taux prime Décès accidentel : <input name="taux_prime_deces_accidentel" value={form.taux_prime_deces_accidentel} onChange={handleChange} disabled={!form.garantie_deces_accidentel} /></label>
            <label>Taux prime Gros Risque : <input name="taux_prime_gros_risque" value={form.taux_prime_gros_risque} onChange={handleChange} disabled={!form.garantie_gros_risque} /></label>
            <label>Taux prime Retraite : <input name="taux_prime_retraite" value={form.taux_prime_retraite} onChange={handleChange} disabled={!form.garantie_maladie_retraite} /></label>
            <label>Taux prime Expatriés : <input name="taux_prime_expatries" value={form.taux_prime_expatries} onChange={handleChange} disabled={!form.garantie_maladie_expatries}/></label>
          </>
        );

      case 'ages':
        return (
          <>
            <label>Âge limite adhérent : <input name="age_limite_adh" value={form.age_limite_adh} onChange={handleChange} /></label>
            <label>Âge limite conjoint : <input name="age_limite_conj" value={form.age_limite_conj} onChange={handleChange} /></label>
            <label>Âge limite enfant : <input name="age_limite_enf" value={form.age_limite_enf} onChange={handleChange} /></label>
            <label>Âge enfant scolaire : <input name="age_limite_enf_scol" value={form.age_limite_enf_scol} onChange={handleChange} /></label>
            <label>Âge enfant handicapé : <input name="age_limite_enf_handicap" value={form.age_limite_enf_handicap} onChange={handleChange} /></label>
          </>
        );

      case 'categories':
        return (
          <fieldset className="categorie-section-modif">
            <legend>Catégories</legend>
            <div className="categorie-flex-modif">
              <table className="categorie-table-modif">
                <tbody>
                  <tr>
                    {categories.map((cat) => (
                      <td key={cat.id_categorie}>
                        <label className="categorie-label-modif">
                          <input
                            type="checkbox"
                            value={cat.id_categorie}
                            checked={form.categorie_ids.includes(Number(cat.id_categorie))}
                            onChange={(e) => {
                              const id = Number(e.target.value);
                              setForm((prevForm) => {
                                const updated = prevForm.categorie_ids.includes(id)
                                  ? prevForm.categorie_ids.filter((c) => c !== id)
                                  : [...prevForm.categorie_ids, id];
                                return { ...prevForm, categorie_ids: updated };
                              });
                            }}
                          />
                          {cat.nom}
                        </label>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={() => setIsAjoutCategorieOpen(true)}
              className="btn-ajout-cat-modif"
            >
              <img src="/Images/edit/plus-2.png" alt="Ajouter" className="icon-ajout-modif" />
              Gérer les catégories
            </button>
          </fieldset>
        );

      default:
        return null;
    }
  };

  return (
    <>      
      <div className="modif-contrat-container">
        <form onSubmit={handleSubmit} className="form-modif-contrat">
          <div className="modif-contrat-header">
            <div style={{width: 'auto', display: 'flex', border: 'none', borderBottom: '1.5px solid #afbac0'}}>
          <h2 style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'darkblue'}}>Modification de Contrat</h2>
           </div>
            <div className="btn-group right">
              <button type="submit" className="btn btn-success">Enregistrer</button>
              <button type="button" className="btn btn-annuler" onClick={() => navigate('/ListeContrats')}>Annuler</button>
            </div>
          </div>

          <div className="tabs">
            {['infos', 'tarifs', 'remb', 'ages', 'categories'].map(tab => (
              <button
                key={tab}
                type="button"
                className={activeTab === tab ? 'tab-active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'infos' && 'Informations Générales'}
                {tab === 'tarifs' && 'Conditions Tarifaires'}
                {tab === 'remb' && 'Règles de Remboursement'}
                {tab === 'ages' && 'Limites d’âge'}
                {tab === 'categories' && 'Catégories'}
              </button>
            ))}
          </div>

          {renderTabContent()}
        </form>

        {isAjoutCategorieOpen && (
          <ModalAjoutCategorie
            isOpen={isAjoutCategorieOpen}
            onClose={() => {
              setIsAjoutCategorieOpen(false);
              fetchCategories();
            }}
            onCategorieAjoutee={fetchCategories}
          />
        )}
      </div>
    </>
  );
};

export default ModifierContrat;