import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';

const ModalAjoutClient = ({ isOpen, onClose, onClientAjoute }) => {
  const [client, setClient] = useState({
    raison_sociale: '',
    adresse: '',
    ville: '',
    personne_contact: '',
    tel: '',
    mail: '',
    agence: '',
    commercial: '',
    id_utilisateur: ''
  });

  // Récupérer l'ID utilisateur depuis le token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setClient(prev => ({ ...prev, id_utilisateur: payload.id || '' }));
      } catch (err) {
        console.error("Erreur lors du décodage du token :", err);
      }
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!client.id_utilisateur) {
      toast.error("ID utilisateur introuvable.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/clients', client, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success("Client ajouté avec succès.");
        onClientAjoute();  // 🔄 recharge la liste
        setClient({
          raison_sociale: '',
          adresse: '',
          ville: '',
          personne_contact: '',
          tel: '',
          mail: '',
          agence: '',
          commercial: '',
          id_utilisateur: client.id_utilisateur
        });
        onClose();  // ❌ ferme la modale
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Erreur d'ajout client :", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Erreur lors de l'ajout du client");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajout - Client"
      size="medium"
      footer={
        <>
          <button className="btn btn-annuler" type="button" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" type="submit" form="clientForm">Enregistrer</button>
        </>
      }
    >
      <form id="clientForm" onSubmit={handleSubmit}>
        {/* Raison sociale */}
        <div className="form-group">
          <label htmlFor="raison_sociale" className="required">Raison sociale</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="raison_sociale"
              name="raison_sociale"
              value={client.raison_sociale}
              onChange={handleChange}
              placeholder="Entrez la raison sociale"
              required
            />
          </div>
        </div>

        {/* Adresse */}
        <div className="form-group">
          <label htmlFor="adresse">Adresse</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="adresse"
              name="adresse"
              value={client.adresse}
              onChange={handleChange}
              placeholder="Entrez l'adresse"
            />
          </div>
        </div>

        {/* Ville et Téléphone côte à côte */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="ville">Ville</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="ville"
                name="ville"
                value={client.ville}
                onChange={handleChange}
                placeholder="Entrez la ville"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tel">Téléphone</label>
            <div className="input-wrapper">
              <input
                type="tel"
                id="tel"
                name="tel"
                value={client.tel}
                onChange={handleChange}
                placeholder="Entrez le téléphone"
              />
            </div>
          </div>
        </div>

        {/* Personne contact et Email côte à côte */}
          <div className="form-group">
            <label htmlFor="personne_contact">Personne contact</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="personne_contact"
                name="personne_contact"
                value={client.personne_contact}
                onChange={handleChange}
                placeholder="Entrez le nom du contact"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mail">Email</label>
            <div className="input-wrapper">
              <input
                type="email"
                id="mail"
                name="mail"
                value={client.mail}
                onChange={handleChange}
                placeholder="Entrez l'email"
              />
            </div>
          </div>

        {/* Agence et Commercial côte à côte */}
          <div className="form-group">
            <label htmlFor="agence" className="required">Agence</label>
            <div className="input-wrapper">
              <select
                id="agence"
                name="agence"
                value={client.agence}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner une agence --</option>
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
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="commercial" className="required">Commercial</label>
            <div className="input-wrapper">
              <select
                id="commercial"
                name="commercial"
                value={client.commercial}
                onChange={handleChange}
                required
              >
                <option value="">-- Sélectionner un commercial --</option>
                <option value="Mouna Medkouri">Mouna Medkouri</option>
                <option value="Fatima Mourabih">Fatima Mourabih</option>
                <option value="Mustapha Chougdali">Mustapha Chougdali</option>
                <option value="Nawal Ben Allali">Nawal Ben Allali</option>
                <option value="Othman Rami">Othman Rami</option>
                <option value="Mohamed Jadrane">Mohamed Jadrane</option>
                <option value="Yassine Benhaissate">Yassine Benhaissate</option>
              </select>
            </div>
          </div>
      </form>
    </Modal>
  );
};

export default ModalAjoutClient;