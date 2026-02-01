import axios from 'axios';
import { useState } from 'react';
import '../Clients/Style-clients/Ajout-client.css'; // Import du CSS spécifique pour la modale d'ajout
import { toast } from 'react-toastify';

const ModalAjoutClient = ({ isOpen, onClose, onClientAjoute }) => {

  const token = localStorage.getItem('token');
  let id_utilisateur = '';

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      id_utilisateur = payload.id;
    } catch (err) {
      console.error("Erreur lors du décodage du token :", err);
    }
  }

  const [client, setClient] = useState({
    raison_sociale: '',
    adresse: '',
    ville: '',
    personne_contact: '',
    tel: '',
    mail: '',
    agence: '',
    commercial: '',
    id_utilisateur: id_utilisateur || '',
  });


  if (!isOpen) return null;

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!client.id_utilisateur) {
      console.error("ID utilisateur introuvable.");
      return;
    }

    try {
      const response = await axios.post('/api/clients', client, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success("Client ajouté avec succès.");

        onClientAjoute();  // 🔄 recharge la liste
        onClose();         // ❌ ferme la modale
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Erreur d'ajout client :", err.response?.data || err.message);
      toast.error("Erreur lors de l'ajout du client");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal_AddClient">
     
      <div className="titre-modal">
        <h1>Ajout - Client</h1>
      </div>

        <div className="modal-content_AddClient">           
          <form className="modal-content_AddClient" onSubmit={handleSubmit}>
            <input name="raison_sociale" placeholder="Raison sociale" value={client.raison_sociale} onChange={handleChange} required />
            <input name="adresse" placeholder="Adresse" value={client.adresse} onChange={handleChange} />
            <input name="ville" placeholder="Ville" value={client.ville} onChange={handleChange} />
            <input name="personne_contact" placeholder="Personne contact" value={client.personne_contact} onChange={handleChange} />
            <input name="tel" placeholder="Téléphone" value={client.tel} onChange={handleChange} />
            <input name="mail" type="email" placeholder="Email" value={client.mail} onChange={handleChange} />
           
          <select name="agence" value={client.agence} onChange={handleChange} required>
            <option value="">-- Agence --</option>
            <option value="EPEGA-SA">EPEGA-SA</option>
            <option value="EPEGA-Centre">EPEGA-Centre</option>
            <option value="EPEGA-Conseil">EPEGA-Conseil</option>
            <option value="EPEGA-Corporate">EPEGA-Corporate</option>
            <option value="EPEGA-Rabat">EPEGA-Rabat</option>
            <option value="EPEGA-Tanger">EPEGA-Tanger</option>
            <option value="EPEGA-Marrakech">EPEGA-Marrakech</option>
            <option value="EPEGA-Agadir">EPEGA-Agadir</option>
            <option value="EPEGA-Laayoune">EPEGA-Laayoune</option>
          </select>

            <select name="commercial" value={client.commercial} onChange={handleChange} required>
            <option value="">-- Commercial --</option>
            <option value="Mouna Medkouri">Mouna Medkouri</option>
            <option value="Fatima Mourabih">Fatima Mourabih</option>
            <option value="Mustapha Chougdali">Mustapha Chougdali</option>
            <option value="Nawal Ben Allali">Nawal Ben Allali</option>
            <option value="Othman Rami">Othman Rami</option>
            <option value="Mohamed Jadrane">Mohamed Jadrane</option>
            <option value="Yassine Benhaissate">Yassine Benhaissate</option>
            </select>
            <div className="btn-group bottom" style={{marginTop: '8px'}}>
              <button id='button-valider' className='btn btn-success' type="submit">Enregistrer</button>
              <button id='reset' className='btn btn-annuler' type="button" onClick={onClose}>Annuler</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAjoutClient;
