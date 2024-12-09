// src/components/AppLayout.js
import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useContext as useReactContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

function AppLayout({ children }) {
  const { currentUser } = useReactContext(AuthContext);
  const { darkMode, setDarkMode } = useReactContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={RouterLink} to="/" style={{ textDecoration: 'none', color: '#fff', marginRight: 'auto' }}>
            Tracker Prières & Invocations
          </Typography>
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
          {currentUser ? (
            <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
          ) : (
            <>
              <Button component={RouterLink} to="/login" color="inherit">Connexion</Button>
              <Button component={RouterLink} to="/register" color="inherit">Inscription</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4, flexGrow: 1 }}>
        {children}
      </Container>
      <Box component="footer" sx={{ p: 2, textAlign: 'center', mt: 'auto', backgroundColor: 'background.paper' }}>
        <Typography variant="body2" color="textSecondary">© {new Date().getFullYear()} - Mon Tracker</Typography>
      </Box>
    </Box>
  );
}

export default AppLayout;
