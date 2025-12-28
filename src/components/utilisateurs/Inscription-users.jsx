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

  // Utilisation de useNavigate pour la navigation
    const navigate = useNavigate();
  // Retourner à la page de gestion des permissions
  const handleRetour = () => {
    navigate('/utilisateurs');
  };
  // Charger les rôles depuis l'API
  // et les stocker dans l'état local
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
      <h2>Inscription Utilisateur</h2>
      <form onSubmit={handleSubmit}>
        {/* Champ nom */}
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

        {/* Champ prénom */}
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

        {/* Champ email */}
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

        {/* Champ rôle dynamique */}
        <div className="form-group">
          <label htmlFor="role_id">Rôle</label>
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

        {/* Champ mot de passe */}
        <div className="form-group">
          <label htmlFor="pass">Mot de passe</label>
          <div className="input-wrapper">
            <input
              type="password"
              id="pass"
              name="pass"
              placeholder="********"
              value={formData.pass}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Champ confirmation mot de passe */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <div className="input-wrapper">
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="********"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="button-groupe">
          <button className="button-valider" type="submit">Valider</button>
          <button className="reset" type="reset" onClick={() => setFormData({
                nom: '',
                prenom: '',
                email: '',
                role_id: '',
                pass: '',
                confirmPassword: ''
              })
            }> Annuler</button>
          <button className="btn-retour" onClick={handleRetour}>Retour</button>
        </div>
      </form>
    </div>
  );
}

export default InscriptionUsers;
