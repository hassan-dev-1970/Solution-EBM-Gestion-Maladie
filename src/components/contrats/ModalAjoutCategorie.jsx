// src/components/ModalAjoutCategorie.jsx
import axios from 'axios';
import { useState } from 'react';
import '../Clients/Style-clients/Ajout-client.css';
import MessageBanner from '../message/MessageBanner';

const ModalAjoutCategorie = ({ isOpen, onClose, onCategorieAjoutee, setMessage, setMessageType }) => {
  const [nom, setNom] = useState('');
  const [localMessage, setLocalMessage] = useState('');
  const [localMessageType, setLocalMessageType] = useState('');

  const token = localStorage.getItem('token');
  try {
    if (token) {
      // Décodage du token si besoin d'utiliser l'id_utilisateur plus tard
      // const id_utilisateur = payload.id;
    }
  } catch (err) {
    console.error("Erreur lors du décodage du token :", err);
  }

  if (!isOpen) return null;

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
      onCategorieAjoutee(); // recharge la liste
      onClose(); // ferme la modale
    } catch (err) {
      console.error(err);
      setLocalMessage("Erreur lors de l'ajout de la catégorie.");
      setLocalMessageType("error");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <form onSubmit={handleSubmit} className="modal-content">
          <h3>Ajouter une catégorie</h3>

          {localMessage && (
            <MessageBanner
              message={localMessage}
              type={localMessageType}
              onClose={() => setLocalMessage('')}
            />
          )}

          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom de la catégorie"
            autoFocus
            required
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

export default ModalAjoutCategorie;
