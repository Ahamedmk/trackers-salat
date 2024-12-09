// src/pages/InvocationsPage.js
import React, { useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { AuthContext } from '../context/AuthContext';
import { ref, push, onValue, remove } from 'firebase/database';
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

// Import des icônes
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';

function InvocationsPage() {
  const { currentUser } = useContext(AuthContext);
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('matin');
  const [invocations, setInvocations] = useState([]);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invocationToDelete, setInvocationToDelete] = useState(null);

  const handleAddInvocation = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const invocationsRef = ref(db, `users/${currentUser.uid}/invocations`);
    await push(invocationsRef, {
      content,
      category,
      count: 0,
      lastRecitedAt: { ".sv": "timestamp" }
    });

    setContent('');
  };

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
        setInvocations(invList);
      } else {
        setInvocations([]);
      }
    });
  };

  useEffect(() => {
    fetchInvocations();
  }, [currentUser]);

  const handleDeleteClick = (inv) => {
    setInvocationToDelete(inv);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (invocationToDelete && currentUser) {
      const invRef = ref(db, `users/${currentUser.uid}/invocations/${invocationToDelete.id}`);
      await remove(invRef);
    }
    setDeleteDialogOpen(false);
    setInvocationToDelete(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setInvocationToDelete(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <LibraryBooksIcon color="primary" />
          <Typography variant="h5" gutterBottom>Ajouter une Invocation</Typography>
        </Box>
        <Box component="form" onSubmit={handleAddInvocation} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Contenu de l'invocation"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            fullWidth
            multiline
          />
          <FormControl fullWidth>
            <InputLabel>Catégorie</InputLabel>
            <Select value={category} label="Catégorie" onChange={(e) => setCategory(e.target.value)}>
              <MenuItem value="matin">Matin</MenuItem>
              <MenuItem value="soir">Soir</MenuItem>
              <MenuItem value="après-prière">Après-prière</MenuItem>
              <MenuItem value="autres">Autres</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" type="submit" color="primary">Ajouter</Button>
        </Box>
      </Paper>

      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" gutterBottom>Liste de vos Invocations</Typography>
        {invocations.length === 0 ? (
          <Typography variant="body1">Aucune invocation enregistrée.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {invocations.map((inv) => (
              <Paper key={inv.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} elevation={1}>
                <Box>
                  <Typography><strong>Invocation :</strong> {inv.content}</Typography>
                  <Typography><strong>Catégorie :</strong> {inv.category}</Typography>
                  {inv.lastRecitedAt && <Typography><strong>Dernière récitation :</strong> {new Date(inv.lastRecitedAt).toLocaleString()}</Typography>}
                </Box>
                <Box>
                  <IconButton color="primary" sx={{ mr: 1 }}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(inv)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirmation de Suppression</DialogTitle>
        <DialogContent>
          <Typography>Êtes-vous sûr de vouloir supprimer cette invocation ? Cette action est irréversible.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Annuler</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default InvocationsPage;
