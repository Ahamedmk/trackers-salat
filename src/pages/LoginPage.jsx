// src/pages/LoginPage.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, Paper } from '@mui/material';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (error) {
      console.log('Erreur de connexion :', error);
    }
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, margin: '0 auto', mt: 4 }} elevation={3}>
      <Typography variant="h5" gutterBottom>Connexion</Typography>
      <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Email"
          type="email"
          value={email}
          fullWidth
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Mot de passe"
          type="password"
          value={password}
          fullWidth
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button variant="contained" type="submit" color="primary">Se connecter</Button>
      </Box>
    </Paper>
  );
}

export default LoginPage;
