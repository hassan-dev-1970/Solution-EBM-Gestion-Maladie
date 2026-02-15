import axios from 'axios';
import { useState } from 'react';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';
import MessageBanner from '../message/MessageBanner';

const ModalAjoutCategorie = ({ 
  isOpen, 
  onClose, 
  onCategorieAjoutee, 
  setMessage, 
  setMessageType 
}) => {
  const [nom, setNom] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [localMessageType, setLocalMessageType] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/categorie-personnel', { nom }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✅ Message global transmis au parent si présent
      if (setMessage && setMessageType) {
        setMessage("Catégorie ajoutée avec succès !");
        setMessageType("success");
      }

      setNom('');
      setLocalMessage('');
      setLocalMessageType('');
      onCategorieAjoutee(); // recharge la liste
      onClose(); // ferme la modale
    } catch (err) {
      console.error("Erreur lors de l'ajout de la catégorie :", err);
      setLocalMessage("Erreur lors de l'ajout de la catégorie.");
      setLocalMessageType("error");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajouter une catégorie"
      size="small"
      footer={
        <>
          <button className="btn btn-success" type="submit" form="addCategorieForm">Enregistrer</button>
          <button className="btn btn-annuler" type="button" onClick={onClose}>Annuler</button>
        </>
      }
    >
      <form id="addCategorieForm" onSubmit={handleSubmit}>
        {localMessage && (
          <MessageBanner
            message={localMessage}
            type={localMessageType}
            onClose={() => setLocalMessage('')}
          />
        )}

        <div className="form-group">
          <label htmlFor="nom" className="required">Nom de la catégorie</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              placeholder="Entrez le nom de la catégorie"
              autoFocus
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ModalAjoutCategorie;