import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../contrats/Styles-contrats/ListeContrats.css';
import { useAuth } from "../utilisateurs/AuthContext";
import PermissionGate from '../utilisateurs/PermissionGate';
import { getAdhesionRouteByRole } from '../affiliation/adhesionRoutes';
import useConfirmToast from '../useConfirmToast';


const ListeAdhesions = () => {
  const [adhesions, setAdhesions] = useState([]);
  const [clients, setClients] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownRef = useRef(null);
  const [searchRaison, setSearchRaison] = useState('');
  const [searchPolice, setSearchPolice] = useState('');
  const [searchCie, setSearchCie] = useState('');
  const [searchAssure, setSearchAssure] = useState('');
  const [searchIdentite, setsearchIdentite] = useState('');
  const [searchMatricule, setsearchMatricule] = useState('');
  const [searchTypeContrat, setSearchTypeContrat] = useState('');
  const [searchDateAdhesion, setSearchDateAdhesion] = useState('');
  const [searchSouscripteur] = useState('');
  const [policesParContrat, setPolicesParContrat] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [filteredAdhesions, setFilteredAdhesions] = useState([]);

  const navigate = useNavigate();
  const adhesionsParPage = 20;

const { user } = useAuth();
const adhesionRoute = getAdhesionRouteByRole(user);


  /* =======================
     FETCH ADHESIONS
  ======================= */
  useEffect(() => {
    const fetchAdhesions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setError("Token requis");

      try {
        const res = await axios.get("/api/adhesions", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = Array.isArray(res.data) ? res.data : [];
        setAdhesions(data);
        setFilteredAdhesions(data);
      } catch (err) {
        console.error(err);
        setError("Erreur chargement adhésions");
      }
    };

    fetchAdhesions();
  }, []);



  // 🔄 Charger les clients depuis l'API
useEffect(() => {
    const fetchClients = async () => {
      const token = localStorage.getItem('token');
    if (!token) return setError("Token non trouvé. Veuillez vous reconnecter.");
      try {
        const res = await axios.get('/api/clients', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setClients(res.data);
      } catch (err) {
        console.error('Erreur chargement clients', err);
      }
    };

    fetchClients();
  }, []);



  // 🔄 Charger les contrats depuis l'API
  const fetchContrats = async () => {
    const token = localStorage.getItem('token');
    if (!token) return setError("Token non trouvé. Veuillez vous reconnecter.");

    try {
      const res = await axios.get('/api/contrats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Contrats chargés :', res.data);
      setContrats(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur Axios :', err.response || err.message);
      setError("Erreur lors du chargement des contrats.");
    }
  };

  useEffect(() => { fetchContrats(); }, []);
  

  // ⏳ Effacer les messages après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

useEffect(() => {
  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownOpenId(null);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  // 🗂️ Filtrer les polices par contrat
useEffect(() => {
    if (searchRaison) {
      const filtered = contrats
        .filter(c => c.id_client === parseInt(searchRaison))
        .map(c => c.police);
      setPolicesParContrat(filtered);
    } else {
      setPolicesParContrat([]);
    }
  }, [searchRaison, contrats]);

// Filtre les adhesions par client et police 
useEffect(() => {
  let data = [...adhesions];

  // 🔍 Client
  if (searchRaison) {
    data = data.filter(a => a.id_client === Number(searchRaison));
  }

  // 🔍 Police
  if (searchPolice) {
    data = data.filter(a =>
      a.num_police?.toLowerCase().includes(searchPolice.toLowerCase())
    );
  }

  // 🔍 Assuré
  if (searchAssure) {
    data = data.filter(a => a.id_adhesion === Number(searchAssure));
  }

  // 🔍 Type contrat
  if (searchTypeContrat) {
    data = data.filter(a => a.type_contrat === searchTypeContrat);
  }

  // 🔍 Souscripteur
  if (searchSouscripteur) {
    data = data.filter(a =>
      a.souscripteur?.toLowerCase().includes(searchSouscripteur.toLowerCase())
    );
  }

  // 🔍 Police par compagnie
  if (searchCie) {
    data = data.filter(a => a.compagnie === searchCie);
  }

  // 🔍 Date d'adhésion
  if (searchDateAdhesion) {
    data = data.filter(a => a.date_adhesion === searchDateAdhesion);
  }

  // 🔍 Identité
  if (searchIdentite) {
    data = data.filter(a => {
      const fullName = `${a.nom} ${a.prenom}`.toLowerCase();
      return fullName.includes(searchIdentite.toLowerCase());
    });
  }

  

  setCurrentPage(1);          // reset pagination
  setFilteredAdhesions(data);
}, [
  searchRaison,
  searchPolice,
  searchAssure,
  searchTypeContrat,
  searchSouscripteur,
  searchCie,
  searchDateAdhesion,
  searchIdentite,
  adhesions
]);

  // 🗑️ Supprimer un assure
  const { showConfirm } = useConfirmToast();
  const supprimerAssure = async (id_adhesion) => {
    showConfirm(
          "Voulez-vous vraiment supprimer cet assuré ?",
          async () => {
            try {
              const token = localStorage.getItem('token');
              await axios.delete(`/api/adhesions/${id_adhesion}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              toast.success("Assuré supprimé avec succès.");
              fetchContrats();
            } catch (err) {
              console.error("Erreur suppression assuré", err);
              toast.error("Erreur lors de la suppression.");
           }
          },
          {
            confirmText: "Supprimer",
            cancelText: "Annuler",
            confirmColor: "#dc3545"
            // Vous pouvez aussi personnaliser les couleurs si besoin
          }
        );
      };


  // 📄 Pagination
const totalPages = Math.ceil(filteredAdhesions.length / adhesionsParPage);
const currentAdhesions = filteredAdhesions.slice(
  (currentPage - 1) * adhesionsParPage,
  currentPage * adhesionsParPage
);

  return (
    <div className="liste-Liste">
      <h1>Liste des adhésions</h1>

      {error && <p className="error">{error}</p>}

              {/* 🔎 Barre de Recherche */}

              <div className='Rech-Simple'>

              {/* 🔎 Recherche par Raison Sociale */}
              <select className='select-search' name="id_client" value={searchRaison}
                onChange={e => {
                  setSearchRaison(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">-- Sélectionner un client --</option>
                {clients.map((client) => (
                  <option key={client.id_client} value={client.id_client}>
                    {client.raison_sociale}
                  </option>
                ))}
              </select>

              {/* 🔎 Police par client */}
              <select className='select-search' name="police" value={searchPolice}
                onChange={(e) => {
                  setSearchPolice(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">-- N° Police --</option>
                {policesParContrat.map((police, index) => (
                  <option key={index} value={police}>{police}</option>
                ))}
              </select>
           
            {/* 🔎 Recherche par Assuré */}
              <select className='select-search' name="id_adhesion" value={searchAssure}
                onChange={e => {
                  setSearchAssure(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="">-- Sélectionner un assuré --</option>
                {adhesions.map((assure) => (
                  <option key={assure.id_adhesion} value={assure.id_adhesion}>
                    {assure.nom} {assure.prenom}
                  </option>
                ))}
              </select>

              {/* Bouton + pour Recherche Avancée */}
              <button
                className="btn-advanced-search"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                title="Recherche avancée"
                type="button"
              >
                {showAdvancedSearch ? '− Masqué' : '+ Recherche Avancée'}
                </button>
              <PermissionGate permission="adhesion:ajouter">
                <button onClick={() => navigate(adhesionRoute)} className="lien-button buton-add-adh">
                  <img src="/Images/edit/plus-1.png" alt="Ajouter" className="icon-plus" />
                  Nouveau Adhérent
                </button>
              </PermissionGate>
          </div>
            {/* Zone Recherche Avancée */}
            {showAdvancedSearch && (
              <div className="zone-recherche-avancee">
                 {/* 🔎 Recherche par Identité */}
                <input type="text" placeholder="Identité" className='input-s' value={searchIdentite}
                        onChange={(e) => {
                          setsearchIdentite(e.target.value);
                          setCurrentPage(1);
                        }}
                      />

                {/* 🔎 Recherche par Matricule */}
                <input type="text" placeholder="Matricule" value={searchMatricule}
                  onChange={(e) => {
                    setsearchMatricule(e.target.value);
                    setCurrentPage(1); }}/>

                {/* 🔎 Recherche par Compagnie */}
                <select className='select-search' name="compagnie" value={searchCie} onChange={(e) => {
                  setSearchCie(e.target.value);
                  setCurrentPage(1);
                }}>
                  <option value="">-- Compagnie --</option>
                  <option value="SANLAM">Sanlam Maroc</option>
                  <option value="AXA">AXA Assurance Maroc</option>
                  <option value="Wafa Assurance">Wafa Assurance</option>
                  <option value="RMA">RMA</option>
                  <option value="MCMA">MCMA</option>
                  <option value="La Marocaine Vie">La Marocaine Vie</option>
                  <option value="Allianz Maroc">Allianz Maroc</option>
                </select>

                {/* 🔎 Recherche par Type de Contrat */}
                <select className='select-search' name="type_contrat" value={searchTypeContrat} onChange={(e) => {
                  setSearchTypeContrat(e.target.value);
                  setCurrentPage(1);
                }}>
                  <option value="">-- Type de contrat --</option>
                  <option value="Classique">Classique</option>
                  <option value="AMC">AMC</option>
                  <option value="Individuel Sante">Individuel Santé</option>
                </select>

                {/* 🔎 Recherche par Date d'Adhésion */}
                <input type="date" placeholder="Date d'adhésion" value={searchDateAdhesion}
                  onChange={(e) => {
                    setSearchDateAdhesion(e.target.value);
                    setCurrentPage(1); }}/>                            

              
              </div>
            )}

      <table className="table-contrats">
        <thead>
          <tr>
            <th className="col-actions">Actions</th>
            <th>Assuré</th>
            <th>Souscripteur</th>
            <th>Police</th>
            <th>Compagnie</th>            
            <th>Type Contrat</th>
            <th>Date Adhésion</th>
            <th>Statut Adhésion</th>
            <th>Date Statut</th>
          </tr>
        </thead>
        <tbody>
          {currentAdhesions.map((assure) => (
            <tr key={assure.id_adhesion}>
              <td className="col-actions">
                <div className="dropdown-container-LC">
                  <button
                    className="dropdown-toggle-LC"
                    onClick={() =>
                      setDropdownOpenId(dropdownOpenId === assure.id_adhesion ? null : assure.id_adhesion)} >
                    <img src="/Images/edit/settings-7.png" alt="Outils" className="action-icon-settings" />
                  </button>

                  {dropdownOpenId === assure.id_adhesion && (
                    <>
                      <ul className="dropdown-menu-LC" ref={dropdownRef}>

                        <PermissionGate permission="adhesion:voir">
                            <li onClick={() => setDropdownOpenId(null)}>
                              <Link to={`/adhesions/${assure.id_adhesion}/details`} className="dropdown-link-LC">
                                <img src="/Images/edit/detail-3.png" alt="Détails" className="action-icon" />
                                Détails
                              </Link>
                            </li>
                          </PermissionGate>

                          <PermissionGate permission="adhesion:modifier">
                            <li onClick={() => setDropdownOpenId(null)}>
                              <Link to={`/adhesions/${assure.id_adhesion}/modifier`} className="dropdown-link-LC">
                                <img src="/Images/edit/modif-2.png" alt="Modifier" className="action-icon" />
                                Modifier
                              </Link>
                            </li>
                          </PermissionGate>
                        <PermissionGate permission="adhesion:supprimer">
                          <li onClick={() => { supprimerAssure(assure.id_adhesion); setDropdownOpenId(null); }}>
                            <img src="/Images/edit/delete-6.png" alt="Supprimer" className="action-icon" /> Supprimer
                          </li>
                        </PermissionGate>
                      </ul>
                    </>
                  )}
                </div>
              </td>
              <td>{assure.nom} {assure.prenom}</td>
              <td>{assure.raison_sociale}</td>
              <td>{assure.num_police}</td>
              <td>{assure.compagnie}</td>
              <td>{assure.type_contrat || "-"}</td>
              <td>{new Date(assure.date_adhesion).toLocaleDateString()}</td>
              <td>{assure.statut_adhesion}</td>
              <td>{new Date(assure.date_statut).toLocaleDateString()}</td>
              </tr>
          ))}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
          <span className="chevron">&laquo;</span> Précédent
        </button>
        <span className='page-numbers'>Page {currentPage} / {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
          Suivant <span className="chevron">&raquo;</span>
          </button>
      </div>
    </div>
  );
};

export default ListeAdhesions;