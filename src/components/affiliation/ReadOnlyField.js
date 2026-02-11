import React from "react";
import ReadOnlyField from "./ReadOnlyField";

const RenderFields = ({
  data = {},
  labels = {},
  title,
  clients = [],
  villes = [],
  pays = []
}) => {

  // 🔹 Fonction de transformation ID → libellé métier
  const formatValue = (key, value) => {
    if (!value) return null;

    // Souscripteur → raison sociale
    if (key === "souscripteur") {
      return (
        clients.find(c => Number(c.id_client) === Number(value))
          ?.raison_sociale || value
      );
    }

    // Ville → nom_ville
    if (key === "ville") {
      return (
        villes.find(v => Number(v.id_ville) === Number(value))
          ?.nom_ville || value
      );
    }

    // Pays ou Nationalité → nom_pays
    if (key === "pays" || key === "nationalite") {
      return (
        pays.find(p => Number(p.id_pays) === Number(value))
          ?.nom_pays || value
      );
    }

    return value;
  };

  return (
    <div className="field-group">
      {title && <h4 className="section-subtitle">{title}</h4>}

      <div className="grid-2">
        {Object.entries(labels).map(([key, label]) => (
          <ReadOnlyField
            key={key}
            label={label}
            value={formatValue(key, data[key])}
          />
        ))}
      </div>
    </div>
  );
};

export default RenderFields;
