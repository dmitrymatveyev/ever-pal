import { useState, useEffect, useRef } from 'react';
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
import { updatePet, deletePet, type UpdatePetRequest, type Pet } from '../services/petService';
import { processImage } from '../utils/imageUtils';

interface EditPetDialogProps {
  open: boolean;
  onClose: () => void;
  pet: Pet | null;
  onPetUpdated: () => void;
  onPetDeleted: () => void;
}

const EditPetDialog = ({ open, onClose, pet, onPetUpdated, onPetDeleted }: EditPetDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    age: '',
    weight: '',
    photoBase64: ''
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoFileName, setPhotoFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pet) {
      setFormData({
        name: pet.name,
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        weight: pet.weight?.toString() || '',
        photoBase64: pet.photoBase64 || ''
      });
      setPhotoFileName(pet.photoBase64 ? 'Current photo' : '');
    }
  }, [pet]);

  const handleChange = (field: string, value: string) => {
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
    if (!pet) {
      return;
    }

    if (!formData.name.trim()) {
      setError('Pet name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr!);

      const updateData: UpdatePetRequest = {
        name: formData.name.trim(),
        breed: formData.breed?.trim() || undefined,
        age: formData.age ? parseInt(formData.age, 10) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        photoBase64: formData.photoBase64?.trim() || undefined
      };

      await updatePet(pet.id, updateData, userData.token, userData.isAnonymous);

      onPetUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update pet:', err);
      setError('Failed to update pet. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!pet) {
      return;
    }

    if (!confirm(`Are you sure you want to delete ${pet.name}? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr!);

      await deletePet(userData.token, pet.id, userData.isAnonymous);

      onPetDeleted();
      onClose();
    } catch (err) {
      console.error('Failed to delete pet:', err);
      setError('Failed to delete pet. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (!saving && !deleting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Pet Profile</DialogTitle>
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
            value={formData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            inputProps={{ min: 0 }}
            fullWidth
            disabled={saving}
          />
          <TextField
            label="Weight (kg)"
            type="number"
            value={formData.weight}
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
                {photoFileName}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between' }}>
        <Button
          onClick={handleDelete}
          color="error"
          disabled={saving || deleting}
        >
          {deleting ? <CircularProgress size={24} /> : 'Delete Pet'}
        </Button>
        <Box>
          <Button onClick={handleClose} disabled={saving || deleting} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving || deleting}
          >
            {saving ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditPetDialog;