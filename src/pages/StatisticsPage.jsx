// src/pages/StatisticsPage.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';
import { Box, Typography, Paper, useMediaQuery } from '@mui/material';
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

// Enregistrement des éléments Chart.js
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
  
  // Pour la responsivité, on peut utiliser useMediaQuery pour ajuster la taille des charts
  const isMobile = useMediaQuery('(max-width:600px)');

  const filterTodayPrayers = (allPrayers) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;
    return allPrayers.filter((p) => {
      if (!p.date) return false;
      const prayerTime = typeof p.date === 'number' ? p.date : Number(p.date);
      return prayerTime >= startOfDay && prayerTime <= endOfDay;
    });
  };

  useEffect(() => {
    if (!currentUser) return;

    const prayersRef = ref(db, `users/${currentUser.uid}/prayers`);
    onValue(prayersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const allPrayers = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        const todaysPrayers = filterTodayPrayers(allPrayers);
        setPrayers(todaysPrayers);
      } else {
        setPrayers([]);
      }
    });
  }, [currentUser]);

  // Calcul des stats
  const totalPrayers = prayers.length;
  const onTimeCount = prayers.filter(p => p.onTimeStatus === 'on-time').length;
  const lateCount = prayers.filter(p => p.onTimeStatus === 'late').length;
  const mosqueCount = prayers.filter(p => p.location === 'mosquée').length;
  const homeCount = prayers.filter(p => p.location === 'maison').length;

  // Doughnut chart data pour "on-time" vs "late"
  const doughnutData = {
    labels: ['À l\'heure', 'En retard'],
    datasets: [
      {
        data: [onTimeCount, lateCount],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }
    ]
  };

  // Bar chart data pour "maison" vs "mosquée"
  const barData = {
    labels: ['Maison', 'Mosquée'],
    datasets: [
      {
        label: 'Prières du jour',
        data: [homeCount, mosqueCount],
        backgroundColor: ['rgba(75, 192, 192, 0.5)', 'rgba(153, 102, 255, 0.5)'],
        borderColor: ['rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)'],
        borderWidth: 1
      }
    ]
  };

  // Options pour les charts, responsive
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <Box sx={{ p:4 }}>
      <Typography variant="h4" gutterBottom>Statistiques du jour</Typography>
      {totalPrayers === 0 ? (
        <Typography>Aucune prière enregistrée aujourd'hui.</Typography>
      ) : (
        <Paper sx={{ p:4 }} elevation={3}>
          <Typography variant="h6">Total de prières : {totalPrayers}</Typography>
          <Typography>À l'heure : {onTimeCount}</Typography>
          <Typography>En retard : {lateCount}</Typography>
          <Typography>Maison : {homeCount}</Typography>
          <Typography>Mosquée : {mosqueCount}</Typography>

          {/* Pour l'affichage responsive, on utilise un conteneur qui s'adapte */}
          {/* On peut réduire la largeur max si on est sur mobile */}
          <Box 
            sx={{ 
              maxWidth: isMobile ? '100%' : '300px', 
              mx: 'auto', 
              mt: 4, 
              height: isMobile ? 200 : 300 // hauteur adaptative
            }}
          >
            <Doughnut data={doughnutData} options={commonOptions} />
          </Box>

          <Box
            sx={{
              maxWidth: isMobile ? '100%' : '400px',
              mx: 'auto',
              mt: 4,
              height: isMobile ? 200 : 300
            }}
          >
            <Bar data={barData} options={commonOptions} />
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default StatisticsPage;
