import axios from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { Link } from "react-router-dom";
import '../Styles/utilisateurs.css';
import PermissionGate from '../utilisateurs/PermissionGate';
import ConfirmationModal from './ConfirmationSuppModal';
import ModalEditUser from './ModalEditUser';
import { toast } from 'react-toastify';

const ListeUtilisateurs = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [searchNom, setsearchNom] = useState('');
  const [searchPrenom, setSearchPrenom] = useState('');
  const [searchLogin, setSearchLogin] = useState('');
  const [searchRole, setSearchRole] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

 /* useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);*/

  const fetchUtilisateurs = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.warning("Token non trouvé.");
      return;
    }

    try {
      const response = await axios.get('/api/utilisateurs', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUtilisateurs(response.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des utilisateurs.");
    }
  }, []);

  useEffect(() => {
    fetchUtilisateurs();
  }, [fetchUtilisateurs]);

  const handleEdit = (user) => {
    setEditingUser(null);
    setIsModalOpen(false);
    setTimeout(() => {
      setEditingUser(user);
      setIsModalOpen(true);
    }, 0);
  };

const handleSave = async (updatedUser) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.put(`/api/utilisateurs/${updatedUser.id_utilisateur}`, updatedUser, {
      headers: { Authorization: `Bearer ${token}` }
    });

   // toast.success(res.data.message || "Modifications enregistrées...Utilisateur mis à jour avec succès.");
    setIsModalOpen(false);

    // ✅ Met à jour uniquement l'utilisateur modifié dans le tableau
setUtilisateurs((prev) =>
  prev.map((u) =>
    u.id_utilisateur === res.data.utilisateur.id_utilisateur
      ? res.data.utilisateur
      : u
  )
);
  } catch (err) {
    console.error("Erreur lors de la modification :", err);
    toast.error("Erreur lors de la modification.");
  }
};
// Confirmation de suppression
  const confirmDelete = (user) => {
    setUserToDelete(user);
    setIsConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/utilisateurs/${userToDelete.id_utilisateur}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Utilisateur supprimé avec succès.");
      fetchUtilisateurs();
    } catch (err) {
      console.error('Erreur suppression :', err.response || err.message);
      toast.error("Erreur lors de la suppression.");
    } finally {
      setIsConfirmOpen(false);
      setUserToDelete(null);
    }
  };

  const cancelDeletion = () => {
    setIsConfirmOpen(false);
    setUserToDelete(null);
  };

  // Filres
  const filteredUsers = utilisateurs.filter((user) =>
  user.nom.toLowerCase().includes(searchNom.toLowerCase()) &&
  user.prenom.toLowerCase().includes(searchPrenom.toLowerCase()) &&
  user.login.toLowerCase().includes(searchLogin.toLowerCase()) &&
  (user.role || '').toLowerCase().includes(searchRole.toLowerCase())
);

// Paginnation
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  return (
    <>
      <div className="liste-Liste">
        <h1>Liste des utilisateurs</h1>

<div className="barre-recherche-clients">
  <input type="text" placeholder="Nom" value={searchNom}
    onChange={(e) => {
      setsearchNom(e.target.value);
      setCurrentPage(1);
    }}
  />
  <input type="text" placeholder="Prénom" value={searchPrenom}
    onChange={(e) => {
      setSearchPrenom(e.target.value);
      setCurrentPage(1);
    }}
  />
  <input type="text" placeholder="E-Mail" value={searchLogin}
    onChange={(e) => {
      setSearchLogin(e.target.value);
      setCurrentPage(1);
    }}
  />
   <input type="text" placeholder="Type Profil" value={searchRole}
    onChange={(e) => {
      setSearchRole(e.target.value);
      setCurrentPage(1);
    }}
  />

      <div style={{ paddingLeft: '10px' }}>
        <PermissionGate permission="utilisateur:ajouter">
          <Link className='lien-button' to="/inscription">
          <img src="/Images/edit/plus-1.png" alt="Ajouter"/>
            <span className="">Nouveau utilisateur</span>
          </Link>
        </PermissionGate>
      </div>
</div>
        <table>
          <thead>
            <tr>
              <th className="col-actions">Actions</th>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle (ID)</th>
              <th>Type-Profil</th>
              <th>Date création</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((user) => (
              <tr key={user.id_utilisateur}>
                <td className="col-actions">
                  <PermissionGate permission="utilisateur:supprimer">
                    <img src="/Images/edit/delete-6.png" alt="Supprimer" title="Supprimer" className="action-icon" onClick={() => confirmDelete(user)} />
                  </PermissionGate>
                  <PermissionGate permission="utilisateur:modifier">
                    <img src="/Images/edit/modif-2.png" alt="Modifier" title="Modifier" className="action-icon" onClick={() => handleEdit(user)} />
                  </PermissionGate>
                </td>
                <td>{user.nom}</td>
                <td>{user.prenom}</td>
                <td>{user.login}</td>
                <td>{user.role_id}</td>
                <td>{user.role || 'Inconnu'}</td>
                <td>{new Date(user.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
            <span className="chevron">&laquo;</span> Précédent
          </button>
          <span className='page-numbers'>Page {currentPage} / {totalPages}</span>
          <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
            Suivant <span className="chevron">&raquo;</span>
          </button>
        </div>

        <ModalEditUser
          user={editingUser}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />

        <ConfirmationModal
          isOpen={isConfirmOpen}
          message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete?.prenom} ${userToDelete?.nom} ?`}
          onConfirm={confirmDeletion}
          onCancel={cancelDeletion}
        />
      </div>
    </>
  );
};

export default ListeUtilisateurs;
