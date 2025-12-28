import React from 'react';
import '../Styles/Accueil.css'; // ajuste le chemin si nécessaire

function Page_404() {
  return (
    
    <div className="accueil-container">
      <div className="flexbox texte-accueil">
        <h1 style={{ color: 'red', fontSize: '32px', textAlign: 'center' }}>
          Page en cours de construction <br />
          <strong>EBM-Solutions !</strong>
        </h1>
      </div>
      <div className="flexbox image-accueil">
        <img src="/Images/web-error-3.png" alt="Illustration accueil" />
      </div>
    </div>
  );
}

export default Page_404;
