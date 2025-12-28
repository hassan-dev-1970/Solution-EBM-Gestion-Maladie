import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MessageBanner from '../message/MessageBanner';
import ModalAjoutTypePrestation from './ModalAjoutTypePrestation';
import ModalEditTypePrestation from './ModalEditTypePrestation';
import ConfirmationModal from '../utilisateurs/ConfirmationSuppModal';
import PermissionGate from '../utilisateurs/PermissionGate';
import '../Prestations/TypesPrestations.css';

const TypesPrestations = () => {
  const [types, setTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const typesPerPage = 20;

  const [selectedType, setSelectedType] = useState(null);
  const [isAjoutOpen, setIsAjoutOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const token = localStorage.getItem('token');

  const fetchTypes = async () => {
    try {
      const res = await axios.get('/api/types-prestations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTypes(res.data);
    } catch {
      setMessage('Erreur lors du chargement');
      setMessageType('error');
    }
  };

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axios.get('/api/types-prestations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTypes(res.data);
      } catch {
        setMessage('Erreur lors du chargement');
        setMessageType('error');
      }
    };
    fetchTypes();
  }, [token]);

  useEffect(() => {
    const filtered = types.filter(t =>
      t.libelle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTypes(filtered);
    setCurrentPage(1); // Reset à la première page
  }, [searchTerm, types]);

  const indexOfLast = currentPage * typesPerPage;
  const indexOfFirst = indexOfLast - typesPerPage;
  const currentTypes = filteredTypes.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredTypes.length / typesPerPage);

  const handleAjout = async (form) => {
    try {
      await axios.post('/api/types-prestations', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Type ajouté avec succès');
      setMessageType('success');
      fetchTypes();
    } catch {
      setMessage('Erreur lors de l’ajout');
      setMessageType('error');
    }
  };

  const handleUpdate = async (form) => {
    try {
      await axios.put(`/api/types-prestations/${form.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Type mis à jour');
      setMessageType('success');
      fetchTypes();
    } catch {
      setMessage('Erreur lors de la modification');
      setMessageType('error');
    }
  };

  // Fonction pour confirmer la suppression d'un type de prestation
  const confirmDelete = (type) => {
    setSelectedType(type);
    setIsConfirmOpen(true);
  };

  const handleDelete = async () => {
    try {
    const token = localStorage.getItem('token');
      await axios.delete(`/api/types-prestations/${selectedType.id_type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Type supprimé');
      setMessageType('success');
      fetchTypes();
    } catch {
      setMessage('Erreur lors de la suppression');
      setMessageType('error');
    } finally {
      setIsConfirmOpen(false);
      setSelectedType(null);
    }
  };
  // Fonction pour annuler la suppression
  const cancelDeletion = () => {
    setIsConfirmOpen(false);
    setSelectedType(null);
  };
  return (
    <div className="liste-Liste">
      <h2>Types de Prestations</h2>

      {message && (
        <MessageBanner
          message={message}
          type={messageType}
          onClose={() => setMessage('')}
        />
      )}

        <input
          type="text"
          placeholder="🔍 Rechercher un type"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-recherche"
        />
        <button className="lien-button" onClick={() => setIsAjoutOpen(true)}>
          <span> ➕ Ajouter un type</span> </button>

      <table>
        <thead>
          <tr>
            <th className="col-actions">Actions</th>
            <th>Code-Prestations</th>
            <th>Libellé</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {currentTypes.map((t) => (
            <tr key={t.id_type}>
              <td className="col-actions">
                <PermissionGate permission="client:supprimer">
                  <img
                    src="/Images/edit/delete-6.png"
                    alt="Supprimer"
                    title="Supprimer"
                    className="action-icon"
                    onClick={() => confirmDelete(t)}
                  />
                </PermissionGate>
                <PermissionGate permission="client:modifier">
                  <img
                    src="/Images/edit/modif-2.png"
                    alt="Modifier"
                    title="Modifier"
                    className="action-icon"
                    onClick={() => {setSelectedType(t); setIsEditOpen(true); }}/>
                </PermissionGate>
              </td>
              <td>{t.id_type}</td>

              <td>{t.libelle}</td>

              <td>{t.description}</td>
              </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
        Précédent
        </button>
        <span>Page {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Suivant
        </button>
      </div>

      {/* Modale Ajout */}
      {isAjoutOpen && (
        <ModalAjoutTypePrestation
          onClose={() => setIsAjoutOpen(false)}
          onSave={handleAjout}
        />
      )}

      {/* Modale Edition */}
      {isEditOpen && (
        <ModalEditTypePrestation
          typeData={selectedType}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedType(null);
          }}
          onSave={handleUpdate}
        />
      )}

      {/* Modale Suppression */}
      <ConfirmationModal
        isOpen={isConfirmOpen}
        message={`Êtes-vous sûr de vouloir supprimer ce type de prestation ${selectedType?.libelle} ?`}
        onConfirm={handleDelete}
        onCancel={cancelDeletion}
      />
    </div>
  );
};

export default TypesPrestations;
