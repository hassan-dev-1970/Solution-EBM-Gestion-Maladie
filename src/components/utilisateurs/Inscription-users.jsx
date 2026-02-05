import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Styles/Inscription-user.css';

function InscriptionUsers() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    role_id: '',
    pass: '',
    confirmPassword: ''
  });

  const [roles, setRoles] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Utilisation de useNavigate pour la navigation
  const navigate = useNavigate();
  
  // Retourner à la page de gestion des permissions
  const handleRetour = () => {
    navigate('/utilisateurs');
  };
  
  // Charger les rôles depuis l'API
  useEffect(() => {
    axios.get('/api/roles')
      .then((res) => setRoles(res.data))
      .catch((err) => {
        console.error('Erreur lors du chargement des rôles :', err);
        toast.info("Impossible de charger les rôles");
      });
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'role_id'
        ? parseInt(e.target.value, 10)
        : e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.pass !== formData.confirmPassword) {
      toast.warning("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const { nom, prenom, email, role_id, pass } = formData;

      const token = localStorage.getItem('token');

      const response = await axios.post('/api/utilisateurs', {
        nom,
        prenom,
        login: email,
        role_id,
        password: pass
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      toast.success(response.data.message || 'Utilisateur ajouté avec succès !');
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        role_id: '',
        pass: '',
        confirmPassword: ''
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => {
        navigate('/utilisateurs');
      }, 1000);

    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <div className="form-container"> 
      <h2 className="titre-modal">Inscription Utilisateur</h2>
      <form onSubmit={handleSubmit}>
        {/* Tous les champs en colonne verticale */}
        <div className="form-group">
          <label htmlFor="nom">Nom</label>
          <div className="input-wrapper">
            <input 
              type="text" 
              id="nom"
              name="nom"
              placeholder="Votre nom"
              value={formData.nom}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="prenom">Prénom</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="prenom"
              name="prenom"
              placeholder="Votre prénom"
              value={formData.prenom}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Votre email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="role_id">Rôle</label>
          <div className="input-wrapper">
            <select
              id="role_id"
              name="role_id"
              value={formData.role_id || ''}
              onChange={handleChange}
              required
              style={{}}              
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

        {/* Mot de passe avec toggle */}
        <div className="form-group">
          <label htmlFor="pass">Mot de passe</label>
          <div className="input-wrapper password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              id="pass"
              name="pass"
              placeholder="********"
              value={formData.pass}
              onChange={handleChange}
              required
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

        {/* Confirmation mot de passe avec toggle */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <div className="input-wrapper password-input-wrapper">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
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

        {/* Boutons */}
        <div className="btn-group bottom group-buttons">
          <button className="btn btn-success" type="submit">Valider</button>
          <button className="btn btn-annuler" type="button" onClick={() => setFormData({
              nom: '',
              prenom: '',
              email: '',
              role_id: '',
              pass: '',
              confirmPassword: ''
            })}
          >
            Annuler
          </button>
          <button className="btn btn-retour" onClick={handleRetour}>Retour</button>
        </div>
      </form>
    </div>
  );
}

export default InscriptionUsers;