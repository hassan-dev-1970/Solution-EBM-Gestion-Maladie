import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import '../contrats/Styles-contrats/PrestationsContrat.css';


const PrestationsContrat = () => {
  const { id_contrat } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [openAccordion, setOpenAccordion] = useState(null);

  // États
  const [typePrestations, setTypePrestations] = useState([]); // Maladie
  const [maladie, setMaladie] = useState({});
  const [contratInfo, setContratInfo] = useState({ taux_remb: "", plafond: "" });
  const masterCheckboxRef = useRef(null);
  
// Etat initial pour incapacité avec valeurs par défaut
const [incapacite, setIncapacite] = useState({
  garantie_incapacite: "",          // par défaut "Oui"
  duree_max_incap: "1 an",             // valeur suggérée
  franchise_incap: 30,                 // 30 jours par défaut
  taux_indem_incap: 75,                // 75% par défaut
  garantie_invalidite: "",          // par défaut "Oui"
  regle_garantie_invalidite: `- IPP < 33% = aucune indemnité\n- IPP > 66% = 50% du salaire annuel\n- 33% < IPP < 66% = 50% du salaire annuel × (3 × IPP définitif) / 200`, // texte par défaut
  duree_max_inv: "Jusqu'à 60 ans",     // valeur par défaut
  base_salaire: "4 trimestres avant arrêt de travail",
  beneficiaire: "",
  mode_indem: "",
});

  const [deces, setDeces] = useState({
  taux_celibataire: "",
  taux_marie_sans_enfant: "",
  maj_enfant_mineur: "",  
  taux_max: "",
  base_traitement: "4 trimestres avant arrêt de travail",
  date_debut_prestat_deces: "",
  periodicite: "365",
  });


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


  // Charger les types de prestations maladie
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await axios.get("/api/types-prestations", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const initialState = {};
        res.data.forEach((p) => {
          initialState[p.id_prestation_std] = {
            checked: false,
            taux: contratInfo?.taux_remb || "",   // ✅ valeur par défaut du contrat
            plafond: contratInfo?.plafond || "",  // ✅ valeur par défaut du contrat
            age_limite: "60",
            valeur_D: "0",
            valeur_K: "0",
            periodicite: 365,
            date_debut: new Date().toISOString().slice(0, 10),    

          };
        });

        setTypePrestations(res.data);
        setMaladie(initialState);
      } catch (err) {
        console.error("❌ Erreur chargement types prestations :", err);
      }
    };

    fetchTypes();
  }, [token, contratInfo]);

  
  // Toggle accordéon
  const toggleAccordion = (key) => {
    setOpenAccordion(openAccordion === key ? null : key);
  };

  // Gestion inputs maladie
  const handleMaladieChange = (id, field, value) => {
    setMaladie((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
    if (field === "checked" && !value) {
      // Vider les champs taux, plafond, age_limite si décoché
      setMaladie((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          taux: "",
          plafond: "",
          age_limite: "",
          valeur_D: "0",
          valeur_K: "0",
        },
      }));
    }

    if (field === "checked" && value) {
      // Remplir les champs taux, plafond, age_limite si coché
      setMaladie((prev) => ({
        ...prev,
        [id]: {
          ...prev[id],
          taux: contratInfo?.taux_remb || "", // ✅ valeur par défaut du contrat
          plafond: contratInfo?.plafond || "", // ✅ valeur par défaut du contrat
          age_limite: "60",
          valeur_D: "0",
          valeur_K: "0",
        },
      }));
    }  };

// Vérifications
const isMaladieComplete = Object.values(maladie).some(
  (v) => v.checked && v.taux && v.plafond && v.age_limite && v.valeur_D && v.valeur_K
);

const isIncapaciteComplete = incapacite.garantie_incapacite &&
  incapacite.duree_max_incap &&
  incapacite.franchise_incap &&
  incapacite.taux_indem_incap &&
  incapacite.garantie_invalidite &&
  incapacite.regle_garantie_invalidite &&
  incapacite.duree_max_inv &&
  incapacite.base_salaire &&
  incapacite.beneficiaire &&
  incapacite.mode_indem;

