import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ModalViewUser from '../utilisateurs/AffichProfil';
import ModalEditUser from '../utilisateurs/ModalEditUser'; // <-- modale de modification
import { useAuth } from '../utilisateurs/AuthContext';

import '../Styles/Header.css';

const Header = ({ setSidebarOpen, onLogout, setMessage, setMessageType }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // modale "voir profil"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // modale "modifier"
  const [editingUser, setEditingUser] = useState(null); // user en édition
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth(); // Récupère l'utilisateur depuis le contexte d'authentification

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(prev => !prev);
  };

  // Ferme le menu utilisateur si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ouvre la modale de modification du profil (avec reset propre)
  const openEditProfile = () => {
    setEditingUser(null);
    setIsEditModalOpen(false);

    setTimeout(() => {
      const token = localStorage.getItem('token');
      if (token) {
        const decoded = jwtDecode(token);
        setEditingUser({
          id: decoded.id,
          nom: decoded.nom || '',
          prenom: decoded.prenom || '',
          login: decoded.login || '',
        });
        setIsEditModalOpen(true);
      }
    }, 0);
  };

  // Sauvegarde du profil modifié
const handleSaveProfil = async (updatedUser) => {
  try {
    const token = localStorage.getItem('token');

    // ✅ Adapter le corps de la requête pour correspondre au backend
    const userToSend = {
      id: updatedUser.id,
      nom: updatedUser.nom,
      prenom: updatedUser.prenom,
      login: updatedUser.login,
      ...(updatedUser.password && { pass: updatedUser.password }) // renomme "password" en "pass"
    };

    await fetch(`/api/utilisateurs/${userToSend.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(userToSend),
    });

    setMessage && setMessage("Profil mis à jour avec succès.");
    setMessageType && setMessageType("success");
    setIsEditModalOpen(false);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
    setMessage && setMessage("Erreur lors de la mise à jour.");
    setMessageType && setMessageType("error");
  }
};


  return (
    <>
      <header>
        <button onClick={toggleSidebar} className="toggle-btn">&#9776;</button>
        <img className="logo-EBM" src="/Images/logo-EBM.png" alt="Logo EBM" />

        <div className="header-links">
          <Link to="/accueil">Accueil</Link>
          <Link to="#">Contact</Link>
          <Link to="#" onClick={handleLogout}>Se déconnecter</Link>
        </div>

        <div className="user-info" onClick={toggleUserMenu} ref={userMenuRef}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" className="size-6">
            <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
          </svg>
          <span className="username">
            {user ? (user.nom ? `${user.prenom} ${user.nom}` : user.login) : "Utilisateur"}
          </span>
         
         {/*Liste des paramètres utilisateur */}
          <div className="dropdown-icon">▼</div>
          {isUserMenuOpen && (
            <div className="user-menu">
              <Link to="#" onClick={() => setIsModalOpen(true)}>Voir mon profil</Link>
              <Link to="#" onClick={openEditProfile}>Modifier mon profil</Link>
              <Link to="#">Paramètres</Link>
              <Link to="#" onClick={handleLogout}>Déconnexion</Link>
            </div>
          )}
        </div>
      </header>
      {/* Modale : Voir profil */}
      <ModalViewUser
        user={user}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modale : Modifier profil */}
      <ModalEditUser
        user={editingUser}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveProfil}
        setMessage={setMessage || (() => {})}
        setMessageType={setMessageType || (() => {})}
      />
    </>
  );
};

export default Header;

