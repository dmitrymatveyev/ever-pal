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
  Alert,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { PhotoCamera, Pets } from '@mui/icons-material';
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
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
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
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pet) {
      return;
    }

    setDeleting(true);
    setError(null);
    setDeleteConfirmOpen(false);

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
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth fullScreen={fullScreen}>
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
            {pet?.name}'s Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Update your companion's information
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Photo Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {formData.photoBase64 ? (
                <Avatar
                  src={formData.photoBase64}
                  alt={formData.name}
                  sx={{
                    width: 120,
                    height: 120,
                    border: 3,
                    borderColor: 'primary.light',
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    border: 3,
                    borderColor: 'primary.light',
                  }}
                >
                  <Pets sx={{ fontSize: 60 }} />
                </Avatar>
              )}
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoCamera />}
                disabled={saving}
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
              placeholder="e.g., Golden Retriever"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
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
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 }, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button
            onClick={handleDeleteClick}
            color="error"
            disabled={saving || deleting}
            variant="outlined"
            sx={{ order: { xs: 3, sm: 1 }, width: { xs: '100%', sm: 'auto' } }}
          >
            Remove Pet
          </Button>
          <Box sx={{ display: 'flex', gap: 1, order: { xs: 1, sm: 2 }, width: { xs: '100%', sm: 'auto' } }}>
            <Button onClick={handleClose} disabled={saving || deleting} sx={{ flex: { xs: 1, sm: 'none' } }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={saving || deleting}
              size="large"
              sx={{ flex: { xs: 1, sm: 'none' } }}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Remove {pet?.name}?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove {pet?.name} and all associated journal entries.
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={24} /> : 'Remove Pet'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EditPetDialog;