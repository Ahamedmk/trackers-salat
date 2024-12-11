// src/pages/StatisticsPage.jsx

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Grid2 from '@mui/material/Grid2'; // Import de Grid2
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { badges } from '../constants/badges'; // Import des badges

// Enregistrement des éléments nécessaires de Chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

function StatisticsPage() {
  const { currentUser } = useContext(AuthContext);
  const [prayers, setPrayers] = useState([]);
  const [invocations, setInvocations] = useState([]); // Ajout des invocations
  const [selectedDays, setSelectedDays] = useState(7); // Par défaut, les 7 derniers jours

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // 'sm' correspond à 600px par défaut

  // Fonction pour filtrer les prières selon la période sélectionnée
  const filterPrayersByPeriod = (allPrayers, days) => {
    const now = new Date();
    const startOfPeriod = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    ).getTime() - (days - 1) * 24 * 60 * 60 * 1000; // Inclut aujourd'hui
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    return allPrayers.filter((p) => {
      if (!p.date) return false;
      const prayerTime =
        typeof p.date === 'number' ? p.date : Number(p.date);
      return prayerTime >= startOfPeriod && prayerTime <= endOfDay;
    });
  };

  // Fonction pour filtrer les invocations selon la période sélectionnée
  const filterInvocationsByPeriod = (allInvocations, days) => {
    const now = new Date();
    const startOfPeriod = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    ).getTime() - (days - 1) * 24 * 60 * 60 * 1000; // Inclut aujourd'hui
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999
    ).getTime();

    return allInvocations.filter((inv) => {
      if (!inv.lastRecitedAt) return false;
      const recitedTime =
        typeof inv.lastRecitedAt === 'number' ? inv.lastRecitedAt : Number(inv.lastRecitedAt);
      return recitedTime >= startOfPeriod && recitedTime <= endOfDay;
    });
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
        const filteredPrayers = filterPrayersByPeriod(allPrayers, selectedDays);
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
        const filteredInvocations = filterInvocationsByPeriod(allInvocations, selectedDays);
        setInvocations(filteredInvocations);
      } else {
        setInvocations([]);
      }
    });
  };

  useEffect(() => {
    fetchPrayers();
    fetchInvocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, selectedDays]); // Re-fetch les prières et invocations lorsque l'utilisateur ou la période change

  // Calcul des statistiques
  const totalPrayers = prayers.length;
  const onTimeCount = prayers.filter(
    (p) => p.onTimeStatus === 'on-time'
  ).length;
  const lateCount = prayers.filter(
    (p) => p.onTimeStatus === 'late'
  ).length;
  const mosqueCount = prayers.filter(
    (p) => p.location === 'mosquée'
  ).length;
  const homeCount = prayers.filter(
    (p) => p.location === 'maison'
  ).length;

  // Calcul total des invocations
  const totalInvocations = invocations.reduce((acc, inv) => acc + inv.count, 0);

  // Fonction pour calculer les badges gagnés
  const calculateEarnedBadges = (totalPrayers, totalInvocations) => {
    return badges.filter(badge => 
      totalPrayers >= badge.criteria.prayers && 
      totalInvocations >= badge.criteria.invocations
    );
  };

  const earnedBadges = calculateEarnedBadges(totalPrayers, totalInvocations);

  // Données pour le Doughnut Chart (À l'heure vs En retard)
  const doughnutData = {
    labels: ['À l\'heure', 'En retard'],
    datasets: [
      {
        data: [onTimeCount, lateCount],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // Bleu pour "À l'heure"
          'rgba(255, 99, 132, 0.6)'  // Rouge pour "En retard"
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Données pour le Bar Chart (Maison vs Mosquée)
  const barData = {
    labels: ['Maison', 'Mosquée'],
    datasets: [
      {
        label: 'Prières du jour',
        data: [homeCount, mosqueCount],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // Vert pour "Maison"
          'rgba(153, 102, 255, 0.6)' // Violet pour "Mosquée"
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Options communes pour les charts
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: isMobile ? 'bottom' : 'top',
        labels: {
          font: {
            size: isMobile ? 12 : 14
          }
        }
      },
      tooltip: {
        bodyFont: {
          size: isMobile ? 12 : 14
        },
        titleFont: {
          size: isMobile ? 14 : 16
        }
      }
    },
    scales: {
      y: {
        ticks: {
          font: {
            size: isMobile ? 12 : 14
          }
        },
        grid: {
          display: false
        }
      },
      x: {
        ticks: {
          font: {
            size: isMobile ? 12 : 14
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  // Gestion du changement de période
  const handlePeriodChange = (event) => {
    setSelectedDays(event.target.value);
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        width: '100%', // Assurer que la largeur prend tout l'espace disponible
        boxSizing: 'border-box', // Inclure padding dans la largeur
        overflowX: 'hidden' // Empêcher le débordement horizontal
      }}
    >
      <Typography
        variant={isMobile ? 'h5' : 'h4'}
        gutterBottom
        textAlign="center"
      >
        Statistiques des {selectedDays} Derniers Jours
      </Typography>

      {/* Sélection de la période */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel>Période</InputLabel>
          <Select
            value={selectedDays}
            onChange={handlePeriodChange}
            label="Période"
          >
            <MenuItem value={7}>7 Jours</MenuItem>
            <MenuItem value={15}>15 Jours</MenuItem>
            <MenuItem value={30}>30 Jours</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {totalPrayers === 0 && totalInvocations === 0 ? (
        <Typography variant="body1" textAlign="center">
          Aucune prière ni invocation enregistrée pour la période sélectionnée.
        </Typography>
      ) : (
        <Paper
          sx={{
            p: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            width: '100%', // Assurer que la largeur prend tout l'espace disponible
            boxSizing: 'border-box' // Inclure padding dans la largeur
          }}
          elevation={3}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              textAlign: 'center'
            }}
          >
            <Typography variant={isMobile ? 'h6' : 'h5'}>
              Total de Prières : {totalPrayers}
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'}>
              À l'heure : {onTimeCount}
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'}>
              En retard : {lateCount}
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'}>
              Maison : {homeCount}
            </Typography>
            <Typography variant={isMobile ? 'body1' : 'h6'}>
              Mosquée : {mosqueCount}
            </Typography>

            <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ mt: 2 }}>
              Total d'Invocations : {totalInvocations}
            </Typography>
            {/* Vous pouvez ajouter d'autres statistiques liées aux invocations ici */}
          </Box>

          {/* Section des Badges Gagnés */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant={isMobile ? 'h6' : 'h5'} gutterBottom>
              Vos Badges
            </Typography>
            {earnedBadges.length === 0 ? (
              <Typography variant="body1">
                Aucun badge gagné pour l'instant.
              </Typography>
            ) : (
              <Grid2 container spacing={2} justifyContent="center">
                {earnedBadges.map((badge) => (
                  <Grid2 key={badge.id} xs={6} sm={4} md={3}>
                    <Paper
                      sx={{
                        p: 2,
                        textAlign: 'center',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                      elevation={2}
                    >
                      {/* Ajoutez une icône ou une image pour chaque badge ici */}
                      <Typography variant="body1">{badge.name}</Typography>
                    </Paper>
                  </Grid2>
                ))}
              </Grid2>
            )}
          </Box>

          {/* Conteneur pour les graphiques */}
          <Grid2
            container
            spacing={4}
            direction={isMobile ? 'column' : 'row'}
            justifyContent="center"
            alignItems="center"
          >
            {/* Doughnut Chart */}
            <Grid2 xs={12} sm={6}>
              <Box
                sx={{
                  width: '100%',
                  height: isMobile ? 200 : 300
                }}
              >
                <Doughnut data={doughnutData} options={commonOptions} />
              </Box>
            </Grid2>

            {/* Bar Chart */}
            <Grid2 xs={12} sm={6}>
              <Box
                sx={{
                  width: '100%',
                  height: isMobile ? 200 : 300
                }}
              >
                <Bar data={barData} options={commonOptions} />
              </Box>
            </Grid2>
          </Grid2>
        </Paper>
      )}
    </Box>
  );
}

export default StatisticsPage;
