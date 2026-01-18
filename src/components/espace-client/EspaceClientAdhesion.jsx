import FormulaireAdhesion from "../affiliation/FormulaireAdhesion";

const EspaceClientAdhesion = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdherentDistant =
    user?.role === "user_distant-adherent";

  const isSouscripteurDistant =
    user?.role === "user_distant-souscripteur";

  return (
    <FormulaireAdhesion
      contexte="client"
      canEdit={isAdherentDistant || isSouscripteurDistant}
      canSubmit={isAdherentDistant || isSouscripteurDistant}
      canValidate={isSouscripteurDistant}
      canPrint={isAdherentDistant || isSouscripteurDistant}
    />
  );
};

export default EspaceClientAdhesion;
