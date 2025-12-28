
import { useEffect, useState } from 'react';
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { ToastContainer, Zoom } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import './App.css';
import ListeClients from './components/Clients/ListeClients';
import GestionTypePrestations from './components/Prestations/TypesPrestations';
import Accueil from './components/menu/Accueil';
import Header from './components/menu/Header';
import PageInstruction from './components/menu/Page-construct';
import PrivateRoute from './components/menu/PrivateRoute';
import Sidebar from './components/menu/Sidebar';
import Connexion from './components/menu/connexion';
import MessageBanner from './components/message/MessageBanner';
import AffichProfil from './components/utilisateurs/AffichProfil';
import AjouterPermission from './components/utilisateurs/AjouterPermission';
import GestionPermissions from './components/utilisateurs/GestionPermissions';
import InscriptionUsers from './components/utilisateurs/Inscription-users';
import ListeUtilisateurs from './components/utilisateurs/ListeUtilisateurs';
import ModifProfil from './components/utilisateurs/ModifProfil';
import ListeContrats from './components/contrats/ListeContrats';
import ListeContratsResilies from './components/contrats/ListeContratsResilies';
import ListeContratsPrestations from './components/contrats/ListeContratsPrestations';
import AjouterContrat from './components/contrats/AjouterContrat';
import DetailsContrat from './components/contrats/DetailsContrat';
import ModifierContrat from './components/contrats/ModifierContrat';
import PrestationsContrat from './components/contrats/PrestationsContrat';
import ModifierPrestationsContrat from './components/contrats/ModifierPrestationsContrat';
import AfficherPrestationsContrat from './components/contrats/AfficherPrestationsContrat';
import ListeMedicaments from './components/medicaments/ListeMedicaments';
import ListeAdhesions from './components/affiliation/ListeAdhesions';
import AjouterAdhesion from './components/affiliation/FormulaireAdhesion';
import './index.css';

