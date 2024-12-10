// src/pages/InvocationsPage.js

import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ref, push, onValue, remove, update } from 'firebase/database';
import {
  Typography,
  Paper,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

function InvocationsPage() {
  const { currentUser } = useContext(AuthContext);
  const [invocationName, setInvocationName] = useState('');
  const [count, setCount] = useState(1);
  const [category, setCategory] = useState('matin');
  const [invocations, setInvocations] = useState([]);

  const [invocationOptions, setInvocationOptions] = useState([]);

  const [newInvocation, setNewInvocation] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invocationToDelete, setInvocationToDelete] = useState(null);

  // Filtrer les invocations du jour
  const filterTodayInvocations = (allInvocations) => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    return allInvocations.filter((inv) => {
      if (!inv.lastRecitedAt) return false;
      const recitedTime = typeof inv.lastRecitedAt === 'number' ? inv.lastRecitedAt : Number(inv.lastRecitedAt);
      return recitedTime >= startOfDay && recitedTime <= endOfDay;
    });
  };

  // Récupérer les options d'invocation depuis Firebase
  const fetchInvocationOptions = () => {
    if (!currentUser) return;
    const optionsRef = ref(db, `users/${currentUser.uid}/invocationOptions`);
    onValue(optionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const optionsList = Object.entries(data).map(([id, value]) => ({ id, name: value }));
        setInvocationOptions(optionsList);
      } else {
        // Initialiser avec les options prédéfinies si aucune option n'existe
        const initialInvocationOptions = [
          'Astaghfirullah',
          'Allahu Akbar',
          'SubhanAllah',
          'Alhamdulillah'
        ];
        initialInvocationOptions.forEach((option) => {
          push(ref(db, `users/${currentUser.uid}/invocationOptions`), option);
        });
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
        const invList = Object.entries(data).map(([id, value]) => ({
          id,
          ...value
        }));
        const todaysInvocations = filterTodayInvocations(invList);
        setInvocations(todaysInvocations);
      } else {
        setInvocations([]);
      }
    });
  };

  useEffect(() => {
    fetchInvocationOptions();
    fetchInvocations();
  }, [currentUser]);

  // Ajouter une nouvelle option d'invocation
  const handleAddInvocationOption = async (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!newInvocation.trim()) return;

    // Vérifier si l'invocation existe déjà (case-insensitive)
    const exists = invocationOptions.some((option) => option.name.toLowerCase() === newInvocation.trim().toLowerCase());
    if (exists) {
      alert('Cette invocation existe déjà.');
      return;
    }

    const optionsRef = ref(db, `users/${currentUser.uid}/invocationOptions`);
    await push(optionsRef, newInvocation.trim());

    setNewInvocation('');
    setAddDialogOpen(false);
  };

  // Supprimer une option d'invocation
  const handleDeleteInvocationOption = async () => {
    if (!currentUser || !invocationToDelete) return;

    const optionsRef = ref(db, `users/${currentUser.uid}/invocationOptions`);
    // Trouver la clé de l'invocation à supprimer
    onValue(optionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const entries = Object.entries(data);
        for (const [key, value] of entries) {
          if (value === invocationToDelete.name) {
            remove(ref(db, `users/${currentUser.uid}/invocationOptions/${key}`));
            break;
          }
        }
      }
    }, { onlyOnce: true });

    setInvocationToDelete(null);
    setDeleteDialogOpen(false);
  };

  // Ajouter une invocation
  const handleAddInvocation = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!invocationName.trim()) {
      alert('Veuillez sélectionner une invocation.');
      return;
    }

    if (count < 1) {
      alert('Le nombre de fois doit être au moins 1.');
      return;
    }

    const invocationsRef = ref(db, `users/${currentUser.uid}/invocations`);
    await push(invocationsRef, {
      name: invocationName.trim(),
      category,
      count: Number(count),
      lastRecitedAt: { ".sv": "timestamp" }
    });

    setInvocationName('');
    setCount(1);
  };

  // Incrémenter le nombre de récitations
  const handleIncrement = async (inv) => {
    if (!currentUser) return;
    const invRef = ref(db, `users/${currentUser.uid}/invocations/${inv.id}`);
    await update(invRef, {
      count: inv.count + 1,
      lastRecitedAt: { ".sv": "timestamp" }
    });
  };

  // Animation framer-motion : paramètres pour l'apparition
  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, p: 2 }}>
      {/* Section pour gérer les options d'invocation */}
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Gérer les Invocations</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Liste des options */}
          <List>
            <AnimatePresence>
              {invocationOptions.map((option) => (
                <motion.div
                  key={option.id} // Utiliser l'ID unique de Firebase
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <ListItem
                    secondaryAction={
                      <IconButton edge="end" aria-label="delete" onClick={() => { setInvocationToDelete(option); setDeleteDialogOpen(true); }}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText primary={option.name} />
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>

          {/* Bouton pour ajouter une nouvelle invocation */}
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAddDialogOpen(true)}>
            Ajouter Invocation
          </Button>
        </Box>
      </Paper>

      {/* Dialog pour ajouter une nouvelle invocation */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Ajouter une Nouvelle Invocation</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddInvocationOption} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Nom de l'invocation"
              value={newInvocation}
              onChange={(e) => setNewInvocation(e.target.value)}
              required
            />
            <Button variant="contained" type="submit">Ajouter</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Annuler</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog pour confirmer la suppression */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Supprimer Invocation</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer "{invocationToDelete?.name}" de la liste des invocations ?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDeleteInvocationOption}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Section pour ajouter une invocation */}
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Ajouter une Invocation</Typography>
        <Box component="form" onSubmit={handleAddInvocation} sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
          
          {/* Sélection de l’invocation */}
          <FormControl fullWidth>
            <InputLabel>Invocation</InputLabel>
            <Select
              value={invocationName}
              label="Invocation"
              onChange={(e) => setInvocationName(e.target.value)}
              required
            >
              {invocationOptions.map((option) => (
                <MenuItem key={option.id} value={option.name}>{option.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Sélection de la catégorie */}
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select value={category} label="Catégorie" onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="matin">Matin</MenuItem>
              <MenuItem value="soir">Soir</MenuItem>
              <MenuItem value="après-prière">Après-prière</MenuItem>
              <MenuItem value="autres">Autres</MenuItem>
            </Select>
          </FormControl>

          {/* Nombre de fois récité */}
          <TextField
            type="number"
            label="Nombre de fois"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            InputProps={{ inputProps: { min: 1 } }}
            required
          />

          <Button variant="contained" type="submit" color="primary">Ajouter</Button>
        </Box>
      </Paper>

      {/* Section de liste des invocations */}
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Liste de vos Invocations</Typography>
        {invocations.length === 0 ? (
          <Typography>Aucune invocation enregistrée.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatePresence>
              {invocations.map((inv) => (
                <motion.div
                  key={inv.id}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Paper sx={{ p: 2 }} elevation={1}>
                    <Typography><strong>Invocation :</strong> {inv.name}</Typography>
                    <Typography><strong>Catégorie :</strong> {inv.category}</Typography>
                    <Typography><strong>Nombre de fois :</strong> {inv.count}</Typography>
                    {inv.lastRecitedAt && <Typography><strong>Dernière récitation :</strong> {new Date(inv.lastRecitedAt).toLocaleString()}</Typography>}
                    <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                      <Button variant="outlined" onClick={() => handleIncrement(inv)}>+1</Button>
                    </Box>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default InvocationsPage;
