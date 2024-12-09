// src/pages/PrayersPage.js
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ref, push, onValue } from 'firebase/database';
import { Typography, Paper, Box, Button, Select, MenuItem, TextField, FormControl, InputLabel } from '@mui/material';

function PrayersPage() {
  const { currentUser } = useContext(AuthContext);
  const [prayerType, setPrayerType] = useState('Fajr');
  const [location, setLocation] = useState('maison');
  const [note, setNote] = useState('');
  const [prayers, setPrayers] = useState([]);

  const handleAddPrayer = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const prayersRef = ref(db, `users/${currentUser.uid}/prayers`);
    await push(prayersRef, {
      type: prayerType,
      location,
      note,
      date: { ".sv": "timestamp" }
    });
    setNote('');
  };

  const fetchPrayers = () => {
    if (!currentUser) return;
    const prayersRef = ref(db, `users/${currentUser.uid}/prayers`);
    onValue(prayersRef, (snapshot) => {
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
  };

  useEffect(() => {
    fetchPrayers();
  }, [currentUser]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Ajouter une Prière</Typography>
        <Box component="form" onSubmit={handleAddPrayer} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControl>
            <InputLabel>Type de prière</InputLabel>
            <Select value={prayerType} label="Type de prière" onChange={(e) => setPrayerType(e.target.value)}>
              <MenuItem value="Fajr">Fajr</MenuItem>
              <MenuItem value="Dhuhr">Dhuhr</MenuItem>
              <MenuItem value="Asr">Asr</MenuItem>
              <MenuItem value="Maghrib">Maghrib</MenuItem>
              <MenuItem value="Isha">Isha</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Lieu</InputLabel>
            <Select value={location} label="Lieu" onChange={(e) => setLocation(e.target.value)}>
              <MenuItem value="maison">Maison</MenuItem>
              <MenuItem value="mosquée">Mosquée</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Note (optionnel)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            multiline
          />
          <Button variant="contained" type="submit" color="primary">Ajouter</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Liste de vos Prières</Typography>
        {prayers.length === 0 ? (
          <Typography variant="body1">Aucune prière enregistrée.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {prayers.map((p) => (
              <Paper key={p.id} sx={{ p: 2 }}>
                <Typography><strong>{p.type}</strong> - {p.location}</Typography>
                {p.note && <Typography>Note : {p.note}</Typography>}
                {p.date && <Typography>Date : {new Date(p.date).toLocaleString()}</Typography>}
              </Paper>
            ))}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default PrayersPage;
