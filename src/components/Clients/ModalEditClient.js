import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from '../Modal/Modal';
import '../Modal/Modal.css';

const ModalEditClient = ({ clientData, isOpen, onClose, onClientUpdated }) => {
  const [client, setClient] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (isOpen && clientData) {
      setClient(clientData);
    }
  }, [isOpen, clientData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setClient(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`/api/clients/${client.id_client}`, client, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Client mis à jour avec succès.");
      onClientUpdated();
      onClose();

    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err);
      toast.error(err.response?.data?.message || "Erreur lors de la mise à jour.");
    }
  };

  if (!isOpen || !clientData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modification - Client"
      size="medium"
      footer={
        <>
          <button className="btn btn-annuler" type="button" onClick={onClose}>Annuler</button>
          <button className="btn btn-success" type="submit" form="editClientForm">Enregistrer</button>
        </>
      }
    >
      <form id="editClientForm" onSubmit={handleSubmit}>
        {/* Raison sociale */}
        <div className="form-group">
          <label htmlFor="raison_sociale" className="required">Raison sociale</label>
          <div className="input-wrapper">
            <input
              type="text"
              id="raison_sociale"
              name="raison_sociale"
              value={client.raison_sociale || ''}
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
              value={client.adresse || ''}
              onChange={handleChange}
              placeholder="Entrez l'adresse"
            />
          </div>
        </div>

        {/* Ville et Téléphone côte à côte */}
          <div className="form-group">
            <label htmlFor="ville">Ville</label>
            <div className="input-wrapper">
              <input
                type="text"
                id="ville"
                name="ville"
                value={client.ville || ''}
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
                value={client.tel || ''}
                onChange={handleChange}
                placeholder="Entrez le téléphone"
              />
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
                value={client.personne_contact || ''}
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
                value={client.mail || ''}
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
                value={client.agence || ''}
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
                value={client.commercial || ''}
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

        {/* Date de création */}
        <div className="form-group">
          <label htmlFor="date_creation">Date de création</label>
          <div className="input-wrapper">
            <input
              type="date"
              id="date_creation"
              name="date_creation"
              value={client.date_creation ? new Date(client.date_creation).toISOString().split('T')[0] : ''}
              onChange={handleChange}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ModalEditClient;