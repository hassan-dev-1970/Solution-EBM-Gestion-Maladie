import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../Styles/permissions.css';
import '../Modal/Modal.css';

const GestionPermissions = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [permissions, setPermissions] = useState([]);

  // Charger les rôles
  useEffect(() => {
    axios.get('/api/roles')
      .then((res) => setRoles(res.data))
      .catch((err) => console.error('Erreur chargement rôles', err));
  }, []);

  // Charger les permissions d’un rôle
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (selectedRoleId && token) {
      axios
       .get(`/api/roles/${selectedRoleId}/permissions`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
          console.log('🔎 Permissions :', res.data);
          setPermissions(res.data);
        })
        .catch((err) => console.error('Erreur chargement permissions', err));
    } else {
      setPermissions([]);
    }
  }, [selectedRoleId]);

  // Activer/désactiver une permission
  const togglePermission = (id) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.id_permission === id ? { ...p, active: p.active ? 0 : 1 } : p
      )
    );
  };

  // Sauvegarder les permissions
const handleSubmit = async () => {
  try {
    const token = localStorage.getItem('token'); // ✅ récupère le token

    const permissionIds = permissions
      .filter((p) => p.active)
      .map((p) => p.id_permission);

    await axios.post(
      `/api/roles/${selectedRoleId}/permissions`,
      { permissions: permissionIds },
      {
        headers: {
          Authorization: `Bearer ${token}` // ✅ ajoute le token ici
        }
      }
    );

    toast.success('Permissions mises à jour avec succès.');
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de l'enregistrement des permissions.");
  }
};

  return (
    <div className="permissions-container">
      <h2>Gestion des Permissions</h2>

      {/* Sélection du rôle */}
      <div className="form-group">
        <select
          id="roleSelect"
          value={selectedRoleId}
          onChange={(e) => setSelectedRoleId(e.target.value)}
        >
          <option value="">-- Choisir un rôle --</option>
          {roles.map((role) => (
            <option key={role.id_role} value={role.id_role}>
              {role.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Liste des permissions */}
      {selectedRoleId && (
        <div className="permissions-list">
          <div className='btn-group'>
            <button className="btn btn-success" onClick={handleSubmit}>Enregistrer</button>
            <Link to="/ajouter-permission" className="btn btn-add" style={{textAlign:'center'}}>
              Ajouter une permission
            </Link>
          </div>

          {permissions.length > 0 && (
            <table className="table-permissions">
              <thead>
                <tr>
                  <th>Permission</th>
                  <th>Active</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id_permission}>
                    <td>{perm.nom}</td>
                    <td style={{textAlign: 'center'}}>
                      <input
                        type="checkbox"
                        checked={perm.active === 1 || perm.active === "1"}
                        onChange={() => togglePermission(perm.id_permission)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}          
        </div>
      )}
    </div>
  );
};

export default GestionPermissions;