function AppContent({
  isAuthenticated,
  setIsAuthenticated,
  isSidebarOpen,
  setSidebarOpen,
  message,
  setMessage,
  messageType,
  setMessageType,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  //==================================================================================================== 
  // ================= 🔐 Vérification de l'expiration du token ======================================
  //==================================================================================================== 
  // 🔐 1. On utilise useEffect pour vérifier l'état de l'authentification à chaque chargement du composant
useEffect(() => {
  // 🔐 1. On récupère le token JWT depuis le localStorage
  const token = localStorage.getItem('token');

  if (token) {
    try {
      // ✅ 2. On décode le token pour lire les informations qu’il contient (notamment sa date d’expiration)
      const decoded = jwtDecode(token);

      // ⏱️ 3. On récupère l’heure actuelle en secondes (UNIX timestamp)
      const now = Date.now() / 1000;

      if (decoded.exp < now) {
        // ⛔ 4. Si le token est déjà expiré : on le supprime et on redirige vers la page de connexion
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        navigate('/');
      } else {
        // ✅ 5. Si le token est encore valide : on active la session
        setIsAuthenticated(true);

        // ⏳ 6. On calcule le temps restant avant l'expiration du token (en ms)
        const timeout = (decoded.exp - now) * 1000;

        // 🕒 7. On programme une déconnexion automatique dès que le token expire
        const timer = setTimeout(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          navigate('/');
        }, timeout);

        // 🧹 8. Nettoyage du timer si le composant se démonte (bonne pratique)
        return () => clearTimeout(timer);
      }

    } catch (err) {
      // ❌ 9. Si le token est invalide ou corrompu, on le supprime et on redirige
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      navigate('/');
    }

  } else {
    // 🔐 10. Si aucun token n’est présent : on force la déconnexion
    setIsAuthenticated(false);
    navigate('/');
  }

}, [navigate, setIsAuthenticated]); // ✅ Dépendances nécessaires à React

  //==================================================================================================== 
  // ================= Réinitialisation du message et gestion de la bannière ============================
  //==================================================================================================== 

  // Réinitialise le message à chaque navigation
  useEffect(() => {
    setMessage('');
  }, [location, setMessage]);

  // Efface le message après 4 secondes
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [message, setMessage]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };
  //==================================================================================================== 
  // ================= Rendu du composant principal de l'application ====================================
  //====================================================================================================
  return (
    <div className="app-container">
      {isAuthenticated && (
        <Header
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout}
          setMessage={setMessage}
          setMessageType={setMessageType}
        />
      )}
      <div className="body-layout">
        {isAuthenticated && <Sidebar isOpen={isSidebarOpen} />}
        <div className={`main-content ${isSidebarOpen ? '' : 'sidebar-closed'}`}>
          {message && (
            <MessageBanner
              message={message}
              type={messageType}
              onClose={() => setMessage('')}
            />
          )}
          <div className="page-content">
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/accueil" />
                  ) : (
                    <Connexion setIsAuthenticated={setIsAuthenticated} />
                  )
                }
              />
              <Route
                path="/accueil"
                element={
                  isAuthenticated ? <Accueil /> : <Navigate to="/" />
                }
              />
              <Route
                path="/inscription"
                element={
                  <PrivateRoute>
                    <InscriptionUsers
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />

            <Route path="/pageinstruction" element={<PageInstruction />} />

              <Route
                path="/gestion-types-prestations"
                element={
                  <PrivateRoute>
                    <GestionTypePrestations
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />

            <Route
              path="/ajouter-permission"
              element={
                <PrivateRoute>
                  <AjouterPermission
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
              <Route
                path="/permissions"
                element={
                  <PrivateRoute>
                    <GestionPermissions
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />

              <Route
                path="/utilisateurs"
                element={
                  <PrivateRoute>
                    <ListeUtilisateurs
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/affichprofil"
                element={
                  <PrivateRoute>
                    <AffichProfil
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/modifprofil"
                element={
                  <PrivateRoute>
                    <ModifProfil
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/listeclients"
                element={
                  <PrivateRoute>
                    <ListeClients
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/listecontrats"
                element={
                  <PrivateRoute>
                    <ListeContrats
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />
              <Route
                path="/ajouter-contrat"
                element={
                  <PrivateRoute>
                    <AjouterContrat
                      setMessage={setMessage}
                      setMessageType={setMessageType}
                    />
                  </PrivateRoute>
                }
              />
            <Route
             path="/contrats/:id_contrat/details"
              element={
                <PrivateRoute>
                  <DetailsContrat
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/contrats/:id_contrat/modifier"
              element={
                <PrivateRoute>
                  <ModifierContrat
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/contrats/:id_contrat/prestations"
              element={
                <PrivateRoute>
                  <PrestationsContrat
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/listecontratsresilies"
              element={
                <PrivateRoute>
                  <ListeContratsResilies
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/listecontratsprestations"
              element={
                <PrivateRoute>    
                  <ListeContratsPrestations
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/contrats/:id_contrat/modifier-prestations"
              element={
                <PrivateRoute>
                  <ModifierPrestationsContrat
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/contrats/:id_contrat/afficher-prestations"
              element={
                <PrivateRoute>
                  <AfficherPrestationsContrat
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />  
            <Route
              path="/listemedicaments"
              element={
                <PrivateRoute>    
                  <ListeMedicaments
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/ajouter-adhesion"
              element={
                <PrivateRoute>
                  <AjouterAdhesion
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
            <Route
              path="/listeadhesions"
              element={
                <PrivateRoute>    
                  <ListeAdhesions
                    setMessage={setMessage}
                    setMessageType={setMessageType}
                  />
                </PrivateRoute>
              }
            />
          </Routes>

          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  return (
    <Router>
     <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        transition={Zoom}
        />
      <AppContent
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        isSidebarOpen={isSidebarOpen}
        setSidebarOpen={setSidebarOpen}
        message={message}
        setMessage={setMessage}
        messageType={messageType}
        setMessageType={setMessageType}
      />
    </Router>
  );
}

export default App;
