// src/pages/LoginPage.jsx

import React, { useState, useContext } from 'react';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import logo from '../assets/trackers1.png';

import { AuthContext } from '../context/AuthContext'; 
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase'; // assurez-vous que ce 'auth' est configuré

function LoginPage() {
  const { currentUser } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
      // une fois connecté, currentUser sera mis à jour par AuthContext
      // vous pouvez rediriger l'utilisateur vers une page dashboard, par exemple
    } catch (err) {
      console.error("Erreur login:", err);
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', p: 2 }}>
      <Grid2
        container
        spacing={2}
        sx={{ height: '100%' }}
        justifyContent="center"
        alignItems="center"
      >
        {/* Formulaire Login */}
        <Grid2 xs={12} md={6}>
          <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h5" gutterBottom>Se Connecter</Typography>
            
            {error && <Typography color="error">{error}</Typography>}

            <TextField 
              label="Email" 
              variant="outlined" 
              fullWidth 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField 
              label="Mot de passe" 
              variant="outlined" 
              type="password" 
              fullWidth 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleLogin}
            >
              Connexion
            </Button>
          </Paper>
        </Grid2>

        {/* Logo */}
        <Grid2 xs={12} md={6}>
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              mx: 'auto',
              mt: { xs: 2, md: 0 }
            }}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default LoginPage;
