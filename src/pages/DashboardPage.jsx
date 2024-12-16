// src/pages/DashboardPage.js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Grid2 from '@mui/material/Grid2'; // Import de Grid2
import { Typography, Paper, Box, Card, CardContent, CardActions, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// Import des icônes
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';

function DashboardPage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiPeopleIcon color="primary" />
          <Typography variant="h4" gutterBottom>Bienvenue sur votre Tableau de Bord</Typography>
        </Box>
        {currentUser && (
          <Typography variant="body1" gutterBottom>
            Connecté en tant que : {currentUser.email}
          </Typography>
        )}
        <Typography variant="body2">
          Utilisez les sections ci-dessous pour gérer vos prières, invocations et consulter vos statistiques.
        </Typography>
      </Paper>

      <Grid2 container spacing={2}>
        <Grid2 xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon color="primary" />
                <Typography variant="h5" gutterBottom>Prières</Typography>
              </Box>
              <Typography variant="body2">
                Ajoutez, visualisez et notez vos prières quotidiennes.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to="/prayers" variant="contained" color="primary">Accéder aux Prières</Button>
            </CardActions>
          </Card>
        </Grid2>

        <Grid2 xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon color="primary" />
                <Typography variant="h5" gutterBottom>Invocations</Typography>
              </Box>
              <Typography variant="body2">
                Gérez vos invocations, leur catégorie et suivez leurs récitations.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to="/invocations" variant="contained" color="primary">Accéder aux Invocations</Button>
            </CardActions>
          </Card>
        </Grid2>

        <Grid2 xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssessmentIcon color="primary" />
                <Typography variant="h5" gutterBottom>Statistiques</Typography>
              </Box>
              <Typography variant="body2">
                Consultez des statistiques et visualisations de vos prières récentes.
              </Typography>
            </CardContent>
            <CardActions>
              <Button component={RouterLink} to="/statistics" variant="contained" color="primary">Voir les Statistiques</Button>
            </CardActions>
          </Card>
        </Grid2>
      </Grid2>
    </Box>
  );
}

export default DashboardPage;
