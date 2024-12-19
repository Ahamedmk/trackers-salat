// src/pages/LoginPage.jsx

import React from 'react';
import { Box,Paper, Typography, TextField, Button } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
// Exemple de chemin du logo
import logo from '../assets/trackers1.png'; // votre logo

function LoginPage() {
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
            <TextField label="Email" variant="outlined" fullWidth />
            <TextField label="Mot de passe" variant="outlined" type="password" fullWidth />
            <Button variant="contained" color="primary">Connexion</Button>
          </Paper>
        </Grid2>

        {/* Logo */}
        <Grid2 xs={12} md={6}>
          {/* Image responsive */}
          <Box
            component="img"
            src={logo}
            alt="Logo"
            sx={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              mx: 'auto', // centrer horizontalement
              mt: { xs: 2, md: 0 } // marge supérieure sur mobile
            }}
          />
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default LoginPage;
