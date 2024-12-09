import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Accueil</h1>
      <p>Bienvenue sur le Tracker de Prières et Invocations.</p>
      <Link to="/login">Se connecter</Link> | <Link to="/register">S'inscrire</Link>
    </div>
  );
}

export default HomePage;
