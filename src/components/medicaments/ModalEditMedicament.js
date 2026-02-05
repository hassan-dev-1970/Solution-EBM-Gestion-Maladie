import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';

const ModalEditMedicament = ({ medicamentData, isOpen, onClose, onMedicamentUpdated }) => {
  const [medicament, setMedicament] = useState({});
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && medicamentData) {
      setMedicament(medicamentData);
    }
  }, [isOpen, medicamentData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMedicament(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/api/medicaments/${medicament.id_medicament}`, medicament, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Médicament mis à jour avec succès.");
      onMedicamentUpdated();
      onClose();

    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour.");
    }
  };

  if (!isOpen || !medicamentData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le Médicament"
      size="medium"
      footer={
        <>
           <button className="btn btn-annuler" type="button" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" type="submit" form="editMedicamentForm" onClick={handleSubmit}>
            Enregistrer
          </button>
        </>
      }
    >
      <form id="editMedicamentForm" onSubmit={handleSubmit}>
        {/* Nom commercial */}
        <div className="form-group">
          <label htmlFor="nom_commercial" className="required">Nom commercial</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="nom_commercial"
              name="nom_commercial"
              value={medicament.nom_commercial || ''}
              onChange={handleChange}
              placeholder="Entrez le nom commercial"
              required
            />
          </div>
        </div>

        {/* Statut et Classification côte à côte */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="statut_medicament">Statut de commercialisation</label>
            <div className="input-wrapper">
              <select
                id="statut_medicament"
                name="statut_medicament"
                value={medicament.statut_medicament || ''}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner un statut --</option>
                <option value="Commercialisé">Commercialisé</option>
                <option value="Non Commercialisé">Non commercialisé</option>
                <option value="Retiré du Marché">Retiré du marché</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="classification">Classification</label>
            <div className="input-wrapper">
              <select
                id="classification"
                name="classification"
                value={medicament.classification || medicament.pp_gn || ''}
                onChange={handleChange}
              >
                <option value="">-- Sélectionner une classification --</option>
                <option value="PP">Princeps</option>
                <option value="GN">Générique</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dosage et Forme côte à côte */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dosage">Dosage</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="dosage"
                name="dosage"
                value={medicament.dosage || ''}
                onChange={handleChange}
                placeholder="Ex: 500mg, 10mg/ml"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="forme">Forme</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="forme"
                name="forme"
                value={medicament.forme || ''}
                onChange={handleChange}
                placeholder="Ex: Comprimé, Sirop, Injection"
              />
            </div>
          </div>
        </div>

        {/* Prix et Présentation côte à côte */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ppv">Prix (DH)</label>
            <div className="input-wrapper">
              <input
                type="number"
                id="ppv"
                name="ppv"
                value={medicament.ppv || medicament.prix || ''}
                onChange={handleChange}
                placeholder="Entrez le prix"
                step="0.01"
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="presentation">Présentation</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="presentation"
                name="presentation"
                value={medicament.presentation || ''}
                onChange={handleChange}
                placeholder="Ex: Boîte de 30 comprimés"
              />
            </div>
          </div>
        </div>

        {/* Remboursable */}
        <div className="form-group">
          <label htmlFor="remboursable">Remboursable</label>
          <div className="input-wrapper">
            <select
              id="remboursable"
              name="remboursable"
              value={medicament.remboursable || ''}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              <option value="Remboursable">Remboursable</option>
              <option value="Non Remboursable">Non remboursable</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ModalEditMedicament;