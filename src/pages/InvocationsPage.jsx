import  { useState, useEffect } from 'react';
import Grid2 from '@mui/material/Grid2'; // Import de Grid2
import {
  Box,
  Typography,
  Container,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Paper,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

import { ref as dbRef, onValue, push, set, remove } from 'firebase/database';
import { db } from '../firebase'; // Votre instance Realtime DB

function InvocationsPage() {
  // Liste des invocations enregistrées dans ParametresPage (nom, id)
  const [invocationList, setInvocationList] = useState([]);
  
  // Liste des "usages" : (invocation + count + category)
  const [usageList, setUsageList] = useState([]);

  // Sélection depuis le menu déroulant
  const [selectedId, setSelectedId] = useState('');
  const [count, setCount] = useState(1);
  const [category, setCategory] = useState('Matin');

  // Charger la liste d'invocations pour le menu (depuis /invocations)
  useEffect(() => {
    const invRef = dbRef(db, 'invocations');
    onValue(invRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          text: value.text || ''
        }));
        setInvocationList(list);
      } else {
        setInvocationList([]);
      }
    });
  }, []);

  // Charger la liste d'usage (invocations + count + catégorie) depuis /invocationsUsage
  useEffect(() => {
    const usageRef = dbRef(db, 'invocationsUsage');
    onValue(usageRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([uid, val]) => ({
          uid,
          text: val.text,
          count: val.count,
          category: val.category,
          createdAt: val.createdAt
        }));
        setUsageList(list);
      } else {
        setUsageList([]);
      }
    });
  }, []);

  // Quand on change la sélection dans le menu
  const handleSelectInvocation = (invId) => {
    setSelectedId(invId);
  };

  // Quand on clique sur "Ajouter"
  const handleAddUsage = () => {
    if (!selectedId) return;

    const found = invocationList.find((inv) => inv.id === selectedId);
    if (!found) return;

    // Créer une nouvelle entrée dans /invocationsUsage
    const usageRef = dbRef(db, 'invocationsUsage');
    const newUsageRef = push(usageRef);
    set(newUsageRef, {
      text: found.text,      // On stocke le "text" de l'invocation sélectionnée
      count: Number(count),
      category,
      createdAt: Date.now()
    });

    // Reset local
    setSelectedId('');
    setCount(1);
    setCategory('Matin');
  };

  // Supprimer un usage (invocation + count + category)
  const handleDeleteUsage = (uid) => {
    const itemRef = dbRef(db, `invocationsUsage/${uid}`);
    remove(itemRef);
  };

  const categoriesPossibles = ['Matin', 'Soir', 'Après-midi', 'Après-prière'];

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Invocations</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Sélectionnez une invocation, indiquez le nombre de fois et la catégorie, puis cliquez sur "Ajouter".
      </Typography>

      {/* Sélection de l'invocation */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="invocation-select-label">Sélectionner une Invocation</InputLabel>
        <Select
          labelId="invocation-select-label"
          label="Sélectionner une Invocation"
          value={selectedId}
          onChange={(e) => handleSelectInvocation(e.target.value)}
        >
          <MenuItem value="">-- Aucune --</MenuItem>
          {invocationList.map((inv) => (
            <MenuItem key={inv.id} value={inv.id}>
              {inv.text}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Champs count & category */}
      <TextField
        type="number"
        label="Nombre de fois"
        value={count}
        onChange={(e) => setCount(e.target.value)}
        sx={{ mb: 2 }}
        fullWidth
      />
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="category-select-label">Catégorie</InputLabel>
        <Select
          labelId="category-select-label"
          label="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoriesPossibles.map((cat) => (
            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="contained" onClick={handleAddUsage} disabled={!selectedId}>
        Ajouter
      </Button>

      {/* Liste des usages (invocations + count + category) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Liste des Invocations (avec count & catégorie)</Typography>
        {usageList.length === 0 ? (
          <Typography>Aucun usage enregistré.</Typography>
        ) : (
          <Grid2 container spacing={2}>
            {usageList.map((usage) => (
              <Grid2 xs={12} sm={6} md={4} key={usage.uid}>
                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {usage.text}
                  </Typography>
                  <Typography variant="body2">
                    Catégorie : {usage.category}
                  </Typography>
                  <Typography variant="body2">
                    Nombre de fois : {usage.count}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <IconButton color="error" onClick={() => handleDeleteUsage(usage.uid)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid2>
            ))}
          </Grid2>
        )}
      </Box>
    </Container>
  );
}

export default InvocationsPage;
