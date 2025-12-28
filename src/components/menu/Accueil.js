import '../Styles/Accueil.css';

function Accueil() {
  return (
    <div className="accueil-container">
      <div className="flexbox texte-accueil">
        <h1>
          Bienvenue sur la plateforme <br />
          <strong>Gestion Maladie !</strong>
        </h1>
      </div>
      <div className="flexbox image-accueil">
        <img src="/Images/logo/2.png" alt="Illustration accueil" />
      </div>
    </div>
  );
}

export default Accueil;
