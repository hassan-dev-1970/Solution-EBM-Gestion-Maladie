import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';
import '../Styles/modal-edit.css';

const ModalEditUser = ({ user, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role_id: '',
    password: '',
    confirmPassword: ''
  });
  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);  
  const [clients, setClients] = useState([]);

  // Utilisation de useNavigate pour la navigation
// Chargez les clients quand le rôle change
useEffect(() => {
  if (formData.role_id) {
    const role = roles.find(r => r.id_role === parseInt(formData.role_id, 10));
    if (role && ['user_distant-souscripteur', 'user_distant-adherent'].includes(role.nom)) {
      // Charger les clients
      const token = localStorage.getItem('token');
      axios.get('/api/clients', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setClients(res.data))
        .catch(err => console.error('Erreur clients:', err));
    } else {
      setClients([]);
    }
  }
}, [formData.role_id, roles]);
// Mettez à jour useEffect d'initialisation
useEffect(() => {
  if (isOpen && user) {
    setFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.login || '',
      role_id: user.role_id || '',
      password: '',
      confirmPassword: ''
    });
    // Si l'utilisateur a un client, on le garde en mémoire pour le select
    if (user.id_client) {
      // Le select sera rempli via l'effet ci-dessus
    }
  }
}, [isOpen, user]);

  useEffect(() => {
    axios.get('/api/roles')
      .then((res) => setRoles(res.data))
      .catch((err) => console.error('Erreur chargement des rôles :', err));
  }, []);

const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: name === 'role_id' || name === 'id_client'
      ? (value ? parseInt(value, 10) : '')
      : value
  }));
};

const handleSubmit = (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    toast.warning("Les mots de passe ne correspondent pas.");
    return;
  }

  const updatedUser = {
    id_utilisateur: user.id_utilisateur,
    nom: formData.nom,
    prenom: formData.prenom,
    login: formData.email,
    role_id: parseInt(formData.role_id, 10),
    ...(clients.length > 0 && { id_client: formData.id_client }), // ← seulement si applicable
    ...(formData.password && { pass: formData.password }),
  };

  onSave(updatedUser);
  toast.success("Utilisateur mis à jour avec succès.");
  onClose();
};

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modification - Utilisateur"
      size="medium"
      footer={
        <>          
          <button className="btn btn-success" form="editUserForm" onClick={handleSubmit}>
            Enregistrer
          </button>
          <button className="btn btn-annuler" onClick={onClose}>Annuler</button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {/* Champ Nom */}
        <div className="form-group">
          <label htmlFor="nom" className="required">Nom</label>
          <div className="input-wrapper">
            <input 
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Champ Prénom */}
        <div className="form-group">
          <label htmlFor="prenom" className="required">Prénom</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Champ Email */}
        <div className="form-group">
          <label htmlFor="email" className="required">Email</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Champ Rôle */}
        <div className="form-group">
          <label htmlFor="role_id" className="required">Rôle</label>
          <div className="input-wrapper">
            <select
              id="role_id"
              name="role_id"
              value={formData.role_id || ''}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionner un rôle --</option>
              {roles.map((role) => (
                <option key={role.id_role} value={role.id_role}>
                  {role.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Champ Client */}
        {clients.length > 0 && (
        <div className="form-group">
          <label htmlFor="id_client" className="required">Client associé</label>
          <div className="input-wrapper">
            <select
              id="id_client"
              name="id_client"
              value={formData.id_client || (user?.id_client || '')}
              onChange={handleChange}
              required
            >
              <option value="">-- Sélectionner un client --</option>
              {clients.map(client => (
                <option key={client.id_client} value={client.id_client}>
                  {client.raison_sociale || client.nom}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

        {/* Mots de passe côte à côte */}
          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Laisser vide pour ne pas modifier"
              />
              <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer</label>
            <div className="input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le mot de passe"
              />
              <button
              type="button"
              className="toggle-password-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                  <line x1="2" y1="2" x2="22" y2="22"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
            </div>
          </div>       
      </form>
    </Modal>
  );
};

export default ModalEditUser;