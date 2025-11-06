import { useState, useRef } from 'react';
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
import { processImage } from '../utils/imageUtils';

const AddFirstPet = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreatePetRequest>({
    name: '',
    breed: '',
    age: undefined,
    weight: undefined,
    photoBase64: undefined
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof CreatePetRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    try {
      const base64 = await processImage(file);
      setFormData(prev => ({
        ...prev,
        photoBase64: base64
      }));
      setPhotoFileName(file.name);
      setError(null);
    } catch (err) {
      console.error('Failed to process image:', err);
      setError('Failed to process image. Please try a different image.');
    }
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
        photoBase64: formData.photoBase64 || undefined
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
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome to EverPal 🐾
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400 }}>
          Track your pet's health and wellness
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
          Let's start by adding your companion to the journal.
        </Typography>
      </Box>

      <Paper sx={{ p: 4, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Tell us about your pet
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
            label="Breed (Optional)"
            value={formData.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Age (Optional)"
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Weight (Optional)"
            type="number"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
            fullWidth
            disabled={saving}
          />
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={saving}
            >
              {photoFileName || 'Upload Photo (Optional)'}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
            {photoFileName && (
              <Box sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                Selected: {photoFileName}
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleSubmit}
            disabled={saving}
            sx={{ mt: 2 }}
          >
            {saving ? <CircularProgress size={24} /> : 'Add Pet & Continue'}
          </Button>

          <Typography
            variant="body2"
            sx={{
              mt: 2,
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.875rem'
            }}
          >
            Only name is required • Add details anytime
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default AddFirstPet;