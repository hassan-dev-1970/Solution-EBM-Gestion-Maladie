import React from 'react';
import '../utilisateurs/style-users/Affich-profil.css';

const ModalViewUser = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;

  // Génère une initiale à partir du prénom/nom si pas d'image
  /*const getInitials = (prenom, nom) => {
    return `${prenom?.charAt(0) || ''}${nom?.charAt(0) || ''}`.toUpperCase();
  };*/

  return (
          <div className="modal-overlay">
            <div className="modal-affichprofil fade-in">
              <div className="titre-modal">
                <h2>Profil de l'utilisateur</h2>
              </div>

              <div className="div-img">
                <img src="/Images/icones/user/user.png" alt="Profil" />
              </div>

              <div className="form-group">
                <label>Nom :</label>
                <input value={user.nom} readOnly />
              </div>

              <div className="form-group">
                <label>Prénom :</label>
                <input value={user.prenom} readOnly />
              </div>

              <div className="form-group">
                <label>Email :</label>
                <input value={user.login} readOnly />
              </div>

              <div className="modal-buttons">
                <button className="button-valider" onClick={onClose}>Fermer</button>
              </div>
            </div>
          </div>
  );
};

export default ModalViewUser;
