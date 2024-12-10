// src/pages/HomePage.js
import { useContext } from 'react';
import { Box, Typography, Button, Paper, Card, CardContent, CardActions } from '@mui/material';
import Grid from '@mui/material/Grid'; // On utilise le Grid stable
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Icônes
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChatIcon from '@mui/icons-material/Chat';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';

function HomePage() {
  const { currentUser } = useContext(AuthContext);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 6, 
        textAlign: { xs: 'center', md: 'center' }, 
        px: { xs: 2, md: 0 } // Un peu de padding sur mobile pour éviter le dépassement
      }}
    >
      {/* Hero Section */}
      <Paper
        sx={{
          p: 6,
          backgroundColor: 'background.paper',
          borderRadius: 2,
          maxWidth: 'md',
          mx: 'auto', // Centrer horizontalement
          textAlign: 'center'
        }}
        elevation={3}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: 1, 
          mb: 2,
          flexWrap: 'wrap' // Permet de revenir à la ligne sur mobile si besoin
        }}>
          <EmojiPeopleIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography variant="h3" component="h1" sx={{ fontSize: { xs: '2rem', md: '3rem' } }}>
            Bienvenue sur votre Tracker de Prières & Invocations
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Organisez, suivez et améliorez votre régularité spirituelle.
        </Typography>
        {currentUser ? (
          <Button
            component={RouterLink}
            to="/dashboard"
            variant="contained"
            color="primary"
            sx={{ mt: 4 }}
          >
            Accéder à mon Tableau de Bord
          </Button>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row'}, gap: 2, justifyContent: 'center', mt: 4 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              color="primary"
            >
              Commencer Maintenant
            </Button>
            <Button
              component={RouterLink}
              to="/login"
              variant="outlined"
              color="primary"
            >
              Se Connecter
            </Button>
          </Box>
        )}
      </Paper>

      {/* Section présentant les fonctionnalités */}
      <Box sx={{ maxWidth: 'md', mx: 'auto' }}> 
        <Typography variant="h4" gutterBottom textAlign="center">
          Fonctionnalités Clés
        </Typography>
        <Typography variant="body1" textAlign="center" mb={4}>
          Découvrez comment cette application peut vous aider au quotidien.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AutoAwesomeIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h5" gutterBottom>Suivi des Prières</Typography>
                <Typography variant="body2" color="text.secondary">
                  Enregistrez vos prières quotidiennes, notez le lieu (maison ou mosquée) et ajoutez des commentaires.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button component={RouterLink} to="/prayers" variant="outlined" color="primary">En savoir plus</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <ChatIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h5" gutterBottom>Gestion des Invocations</Typography>
                <Typography variant="body2" color="text.secondary">
                  Ajoutez vos invocations, catégorisez-les (matin, soir, après-prière, etc.) et suivez vos récitations.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button component={RouterLink} to="/invocations" variant="outlined" color="primary">En savoir plus</Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon color="primary" sx={{ fontSize: 50, mb: 2 }} />
                <Typography variant="h5" gutterBottom>Statistiques & Graphiques</Typography>
                <Typography variant="body2" color="text.secondary">
                  Visualisez vos progrès, filtrez par période, et motivez-vous en améliorant votre régularité.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <Button component={RouterLink} to="/statistics" variant="outlined" color="primary">En savoir plus</Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default HomePage;
