// utils/adhesionRoutes.js
export const getAdhesionRouteByRole = (user) => {
  if (!user || !user.role) return "/connexion";

  switch (user.role) {
    case "user_distant-adherent":
      return "/espace-client/adhesion";

    case "user_distant-souscripteur":
      return "/espace-souscripteur/adhesion";

    default:
      return "/ajouter-adhesion";
  }
};

