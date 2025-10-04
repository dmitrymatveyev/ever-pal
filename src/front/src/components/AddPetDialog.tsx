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
  Alert
} from '@mui/material';
import { createPet, type CreatePetRequest } from '../services/petService';
import { processImage } from '../utils/imageUtils';

interface AddPetDialogProps {
  open: boolean;
  onClose: () => void;
  onPetAdded: (petId: string) => void;
}

const AddPetDialog = ({ open, onClose, onPetAdded }: AddPetDialogProps) => {
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Pet</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          <Box>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              disabled={saving}
            >
              {photoFileName || 'Upload Photo'}
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
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Add Pet'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPetDialog;