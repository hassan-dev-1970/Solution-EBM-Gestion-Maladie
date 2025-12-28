import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import '../Clients/Style-clients/ListeClient.css';
import ConfirmationModal from '../utilisateurs/ConfirmationSuppModal';
import PermissionGate from '../utilisateurs/PermissionGate';
import ModalAjoutMedicament from './ModalAjoutMedicament';
import ModalEditMedicament from './ModalEditMedicament';

const ListeMedicaments = () => {
  const [medicaments, setMedicaments] = useState([]);
  const [, setError] = useState('');
  const [editingMedicaments, setEditingMedicaments] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAjoutModalOpen, setIsAjoutModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [medicamentsToDelete, setMedicamentsToDelete] = useState(null);
  const [searchMedicament, setSearchMedicament] = useState('');
  const [searchClassification, setSearchClassification] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [medicamentsPerPage , setMedicamentsPerPage] = useState(20);
  const [totalFiltered, setTotalFiltered] = useState(0);

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

  // Fonction pour récupérer la liste des medicaments depuis l'API
  const fetchMedicaments = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Token non trouvé.");
      return;
    }

    try {
       const response = await axios.get(
      `/api/medicaments?page=${currentPage}&limit=${medicamentsPerPage}&search=${searchMedicament}&classification=${searchClassification}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

      // Si le backend renvoie { results: [...], totalCount: 20 }, on prend results
      const data = response.data.results || response.data;
      setMedicaments(data);

      const total = response.data.totalCount || data.length;
      setTotalPages(Math.ceil(total / medicamentsPerPage));

    // Nombre total de medicaments filtrés après recherche
      setTotalFiltered(total);
      //==================================================
    } catch (err) {
      setError("Erreur lors du chargement des medicaments.");
      setMessageType('error');
    }
  }, [currentPage, searchMedicament, searchClassification, medicamentsPerPage]);

  useEffect(() => {
    fetchMedicaments();
  }, [fetchMedicaments]);

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingMedicaments(null);
  };

  const handleMedicamentUpdated = () => {
    fetchMedicaments();
    handleCloseEditModal();
  };

  // Gestion de l'édition d'un medicament
  const handleEdit = (medicaments) => {
    setEditingMedicaments(null);
    setIsEditModalOpen(false);
    setTimeout(() => {
      setEditingMedicaments(medicaments);
      setIsEditModalOpen(true);
    }, 0);
  };

  // Gestion de la suppression d'un medicament
  const confirmDelete = (medicaments) => {
    setMedicamentsToDelete(medicaments);
    setIsConfirmOpen(true);
  };

  const confirmDeletion = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/medicaments/${medicamentsToDelete.id_medicament}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage("Medicament supprimé avec succès.");
      setMessageType("success");
      fetchMedicaments();
    } catch (err) {
      setMessage("Erreur lors de la suppression.");
      setMessageType("error");
    } finally {
      setIsConfirmOpen(false);
      setMedicamentsToDelete(null);
    }
  };

  const cancelDeletion = () => {
    setIsConfirmOpen(false);
    setMedicamentsToDelete(null);
  };
// Filtrer les medicaments par classification
  const filteredMedicaments = medicaments.filter(m => (m.pp_gn || '').toLowerCase().includes(searchClassification.toLowerCase()));

  // Récupération du nombre total de medicaments
const [totalMedicaments, setTotalMedicaments] = useState(0);

const fetchTotalMedicaments = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/medicaments/total', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTotalMedicaments(response.data.total);
  } catch (err) {
    console.error('Erreur récupération total médicaments');
  }
};

// Appel au montage du composant
useEffect(() => {
  fetchTotalMedicaments();
}, []);

// Affichage de la liste des medicaments
  return (
    <div className="liste-Liste">
      <h2>Liste des Medicaments</h2>
<div className="barre-recherche-clients">

  <div className="input-tooltip">
    <input
      type="text"
      placeholder="Nom commercial du médicament"
      value={searchMedicament}
      onChange={(e) => {
        setSearchMedicament(e.target.value);
        setCurrentPage(1);
      }}
      onKeyDown={(e) => e.key === 'Escape' && setSearchMedicament('')}
    />
    <span className="tooltip-text">Appuyez sur Esc pour vider</span>
  </div>

  <div className="input-tooltip">
    <input
      type="text"
      placeholder="Classification"
      value={searchClassification}
      onChange={(e) => {
        setSearchClassification(e.target.value);
        setCurrentPage(1);
      }}
      onKeyDown={(e) => e.key === 'Escape' && setSearchClassification('')}
    />
    <span className="tooltip-text">Appuyez sur Esc pour vider</span>
  </div>

  <div className="input-tooltip">
  { (searchMedicament || searchClassification) && (
    <span className='nombre_total_filtre'>{totalFiltered} médicaments trouvés</span>
  )}
</div>

  <div className='container-btn-add'>

       <PermissionGate permission="medicament:ajouter">
        <button className="lien-button" onClick={() => setIsAjoutModalOpen(true)}>
          <img src="/Images/edit/plus-1.png" alt="Ajouter" />
          <span>Nouveau medicament</span>
        </button>
      </PermissionGate>
  </div> 

</div>

      <table>
        <thead>
          <tr>
            <th className="col-actions">Actions</th>
            <th>Nom commercial</th>
            <th>Statut-medicament</th>
            <th>Dosage</th>
            <th>Forme</th>
            <th>Classification</th>
            <th>Prix</th>
            <th>Présentation</th>
            <th>Remboursable</th>
          </tr>
        </thead>
        <tbody>
          {filteredMedicaments.map((medicament) => (
            <tr key={medicament.id_medicament}>
              <td className="col-actions">
                <PermissionGate permission="medicament:supprimer">
                  <img src="/Images/edit/delete-6.png" alt="Supprimer" title="Supprimer" className="action-icon"
                    onClick={() => confirmDelete(medicament)}
                  />
                </PermissionGate>
                <PermissionGate permission="medicament:modifier">
                  <img src="/Images/edit/modif-2.png" alt="Modifier" title="Modifier" className="action-icon"
                    onClick={() => handleEdit(medicament)}
                  />
                </PermissionGate>
              </td>
              <td>{medicament.nom_commercial}</td>
              <td>{medicament.statut_medicament}</td>
              <td>{medicament.dosage}</td>
              <td>{medicament.forme}</td>
              <td>{medicament.pp_gn}</td>
              <td>{medicament.ppv}</td>
              <td>{medicament.presentation}</td>
              <td>{medicament.remboursable}</td>
            </tr>
          ))}
        </tbody>
      </table>

 {/* Pagination Section */}
<div className="pagination-container">
  <div className="total-medicaments">
    Total médicaments : {totalMedicaments}
  </div>

<div className="pagination-buttons">
  {/*page suivante*/}
    <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
      	&lt;
    </button>
{/*dernière page*/}
    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
      &lt;&lt;
    </button>

      <div className='pages_numbers'>  
          <span className="page-info">
            Page {currentPage} / {totalPages}
          </span>
      </div>

      {/*page précèdente*/}
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
          >
          	&gt;
          </button>
          
          {/*première page*/}
          <button 
            onClick={() => setCurrentPage(totalPages)} 
            disabled={currentPage === totalPages}
          >
            &gt;&gt;
          </button>

      <div className="pagination-settings">
                
                  <select
                    value={medicamentsPerPage}
                    onChange={(e) => {
                      setMedicamentsPerPage(Number(e.target.value));
                      setCurrentPage(1); // reset page courante
                    }}
                  >
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                    <option value={100}>100 / page</option>
                  </select>
              
        </div>

  </div>
</div>



      <ModalAjoutMedicament
        isOpen={isAjoutModalOpen}
        onClose={() => setIsAjoutModalOpen(false)}
        onMedicamentAjoute={fetchMedicaments}
        setMessage={setMessage}
        setMessageType={setMessageType}
      />

      {isEditModalOpen && editingMedicaments && (
        <ModalEditMedicament
          medicamentData={editingMedicaments}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onMedicamentUpdated={handleMedicamentUpdated}
          setMessage={setMessage}
          setMessageType={setMessageType}
        />
      )}

      <ConfirmationModal
        isOpen={isConfirmOpen}
        message={`Êtes-vous sûr de vouloir supprimer le medicament ${medicamentsToDelete?.nom_commercial} ?`}
        onConfirm={confirmDeletion}
        onCancel={cancelDeletion}
      />
    </div>
  );
};

export default ListeMedicaments;
