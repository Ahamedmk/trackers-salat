// src/pages/StatisticsPage.js
import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function StatisticsPage() {
  const { currentUser } = useContext(AuthContext);
  const [prayers, setPrayers] = useState([]);
  const [period, setPeriod] = useState(7); // Période en jours (7 par défaut)

  useEffect(() => {
    if (!currentUser) return;

    const prayersRef = ref(db, `users/${currentUser.uid}/prayers`);
    const unsubscribe = onValue(prayersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const prayersList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        setPrayers(prayersList);
      } else {
        setPrayers([]);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser]);

  // Calcul des stats en fonction de la période
  const now = Date.now();
  const periodInMs = period * 24 * 60 * 60 * 1000;
  const startTime = now - periodInMs;

  const recentPrayers = prayers.filter((p) => {
    if (!p.date) return false;
    const prayerTime = typeof p.date === 'number' ? p.date : Number(p.date); 
    return prayerTime >= startTime;
  });

  const totalPrayers = recentPrayers.length;
  const mosquePrayers = recentPrayers.filter((p) => p.location === 'mosquée').length;
  const homePrayers = recentPrayers.filter((p) => p.location === 'maison').length;

  const data = {
    labels: ['Mosquée', 'Maison'],
    datasets: [
      {
        label: `Prières sur les ${period} derniers jours`,
        data: [mosquePrayers, homePrayers],
        backgroundColor: ['rgba(54, 162, 235, 0.5)', 'rgba(255, 99, 132, 0.5)'],
        borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
        borderWidth: 1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Distribution des Prières'
      }
    }
  };

  return (
    <div>
      <h1>Statistiques</h1>
      <div>
        <label>Période :</label>
        <select value={period} onChange={(e) => setPeriod(Number(e.target.value))}>
          <option value={7}>7 jours</option>
          <option value={30}>30 jours</option>
          <option value={90}>90 jours</option>
        </select>
      </div>

      <p>Total de prières : {totalPrayers}</p>
      <p>Prières à la mosquée : {mosquePrayers}</p>
      <p>Prières à la maison : {homePrayers}</p>

      <div style={{ maxWidth: '500px', margin: 'auto' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default StatisticsPage;
