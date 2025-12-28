import { createContext, useContext, useState, useEffect } from 'react';

// Crée le contexte
export const AuthContext = createContext();

// Fournisseur du contexte
export const AuthProvider = ({ children }) => {
  // ✅ Initialise le user depuis localStorage s’il existe
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Erreur parsing user depuis localStorage :", e);
      return null;
    }
  });

  // ✅ Met à jour localStorage dès que le user change
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook pratique
export const useAuth = () => useContext(AuthContext);
