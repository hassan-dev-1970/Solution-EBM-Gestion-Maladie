import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
//import { toast } from 'react-toastify';
import PermissionGate from '../utilisateurs/PermissionGate';
import './Styles-contrats/ListeContrats.css';

const ListeContratsPrestations = () => {
  const [contrats, setContrats] = useState([]);
  const [clients, setClients] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownRef = useRef(null);
  const [searchRaison, setSearchRaison] = useState('');
  const [searchPolice, setSearchPolice] = useState('');
  const [searchCie, setSearchCie] = useState('');
  const [searchTypeContrat, setSearchTypeContrat] = useState('');
  const [searchDateDebut, setSearchDateDebut] = useState('');
  const [policesParContrat, setPolicesParContrat] = useState([]);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);

  const navigate = useNavigate();
  const contratsParPage = 10;

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

      // Vérifier pour chaque contrat s'il a déjà des prestations
      const contratsAvecPrestations = await Promise.all(
        res.data.map(async (contrat) => {
          try {
            const checkRes = await axios.get(
              `/api/contrats/${contrat.id_contrat}/has-prestations`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            return { ...contrat, hasPrestations: checkRes.data.hasPrestations };
          } catch (err) {
            console.error("❌ Erreur vérif prestations :", err);
            return { ...contrat, hasPrestations: false };
          }
        })
      );

      setContrats(Array.isArray(contratsAvecPrestations) ? contratsAvecPrestations : []);
    } catch (err) {
      console.error('Erreur Axios :', err.response || err.message);
      setError("Erreur lors du chargement des contrats.");
    }
  };

  useEffect(() => { fetchContrats(); }, []);


  // ⏲️ Effacer les messages après 3 secondes
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // 🔽 Fermer le dropdown si clic en dehors
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


  // 🔍 Filtrage
  const filteredContrat = contrats.filter((contrat) =>
  contrat.police.toLowerCase().includes(searchPolice.toLowerCase()) &&
  contrat.compagnie.toLowerCase().includes(searchCie.toLowerCase()) &&
  contrat.type_contrat.toLowerCase().includes(searchTypeContrat.toLowerCase()) &&
  (searchDateDebut ? new Date(contrat.date_debut).toLocaleDateString().includes(searchDateDebut) : true) 
 );

  // 📄 Pagination
  const totalPages = Math.ceil(filteredContrat.length / contratsParPage);
  const currentContrats = filteredContrat.slice(
    (currentPage - 1) * contratsParPage,
    currentPage * contratsParPage
  );

  return (
    <div className="liste-Liste">
      <h1>Gestion des Prestations</h1>

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
           
              {/* Bouton + pour Recherche Avancée */}
              <button
                className="btn-advanced-search"
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                title="Recherche avancée"
                type="button">
                {showAdvancedSearch ? '− Masqué' : '+ Recherche Avancée'}
                </button>

              
          </div>
            {/* Zone Recherche Avancée */}
            {showAdvancedSearch && (
              <div className="zone-recherche-avancee">
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

                <select className='select-search' name="type_contrat" value={searchTypeContrat} onChange={(e) => {
                  setSearchTypeContrat(e.target.value);
                  setCurrentPage(1);
                }}>
                  <option value="">-- Type de contrat --</option>
                  <option value="Classique">Classique</option>
                  <option value="AMC">AMC</option>
                  <option value="Individuel Sante">Individuel Santé</option>
                </select>

                <input type="date" placeholder="Date de début" value={searchDateDebut}
                  onChange={(e) => {
                    setSearchDateDebut(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}

      <table className="table-contrats">
        <thead>
          <tr>
            <th className="col-actions">Actions</th>
            <th>Client</th>
            <th>Police</th>
            <th>Compagnie</th>
            <th>Agence</th>
            <th>Type</th>
            <th>Début</th>
            <th>Fin</th>
            <th>Catégories</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          {currentContrats.map((contrat) => (
            <tr key={contrat.id_contrat}>
              <td className="col-actions">
                <div className="dropdown-container-LC">
                  <button
                    className="dropdown-toggle-LC"
                    onClick={() =>
                      setDropdownOpenId(dropdownOpenId === contrat.id_contrat ? null : contrat.id_contrat)} >
                    <img src="/Images/edit/settings-7.png" alt="Outils" className="action-icon-settings" />
                  </button>

                  {dropdownOpenId === contrat.id_contrat && (
                    <ul className="dropdown-menu-LC" ref={dropdownRef}>

                      <PermissionGate permission="prestations:voir">
                      <li onClick={() => setDropdownOpenId(null)}>
                        <Link to={`/contrats/${contrat.id_contrat}/afficher-prestations`} className="dropdown-link-LC">
                          <img src="/Images/edit/detail-3.png" alt="Détails" className="action-icon" /> 
                          Détails-Prestations
                        </Link>
                      </li>
                    </PermissionGate>

                     <PermissionGate permission="prestations:ajouter">
                        <li
                          className={contrat.hasPrestations ? "disabled-item" : ""}
                          onClick={() => {
                            if (!contrat.hasPrestations) {
                              navigate(`/contrats/${contrat.id_contrat}/prestations`, {
                                state: { from: "/listecontratsprestations" }
                              });
                              setDropdownOpenId(null);
                            }
                          }}
                        >
                          <img src="/Images/edit/plus-4.png" alt="outil" className="action-icon" />
                          {contrat.hasPrestations ? "Prestations déjà ajoutées" : "Ajouter-Prestations"}
                        </li>
                      </PermissionGate>

                            <PermissionGate permission="prestations:modifier">
                              <li onClick={() => setDropdownOpenId(null)}>
                                <Link to={`/contrats/${contrat.id_contrat}/modifier-prestations`} 
                                  className="dropdown-link-LC"> <img src="/Images/edit/modif-2.png" alt="Modifier" 
                                    className="action-icon" /> 
                                  Modifier-Prestations
                                </Link>                          
                              </li>
                            </PermissionGate>
                    </ul>
                  )}
                </div>

              </td>
              <td>{contrat.client}</td>
              <td>{contrat.police}</td>
              <td>{contrat.compagnie}</td>
              <td>{contrat.agence}</td>
              <td>{contrat.type_contrat}</td>
              <td>{new Date(contrat.date_debut).toLocaleDateString()}</td>
              <td>{new Date(contrat.date_fin).toLocaleDateString()}</td>
              <td>{contrat.categories}</td>
              <td>{contrat.statut}</td>
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

export default ListeContratsPrestations;
