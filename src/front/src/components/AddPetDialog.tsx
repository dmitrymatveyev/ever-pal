import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Avatar,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Pets, PhotoCamera } from '@mui/icons-material';
import { createPet, type CreatePetRequest } from '../services/petService';
import { processImage } from '../utils/imageUtils';

interface AddPetDialogProps {
  open: boolean;
  onClose: () => void;
  onPetAdded: (petId: string) => void;
}

const AddPetDialog = ({ open, onClose, onPetAdded }: AddPetDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
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

      const newPet = await createPet(userData.token, petData, userData.isAnonymous);

      // Reset form
      setFormData({
        name: '',
        breed: '',
        age: undefined,
        weight: undefined,
        photoBase64: undefined
      });
      setPhotoFileName('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      onPetAdded(newPet.id);
      onClose();
    } catch (err) {
      console.error('Failed to create pet:', err);
      setError('Failed to create pet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Add Your Companion
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Tell us about your furry friend
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Photo Upload Section */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {formData.photoBase64 ? (
              <Avatar
                src={formData.photoBase64}
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  border: 3,
                  borderColor: 'primary.main'
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: { xs: 100, sm: 120 },
                  height: { xs: 100, sm: 120 },
                  bgcolor: 'primary.main',
                  border: 3,
                  borderColor: 'primary.main'
                }}
              >
                <Pets sx={{ fontSize: { xs: 50, sm: 60 } }} />
              </Avatar>
            )}
            <Button
              variant="outlined"
              component="label"
              startIcon={<PhotoCamera />}
              disabled={saving}
              sx={{ borderRadius: 3 }}
            >
              {photoFileName ? 'Change Photo' : 'Add Photo'}
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </Button>
          </Box>

          {/* Form Fields */}
          <TextField
            label="Pet Name"
            placeholder="e.g., Max"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Breed"
            placeholder="e.g., Golden Retriever"
            value={formData.breed}
            onChange={(e) => handleChange('breed', e.target.value)}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Age (years)"
            placeholder="e.g., 8"
            type="number"
            value={formData.age || ''}
            onChange={(e) => handleChange('age', e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Weight (kg)"
            placeholder="e.g., 25.5"
            type="number"
            value={formData.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            inputProps={{ min: 0, step: 0.1 }}
            fullWidth
            disabled={saving}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button
          onClick={handleClose}
          disabled={saving}
          sx={{
            flex: { xs: 1, sm: 'none' },
            order: { xs: 1, sm: 1 }
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
          sx={{
            flex: { xs: 1, sm: 'none' },
            order: { xs: 2, sm: 2 }
          }}
        >
          {saving ? <CircularProgress size={24} /> : 'Add Pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPetDialog;