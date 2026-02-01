// src/components/contrats/AfficherPrestationsContrat.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "../contrats/Styles-contrats/PrestationsContrat.css";

const AfficherPrestationsContrat = () => {
  const { id_contrat } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [activeTab, setActiveTab] = useState("maladie");
  const [maladie, setMaladie] = useState([]);
  const [incapacite, setIncapacite] = useState({});
  const [deces, setDeces] = useState({});
  const [contratInfo, setContratInfo] = useState({ taux_remb: "", plafond: "" });

 // 🔹 Charger infos contrat (nom client + police)
  useEffect(() => {
    const fetchContrat = async () => {
      try {
        const res = await axios.get(`/api/contrats/${id_contrat}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContratInfo(res.data);
      } catch (err) {
        console.error("❌ Erreur chargement contrat :", err);
      }
    };

    fetchContrat();
  }, [id_contrat, token]);

  useEffect(() => {
    const fetchPrestations = async () => {
      try {
        const res = await axios.get(`/api/contrats/${id_contrat}/prestations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMaladie(res.data.filter((p) => p.type_prestation === "maladie"));
        setIncapacite(
          res.data.find((p) => p.type_prestation === "incapacite") || {}
        );
        setDeces(res.data.find((p) => p.type_prestation === "deces") || {});
      } catch (err) {
        console.error("❌ Erreur chargement prestations :", err);
        toast.error("Erreur lors du chargement des prestations");
      }
    };

    fetchPrestations();
  }, [id_contrat, token]);

  return (
    <div className="prestations-container">
      <div className="header-actions">
      <h2>
        Détail des Prestations <br />
        {contratInfo ? (
          <span>
            Client : <strong>{contratInfo.nom_client}</strong> | Police :{" "}
            <strong>{contratInfo.numero_police}</strong>
          </span>
        ) : (
          "Chargement..."
        )}
      </h2>
          <div className="actions-buttons">
            <button
              className="btn-retour"
              onClick={() => navigate("/listecontratsprestations")}
            >
              &lt;&lt;&lt; Retour
            </button>
      </div>
      </div>


      {/* Onglets */}
      <div className="tabs">
        <button
          className={activeTab === "maladie" ? "tab active" : "tab"}
          onClick={() => setActiveTab("maladie")}
        >
          Maladie
        </button>
        <button
          className={activeTab === "incapacite" ? "tab active" : "tab"}
          onClick={() => setActiveTab("incapacite")}
        >
          Incapacité & Invalidité
        </button>
        <button
          className={activeTab === "deces" ? "tab active" : "tab"}
          onClick={() => setActiveTab("deces")}
        >
          Décès
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === "maladie" && (
        <div className="tab-content">
          <table className="table-prestations">
            <thead>
              <tr>
                <th>Libellé</th>
                <th>Taux</th>
                <th>Plafond</th>
                <th>Âge limite</th>
                <th>Valeur D</th>
                <th>Valeur K</th>
                <th>Périodicité</th>
                <th>Date début</th>
              </tr>
            </thead>
            <tbody>
              {maladie.length > 0 ? (
                maladie.map((m, index) => (
                  <tr key={index}>
                    <td>{m.libelle_prestat_mald}</td>
                    <td>{m.taux_remb_prestat_mald ?? 0}%</td>
                    <td>{m.plafond_prestat_mald ?? 0}</td>
                    <td>{m.age_limit_prestat_mald ?? "-"}</td>
                    <td>{m.valeur_d ?? "-"}</td>
                    <td>{m.valeur_k ?? "-"}</td>
                    <td>{m.periode_prestat_mald ?? "-"}</td>
                    <td>
                      {m.date_debut_prestat_mald
                        ? m.date_debut_prestat_mald.substring(0, 10)
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center" }}>
                    Aucune prestation Maladie enregistrée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Contenu des onglets */}
      {activeTab === "incapacite" && (
        <div className="tab-content">
          <div className="grid-2cols">
            
            {/* Bloc Incapacité */}
            <div className="card-prestation">
              <h3 className="section-title">Prestations Incapacité</h3>
              {incapacite.id_prestation ? (
                <table className="table-infos">
                  <tbody>
                    <tr>
                      <td>Garantie</td>
                      <td>{incapacite.garantie_incapacite}</td>
                    </tr>
                    <tr>
                      <td>Franchise</td>
                      <td>{incapacite.franchise_incap}</td>
                    </tr>
                    <tr>
                      <td>Durée max</td>
                      <td>{incapacite.duree_max_incap}</td>
                    </tr>
                    <tr>
                      <td>Taux indemnité</td>
                      <td>{incapacite.taux_indem_incap}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="empty-msg">Aucune prestation Incapacité enregistrée</p>
              )}
            </div>

            {/* Bloc Invalidité */}
            <div className="card-prestation">
              <h3 className="section-title">Prestations Invalidité</h3>
              {incapacite.id_prestation ? (
                <table className="table-infos">
                  <tbody>
                    <tr>
                      <td>Garantie</td>
                      <td>{incapacite.garantie_invalidite}</td>
                    </tr>
                    <tr>
                      <td>Durée max</td>
                      <td>{incapacite.duree_max_inv}</td>
                    </tr>
                    <tr>
                      <td>Base de traitement</td>
                      <td>{incapacite.base_salaire}</td>
                    </tr>
                    <tr>
                      <td>Bénéficiaire</td>
                      <td>{incapacite.beneficiaire}</td>
                    </tr>
                    <tr>
                      <td>Mode indemnisation</td>
                      <td>{incapacite.mode_indem}</td>
                    </tr>
                    <tr>
                      <td>Règle de calcul</td>
                      <td>{incapacite.regle_garantie_invalidite}</td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                <p className="empty-msg">Aucune prestation Invalidité enregistrée</p>
              )}
            </div>
          </div>
        </div>
      )}


      {activeTab === "deces" && (
        <div className="tab-content">
          {deces.id_prestation ? (
            <div className="card-prestation">
              <p><strong>- Taux Célibataire :</strong>{deces.taux_celibataire}%</p>
              <p><strong>- Taux Marié sans enfant :</strong>{" "}{deces.taux_marie_sans_enfant}%</p>
              <p><strong>- Taux Majoration enfants mineurs :</strong>{" "}{deces.maj_enfant_mineur}%</p>
              <p><strong>- Taux max :</strong> {deces.taux_max}%</p>
              <p><strong>- Base de traitement :</strong>{" "}{deces.base_traitement}</p>
              <p><strong>- Date début :</strong>{" "}
                {deces.date_debut_prestat_deces
                  ? deces.date_debut_prestat_deces.substring(0, 10): "-"}
              </p>
              
            </div>
          ) : (
            <p>Aucune prestation Décès enregistrée</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AfficherPrestationsContrat;
