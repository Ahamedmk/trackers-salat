// src/pages/PrayersPage.js
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ref, push, onValue, update, remove } from 'firebase/database';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

function PrayersPage() {
  const { currentUser } = useContext(AuthContext);

  const [prayerType, setPrayerType] = useState('Fajr');
  const [location, setLocation] = useState('maison');
  const [note, setNote] = useState('');
  const [onTimeStatus, setOnTimeStatus] = useState('on-time');
  const [prayers, setPrayers] = useState([]);

  // Etats pour gérer le pop-up "déjà validé"
  const [alreadyValidatedOpen, setAlreadyValidatedOpen] = useState(false);

  // Etats pour la modification d'une prière
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [prayerToEdit, setPrayerToEdit] = useState(null);
  const [editPrayerType, setEditPrayerType] = useState('Fajr');
  const [editLocation, setEditLocation] = useState('maison');
  const [editNote, setEditNote] = useState('');
  const [editOnTimeStatus, setEditOnTimeStatus] = useState('on-time');

  // Filtre pour obtenir uniquement les prières du jour
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
        const todaysPrayers = filterTodayPrayers(allPrayers);
        setPrayers(todaysPrayers);
      } else {
        setPrayers([]);
      }
    });
  };

  useEffect(() => {
    fetchPrayers();
  }, [currentUser]);

  const handleAddPrayer = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // Vérifier si une prière du même type existe déjà aujourd'hui
    const alreadyExists = prayers.some((p) => p.type === prayerType);

    if (alreadyExists) {
      setAlreadyValidatedOpen(true);
      return;
    }

    const prayersRef = ref(db, `users/${currentUser.uid}/prayers`);
    await push(prayersRef, {
      type: prayerType,
      location,
      note,
      onTimeStatus,
      date: { ".sv": "timestamp" }
    });

    setNote('');
  };

  const handleCloseAlreadyValidated = () => {
    setAlreadyValidatedOpen(false);
  };

  const handleDeletePrayer = async (prayerId) => {
    if (!currentUser) return;
    const prayerRef = ref(db, `users/${currentUser.uid}/prayers/${prayerId}`);
    await remove(prayerRef);
  };

  const handleEditPrayerOpen = (p) => {
    setPrayerToEdit(p);
    setEditPrayerType(p.type);
    setEditLocation(p.location);
    setEditNote(p.note || '');
    setEditOnTimeStatus(p.onTimeStatus || 'on-time');
    setEditDialogOpen(true);
  };

  const handleEditPrayerClose = () => {
    setEditDialogOpen(false);
    setPrayerToEdit(null);
  };

  const handleEditPrayerSave = async () => {
    if (!currentUser || !prayerToEdit) return;
    const prayerRef = ref(db, `users/${currentUser.uid}/prayers/${prayerToEdit.id}`);
    await update(prayerRef, {
      type: editPrayerType,
      location: editLocation,
      note: editNote,
      onTimeStatus: editOnTimeStatus
    });
    setEditDialogOpen(false);
    setPrayerToEdit(null);
  };

  // Animation framer-motion : paramètres pour l'apparition
  const itemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Ajouter une Prière</Typography>
        <Box component="form" onSubmit={handleAddPrayer} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          <FormControl fullWidth>
            <InputLabel>Type de prière</InputLabel>
            <Select value={prayerType} label="Type de prière" onChange={(e) => setPrayerType(e.target.value)}>
              <MenuItem value="Fajr">Fajr</MenuItem>
              <MenuItem value="Dhuhr">Dhuhr</MenuItem>
              <MenuItem value="Asr">Asr</MenuItem>
              <MenuItem value="Maghrib">Maghrib</MenuItem>
              <MenuItem value="Isha">Isha</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Lieu</InputLabel>
            <Select value={location} label="Lieu" onChange={(e) => setLocation(e.target.value)}>
              <MenuItem value="maison">Maison</MenuItem>
              <MenuItem value="mosquée">Mosquée</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select value={onTimeStatus} label="Statut" onChange={(e) => setOnTimeStatus(e.target.value)}>
              <MenuItem value="on-time">À l'heure</MenuItem>
              <MenuItem value="late">En retard</MenuItem>
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
        <Typography variant="h5" gutterBottom>Prières d'aujourd'hui</Typography>
        {prayers.length === 0 ? (
          <Typography variant="body1">Aucune prière enregistrée pour aujourd'hui.</Typography>
        ) : (
          <AnimatePresence>
            {prayers.map((p) => (
              <motion.div
                key={p.id}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ marginBottom: '16px' }}
              >
                <Paper sx={{ p: 2 }} elevation={1}>
                  <Typography><strong>{p.type}</strong> - {p.location}</Typography>
                  {p.note && <Typography>Note : {p.note}</Typography>}
                  <Typography>Statut : {p.onTimeStatus === 'on-time' ? "À l'heure" : "En retard"}</Typography>
                  {p.date && <Typography>Date : {new Date(p.date).toLocaleString()}</Typography>}
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button variant="outlined" color="secondary" onClick={() => handleEditPrayerOpen(p)}>Modifier</Button>
                    <Button variant="outlined" color="error" onClick={() => handleDeletePrayer(p.id)}>Supprimer</Button>
                  </Box>
                </Paper>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Paper>

      {/* Dialog pour "déjà validé" */}
      <Dialog open={alreadyValidatedOpen} onClose={handleCloseAlreadyValidated}>
        <DialogTitle>Déjà Validé</DialogTitle>
        <DialogContent>
          <Typography>Vous avez déjà validé cette prière aujourd'hui.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlreadyValidated}>OK</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour modifier une prière */}
      <Dialog open={editDialogOpen} onClose={handleEditPrayerClose}>
        <DialogTitle>Modifier la Prière</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Type de prière</InputLabel>
            <Select value={editPrayerType} label="Type de prière" onChange={(e) => setEditPrayerType(e.target.value)}>
              <MenuItem value="Fajr">Fajr</MenuItem>
              <MenuItem value="Dhuhr">Dhuhr</MenuItem>
              <MenuItem value="Asr">Asr</MenuItem>
              <MenuItem value="Maghrib">Maghrib</MenuItem>
              <MenuItem value="Isha">Isha</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Lieu</InputLabel>
            <Select value={editLocation} label="Lieu" onChange={(e) => setEditLocation(e.target.value)}>
              <MenuItem value="maison">Maison</MenuItem>
              <MenuItem value="mosquée">Mosquée</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Statut</InputLabel>
            <Select value={editOnTimeStatus} label="Statut" onChange={(e) => setEditOnTimeStatus(e.target.value)}>
              <MenuItem value="on-time">À l'heure</MenuItem>
              <MenuItem value="late">En retard</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Note (optionnel)"
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            multiline
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditPrayerClose}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={handleEditPrayerSave}>Enregistrer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PrayersPage;
