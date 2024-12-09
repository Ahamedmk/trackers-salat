// src/components/PrivateRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

function PrivateRoute({ children }) {
  const { currentUser } = useContext(AuthContext);

  if (!currentUser) {
    // Si pas d'utilisateur, on redirige vers /login
    return <Navigate to="/login" replace />;
  }

  // Si utilisateur connecté, on rend le contenu
  return children;
}

export default PrivateRoute;
