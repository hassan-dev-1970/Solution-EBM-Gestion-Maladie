// src/components/contrats/ModifierPrestationsContrat.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../contrats/Styles-contrats/PrestationsContrat.css";

const ModifierPrestationsContrat = () => {
  const { id_contrat } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [openAccordion, setOpenAccordion] = useState(null);
  const [typePrestations, setTypePrestations] = useState([]);
  const [maladie, setMaladie] = useState({});
  const [incapacite, setIncapacite] = useState({});
  const [deces, setDeces] = useState({});
  const [contratInfo, setContratInfo] = useState({ taux_remb: "", plafond: "" });

// Fonction utilitaire : formater date pour MySQL (YYYY-MM-DD)
  function formatDateForMySQL(date) {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // ✅ Sans heure, pas de décalage
}

  // 🔹 Charger info contrat (taux_remb, plafond)
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
  }, [id_contrat, token, contratInfo?.taux_remb, contratInfo?.plafond]);


  // 🔹 Charger types maladie + prestations enregistrées
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [typesRes, prestationsRes] = await Promise.all([
          axios.get("/api/types-prestations", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`/api/contrats/${id_contrat}/prestations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setTypePrestations(typesRes.data);

        const existing = prestationsRes.data;

        // Maladie
        const initialMaladie = {};
        typesRes.data.forEach((t) => {
          const found = existing.find(
            (p) =>
              p.type_prestation === "maladie" &&
              parseInt(p.code_prestat_mald) === t.id_prestation_std
          );
          initialMaladie[t.id_prestation_std] = found
            ? { ...found, checked: true }
            : {
                checked: false,
                taux_remb_prestat_mald: contratInfo?.taux_remb || "",
                plafond_prestat_mald: contratInfo?.plafond || "",
                age_limit_prestat_mald: "",
                valeur_d: "0",
                valeur_k: "0",
                periode_prestat_mald: 365,
                date_debut_prestat_mald: new Date().toISOString().slice(0, 10),
              };
        });

        setMaladie(initialMaladie);
        setIncapacite(existing.find((p) => p.type_prestation === "incapacite") || {});
        setDeces(existing.find((p) => p.type_prestation === "deces") || {});
      } catch (err) {
        console.error("❌ Erreur chargement prestations :", err);
        toast.error("Erreur lors du chargement des prestations");
      }
    };

    fetchData();
  }, [id_contrat, token, contratInfo?.taux_remb, contratInfo?.plafond]);

  // Toggle accordéon
  const toggleAccordion = (key) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // 🔄 Changement Maladie
  const handleMaladieChange = (id, field, value) => {
    setMaladie((prev) => ({
      ...prev, [id]: { ...prev[id], [field]: value },
    }));
 if (field === "checked" && !value) {
      // Vider les champs taux, plafond, age_limite si décoché
      setMaladie((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          taux_remb_prestat_mald: "",
          plafond_prestat_mald: "",
          age_limit_prestat_mald: "",
          valeur_d: "0",
          valeur_k: "0",
          periode_prestat_mald: 365,
          date_debut_prestat_mald: new Date().toISOString().slice(0, 10),
        },
      }));
    }

    if (field === "checked" && value) {
      // Remplir les champs taux, plafond, age_limite si coché
      setMaladie((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          taux_remb_prestat_mald: contratInfo?.taux_remb || "",
          plafond_prestat_mald: contratInfo?.plafond || "",
          age_limit_prestat_mald: "60",
          valeur_d: "0",
          valeur_k: "0",
          periode_prestat_mald: 365,
          date_debut_prestat_mald: new Date().toISOString().slice(0, 10),
        },
      }));
    }  
  };

  
// Fonction utilitaire : supprime les champs inutiles avant envoi
const cleanPrestation = (p) => {
  const { checked, ...rest } = p; // ❌ enlève "checked"
  return rest;
};

// 💾 Sauvegarder TOUTES les prestations
const handleSaveAll = async () => {
  try {
    const maladiePayload = Object.entries(maladie)
      .filter(([_, v]) => v.checked) // garde seulement cochées
      .map(([id, v]) => ({
        ...v,
        type_prestation: "maladie",
        id_contrat,
        code_prestat_mald: id,
        libelle_prestat_mald: typePrestations.find(
          (t) => t.id_prestation_std === parseInt(id)
        )?.libelle_prestation,
      }));

    const payload = [
      ...maladiePayload,
      { ...incapacite, type_prestation: "incapacite", id_contrat },
      { ...deces, type_prestation: "deces", id_contrat },
    ];

    const updates = payload.filter((p) => p.id_prestation);
    const inserts = payload.filter((p) => !p.id_prestation);

    // 🔄 UPDATE
    for (const p of updates) {
      await axios.put(
        `/api/contrats/${id_contrat}/prestations/${p.id_prestation}`,
        cleanPrestation(p), // ✅ nettoyé avant envoi
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    // ➕ INSERT
    if (inserts.length > 0) {
      await axios.post(
        `/api/contrats/${id_contrat}/prestations`,
        { prestations: inserts.map(cleanPrestation) }, // ✅ nettoyées
        { headers: { Authorization: `Bearer ${token}` } }
      );
    }

    toast.success("Mise à jour des prestations a été effectuée avec succès");
    navigate("/listecontratsprestations");
  } catch (err) {
    console.error("❌ Erreur save all :", err);
    toast.error("Erreur lors de l’enregistrement global");
  }
};

// ================ Rendu principal ==================================================

  return (
    <div className="prestations-container">
      <div className="header-actions-prestations">
          <h2>
              Mise à jour des Prestations <br />
              {contratInfo ? (
                <span>
                  Client : <strong>{contratInfo.nom_client}</strong> | Police :{" "}
                  <strong>{contratInfo.numero_police}</strong>
                </span>
              ) : (
                "Chargement..."
              )}
        </h2>
          
      <div className="btn-group right">
          <button className="btn-secondary" onClick={() => navigate("/listecontratsprestations")}>
            &lt;&lt;&lt; Retour</button>        

          <button onClick={handleSaveAll}  className="btn-success"> Valider la modification des prestations</button>
      </div>
    </div>


      {/* Maladie */}
      <div className="accordion">
        <div className="accordion-header" onClick={() => toggleAccordion("maladie")}>
          <h3>Prestations Maladie</h3>
          <span className="accordion-icon">{openAccordion === "maladie" ? "−" : "+"}</span>
        </div>
        {openAccordion === "maladie" && (
          <div className="accordion-content open">
          <div className="table-container">
            <table className="table-prestations">
              <thead>
                <tr>
                  <th></th>
                  <th>Libellé</th>
                  <th>Taux</th>
                  <th>Plafond</th>
                  <th>Âge limite</th>
                  <th>Valeur (D)</th>
                  <th>Valeur (K)</th>
                  <th>Périodicité</th>
                  <th>Date début</th>
                </tr>
              </thead>
              <tbody>
                {typePrestations.map((p) => (
                  <tr key={p.id_prestation_std}>
                    <td>
                      <input
                        style={{width: '15px', height: '15px'}}
                        type="checkbox" 
                        checked={maladie[p.id_prestation_std]?.checked || false}
                        onChange={(e) =>
                          handleMaladieChange(p.id_prestation_std, "checked", e.target.checked)
                        }
                      />
                    </td>
                    <td>{p.libelle_prestation}</td>
                    <td>
                      <input
                        type="number"
                        value={maladie[p.id_prestation_std]?.taux_remb_prestat_mald ?? ""}
                        onChange={(e) =>
                          handleMaladieChange(p.id_prestation_std, "taux_remb_prestat_mald", e.target.value)
                        }
                        disabled={!maladie[p.id_prestation_std]?.checked}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={maladie[p.id_prestation_std]?.plafond_prestat_mald ?? ""}
                        onChange={(e) =>
                          handleMaladieChange(p.id_prestation_std, "plafond_prestat_mald", e.target.value)
                        }
                        disabled={!maladie[p.id_prestation_std]?.checked}
                      />
                    </td>
                    <td>

                   <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.age_limit_prestat_mald ?? ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "age_limit_prestat_mald", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                    </td>
                    
                    <td><input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.valeur_d ?? ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "valeur_d", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                    </td>
                    <td>
                      <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.valeur_k ?? ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "valeur_k", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                    </td>
                    <td>
                      <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.periode_prestat_mald ?? ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "periode_prestat_mald", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                    </td>
                    <td>
                      <input
                          type="date"
                          value={maladie?.[p.id_prestation_std]?.date_debut_prestat_mald
                              ? formatDateForMySQL(maladie[p.id_prestation_std].date_debut_prestat_mald).substring(0, 10): ""
                          }
                          onChange={(e) =>
                            handleMaladieChange(p.id_prestation_std, "date_debut_prestat_mald", e.target.value)
                          }
                          disabled={!maladie?.[p.id_prestation_std]?.checked}
                        />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>

      {/* Incapacité */}
      <div className="accordion">
        <div className="accordion-header" onClick={() => toggleAccordion("incapacite")}>
          <h3>Prestations Incapacité</h3>
          <span className="accordion-icon">{openAccordion === "incapacite" ? "−" : "+"}</span>
        </div>
        {openAccordion === "incapacite" && (
          <div className="accordion-content open">
         
          {/* Bloc Incapacité */}
          <div className="section-block">
            <h4>Garantie Incapacité</h4>
            <div className="form-grid">
              <label>
                Garantie Incapacité :
                <select
                  value={incapacite.garantie_incapacite || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, garantie_incapacite: e.target.value })
                  }
                >
                  <option value="">--</option>
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                </select>
              </label>
              <label>
                Durée max incapacité :
                <input
                  type="text"
                  value={incapacite.duree_max_incap || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, duree_max_incap: e.target.value })
                  }
                />
              </label>
              <label>
                Franchise (jours) :
                <input
                  type="number"
                  value={incapacite.franchise_incap || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, franchise_incap: e.target.value })
                  }
                />
              </label>
              <label>
                Taux indemnité incapacité (%):
                <input
                  type="number"
                  value={incapacite.taux_indem_incap || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, taux_indem_incap: e.target.value })
                  }
                />
              </label>
            </div>
          </div>
          {/* Bloc Invalidité */}
          <div className="section-block">
            <h4>Garantie Invalidité</h4>
            <div className="form-grid">
              <label>
                Garantie Invalidité :
                <select
                  value={incapacite.garantie_invalidite || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, garantie_invalidite: e.target.value })
                  }
                >
                  <option value="">--</option>
                  <option value="Oui">Oui</option>
                  <option value="Non">Non</option>
                </select>
              </label>
               <label>
                Durée max invalidité :
                <input
                  type="text"
                  value={incapacite.duree_max_inv || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, duree_max_inv: e.target.value })
                  }
                />
              </label>
              <label>
                Base salaire :
                <input
                  type="text"
                  value={incapacite.base_salaire || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, base_salaire: e.target.value })
                  }
                />
              </label>

              <label>
                 Bénéficiaire :
                <select
                  value={incapacite.beneficiaire || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, beneficiaire: e.target.value })
                  }
                >
                  <option value="">--</option>
                  <option value="Souscripteur">Souscripteur</option>
                  <option value="Adhérent">Adhérent</option>
                  <option value="Autres">Autres</option>
                </select>
              </label>


              <label>
                 Mode indemnisation :
                <select
                  value={incapacite.mode_indem || ""}
                  onChange={(e) =>
                    setIncapacite({ ...incapacite, mode_indem: e.target.value })
                  }
                >
                  <option value="">--</option>
                  <option value="Virement bancaire">Virement bancaire</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Autres">Autres</option>
                </select>
              </label>  
                          
             <br/>

              <label className="col-span-2">
                Règle garantie invalidité :
                <textarea
                  value={incapacite.regle_garantie_invalidite || ""}
                  onChange={(e) =>
                    setIncapacite({
                      ...incapacite,
                      regle_garantie_invalidite: e.target.value,
                    })
                  }
                />
              </label>
            </div>
          </div>

       </div>
        )}
      </div>

      {/* Décès */}
      <div className="accordion">
        <div className="accordion-header" onClick={() => toggleAccordion("deces")}>
          <h3>Prestations Décès</h3>
          <span className="accordion-icon">{openAccordion === "deces" ? "−" : "+"}</span>
        </div>
        {openAccordion === "deces" && (
          <div className="accordion-content open">
                    
          <div className="form-grid">
            <label>
              Taux Célibataire :
              <input
                type="number"
                value={deces.taux_celibataire ?? ""}
                onChange={(e) =>
                  setDeces({ ...deces, taux_celibataire: e.target.value })
                }
              />
            </label>
            <label>
              Taux Marié sans enfant :
              <input
                type="number"
                value={deces.taux_marie_sans_enfant ?? ""}
                onChange={(e) =>
                  setDeces({ ...deces, taux_marie_sans_enfant: e.target.value })
                }
              />
            </label>
            <label>
              Majoration enfant mineur :
              <input
                type="number"
                value={deces.maj_enfant_mineur ?? ""}
                onChange={(e) =>
                  setDeces({ ...deces, maj_enfant_mineur: e.target.value })
                }
              />
            </label>
            <label>
              Taux maximum :
              <input
                type="number"
                value={deces.taux_max ?? ""}
                onChange={(e) => setDeces({ ...deces, taux_max: e.target.value })}
              />
            </label>
            <label>
              Base de traitement :
              <input
                type="text"
                value={deces.base_traitement || ""}
                onChange={(e) =>
                  setDeces({ ...deces, base_traitement: e.target.value })
                }
              />
            </label>
            <label>
              Date début :
              <input
                  type="date"
                  value={
                    deces.date_debut_prestat_deces
                      ? formatDateForMySQL(deces.date_debut_prestat_deces).substring(0, 10)
                      : ""
                  }
                  onChange={(e) =>
                    setDeces({ ...deces, date_debut_prestat_deces: e.target.value })
                  }
                />
            </label>
            <label>
              Périodicité :
              <input
                type="number"
                value={deces.periodicite ?? ""}
                onChange={(e) =>
                  setDeces({ ...deces, periodicite: e.target.value })
                }
              />
            </label>
          </div>
        </div>
      )}
    </div>
  </div>
  );
};

export default ModifierPrestationsContrat;
