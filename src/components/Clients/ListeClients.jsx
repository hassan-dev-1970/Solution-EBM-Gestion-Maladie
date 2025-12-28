import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import '../Clients/Style-clients/ListeClient.css';
import ConfirmationModal from '../utilisateurs/ConfirmationSuppModal';
import PermissionGate from '../utilisateurs/PermissionGate';
import ModalAjoutClient from './ModalAjoutClient';
import ModalEditClient from './ModalEditClient';

  const ListeClients = () => {
  const [clients, setClients] = useState([]);
  const [, setError] = useState('');
  const [editingClient, setEditingClient] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAjoutModalOpen, setIsAjoutModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [searchRaison, setSearchRaison] = useState('');
  const [searchAdresse, setSearchAdresse] = useState('');
  const [searchVille, setSearchVille] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const clientsPerPage = 10;

  const [message, setMessage] = useState('');
  const [, setMessageType] = useState('');

  // Masque automatique du message après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Fonction pour récupérer la liste des clients depuis l'API
  const fetchClients = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token non trouvé.");
      return;
    }

    try {
      const response = await axios.get('/api/clients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(response.data);
    } catch (err) {
      setError("Erreur lors du chargement des clients.");
      setMessageType('error');
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);


  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingClient(null);
  };

  const handleClientUpdated = () => {
    console.log('🔄 LISTE — appel handleClientUpdated');
    fetchClients();
    handleCloseEditModal();
  };

  const handleEdit = (client) => {
    setEditingClient(null);
    setIsEditModalOpen(false);
    setTimeout(() => {
      setEditingClient(client);
      setIsEditModalOpen(true);
    }, 0);
  };

  const confirmDelete = (client) => {
    setClientToDelete(client);
    setIsConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/clients/${clientToDelete.id_client}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Client supprimé avec succès.");
      setMessageType("success");
      fetchClients();
    } catch (err) {
      setMessage("Erreur lors de la suppression.");
      setMessageType("error");
    } finally {
      setIsConfirmOpen(false);
      setClientToDelete(null);
    }
  };

  const cancelDeletion = () => {
    setIsConfirmOpen(false);
    setClientToDelete(null);
  };

const filteredClients = clients.filter((client) =>
  client.raison_sociale.toLowerCase().includes(searchRaison.toLowerCase()) &&
  client.adresse.toLowerCase().includes(searchAdresse.toLowerCase()) &&
  client.ville.toLowerCase().includes(searchVille.toLowerCase())
);

  const indexOfLastClient = currentPage * clientsPerPage;
  const indexOfFirstClient = indexOfLastClient - clientsPerPage;
  const currentClient = filteredClients.slice(indexOfFirstClient, indexOfLastClient);
  const totalPages = Math.ceil(filteredClients.length / clientsPerPage);

  return (
    <div className="liste-Liste">
      <h2>Liste des Clients</h2>

<div className="barre-recherche-clients">

  <div className="input-tooltip">

  <input type="text" placeholder="Raison sociale" value={searchRaison}
    onChange={(e) => {
      setSearchRaison(e.target.value);
      setCurrentPage(1);
    }}
    onKeyDown={(e) => e.key === 'Escape' && setSearchRaison('')}
  />
   <span className="tooltip-text">Appuyez sur Esc pour vider</span>
  </div>

  <div className="input-tooltip">
  <input type="text" placeholder="Adresse" value={searchAdresse}
    onChange={(e) => {
      setSearchAdresse(e.target.value);
      setCurrentPage(1);
    }}
    onKeyDown={(e) => e.key === 'Escape' && setSearchAdresse('')}
  />
 <span className="tooltip-text">Appuyez sur Esc pour vider</span>
  </div>

  <div className="input-tooltip">
  <input type="text" placeholder="Ville" value={searchVille}
    onChange={(e) => {
      setSearchVille(e.target.value);
      setCurrentPage(1);
    }}
  onKeyDown={(e) => e.key === 'Escape' && setSearchVille('')}
  />
 <span className="tooltip-text">Appuyez sur Esc pour vider</span>
  </div>

<div className='container-btn-add'>
     <PermissionGate permission="client:ajouter">
        <button className="lien-button" onClick={() => setIsAjoutModalOpen(true)}>
          <img src="/Images/edit/plus-1.png" alt="Ajouter" />
          <span>Nouveau client</span>
        </button>
      </PermissionGate>
      </div>
</div>

      <table>
        <thead>
          <tr>
            <th className="col-actions">Actions</th>
            <th>Raison sociale</th>
            <th>Adresse</th>
            <th>Ville</th>
            <th>Contact</th>
            <th>Téléphone</th>
            <th>Email</th>
            <th>Agence</th>
            <th>Commercial</th>
            <th>Date création</th>
          </tr>
        </thead>
        <tbody>
          {currentClient.map((client) => (
            <tr key={client.id_client}>
              <td className="col-actions">
                <PermissionGate permission="client:supprimer">
                  <img src="/Images/edit/delete-6.png" alt="Supprimer" title="Supprimer" className="action-icon"
                  onClick={() => confirmDelete(client)}
                  />
                </PermissionGate>
                <PermissionGate permission="client:modifier">
                  <img src="/Images/edit/modif-2.png" alt="Modifier" title="Modifier" className="action-icon"
                    onClick={() => handleEdit(client)}
                  />
                </PermissionGate>
              </td>
              <td>{client.raison_sociale}</td>
              <td>{client.adresse}</td>
              <td>{client.ville}</td>
              <td>{client.personne_contact}</td>
              <td>{client.tel}</td>
              <td>{client.mail}</td>
              <td>{client.agence}</td>
              <td>{client.commercial}</td>
              <td>{new Date(client.date_creation).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
          <span className="chevron">&laquo;</span> Précédent
        </button>
        <span className="page-numbers">Page {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
          Suivant <span className="chevron">&raquo;</span>
        </button>
      </div>

      <ModalAjoutClient
        isOpen={isAjoutModalOpen}
        onClose={() => setIsAjoutModalOpen(false)}
        onClientAjoute={fetchClients}
        setMessage={setMessage}
        setMessageType={setMessageType}
      />

      {isEditModalOpen && editingClient && (
        <ModalEditClient
          clientData={editingClient}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onClientUpdated={handleClientUpdated}
          setMessage={setMessage}
          setMessageType={setMessageType}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        message={`Êtes-vous sûr de vouloir supprimer le client ${clientToDelete?.raison_sociale} ?`}
        onConfirm={confirmDeletion}
        onCancel={cancelDeletion}
      />
    </div>
  );
};

export default ListeClients;