// src/pages/ParametresPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Container,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import Grid2 from '@mui/material/Grid2'; // Import de Grid2
import DeleteIcon from '@mui/icons-material/Delete';
import { ref as dbRef, push, set, onValue, remove } from 'firebase/database';
import { db } from '../firebase'; // Votre instance Realtime DB
import { ThemeContext } from '../context/ThemeContext'; // Import du contexte du thème

// Quelques couleurs proposées
const colorOptions = [
  { label: 'Vert Pastel', value: '#F2FFF2' },
  { label: 'Beige', value: '#FFF8E1' },
  { label: 'Bleu Clair', value: '#E1F5FE' },
  { label: 'Rose très clair', value: '#FCE4EC' }
];

function ParametresPage() {
  const [invocationText, setInvocationText] = useState('');
  const [invocationList, setInvocationList] = useState([]);

  const { backgroundColor, setBackgroundColor } = useContext(ThemeContext);

  useEffect(() => {
    // Charger la liste des invocations
    const invRef = dbRef(db, 'invocations');
    onValue(invRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setInvocationList(list);
      } else {
        setInvocationList([]);
      }
    });
  }, []);

  const handleAddInvocation = (e) => {
    e.preventDefault();
    if (!invocationText.trim()) return;

    const invRef = dbRef(db, 'invocations');
    const newInvRef = push(invRef);
    set(newInvRef, {
      text: invocationText,
      createdAt: Date.now(),
    });

    setInvocationText('');
  };

  const handleDeleteInvocation = (id) => {
    // Supprimer l’invocation dans la DB
    const itemRef = dbRef(db, `invocations/${id}`);
    remove(itemRef);
  };

  const handleChangeColor = (e) => {
    setBackgroundColor(e.target.value);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Paramètres : Gérer les Invocations</Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>Ajouter une Invocation</Typography>
        <Box
          component="form"
          onSubmit={handleAddInvocation}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}
        >
          <TextField
            label="Nom de l'Invocation"
            value={invocationText}
            onChange={(e) => setInvocationText(e.target.value)}
            required
          />
          <Button variant="contained" type="submit">Ajouter</Button>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom>Liste des Invocations</Typography>
      {invocationList.length === 0 ? (
        <Typography variant="body1">Aucune invocation enregistrée.</Typography>
      ) : (
        <Grid2 container spacing={2}>
          {invocationList.map((inv) => (
            <Grid2 xs={12} sm={6} md={4} key={inv.id}>
              <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{inv.text}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ajoutée le {new Date(inv.createdAt).toLocaleString()}
                  </Typography>
                </Box>
                <IconButton color="error" onClick={() => handleDeleteInvocation(inv.id)}>
                  <DeleteIcon />
                </IconButton>
              </Paper>
            </Grid2>
          ))}
        </Grid2>
      )}

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Couleur de fond</Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Choisissez une couleur de fond pour l'application :
        </Typography>
        <FormControl fullWidth sx={{ maxWidth: 300 }}>
          <InputLabel>Couleur de fond</InputLabel>
          <Select
            value={backgroundColor}
            label="Couleur de fond"
            onChange={handleChangeColor}
          >
            {colorOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Container>
  );
}

export default ParametresPage;
