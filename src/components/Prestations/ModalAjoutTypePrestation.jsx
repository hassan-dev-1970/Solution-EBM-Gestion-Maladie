
import React, { useState } from 'react';
import '../Prestations/AjoutPrestations.css'; // Import du CSS spécifique pour la modale d'ajout

const ModalAjoutTypePrestation = ({ onClose, onSave }) => {
  const [form, setForm] = useState({ libelle: '', description: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal_AddPrestation">
        <form className='modal-content_AddPrestation' onSubmit={handleSubmit}>
          <div className='titre'>
          <h3>Ajouter un type de prestation</h3>
          </div>


          
          <input
            name="libelle"
            placeholder="Libellé"
            value={form.libelle}
            onChange={handleChange}
            required
          />
          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />
          <div className="modal-actions">
            <button type="submit">Enregistrer</button>
            <button type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalAjoutTypePrestation;
