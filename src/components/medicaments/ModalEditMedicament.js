import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import '../Clients/Style-clients/Edit-client.css';

const ModalEditClient = ({ medicamentData, isOpen, onClose, onMedicamentUpdated }) => {
  const token = localStorage.getItem('token');
  const [medicament, setMedicament] = useState(medicamentData || {});

  useEffect(() => {
    if (medicamentData) {
      setMedicament(medicamentData);
    }
  }, [medicamentData]);

  const handleChange = (e) => {
    setMedicament({ ...medicament, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/api/medicaments/${medicament.id_medicament}`, medicament, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Medicament mis à jour avec succès.");

      onMedicamentUpdated(); // Le parent se charge de fermer la modale

    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  if (!isOpen || !medicamentData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal_modif_client">
        <form className="modal-content_EditClient" onSubmit={handleSubmit}>
          <div className="titre_EditClient">
          <h2>Modifier le Médicament</h2> 
          </div>
          
<div className="form-group">
          <label htmlFor="nom_commercial">Nom commercial</label>
          <input type="text" name="nom_commercial" placeholder="Nom commercial"
            value={medicament.nom_commercial || ''} onChange={handleChange} required />
</div>
<div className="form-group">
          <label htmlFor="statut_medicament">Statut commercialisation</label>
          <select name="statut_medicament" value={medicament.statut_medicament || ''} onChange={handleChange}>
            <option value="">-- Statut de commercialisation --</option>
            <option value="Commercialisé">Commercialisé</option>
            <option value="Non Commercialisé">Non Commercialisé</option>
            <option value="Retiré du Marché">Retiré du Marché</option>
            <option value="Autre">Autre</option>
          </select>
</div>
<div className="form-group">
          <label htmlFor="dosage">Dosage</label>
          <input type="text" name="dosage" placeholder="Dosage"
            value={medicament.dosage || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="forme">Forme</label>
          <input type="text" name="forme" placeholder="Forme"
            value={medicament.forme || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="pp_gn">Classification</label>
          <select name="pp_gn" value={medicament.pp_gn || ''} onChange={handleChange}>
            <option value="">-- Classification --</option>
            <option value="PP">Princeps</option>
            <option value="GN">Générique</option>
            <option value="Autre">Autre</option>
          </select>
</div>
<div className="form-group">
          <label htmlFor="prix">Prix</label>
          <input name="ppv" type="text" placeholder="Prix"
            value={medicament.ppv || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="presentation">Presentation</label>
          <input name="presentation" type="text" placeholder="Presentation"
            value={medicament.presentation || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="statut_medicament">Remboursable</label>
          <select name="remboursable" value={medicament.remboursable || ''} onChange={handleChange}>
            <option value="">-- Remboursable --</option>
            <option value="Remboursable">Remboursable</option>
            <option value="Non Remboursable">Non Remboursable</option>
          </select>
</div>

          <div className="modal-button">
            <button className="valider_button" type="submit">Enregistrer</button>
            <button className="cancel_button" type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditClient;