import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Styles/connexion.css';
import { useAuth } from '../utilisateurs/AuthContext';

const Connexion = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1); // 1 = email, 2 = mot de passe
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  

  // 🔹 Étape 1 : Vérifier l’email
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/connexion/check-email', { email });

      if (res.data.exists) {
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Aucun compte associé à cet e-mail.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Étape 2 : Connexion complète

const { setUser } = useAuth();

const handleConnexion = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const { data } = await axios.post("/api/connexion", { email, pass });
    const { token, user } = data;

    // 🔐 Stockage persistant
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // 🔐 Mise à jour du contexte (source de vérité)
    setUser(user);

 // ✅ Redirection vers la page d'accueil pour tous les utilisateurs
setTimeout(() => {
  navigate('/accueil', { replace: true });
}, 0);

  } catch (error) {
    toast.error(error.response?.data?.message || "Mot de passe incorrect.");
    setPass("");
  } finally {
    setLoading(false);
  }
};




  return (
    <>
      <div className="container">
        <div className="logo">
          <img src="/Images/BACK/EBM-Solutions.png" alt="Logo EBM Solutions" />
        </div>

        <div className="login-form">
          <form onSubmit={step === 1 ? handleCheckEmail : handleConnexion}>
            <img src="/Images/icones/user/user.png" alt="" aria-hidden="true" />
            <h2>Connexion à votre espace</h2>

            {step === 1 && (
              <>
                <p>Saisissez votre adresse e-mail professionnelle.</p>

                <label htmlFor="email">Adresse e-mail</label>
                <input
                  id="email"
                  type="email"
                  placeholder="exemple@organisation.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />

                <button 
                  type="submit" 
                  disabled={loading}
                  aria-label="Continuer avec cet e-mail"
                >
                  {loading ? 'Vérification…' : 'Continuer'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <p>
                  Connexion en tant que <strong>{email}</strong>
                </p>

                <label htmlFor="password">Mot de passe</label>
                <div className="password-container">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                    required
                    autoFocus
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  >
                    <img className="eye-icon"
                      src={
                        showPassword
                          ? '/Images/icones/hide.png'
                          : '/Images/icones/view.png'
                      }
                      alt={showPassword ? "Œil barré" : "Œil visible"}
                    />
                  </button>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  aria-label="Se connecter à votre compte"
                >
                  {loading ? 'Connexion en cours…' : 'Se connecter'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>

      <footer className="footer-ebm">
        <p>
          <strong style={{ color: 'rgb(147, 89, 165)' }}>EBM Solutions</strong> — 
          Plateforme technologique de gestion des dossiers médicaux.
        </p>
        <p>© {new Date().getFullYear()} EBM Solutions. Tous droits réservés.</p>
      </footer>
    </>
  );
};

export default Connexion;