const isDecesComplete = deces.taux_celibataire &&
  deces.taux_marie_sans_enfant &&
  deces.maj_enfant_mineur &&
  deces.taux_max &&
  deces.base_traitement &&
  deces.date_debut_prestat_deces &&
  deces.periodicite;

// Sauvegarde
const handleSaveAll = async () => {
  if (!isMaladieComplete || !isIncapaciteComplete || !isDecesComplete) {
    toast.info("⚠️ Veuillez remplir toutes les prestations avant d’enregistrer.");
    return;
  }

  try {
    const payload = [
      ...Object.entries(maladie)
        .filter(([_, v]) => v.checked)
        .map(([id, v]) => ({
          type_prestation: "maladie",
          id_contrat,
          code_prestat_mald: id,
          libelle_prestat_mald: typePrestations.find(
            (p) => p.id_prestation_std === parseInt(id)
          )?.libelle,
          // mapping correct
          taux_remb_prestat_mald: v.taux,
          plafond_prestat_mald: v.plafond,
          age_limit_prestat_mald: v.age_limite,
          valeur_d: v.valeur_D,
          valeur_k: v.valeur_K,
          periode_prestat_mald: v.periodicite,
          date_debut_prestat_mald: v.date_debut
        })),
      { ...incapacite, type_prestation: "incapacite", id_contrat },
      { ...deces, type_prestation: "deces", id_contrat },
    ];

    await axios.post(
      `/api/contrats/${id_contrat}/prestations`,
      { prestations: payload },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("✅ Prestations enregistrées !");
    navigate("/listecontratsprestations");
  } catch (err) {
    console.error("❌ Erreur :", err);
    toast.error("❌ Une erreur est survenue.");
  }
};

// Vérifie si toutes ou certaines sont cochées

// Ajout de masterState pour gérer l'état du master checkbox
const [masterState, setMasterState] = useState("none"); // "all", "partial", "none"

// Met à jour masterState selon l'état des cases maladie
useEffect(() => {
  const values = Object.values(maladie || {});
  if (values.length === 0) {
    setMasterState("none");
    return;
  }
  const allChecked = values.every((m) => m.checked);
  const someChecked = values.some((m) => m.checked);
  if (allChecked) setMasterState("all");
  else if (someChecked) setMasterState("partial");
  else setMasterState("none");
}, [maladie]);

// Gérer le "tout cocher/décocher"
const handleCheckAll = (checked) => {
  const updated = {};
  for (const id in maladie) {
    updated[id] = { ...maladie[id], checked };
  }
  setMaladie(updated);
};

// ⚡️ Met à jour l'état "indeterminate"
useEffect(() => {
  if (masterCheckboxRef.current) {
    masterCheckboxRef.current.indeterminate = masterState === "partial";
  }
}, [masterState]);

  // Gestion du bouton retour
const handleRetour = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1); // fallback sécurité
    }
  };




  return (
    <div className="prestations-container">
    {/* En-tête avec boutons */}
    <div className="header-actions">
          <h2>
        Paramétrage des Prestations <br />
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
            <button className="btn-retour"
              onClick={handleRetour}>
              &lt;&lt; Retour
            </button>
            <button
              onClick={handleSaveAll}
              className="btn-valider-prestations"
              disabled={!isMaladieComplete || !isIncapaciteComplete || !isDecesComplete}
            >
              Enregistrer toutes les prestations
            </button>
          </div>
    </div>


      {/* Maladie */}
      <div className="accordion">
        <div className="accordion-header"
          onClick={() => toggleAccordion("maladie")}>
          <h3>Prestations Maladie</h3>
          <span className="accordion-icon">
            {openAccordion === "maladie" ? "−" : "+"}
          </span>
        </div>
        <div
          className={`accordion-content ${
            openAccordion === "maladie" ? "open" : ""
          }`}
        >
        <div className="table-container">
          <table className="table-prestations">
            <thead>
              <tr>
                <th>
                  <input
                    ref={masterCheckboxRef}
                    type="checkbox"
                    className={`master-checkbox ${masterState}`}
                    checked={masterState === "all"}
                    onChange={(e) => handleCheckAll(e.target.checked)}
                    aria-label="Sélectionner toutes les prestations"
                  />
                </th>
                <th>Libellé</th>
                <th>Taux (%)</th>
                <th>Plafond</th>
                <th>Âge limite</th>
                <th>Valeur D</th>
                <th>Valeur K</th>
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
                      checked={maladie?.[p.id_prestation_std]?.checked || false}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "checked", e.target.checked)
                      }
                    />
                  </td>
                  <td>{p.libelle_prestation}</td>
                  <td>
                    <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.taux || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "taux", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.plafond || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "plafond", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.age_limite || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "age_limite", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.valeur_D || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "valeur_D", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.valeur_K || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "valeur_K", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={maladie?.[p.id_prestation_std]?.periodicite || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "periodicite", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      value={maladie?.[p.id_prestation_std]?.date_debut || ""}
                      onChange={(e) =>
                        handleMaladieChange(p.id_prestation_std, "date_debut", e.target.value)
                      }
                      disabled={!maladie?.[p.id_prestation_std]?.checked}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="selection-info"> {/* compteur de nombre de prestations sélectionnées*/}
            {Object.values(maladie).filter((m) => m.checked).length} prestation(s) sélectionnée(s) sur {Object.keys(maladie).length}
          </div>
        </div>
      </div>

{/* Incapacité/Invalidité */}
          <div className="accordion">
            <div
              className="accordion-header"
              onClick={() => toggleAccordion("incapacite")}
            >
              <h3>Prestations Incapacité</h3>
              <span className="accordion-icon">
                {openAccordion === "incapacite" ? "−" : "+"}
              </span>
            </div>

            <div className={`accordion-content ${
                openAccordion === "incapacite" ? "open" : ""
              }`}>

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
                  <option value="Oui">Souscripteur</option>
                  <option value="Non">Adhérent</option>
                  <option value="Non">Autres</option>
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
                  <option value="Oui">Virement bancaire</option>
                  <option value="Non">Chèque</option>
                  <option value="Non">Autres</option>
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
      </div>

      {/* Décès */}
      <div className="accordion">
        <div
          className="accordion-header"
          onClick={() => toggleAccordion("deces")}
        >
          <h3>Prestations Décès</h3>
          <span className="accordion-icon">
            {openAccordion === "deces" ? "−" : "+"}
          </span>
        </div>
        <div
          className={`accordion-content ${
            openAccordion === "deces" ? "open" : ""
          }`}>
          <div className="form-grid">
            <label>
              Taux Célibataire :
              <input
                type="number"
                value={deces.taux_celibataire || ""}
                onChange={(e) =>
                  setDeces({ ...deces, taux_celibataire: e.target.value })
                }
              />
            </label>
            <label>
              Taux Marié sans enfant :
              <input
                type="number"
                value={deces.taux_marie_sans_enfant || ""}
                onChange={(e) =>
                  setDeces({ ...deces, taux_marie_sans_enfant: e.target.value })
                }
              />
            </label>
            <label>
              Majoration enfant mineur :
              <input
                type="number"
                value={deces.maj_enfant_mineur || ""}
                onChange={(e) =>
                  setDeces({ ...deces, maj_enfant_mineur: e.target.value })
                }
              />
            </label>
            <label>
              Taux maximum :
              <input
                type="number"
                value={deces.taux_max || ""}
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
                value={deces.date_debut_prestat_deces || ""}
                onChange={(e) =>
                  setDeces({
                    ...deces,
                    date_debut_prestat_deces: e.target.value,
                  })
                }
              />
            </label>
            <label>
              Périodicité :
              <input
                type="number"
                value={deces.periodicite || ""}
                onChange={(e) =>
                  setDeces({ ...deces, periodicite: e.target.value })
                }
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestationsContrat;
