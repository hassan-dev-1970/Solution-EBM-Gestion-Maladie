import axios from 'axios';
import { useState } from 'react';
import { toast } from 'react-toastify';
import '../Clients/Style-clients/Ajout-client.css'; // Import du CSS spécifique pour la modale d'ajout

const ModalAjoutMedicament = ({ isOpen, onClose, onMedicamentAjoute }) => {

  const token = localStorage.getItem('token');
  let id_medicament = '';

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      id_medicament = payload.id;
    } catch (err) {
      console.error("Erreur lors du décodage du token :", err);
    }
  }

  // État local pour les données du médicament
  const [medicament, setMedicament] = useState({
    nom_commercial: '',
    statut_medicament: '',
    dosage: '',
    forme: '',
    classification: '',
    prix: '',
    presentation: '',
    id_medicament: id_medicament || '',
  });


  if (!isOpen) return null;

  const handleChange = (e) => {
    setMedicament({ ...medicament, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!medicament.id_medicament) {
      console.error("ID medicament introuvable.");
      return;
    }

    try {
      const response = await axios.post('/api/medicaments', medicament, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201) {
        toast.success("Médicament ajouté avec succès.");

        onMedicamentAjoute();  // 🔄 recharge la liste
        onClose();         // ❌ ferme la modale
      } else {
        throw new Error("Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("Erreur d'ajout medicament :", err.response?.data || err.message);
      toast.error("Erreur lors de l'ajout du médicament");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal_AddClient">
        <div className="modal-content_AddClient">
          <div className="titre"><h2>Ajouter un Médicament</h2> </div>
           
          <form className="modal-content_AddClient" onSubmit={handleSubmit}>

            <input name="nom_commercial" placeholder="Nom commercial" value={medicament.nom_commercial} onChange={handleChange} required />
          
            <select name="statut_medicament" value={medicament.statut_medicament} onChange={handleChange}>
            <option value="">-- Statut de commercialisation --</option>
            <option value="Commercialisé">Commercialisé</option>
            <option value="Non Commercialise">Non commercialisé</option>
            <option value="Retiré du Marché">Retiré du marché</option>
            <option value="Autre">Autre</option>
          </select>
                        
            <input name="dosage" placeholder="Dosage" value={medicament.dosage} onChange={handleChange} />
            <input name="forme" placeholder="Forme" value={medicament.forme} onChange={handleChange} />
           
          <select name="classification" value={medicament.classification} onChange={handleChange} required>
            <option value="">-- Classification --</option>
            <option value="PP">Princeps</option>
            <option value="GN">Générique</option>
            <option value="Autre">Autre</option>
          </select>

            <input name="prix" type="number" placeholder="Prix" value={medicament.prix} onChange={handleChange} />
            <input name="presentation" placeholder="Présentation" value={medicament.presentation} onChange={handleChange} />
            
            <select name="Remboursable" value={medicament.remboursable} onChange={handleChange} required>
            <option value="">-- Remboursable --</option>
            <option value="Remboursable">Remboursable</option>
            <option value="Non Remboursable">Non remboursable</option>
            <option value="Autre">Autre</option>
          </select>
          
            <div className="modal-actions">
              <button id='button-valider' className='button-valider' type="submit">Enregistrer</button>
              <button id='reset' className='reset' type="button" onClick={onClose}>Annuler</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAjoutMedicament;
