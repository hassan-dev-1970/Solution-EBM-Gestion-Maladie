import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './components/utilisateurs/AuthContext'; // ✅ importe ton contexte

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <AuthProvider> {/* ✅ CONTEXT ici */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
