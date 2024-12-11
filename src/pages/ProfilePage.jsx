// src/pages/ProfilePage.js

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import {
  Box,
  Typography,
  Paper,
  Grid
} from '@mui/material';
import { badges } from '../constants/badges';

function ProfilePage() {
  const { currentUser } = useContext(AuthContext);
  const [prayers, setPrayers] = useState([]);
  const [invocations, setInvocations] = useState([]);

  // Fonction pour filtrer les prières du jour
  const filterPrayers = (allPrayers) => {
    // Vous pouvez ajuster ce filtre selon vos besoins
    return allPrayers;
  };

  // Récupérer les prières depuis Firebase
  const fetchPrayers = () => {
    if (!currentUser) return;
    const prayersRef = ref(db, `users/${currentUser.uid}/prayers`);
    onValue(prayersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allPrayers = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        const filteredPrayers = filterPrayers(allPrayers);
        setPrayers(filteredPrayers);
      } else {
        setPrayers([]);
      }
    });
  };

  // Récupérer les invocations depuis Firebase
  const fetchInvocations = () => {
    if (!currentUser) return;
    const invocationsRef = ref(db, `users/${currentUser.uid}/invocations`);
    onValue(invocationsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allInvocations = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setInvocations(allInvocations);
      } else {
        setInvocations([]);
      }
    });
  };

  useEffect(() => {
    fetchPrayers();
    fetchInvocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Calcul total des invocations
  const totalInvocations = invocations.reduce((acc, inv) => acc + inv.count, 0);
  const totalPrayersCount = prayers.length;

  // Fonction pour calculer les badges gagnés
  const calculateEarnedBadges = (totalPrayers, totalInvocations) => {
    return badges.filter(badge => 
      totalPrayers >= badge.criteria.prayers && 
      totalInvocations >= badge.criteria.invocations
    );
  };

  const earnedBadges = calculateEarnedBadges(totalPrayersCount, totalInvocations);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        textAlign="center"
      >
        Profil Utilisateur
      </Typography>

      <Paper
        sx={{
          p: { xs: 2, sm: 4 },
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          width: '100%',
          boxSizing: 'border-box'
        }}
        elevation={3}
      >
        <Typography variant="h5" gutterBottom textAlign="center">
          Vos Badges
        </Typography>
        {earnedBadges.length === 0 ? (
          <Typography variant="body1" textAlign="center">
            Aucun badge gagné pour l'instant.
          </Typography>
        ) : (
          <Grid container spacing={2} justifyContent="center">
            {earnedBadges.map((badge) => (
              <Grid item key={badge.id}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    backgroundColor: '#f0f0f0'
                  }}
                  elevation={2}
                >
                  <Typography variant="body1">{badge.name}</Typography>
                  {/* Ajoutez une icône ou une image pour chaque badge ici */}
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    </Box>
  );
}

export default ProfilePage;
