// src/components/AppLayout.js
import React, { useContext, useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, Button, IconButton, Drawer, List, ListItem, ListItemText, Divider, ListItemButton } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { ThemeContext } from '../context/ThemeContext';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import MenuIcon from '@mui/icons-material/Menu';

function AppLayout({ children }) {
  const { currentUser } = useContext(AuthContext);
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleDrawer = (open) => (event) => {
    // Pour éviter que le toggle se produise sur un clavier sur Tab ou Shift (accessibilité)
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  // Contenu du drawer (menu burger)
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {currentUser ? (
          <>
            <ListItem>
             <ListItemButton component={RouterLink} to="/dashboard">
              <ListItemText primary="Tableau de Bord" />
              </ListItemButton>
            </ListItem>
            <ListItem>
  <ListItemButton component={RouterLink} to="/prayers">
    <ListItemText primary="Prières" />
  </ListItemButton>
</ListItem>
            <ListItem>
            <ListItemButton component={RouterLink} to="/invocations">
              <ListItemText primary="Invocations" />
              </ListItemButton>
            </ListItem>

            <ListItem>
            <ListItemButton component={RouterLink} to="/profils">
              <ListItemText primary="Profils" />
              </ListItemButton>
            </ListItem>

            <ListItem>
            <ListItemButton component={RouterLink} to="/statistics">
              <ListItemText primary="Statistiques" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem>
            <ListItemButton onClick={handleLogout}>
              <ListItemText primary="Déconnexion" />
              </ListItemButton>
            </ListItem>
          </>
        ) : (
          <>
            <ListItem>
            <ListItemButton  component={RouterLink} to="/login">
              <ListItemText primary="Connexion" />
              </ListItemButton>
            </ListItem>
            <ListItem >
            <ListItemButton component={RouterLink} to="/register">
    
              <ListItemText primary="Inscription" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          {/* Bouton menu burger */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ mr: 2, display: { xs: 'inline-flex', md: 'none' } }} // visible surtout en mobile
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component={RouterLink} to="/" style={{ textDecoration: 'none', color: '#fff', marginRight: 'auto' }}>
            Tracker Prières & Invocations
          </Typography>

          {/* Bouton dark mode */}
          <IconButton color="inherit" onClick={toggleDarkMode} sx={{ mr: 1 }}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          {/* Boutons connexion/déconnexion (affichés en desktop) */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {currentUser ? (
              <Button color="inherit" onClick={handleLogout}>Déconnexion</Button>
            ) : (
              <>
                <Button component={RouterLink} to="/login" color="inherit">Connexion</Button>
                <Button component={RouterLink} to="/register" color="inherit">Inscription</Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer (menu burger) */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>

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
