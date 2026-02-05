import { useEffect, useState } from 'react';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';

const ModalEditTypePrestation = ({ typeData, isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ libelle: '', description: '' });

  useEffect(() => {
    if (isOpen && typeData) {
      setForm({
        libelle: typeData.libelle || '',
        description: typeData.description || ''
      });
    }
  }, [isOpen, typeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: typeData.id_type });
    onClose();
  };

  if (!isOpen || !typeData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier le type de prestation"
      size="medium"
      footer={
        <>
          <button className="btn btn-annuler" type="button" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" type="submit" form="editTypePrestationForm" onClick={handleSubmit}>
            Enregistrer
          </button>
        </>
      }
    >
      <form id="editTypePrestationForm" onSubmit={handleSubmit}>
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

export default ModalEditTypePrestation;