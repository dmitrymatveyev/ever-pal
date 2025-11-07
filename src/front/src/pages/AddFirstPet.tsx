import { useState, useRef, useEffect } from 'react';
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
import { trackEvent, trackPageView, trackFormInteraction, trackFormSubmit } from '../utils/analytics';

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
  const pageLoadTime = useRef<Date>(new Date());

  // Track page view on mount
  useEffect(() => {
    trackPageView('/add-first-pet');
    trackEvent('onboarding_started', { timestamp: new Date().toISOString() });

    // Track time spent on page when user leaves
    return () => {
      const timeSpent = Math.floor((new Date().getTime() - pageLoadTime.current.getTime()) / 1000);
      trackEvent('onboarding_abandoned', {
        timeSpentSeconds: timeSpent,
        petNameFilled: !!formData.name,
        breedFilled: !!formData.breed,
        ageFilled: !!formData.age,
        weightFilled: !!formData.weight,
        photoUploaded: !!formData.photoBase64
      });
    };
  }, [formData]);

  const handleChange = (field: keyof CreatePetRequest, value: string) => {
    // Track field interaction (only once per field)
    if (!formData[field]) {
      trackFormInteraction('add_first_pet', field, 'started_filling');
    }

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

    trackFormInteraction('add_first_pet', 'photo', 'upload_attempted');

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      trackEvent('photo_upload_failed', { reason: 'invalid_file_type' });
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
      trackFormInteraction('add_first_pet', 'photo', 'upload_success');
    } catch (err) {
      console.error('Failed to process image:', err);
      setError('Failed to process image. Please try a different image.');
      trackEvent('photo_upload_failed', { reason: 'processing_error' });
    }
  };

  const handleSubmit = async () => {
    trackEvent('add_pet_button_clicked', {
      petNameFilled: !!formData.name,
      breedFilled: !!formData.breed,
      ageFilled: !!formData.age,
      weightFilled: !!formData.weight,
      photoUploaded: !!formData.photoBase64
    });

    if (!formData.name.trim()) {
      setError('Pet name is required');
      trackFormSubmit('add_first_pet', false, 'validation_failed_no_name');
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

      // Track successful pet creation
      trackFormSubmit('add_first_pet', true);
      trackEvent('pet_created_successfully', {
        hasBreed: !!petData.breed,
        hasAge: !!petData.age,
        hasWeight: !!petData.weight,
        hasPhoto: !!petData.photoBase64,
        timeSpentSeconds: Math.floor((new Date().getTime() - pageLoadTime.current.getTime()) / 1000)
      });

      // Navigate to health journal after adding first pet
      navigate('/');
    } catch (err) {
      console.error('Failed to create pet:', err);
      setError('Failed to create pet. Please try again.');
      trackFormSubmit('add_first_pet', false, 'api_error');
      trackEvent('pet_creation_failed', {
        error: err instanceof Error ? err.message : 'unknown_error'
      });
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
            onFocus={() => trackFormInteraction('add_first_pet', 'name', 'focused')}
            required
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Breed (Optional)"
            value={formData.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            onFocus={() => trackFormInteraction('add_first_pet', 'breed', 'focused')}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Age (Optional)"
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value)}
            onFocus={() => trackFormInteraction('add_first_pet', 'age', 'focused')}
            inputProps={{ min: 0 }}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Weight (Optional)"
            placeholder="e.g., 12 lbs or 5.5 kg"
            type="number"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            onFocus={() => trackFormInteraction('add_first_pet', 'weight', 'focused')}
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