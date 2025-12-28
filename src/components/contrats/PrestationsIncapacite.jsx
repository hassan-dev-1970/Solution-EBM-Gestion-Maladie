import React, { useState, useEffect } from "react";
import "../contrats/Styles-contrats/PrestationsIncapacite.css";


const PrestationsIncapacite = ({ data, onChange }) => {
  const [formData, setFormData] = useState({
    garantie_incapacite: "Oui",
    duree_max_incap: "1",
    franchise_incap: "30",
    taux_indem_incap: "75",
    garantie_invalidite: "Oui",
    regle_garantie_invalidite:
      "- IPP < 33% = aucune indemnité\n- IPP > 66% = 50% du salaire annuel\n- 33% < IPP < 66% = 50% du salaire annuel × (3 × IPP définitif) / 200",
    duree_max_inv: "Jusqu'à 60 ans",
    base_salaire: "4 trimestres avant arrêt de travail",
    beneficiaire: "Souscripteur",
    mode_indem: "Virement",
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
      <h3>Paramétrage - Incapacité & Invalidité</h3>

      <div className="form-columns">
        {/* Bloc 1 : Garantie Incapacité */}
        <div className="form-block">
          <h4>Garantie Incapacité</h4>

          <div className="form-group">
            <label>Garantie Incapacité</label>
            <select
              name="garantie_incapacite"
              value={data.garantie_incapacite || ""}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          <div className="form-group">
            <label>Durée max incapacité</label>
            <input
              type="text"
              name="duree_max_incap"
              value={data.duree_max_incap || ""}
              onChange={handleChange}
              placeholder="Ex: 1 an, 3 ans"
            />
          </div>

          <div className="form-group">
            <label>Franchise (jours)</label>
            <input
              type="number"
              name="franchise_incap"
              value={data.franchise_incap || ""}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Taux d’indemnité (%)</label>
            <input
              type="number"
              step="0.01"
              name="taux_indem_incap"
              value={data.taux_indem_incap || ""}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Bloc 2 : Garantie Invalidité */}
        <div className="form-block">
          <h4>Garantie Invalidité</h4>

          <div className="form-group">
            <label>Garantie Invalidité</label>
            <select
              name="garantie_invalidite"
              value={data.garantie_invalidite || ""}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Oui</option>
              <option value="Non">Non</option>
            </select>
          </div>

          <div className="form-group">
            <label>Règle Garantie Invalidité</label>
            <textarea
              name="regle_garantie_invalidite"
              value={data.regle_garantie_invalidite || ""}
              onChange={handleChange}
              placeholder="Ex: - IPP < 33% = Aucune indemnité..."
            />
          </div>

          <div className="form-group">
            <label>Durée max invalidité</label>
            <input
              type="text"
              name="duree_max_inv"
              value={data.duree_max_inv || ""}
              onChange={handleChange}
              placeholder="Ex: Jusqu’à 60 ans"
            />
          </div>

          <div className="form-group">
            <label>Base de salaire</label>
            <input
              type="text"
              name="base_salaire"
              value={data.base_salaire || ""}
              onChange={handleChange}
              placeholder="Ex: 4 trimestres avant arrêt"
            />
          </div>

          <div className="form-group">
            <label>Bénéficiaire</label>
            <select
              name="beneficiaire"
              value={data.beneficiaire || ""}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Souscripteur</option>
              <option value="Non">Adhérent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mode d’indemnisation</label>
          <select
              name="mode_indem"
              value={data.mode_indem || ""}
              onChange={handleChange}
            >
              <option value="">-- Sélectionner --</option>
              <option value="Oui">Virement</option>
              <option value="Non">Chèque</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrestationsIncapacite;