// src/pages/ProfilePage.jsx

import { useContext, useState, useEffect } from 'react';
import Grid2 from '@mui/material/Grid2'; // Import de Grid2
import {
  Box,
  Typography,
  Paper,
  Container,
  Avatar,
  Button,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, onValue, set } from 'firebase/database';
import { db, storage } from '../firebase';
import { AuthContext } from '../context/AuthContext';

// On suppose que vous utilisez la même logique de badges que dans StatistiquesPage
import { badges } from '../constants/badges';

// Optionnel : fonction pour calculer les badges, identique à StatistiquesPage
function calculateEarnedBadges(totalPrayers, totalInvocations) {
  return badges.filter((badge) => 
    totalPrayers >= badge.criteria.prayers && 
    totalInvocations >= badge.criteria.invocations
  );
}

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);

  const [profilePhoto, setProfilePhoto] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [prayers, setPrayers] = useState([]);
  const [invocations, setInvocations] = useState([]);
  const [badgesEarned, setBadgesEarned] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    // 1) Charger la photo depuis localStorage si dispo
    const storedPhoto = localStorage.getItem('profilePhoto');
    if (storedPhoto) {
      setProfilePhoto(storedPhoto);
    }

    // 2) Charger la photo depuis la DB (écrase potentiellement la version localStorage si plus récent)
    const photoRef = dbRef(db, `users/${currentUser.uid}/profilePhoto`);
    onValue(photoRef, (snapshot) => {
      const url = snapshot.val();
      if (url) {
        setProfilePhoto(url);
        localStorage.setItem('profilePhoto', url); // synchronise localStorage
      }
    });

    // 3) Charger les prières
    const prayersRef = dbRef(db, `users/${currentUser.uid}/prayers`);
    onValue(prayersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allPrayers = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setPrayers(allPrayers);
      } else {
        setPrayers([]);
      }
    });

    // 4) Charger les invocations
    const invRef = dbRef(db, `users/${currentUser.uid}/invocations`);
    onValue(invRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allInv = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        setInvocations(allInv);
      } else {
        setInvocations([]);
      }
    });
  }, [currentUser]);

  // Calculer les stats
  const totalPrayers = prayers.length;
  const totalInvocations = invocations.reduce((acc, inv) => acc + (inv.count || 0), 0);

  useEffect(() => {
    // Calcul des badges gagnés identique à StatisticsPage
    const earned = calculateEarnedBadges(totalPrayers, totalInvocations);
    setBadgesEarned(earned);
  }, [totalPrayers, totalInvocations]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handlePhotoUpload = async () => {
    if (!selectedFile || !currentUser) return;
    setUploading(true);

    try {
      const fileRef = storageRef(storage, `profilePhotos/${currentUser.uid}`);
      await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(fileRef);

      // Mettre à jour la DB
      const userRef = dbRef(db, `users/${currentUser.uid}/profilePhoto`);
      await set(userRef, downloadURL);

      // Mettre à jour localStorage
      localStorage.setItem('profilePhoto', downloadURL);

      setProfilePhoto(downloadURL);
      setSelectedFile(null);
    } catch (error) {
      console.error('Erreur upload photo profil :', error);
    }
    setUploading(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Mon Profil</Typography>

      {/* Photo de profil */}
      <Paper sx={{ p: 3, mb: 4, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Avatar
          src={profilePhoto}
          alt="Photo de profil"
          sx={{ width: 120, height: 120 }}
        />
        <label htmlFor="icon-button-file">
          <input
            accept="image/*"
            id="icon-button-file"
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <IconButton color="primary" aria-label="upload picture" component="span">
            <PhotoCamera />
          </IconButton>
        </label>
        {selectedFile && (
          <Typography variant="body2">
            {selectedFile.name}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handlePhotoUpload}
          disabled={!selectedFile || uploading}
        >
          {uploading ? <CircularProgress size={24} color="inherit" /> : "Mettre à jour la photo"}
        </Button>
      </Paper>

      {/* Badges synchronisés avec Statistiques */}
      <Typography variant="h5" gutterBottom>Mes Badges</Typography>
      {badgesEarned.length === 0 ? (
        <Typography>Aucun badge gagné pour l'instant.</Typography>
      ) : (
        <gap-2 container spacing={2}>
          {badgesEarned.map((badge) => (
            <Grid2 xs={12} sm={6} md={4} key={badge.id}>
              <Paper sx={{ p: 2, textAlign: 'center'}}>
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {badge.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {badge.description || 'Description du badge.'}
                </Typography>
              </Paper>
            </Grid2>
          ))}
        </gap-2>
      )}
    </Container>
  );
}

export default ProfilePage;
