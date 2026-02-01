// src/affiliation/useAdhesionCount.js
import { useState, useEffect } from 'react';

const useAdhesionCount = (userRole) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Si le rôle n'est pas encore chargé, ne rien faire
    if (userRole === undefined || userRole === null) return;

    // Si ce n'est pas un souscripteur, compteur = 0
    if (userRole !== 'user_distant-souscripteur') {
      setCount(0);
      return;
    }

    const fetchCount = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/adhesions/count/soumis', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setCount(data.count || 0);
      } catch (err) {
        console.error("Erreur compteur :", err);
        setCount(0);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userRole]); // 👈 dépendance sur userRole

  return { count };
};

export default useAdhesionCount;