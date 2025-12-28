import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import ModalEditUser from './ModalEditUser';
import { toast } from 'react-toastify';

const MonProfil = () => {
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(true); // modal ouverte par défaut

  useEffect(() => {
  const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser({
            id: decoded.id,
            nom: decoded.nom || '',
            prenom: decoded.prenom || '',
            login: decoded.login || '',
            role_id: decoded.role_id || '',
          });
        } catch (err) {
          console.error("Erreur lors du décodage du token :", err);
        }
}
  }, []);

  const navigate = useNavigate();

  const handleSave = async (updatedUser) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`/api/utilisateurs/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      setIsModalOpen(false);
    } catch (err) {
      console.error("Erreur :", err);
      toast.error("Erreur lors de la mise à jour du profil.");
    }

    // ✅ Redirection après 1 seconde vers /utilisateurs
    setTimeout(() => {
      navigate('/accueil');
    }, 2000);
  };

  if (!user) return null;

  return (
    <ModalEditUser
      user={user}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSave={handleSave}
    />
  );
};

export default MonProfil;
