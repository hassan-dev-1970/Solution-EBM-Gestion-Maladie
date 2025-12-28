import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../Styles/modal-edit.css';
import { toast } from 'react-toastify';

const ModalEditUser = ({ user, isOpen, onClose, onSave }) => {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [login, setLogin] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Préremplir les champs à l'ouverture de la modale
  useEffect(() => {
    if (isOpen && user) {
      setNom(user.nom || '');
      setPrenom(user.prenom || '');
      setLogin(user.login || '');
      setRoleId(user.role_id || '');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [isOpen, user]);

  // Charger la liste des rôles depuis l’API
 useEffect(() => {
  axios.get('/api/roles')
    .then((res) => {
      setRoles(res.data);
      console.log("Rôles chargés dans modale :", res.data);
    })
    .catch((err) => console.error('Erreur chargement des rôles :', err));
}, []);


  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      const msg = "Les mots de passe ne correspondent pas.";
      toast.warning(msg);
      return;
    }

    const updatedUser = {
      id_utilisateur: user.id_utilisateur,
      nom,
      prenom,
      login,
      role_id: parseInt(roleId, 10), // 🔥 ici on force à INT
      role: roles.find(r => r.id_role === parseInt(roleId, 10))?.nom || user.role, // Ajout du nom du rôle pour l'affichage
      ...(password && { pass: password }),
    };
    console.log("📝 Données envoyées pour la modification :", updatedUser);
    onSave(updatedUser);
    toast.success("Utilisateur mis à jour avec succès.");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className='titre'>
        <h2>Modifier l'utilisateur</h2>
        </div>
        <form className="modal-content" onSubmit={handleSubmit}>
          <input type='text'
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
            required
          />
          <input type='text'
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
            placeholder="Prénom"
            required
          />
          <input
            type="email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Email"
            required
          />

          {/* Champ select dynamique pour le rôle */}
              <select
                id="role_id"
                name="role_id"
                value={String(roleId)}
                onChange={(e) => setRoleId(e.target.value)}
                required
              >
                <option value="">-- Sélectionner un rôle --</option>
                {roles.map((role) => (
                  <option key={role.id_role} value={String(role.id_role)}>
                    {role.nom}
                  </option>
                ))}
              </select>

          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nouveau mot de passe"
            />
          </div>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le mot de passe"
            />
          </div>
          <div className="password-show">
            <label htmlFor="showPassword">
              <span>Afficher le mot de passe</span>
            </label>
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
            />
          </div>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          <div className="modal-actions">
            <button className="button-valider" type="submit">Enregistrer</button>
            <button className="reset" type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditUser;
