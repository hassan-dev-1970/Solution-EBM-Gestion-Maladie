import { useEffect, useState } from 'react';
import '../Prestations/AjoutPrestations.css'; // Import du CSS spécifique pour la modale d'ajout

const ModalEditTypePrestation = ({ typeData, onClose, onSave }) => {
  const [form, setForm] = useState({ libelle: '', description: '' });

  useEffect(() => {
    if (typeData) {
      setForm({
        libelle: typeData.libelle,
        description: typeData.description
      });
    }
  }, [typeData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, id: typeData.id_type });
    onClose();
  };

  if (!typeData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <form className='modal-content_AddPrestation' onSubmit={handleSubmit}>
          <div className='titre'>
          <h3>Modifier le type de prestation</h3>
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

export default ModalEditTypePrestation;
