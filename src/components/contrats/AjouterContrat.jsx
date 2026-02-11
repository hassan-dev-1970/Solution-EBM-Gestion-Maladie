import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import ModalAjoutCategorie from '../contrats/ModalAjoutCategorie';
import '../contrats/Styles-contrats/ajoutContrat.css';

const AjouterContrat = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isAjoutCategorieOpen, setIsAjoutCategorieOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [activeTab, setActiveTab] = useState('infos'); // 👈 Onglet actif

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
    statut: 'actif', // Nouveau champ pour le statut
    garantie_maladie: false,
    garantie_incapacite_invalidite_temporaire: false,
    garantie_deces_invalidite_totale: false,
    garantie_deces_accidentel: false,
    garantie_gros_risque: false,
    garantie_maladie_retraite: false, // Champ pour la garantie retraite
    garantie_maladie_expatries: false, // Champ pour la garantie maladie expatriés

    categorie_ids: [] // Nouveau champ pour les catégories
  });

/*useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);*/

  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get('/api/categorie-personnel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Erreur chargement catégories', err);
    }
  }, [token]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
      } catch (err) {
        console.error('Erreur chargement clients', err);
      }
    };

    fetchClients();
    fetchCategories();
  }, [token, fetchCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = { ...form, categories: selectedCategories };
      await axios.post('/api/contrats', dataToSend, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Contrat ajouté avec succès !');
      setSelectedCategories([]);
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'ajout du contrat");
    }
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'infos':
        return (
          <>
            <fieldset>
              <legend>Informations générales</legend>
              <select name="id_client" value={form.id_client} onChange={handleChange} required>
                <option value="">-- Sélectionner un client --</option>
                {clients.map((client) => (
                  <option key={client.id_client} value={client.id_client}>
                    {client.raison_sociale}
                  </option>
                ))}
              </select>

              {/* Liste des Compagnies*/}
              
              <select name="compagnie" value={form.compagnie} onChange={handleChange} required>
                <option value="">-- Compagnie --</option>
                <option value="SANLAM">Sanlam Maroc</option>
                <option value="AXA">AXA Assurance Maroc</option>
                <option value="Wafa Assurance">Wafa Assurance</option>
                <option value="RMA">RMA</option>
                <option value="MCMA">MCMA</option>
                <option value="La Marocaine Vie">La Marocaine Vie</option>
                <option value="Allianz Maroc">Allianz Maroc</option>
              </select>
              
              <input name="police" placeholder="Police" value={form.police} onChange={handleChange} required />

              <select name="type_contrat" value={form.type_contrat} onChange={handleChange} required>
                <option value="">-- Type de contrat --</option>
                <option value="Classique">Classique</option>
                <option value="AMC">AMC</option>
                <option value="Individuel Sante">Individuel Santé</option>
              </select>
            </fieldset>

            <fieldset>
              <legend>Période de couverture</legend>
              <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
              <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} required />
            </fieldset>

            <fieldset>
              <legend>Garanties</legend>
              <div className="checkbox-list">
                <label><input type="checkbox" name="garantie_maladie" checked={form.garantie_maladie} onChange={handleChange} /> Maladie</label>
                <label><input type="checkbox" name="garantie_incapacite_invalidite_temporaire" checked={form.garantie_incapacite_invalidite_temporaire} onChange={handleChange} /> Incapacité</label>
                <label><input type="checkbox" name="garantie_deces_invalidite_totale" checked={form.garantie_deces_invalidite_totale} onChange={handleChange} /> Décès</label>
                <label><input type="checkbox" name="garantie_deces_accidentel" checked={form.garantie_deces_accidentel} onChange={handleChange} /> Décès accidentel</label>
                <label><input type="checkbox" name="garantie_gros_risque" checked={form.garantie_gros_risque} onChange={handleChange} /> Gros risque</label>
                <label><input type="checkbox" name="garantie_maladie_retraite" checked={form.garantie_maladie_retraite} onChange={handleChange} /> Maladie Retraite</label>
                <label><input type="checkbox" name="garantie_maladie_expat" checked={form.garantie_maladie_expatries} onChange={handleChange} /> Maladie Expatriés</label>
              </div>
            </fieldset>
          </>
        );
      case 'tarifs':
        return (
          <fieldset>
            <legend>Conditions tarifaires</legend>
            <input name="taux_prime_mald" placeholder="Taux prime Maladie (%)" value={form.taux_prime_mald} onChange={handleChange} disabled={!form.garantie_maladie}/>
            <input name="taux_prime_incap" placeholder="Taux prime Incapacité (%)" value={form.taux_prime_incap} onChange={handleChange} disabled={!form.garantie_incapacite_invalidite_temporaire}/>
            <input name="taux_prime_deces" placeholder="Taux prime Décès (%)" value={form.taux_prime_deces} onChange={handleChange} disabled={!form.garantie_deces_invalidite_totale}/>
            <input name="taux_prime_deces_accidentel" placeholder="Décès accidentel" value={form.taux_prime_deces_accidentel} onChange={handleChange} disabled={!form.garantie_deces_accidentel}/>
            <input name="taux_prime_gros_risque" placeholder="Taux prime Gros Risque (%)" value={form.taux_prime_gros_risque} onChange={handleChange} disabled={!form.garantie_gros_risque}/>
            <input name="taux_prime_retraite" placeholder="Taux prime Retraite (%)" value={form.taux_prime_retraite} onChange={handleChange} disabled={!form.garantie_maladie_retraite}/>
            <input name="taux_prime_expatries" placeholder="Taux prime Expatriés (%)" value={form.taux_prime_expatries} onChange={handleChange} disabled={!form.garantie_maladie_expatries}/>
          </fieldset>
        );
      case 'remb':
        return (
          <fieldset>
            <legend>Remboursement</legend>
            <input name="taux_remb" placeholder="Taux remboursement (%)" value={form.taux_remb} onChange={handleChange} />
            <input name="plafond" placeholder="Plafond" value={form.plafond} onChange={handleChange} />
            <select name="mode_remb" value={form.mode_remb} onChange={handleChange}>

                  <option value="">-- Mode remboursement --</option>
                  <optgroup label="Via Cie">
                    <option value="Via Cie: Chèque Adhérent">Chèque Adhérent</option>
                    <option value="Via Cie: Chèque Souscripteur">Chèque Souscripteur</option>
                    <option value="Via Cie: Virement Adhérent">Virement Adhérent</option>
                    <option value="Via Cie: Virement Souscripteur">Virement Souscripteur</option>
                  </optgroup>

                  <optgroup label="Via Cabinet">
                    <option value="Via Cabinet: Chèque Adhérent">Chèque Adhérent</option>
                    <option value="Via Cabinet: Chèque Souscripteur">Chèque Souscripteur</option>
                    <option value="Via Cabinet: Virement Adhérent">Virement Adhérent</option>
                    <option value="Via Cabinet: Virement Souscripteur">Virement Souscripteur</option>
                  </optgroup>
                </select>

            <select name="circuit" value={form.circuit} onChange={handleChange}>
              <option value="">-- Circuit --</option>
              <option value="Courtier">Courtier</option>
              <option value="Payeur">Payeur</option>
            </select>
          </fieldset>
        );
    case 'ages':
      return (
        <fieldset>
          <legend>Limites d’âge</legend>
          <input name="age_limite_adh" placeholder="Adhérent" value={form.age_limite_adh} onChange={handleChange} />
          <input name="age_limite_conj" placeholder="Conjoint" value={form.age_limite_conj} onChange={handleChange} />
          <input name="age_limite_enf" placeholder="Enfant" value={form.age_limite_enf} onChange={handleChange} />
          <input name="age_limite_enf_scol" placeholder="Enfant Scolaire" value={form.age_limite_enf_scol} onChange={handleChange} />
          <input name="age_limite_enf_handicap" placeholder="Enfant Handicapé" value={form.age_limite_enf_handicap} onChange={handleChange} />
        </fieldset>
      );
      case 'categories':
        return (
          <fieldset className="categorie-section">
            <legend>Catégories de personnel</legend>
            <div className="categorie-flex">
              {categories.map((cat) => {
                const id = parseInt(cat.id_categorie); // Assure que c'est bien un entier
                const isChecked = selectedCategories.includes(id);

      return (
        <label key={id} className="categorie-label">
          <input
            type="checkbox"
            value={id}
            checked={isChecked}
            onChange={() => {
              setSelectedCategories((prev) =>
                prev.includes(id)
                  ? prev.filter((c) => c !== id)
                  : [...prev, id]
              );
            }}
          />
          {cat.nom}
        </label>
      );
    })}
  </div>

    <button
      type="button"
      onClick={() => setIsAjoutCategorieOpen(true)}
      className="btn btn-primary"  >
      <img src="/Images/edit/plus-2.png" alt="Ajouter" className="icon-ajout" />
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
      <div className="modifier-contrat">
      </div>
    <div className="ajouter-contrat-container">
        <div className="ajouter-contrat-header">

          <div style={{width: 'auto', display: 'flex', border: 'none', borderBottom: '1.5px solid #afbac0'}}>
          <h2 style={{fontSize: '1.8rem', fontWeight: 'bold', color: 'darkblue'}}>Ajout de Contrat</h2>
           </div>
          <div className="btn-group right">          
            <button type="submit" className="btn btn-success" onClick={handleSubmit}>Enregistrer</button>
            <button type="button" className="btn btn-annuler" onClick={() => navigate('/ListeContrats')}>Annuler</button>            
          </div>
        </div>


      <div className="tabs">
        {['infos', 'tarifs', 'remb', 'ages', 'categories'].map((tab) => (
          <button
            key={tab}
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

      <form onSubmit={handleSubmit} className="form-ajout-contrat">
        {renderTabContent()}
      </form>
      
      <ModalAjoutCategorie
        isOpen={isAjoutCategorieOpen}
        onClose={() => setIsAjoutCategorieOpen(false)}
        onCategorieAjoutee={fetchCategories}
      />
    </div>
      </>
  );
};

export default AjouterContrat;
