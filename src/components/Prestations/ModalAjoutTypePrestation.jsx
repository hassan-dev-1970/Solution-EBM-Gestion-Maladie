import React, { useState } from 'react';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';

const ModalAjoutTypePrestation = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ libelle: '', description: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ libelle: '', description: '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter un type de prestation"
      size="medium"
      footer={
        <>
          <button className="btn btn-annulerbtn " type="button" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" type="submit" form="addTypePrestationForm" onClick={handleSubmit}>
            Enregistrer
          </button>
        </>
      }
    >
      <form id="addTypePrestationForm" onSubmit={handleSubmit}>
        {/* Libellé */}
        <div className="form-group">
          <label htmlFor="libelle" className="required">Libellé</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="libelle"
              name="libelle"
              value={form.libelle}
              onChange={handleChange}
              placeholder="Entrez le libellé de la prestation"
              required
              autoFocus
            />
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <div className="input-wrapper">
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Entrez une description (facultatif)"
              rows="4"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ModalAjoutTypePrestation;