import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardMedia,
  ButtonGroup
} from '@mui/material';
import { ArrowBack, Edit, Save, Cancel } from '@mui/icons-material';
import { getPets, updatePet, type Pet } from '../services/petService';

interface UserData {
  email: string;
  isAnonymous?: boolean;
  token?: string;
}

const PetProfile = () => {
  const { petId } = useParams<{ petId: string }>();
  const navigate = useNavigate();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    breed: '',
    age: '',
    weight: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const userStr = localStorage.getItem('user');
        const userData: UserData = JSON.parse(userStr!);

        // Get all pets and find the one with matching ID
        const pets = await getPets(userData.token!, userData.isAnonymous);
        const foundPet = pets.find(p => p.id === petId);
        
        if (!foundPet) {
          setError('Pet not found');
        } else {
          setPet(foundPet);
          setEditForm({
            name: foundPet.name,
            breed: foundPet.breed || '',
            age: foundPet.age?.toString() || '',
            weight: foundPet.weight?.toString() || ''
          });
        }
      } catch (err) {
        console.error('Failed to fetch pet:', err);
        setError('Failed to load pet information');
      } finally {
        setLoading(false);
      }
    };

    if (petId) {
      fetchPet();
    }
  }, [petId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original values
    if (pet) {
      setEditForm({
        name: pet.name,
        breed: pet.breed || '',
        age: pet.age?.toString() || '',
        weight: pet.weight?.toString() || ''
      });
    }
  };

  const handleSave = async () => {
    if (!pet || !petId) return;
    
    setSaving(true);
    try {
      const userStr = localStorage.getItem('user');
      const userData: UserData = JSON.parse(userStr!);

      const updateData = {
        name: editForm.name.trim(),
        breed: editForm.breed.trim() || undefined,
        age: editForm.age ? parseInt(editForm.age, 10) : undefined,
        weight: editForm.weight ? parseFloat(editForm.weight) : undefined
      };

      // Call the API to update the pet
      const updatedPet = await updatePet(petId, updateData, userData.token!, userData.isAnonymous);
      
      setPet(updatedPet);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update pet:', err);
      setError('Failed to update pet information');
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !pet) {
    return (
      <Box sx={{ maxWidth: 600, mx: 'auto' }}>
        <Button 
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">
          {error || 'Pet not found'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Button 
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          {isEditing ? (
            <TextField
              value={editForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              variant="outlined"
              size="small"
              sx={{ 
                flexGrow: 1, 
                mr: 2,
                '& .MuiInputBase-input': { fontSize: '2rem', fontWeight: 'bold' }
              }}
            />
          ) : (
            <Typography variant="h3" component="h1">
              {pet.name}
            </Typography>
          )}
          
          {!isEditing ? (
            <Button 
              variant="contained"
              startIcon={<Edit />}
              onClick={handleEdit}
            >
              Edit
            </Button>
          ) : (
            <ButtonGroup>
              <Button 
                variant="contained"
                color="success"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save'}
              </Button>
              <Button 
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </Button>
            </ButtonGroup>
          )}
        </Box>
        
        {(pet.photoBase64 || pet.photoUrl) && (
          <Card sx={{ mb: 3, maxWidth: 300 }}>
            <CardMedia
              component="img"
              height="300"
              image={pet.photoBase64 || pet.photoUrl}
              alt={pet.name}
            />
          </Card>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Breed
            </Typography>
            {isEditing ? (
              <TextField
                value={editForm.breed}
                onChange={(e) => handleFormChange('breed', e.target.value)}
                placeholder="Enter breed"
                size="small"
                fullWidth
              />
            ) : (
              <Typography variant="body1">
                {pet.breed || 'Not specified'}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Age
            </Typography>
            {isEditing ? (
              <TextField
                type="number"
                value={editForm.age}
                onChange={(e) => handleFormChange('age', e.target.value)}
                placeholder="Enter age"
                size="small"
                fullWidth
                inputProps={{ min: 0 }}
              />
            ) : (
              <Typography variant="body1">
                {pet.age !== null && pet.age !== undefined ? `${pet.age} years old` : 'Not specified'}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Weight
            </Typography>
            {isEditing ? (
              <TextField
                type="number"
                value={editForm.weight}
                onChange={(e) => handleFormChange('weight', e.target.value)}
                placeholder="Enter weight"
                size="small"
                fullWidth
                inputProps={{ min: 0, step: 0.1 }}
              />
            ) : (
              <Typography variant="body1">
                {pet.weight !== null && pet.weight !== undefined ? pet.weight : 'Not specified'}
              </Typography>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Added
            </Typography>
            <Typography variant="body1">
              {new Date(pet.createdAt).toLocaleDateString()}
            </Typography>
          </Grid>
          
          {pet.updatedAt !== pet.createdAt && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last updated
              </Typography>
              <Typography variant="body1">
                {new Date(pet.updatedAt).toLocaleDateString()}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Box>
  );
};

export default PetProfile;