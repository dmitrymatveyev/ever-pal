import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  CircularProgress,
  Alert
} from '@mui/material';
import { createPet, type CreatePetRequest } from '../services/petService';

const AddFirstPet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePetRequest>({
    name: '',
    breed: '',
    age: undefined,
    weight: undefined,
    photoUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof CreatePetRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Pet name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr!);

      const petData: CreatePetRequest = {
        name: formData.name.trim(),
        breed: formData.breed?.trim() || undefined,
        age: formData.age || undefined,
        weight: formData.weight || undefined,
        photoUrl: formData.photoUrl?.trim() || undefined
      };

      await createPet(userData.token, petData, userData.isAnonymous);

      // Navigate to health journal after adding first pet
      navigate('/');
    } catch (err) {
      console.error('Failed to create pet:', err);
      setError('Failed to create pet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to EverPal
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        Let's start by adding your first pet to the health journal.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add Your Pet
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Pet Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Breed"
            value={formData.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Age (years)"
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Weight (kg)"
            type="number"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Photo URL"
            value={formData.photoUrl}
            onChange={(e) => handleChange('photoUrl', e.target.value)}
            fullWidth
            disabled={saving}
          />

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Add Pet & Continue'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddFirstPet;