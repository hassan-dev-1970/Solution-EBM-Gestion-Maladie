import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import '../utilisateurs/style-users/ajout-permission.css'; // Assurez-vous d'avoir ce fichier CSS pour le style

const AjouterPermission = () => {
  const [permissions, setPermissions] = useState([]);
  const [newPermission, setNewPermission] = useState('');

  // Utilisation de useNavigate pour la navigation
    const navigate = useNavigate();

  // Retourner à la page de gestion des permissions
  const handleRetour = () => {
    navigate('/permissions');
  };

  // Charger les permissions existantes
  useEffect(() => {
    axios.get('/api/permissions')
      .then(res => setPermissions(res.data))
      .catch(err => console.error("Erreur chargement permissions :", err));
  }, []);

  // Ajouter une nouvelle permission
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newPermission.trim()) return;

    try {
      await axios.post('/api/permissions', { nom: newPermission.trim() });
      toast.success("Permission ajoutée avec succès.");
      setPermissions(prev => [...prev, { nom: newPermission.trim() }]);
      setNewPermission('');
    } catch (error) {
      toast.error("Erreur lors de l'ajout.");
      console.error(error);
    }
  };

return (
  <>
    
    <div className="form-container-ajout-permission">
    <div className="titre-permission">
      <h2>Ajouter une nouvelle permission</h2>
    </div>
      <form onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Ajouter ici la nouvelle permission - Ex. utilisateur:consulter"
          value={newPermission}
          onChange={(e) => setNewPermission(e.target.value)}
          required
        />
        <div className="bouton">
        <button className="btn btn-success" type="submit">Ajouter</button>
        <button className="btn btn-retour" onClick={handleRetour}>Retour</button>
      </div>
      </form>

<div className="titre-permission"> <h4 className='h4'>Permissions existantes</h4></div>
     
     <table className="permissions-table">
  <thead>
    <tr>
      <th>Ordre</th>
      <th>Nom de la permission</th>
    </tr>
  </thead>
  <tbody>
    {permissions.map((perm, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{perm.nom}</td>
      </tr>
    ))}
  </tbody>
</table>
    </div>
  </>
);
};

export default AjouterPermission;
