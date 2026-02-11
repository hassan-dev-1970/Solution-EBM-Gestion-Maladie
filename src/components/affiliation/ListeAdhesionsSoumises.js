// src/pages/ListeAdhesionsSoumises.js
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import useConfirmToast from '../useConfirmToast';
import '../contrats/Styles-contrats/ListeContrats.css';

const ListeAdhesionsSoumises = () => {
  const [adhesions, setAdhesions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const dropdownRef = useRef(null);

  const adhesionsParPage = 20;
  const [currentPage, setCurrentPage] = useState(1);

  /* =======================
     FETCH ADHESIONS SOUMISES
  ======================= */
  useEffect(() => {
    const fetchAdhesions = async () => {
      const token = localStorage.getItem("token");
      if (!token) return setError("Token requis");

      try {
        const res = await axios.get("/api/adhesions/soumis", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAdhesions(Array.isArray(res.data) ? res.data : []);
        setError('');
      } catch (err) {
        console.error(err);
        setError("Erreur lors du chargement des adhésions à valider.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdhesions();
  }, []);


  // Gestion du clic hors du menu déroulant
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Valider une adhésion
      const { showConfirm } = useConfirmToast();

      const validerAdhesion = (id_adhesion) => {
        showConfirm(
          "Voulez-vous vraiment valider cette adhésion ?",
          async () => {
            try {
              const token = localStorage.getItem("token");
              await axios.patch(`/api/adhesions/${id_adhesion}/validate`, {}, {
                headers: { Authorization: `Bearer ${token}` }
              });
              toast.success("✅ Adhésion validée avec succès.");
              const res = await axios.get("/api/adhesions/soumis", {
                headers: { Authorization: `Bearer ${token}` }
              });
              setAdhesions(res.data);
            } catch (err) {
              console.error("Erreur validation :", err);
              toast.error("❌ Échec de la validation.");
            }
          },
          {
            confirmText: "Valider",
            cancelText: "Annuler",
            confirmColor: "#17a921"
            // Vous pouvez aussi personnaliser les couleurs si besoin
          }
        );
      };

  // 📄 Pagination
  const totalPages = Math.ceil(adhesions.length / adhesionsParPage);
  const currentAdhesions = adhesions.slice(
    (currentPage - 1) * adhesionsParPage,
    currentPage * adhesionsParPage
  );

  // Formater la date
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="liste-Liste">
      <h1>Liste des demandes d'adhésion en attente de validation</h1>

      {error && <p className="error">{error}</p>}
      {loading && <p>Chargement...</p>}

      {!loading && adhesions.length === 0 && (
        <p style={{textAlign: 'center', fontSize: 'large', fontWeight: 'bold', color: 'darkred'}}>Aucune adhésion en attente de validation.</p>
      )}

      {!loading && adhesions.length > 0 && (
        <>
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
                <th>Statut</th>
                <th>Date Soumission</th>
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
                          setDropdownOpenId(dropdownOpenId === assure.id_adhesion ? null : assure.id_adhesion)}
                      >
                        <img src="/Images/edit/settings-7.png" alt="Outils" className="action-icon-settings" />
                      </button>

                      {dropdownOpenId === assure.id_adhesion && (
                        <ul className="dropdown-menu-LC" ref={dropdownRef}>
                          <li onClick={() => setDropdownOpenId(null)}>
                            <Link to={`/adhesions/${assure.id_adhesion}/details`} className="dropdown-link-LC">
                              <img src="/Images/edit/detail-3.png" alt="Détails" className="action-icon" />
                              Détails
                            </Link>
                          </li>
                          <li onClick={() => { validerAdhesion(assure.id_adhesion); setDropdownOpenId(null); }}>
                            <span className="dropdown-link-LC" style={{ cursor: 'pointer' }}>
                              <img src="/Images/edit/validate.png" alt="Valider" className="action-icon" />
                              Valider
                            </span>
                          </li>
                        </ul>
                      )}
                    </div>
                  </td>
                  <td>{assure.nom} {assure.prenom}</td>
                  <td>{assure.souscripteur_nom || "-"}</td>
                  <td>{assure.num_police || "-"}</td>
                  <td>{assure.compagnie || "-"}</td>
                  <td>{assure.type_contrat || "-"}</td>
                  <td>{formatDate(assure.date_adhesion)}</td>
                  <td><span className="badge badge-warning">En attente de validation</span></td>
                  <td>{formatDate(assure.date_soumis)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} 
                disabled={currentPage === 1}
              >
                <span className="chevron">&laquo;</span> Précédent
              </button>
              <span className='page-numbers'>Page {currentPage} / {totalPages}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} 
                disabled={currentPage === totalPages}
              >
                Suivant <span className="chevron">&raquo;</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ListeAdhesionsSoumises;