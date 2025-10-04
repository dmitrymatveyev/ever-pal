import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SelectChangeEvent } from '@mui/material';
import {
  Typography,
  Button,
  Box,
  Paper,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton
} from '@mui/material';
import { Add, Pets, Edit, Delete } from '@mui/icons-material';
import { getPets, type Pet } from '../services/petService';
import { getHealthLogs, deleteHealthLog, type HealthLog } from '../services/healthLogService';
import AddPetDialog from '../components/AddPetDialog';
import AddLogEventDialog from '../components/AddLogEventDialog';
import EditHealthLogDialog from '../components/EditHealthLogDialog';

interface UserData {
  email: string;
  isAnonymous?: boolean;
  token?: string;
}

const HealthJournal = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addPetDialogOpen, setAddPetDialogOpen] = useState(false);
  const [addLogDialogOpen, setAddLogDialogOpen] = useState(false);
  const [editLogDialogOpen, setEditLogDialogOpen] = useState(false);
  const [selectedHealthLog, setSelectedHealthLog] = useState<HealthLog | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          setError('No user data found');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        setUserData(user);

        // Fetch pets
        const userPets = await getPets(user.token, user.isAnonymous);
        setPets(userPets);

        if (userPets.length === 0) {
          // No pets - redirect to add first pet
          navigate('/add-first-pet');
        } else {
          // Select first pet by default
          setSelectedPetId(userPets[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [navigate]);

  useEffect(() => {
    const fetchHealthLogs = async () => {
      if (!selectedPetId || !userData) {
        return;
      }

      setLoadingLogs(true);
      try {
        const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous);
        // Sort by loggedAt descending
        const sortedLogs = logs.sort((a, b) =>
          new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
        );
        setHealthLogs(sortedLogs);
      } catch (err) {
        console.error('Failed to fetch health logs:', err);
        setError('Failed to load health logs');
      } finally {
        setLoadingLogs(false);
      }
    };

    fetchHealthLogs();
  }, [selectedPetId, userData]);

  const handlePetChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    if (value === 'add-new') {
      setAddPetDialogOpen(true);
    } else {
      setSelectedPetId(value);
      setVisibleCount(5); // Reset visible count when switching pets
    }
  };

  const handlePetAdded = async () => {
    if (!userData) {
      return;
    }

    try {
      const userPets = await getPets(userData.token!, userData.isAnonymous);
      setPets(userPets);

      // Select the newly added pet (last one)
      if (userPets.length > 0) {
        setSelectedPetId(userPets[userPets.length - 1].id);
      }
    } catch (err) {
      console.error('Failed to refresh pets:', err);
    }
  };

  const handleLogAdded = async () => {
    if (!selectedPetId || !userData) {
      return;
    }

    try {
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous);
      const sortedLogs = logs.sort((a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      );
      setHealthLogs(sortedLogs);
      setVisibleCount(5); // Reset visible count
    } catch (err) {
      console.error('Failed to refresh health logs:', err);
    }
  };

  const handleEditClick = (log: HealthLog) => {
    setSelectedHealthLog(log);
    setEditLogDialogOpen(true);
  };

  const handleLogUpdated = async () => {
    if (!selectedPetId || !userData) {
      return;
    }

    try {
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous);
      const sortedLogs = logs.sort((a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      );
      setHealthLogs(sortedLogs);
      // Keep current visible count after update
    } catch (err) {
      console.error('Failed to refresh health logs:', err);
    }
  };

  const handleDeleteClick = async (logId: string) => {
    if (!userData || !selectedPetId) {
      return;
    }

    try {
      await deleteHealthLog(logId, userData.token!, userData.isAnonymous);

      // Refresh health logs
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous);
      const sortedLogs = logs.sort((a, b) =>
        new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime()
      );
      setHealthLogs(sortedLogs);
      // Keep current visible count after deletion
    } catch (err) {
      console.error('Failed to delete health log:', err);
      setError('Failed to delete health log. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const visibleLogs = healthLogs.slice(0, visibleCount);
  const hasMoreLogs = healthLogs.length > visibleCount;

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Health Journal
      </Typography>

      {/* Pet Selection */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="pet-select-label">Select Pet</InputLabel>
          <Select
            labelId="pet-select-label"
            value={selectedPetId}
            label="Select Pet"
            onChange={handlePetChange}
          >
            {pets.map((pet) => (
              <MenuItem key={pet.id} value={pet.id}>
                {pet.name}
              </MenuItem>
            ))}
            <Divider />
            <MenuItem value="add-new">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Add fontSize="small" />
                <span>Add new pet</span>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {selectedPet && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Pets color="primary" />
            <Typography variant="h6">{selectedPet.name}</Typography>
          </Box>
        )}
      </Paper>

      {/* Health Logs */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Health Events</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setAddLogDialogOpen(true)}
            disabled={!selectedPetId}
          >
            Log Health Event
          </Button>
        </Box>

        {loadingLogs ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : healthLogs.length === 0 ? (
          <Alert severity="info">
            No health events logged yet. Click "Log Health Event" to add your first entry.
          </Alert>
        ) : (
          <>
            <List>
              {visibleLogs.map((log, index) => (
                <Box key={log.id}>
                  {index > 0 && <Divider />}
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          aria-label="edit"
                          onClick={() => handleEditClick(log)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          aria-label="delete"
                          onClick={() => handleDeleteClick(log.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    }
                  >
                    <ListItemText
                      primary={log.entryText}
                      secondary={formatDate(log.loggedAt)}
                    />
                  </ListItem>
                </Box>
              ))}
            </List>
            {hasMoreLogs && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleShowMore}
                >
                  Show More
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>

      {/* Dialogs */}
      <AddPetDialog
        open={addPetDialogOpen}
        onClose={() => setAddPetDialogOpen(false)}
        onPetAdded={handlePetAdded}
      />

      {selectedPetId && (
        <AddLogEventDialog
          open={addLogDialogOpen}
          onClose={() => setAddLogDialogOpen(false)}
          petId={selectedPetId}
          onLogAdded={handleLogAdded}
        />
      )}

      <EditHealthLogDialog
        open={editLogDialogOpen}
        onClose={() => setEditLogDialogOpen(false)}
        healthLog={selectedHealthLog}
        onLogUpdated={handleLogUpdated}
      />
    </Box>
  );
};

export default HealthJournal;