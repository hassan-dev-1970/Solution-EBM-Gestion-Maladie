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
      [name]: value
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
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmer le mot de passe"
              />
            </div>
          </div>

        {/* Checkbox show password */}
        <div className="password-show-group" onClick={() => setShowPassword(!showPassword)}>
          <input
            type="checkbox"
            id="showPassword"
            checked={showPassword}
            onChange={() => {}}
          />
          <label htmlFor="showPassword">Afficher le mot de passe</label>
        </div>
      </form>
    </Modal>
  );
};

export default ModalEditUser;