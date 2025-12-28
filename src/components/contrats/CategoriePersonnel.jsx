
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MessageBanner from '../message/MessageBanner';
import '../contrats/Styles-contrats/CategoriePersonnel.css'; // Assuming you have a CSS file for styling

const CategoriePersonnel = () => {
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [newNom, setNewNom] = useState('');
  const [editing, setEditing] = useState(null);
  const [editNom, setEditNom] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const fetchCategories = React.useCallback(async () => {
    try {
      const res = await axios.get('/api/categorie-personnel', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      setMessage('Erreur chargement des catégories');
      setMessageType('error');
    }
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async () => {
    if (!newNom.trim()) return;

    try {
      await axios.post('/api/categorie-personnel', { nom: newNom }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewNom('');
      setMessage('Catégorie ajoutée');
      setMessageType('success');
      fetchCategories();
    } catch (err) {
      setMessage('Erreur ajout');
      setMessageType('error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette catégorie ?')) return;
    try {
      await axios.delete(`/api/categorie-personnel/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Catégorie supprimée');
      setMessageType('success');
      fetchCategories();
    } catch (err) {
      setMessage('Erreur suppression');
      setMessageType('error');
    }
  };

  const handleEdit = async (id) => {
    try {
      await axios.put(`/api/categorie-personnel/${id}`, { nom: editNom }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditing(null);
      setEditNom('');
      setMessage('Catégorie modifiée');
      setMessageType('success');
      fetchCategories();
    } catch (err) {
      setMessage('Erreur modification');
      setMessageType('error');
    }
  };

  return (
    <div className="categorie-container">
      <h2>Catégories de Personnel</h2>

      {message && (
        <MessageBanner message={message} type={messageType} onClose={() => setMessage('')} />
      )}

      <div className="add-form">
        <input
          type="text"
          placeholder="Nouvelle catégorie"
          value={newNom}
          onChange={(e) => setNewNom(e.target.value)}
        />
        <button onClick={handleAdd}>➕ Ajouter</button>
      </div>

      <table className="categorie-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editing === cat.id ? (
                  <input
                    type="text"
                    value={editNom}
                    onChange={(e) => setEditNom(e.target.value)}
                  />
                ) : (
                  cat.nom
                )}
              </td>
              <td>
                {editing === cat.id ? (
                  <>
                    <button onClick={() => handleEdit(cat.id)}>💾</button>
                    <button onClick={() => setEditing(null)}>❌</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditing(cat.id); setEditNom(cat.nom); }}>✏️</button>
                    <button onClick={() => handleDelete(cat.id)}>🗑️</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CategoriePersonnel;
