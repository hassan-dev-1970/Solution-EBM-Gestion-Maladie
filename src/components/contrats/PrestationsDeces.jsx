import { useState, useEffect } from "react";
import "../contrats/Styles-contrats/PrestationsDeces.css";


const PrestationsDeces = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    taux_celibataire: "100",
    taux_marie_sans_enfant: "150",
    maj_enfant_mineur: "32.50",
    taux_max: "345",
    base_traitement: "4 trimestres avant le sinistre",
    date_debut_prestat_deces: "01/01/2025",
    periodicite: "365",
  });

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

return (
    <div className="form-section">
      <h3>Paramétrage - Décès</h3>

      <div className="form-columns">
        <div className="form-block">
          <h4>Capital Assuré</h4>

          <div className="form-group">
            <label>Taux Célibataire (%)</label>
            <input
              type="number"
              step="0.01"
              name="taux_celibataire"
              value={data.taux_celibataire || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Taux Marié sans enfant (%)</label>
            <input
              type="number"
              step="0.01"
              name="taux_marie_sans_enfant"
              value={data.taux_marie_sans_enfant || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Majoration enfant mineur (%)</label>
            <input
              type="number"
              step="0.01"
              name="maj_enfant_mineur"
              value={data.maj_enfant_mineur || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Taux Maximum (%)</label>
            <input
              type="number"
              step="0.01"
              name="taux_max"
              value={data.taux_max || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-block">
          <h4>Informations complémentaires</h4>

          <div className="form-group">
            <label>Base de traitement</label>
            <input
              type="text"
              name="base_traitement"
              value={data.base_traitement || ""}
              onChange={handleChange}
              placeholder="Ex: 4 trimestres avant sinistre"
            />
          </div>

          <div className="form-group">
            <label>Date Début</label>
            <input
              type="date"
              name="date_debut_prestat_deces"
              value={data.date_debut_prestat_deces || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Périodicité (jours)</label>
            <input
              type="number"
              name="periodicite"
              value={data.periodicite || ""}
              onChange={handleChange}
              placeholder="Ex: 365"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestationsDeces;