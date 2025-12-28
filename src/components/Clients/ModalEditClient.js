import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../Clients/Style-clients/Edit-client.css';
import { toast } from 'react-toastify';

const ModalEditClient = ({ clientData, isOpen, onClose, onClientUpdated }) => {
  const token = localStorage.getItem('token');
  const [client, setClient] = useState(clientData || {});

  useEffect(() => {
    if (clientData) {
      setClient(clientData);
    }
  }, [clientData]);

  const handleChange = (e) => {
    setClient({ ...client, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/api/clients/${client.id_client}`, client, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Client mis à jour avec succès.");

      onClientUpdated(); // Le parent se charge de fermer la modale

    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  if (!isOpen || !clientData) return null;

  return (
    <div className="modal-overlay">
      <div className="modal_modif_client">
        <form className="modal-content_EditClient" onSubmit={handleSubmit}>
          <div className="titre_EditClient">
          <h2>Modifier le Client</h2> 
          </div>
          
<div className="form-group">
          <label htmlFor="raison_sociale">Raison Sociale</label>
          <input type="text" name="raison_sociale" placeholder="Raison sociale"
            value={client.raison_sociale || ''} onChange={handleChange} required />
</div>
<div className="form-group">
          <label htmlFor="adresse">Adresse</label>
          <input type="text" name="adresse" placeholder="Adresse"
            value={client.adresse || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="ville">Ville</label>
          <input type="text" name="ville" placeholder="Ville"
            value={client.ville || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="personne_contact">Personne Contact</label>
          <input type="text" name="personne_contact" placeholder="Personne contact"
            value={client.personne_contact || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="tel">Téléphone</label>
          <input type="text" name="tel" placeholder="Téléphone"
            value={client.tel || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="mail">Email</label>
          <input name="mail" type="email" placeholder="Email"
            value={client.mail || ''} onChange={handleChange} />
</div>
<div className="form-group">
          <label htmlFor="agence">Agence</label>
          <select name="agence" value={client.agence || ''} onChange={handleChange} required>
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
</div>
<div className="form-group">
          <label htmlFor="commercial">Commercial</label>
            <select name="commercial" value={client.commercial || ''} onChange={handleChange} required>
            <option value="">-- Commercial --</option>
           <option value="Mouna Medkouri">Mouna Medkouri</option>
            <option value="Fatima Mourabih">Fatima Mourabih</option>
            <option value="Mustapha Chougdali">Mustapha Chougdali</option>
            <option value="Nawal Ben Allali">Nawal Ben Allali</option>
            <option value="Othman Rami">Othman Rami</option>
            <option value="Mohamed Jadrane">Mohamed Jadrane</option>
            <option value="Yassine Benhaissate">Yassine Benhaissate</option>
            </select>
</div>
<div className="form-group">
          <label htmlFor="date_creation">Date de Création</label>
          <input type="date" name="date_creation" placeholder="Date de création"
            value={client.date_creation ? new Date(client.date_creation).toISOString().split('T')[0] : ''}
            onChange={handleChange} />
</div>
          <div className="modal-button">
            <button className="valider_button" type="submit">Enregistrer</button>
            <button className="cancel_button" type="button" onClick={onClose}>Annuler</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalEditClient;