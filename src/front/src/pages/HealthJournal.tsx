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
  List,
  ListItem,
  Divider,
  IconButton,
  Avatar
} from '@mui/material';
import { Add, Pets, Edit, Delete, Settings } from '@mui/icons-material';
import { getPets, type Pet } from '../services/petService';
import { getHealthLogs, deleteHealthLog, type HealthLog } from '../services/healthLogService';
import AddPetDialog from '../components/AddPetDialog';
import AddLogEventDialog from '../components/AddLogEventDialog';
import EditHealthLogDialog from '../components/EditHealthLogDialog';
import EditPetDialog from '../components/EditPetDialog';

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
  const [editPetDialogOpen, setEditPetDialogOpen] = useState(false);
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
          // Try to restore previously selected pet
          const savedPetId = localStorage.getItem('selectedPetId');
          const petExists = savedPetId && userPets.some(p => p.id === savedPetId);

          if (petExists) {
            setSelectedPetId(savedPetId);
          } else {
            // Select first pet by default and save it
            setSelectedPetId(userPets[0].id);
            localStorage.setItem('selectedPetId', userPets[0].id);
          }
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
        // Fetch initial 5 logs
        const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, 5, 0);
        setHealthLogs(logs);
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
      localStorage.setItem('selectedPetId', value); // Remember selected pet
    }
  };

  const handlePetAdded = async (newPetId: string) => {
    if (!userData) {
      return;
    }

    try {
      const userPets = await getPets(userData.token!, userData.isAnonymous);
      setPets(userPets);

      // Select the newly added pet by ID
      setSelectedPetId(newPetId);
      localStorage.setItem('selectedPetId', newPetId); // Remember newly added pet
    } catch (err) {
      console.error('Failed to refresh pets:', err);
    }
  };

  const handleLogAdded = async () => {
    if (!selectedPetId || !userData) {
      return;
    }

    try {
      // Fetch initial 5 logs after adding
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, 5, 0);
      setHealthLogs(logs);
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
      // Refetch current number of visible logs
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, visibleCount, 0);
      setHealthLogs(logs);
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

      // Refresh health logs - fetch current visible count
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, visibleCount, 0);
      setHealthLogs(logs);
      // Keep current visible count after deletion
    } catch (err) {
      console.error('Failed to delete health log:', err);
      setError('Failed to delete health log. Please try again.');
    }
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time to compare just dates
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    }
    if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const groupLogsByDate = (logs: HealthLog[]) => {
    return logs.reduce((groups, log) => {
      const dateHeader = formatDateHeader(log.loggedAt);
      if (!groups[dateHeader]) {
        groups[dateHeader] = [];
      }
      groups[dateHeader].push(log);
      return groups;
    }, {} as Record<string, HealthLog[]>);
  };

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const visibleLogs = healthLogs;
  const hasMoreLogs = healthLogs.length === visibleCount && healthLogs.length % 5 === 0;
  const groupedLogs = groupLogsByDate(visibleLogs);

  const handleShowMore = async () => {
    if (!selectedPetId || !userData) {
      return;
    }

    const newVisibleCount = visibleCount + 5;

    try {
      // Fetch additional 5 logs
      const newLogs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, 5, visibleCount);

      // Append new logs to existing ones
      setHealthLogs(prev => [...prev, ...newLogs]);
      setVisibleCount(newVisibleCount);
    } catch (err) {
      console.error('Failed to load more health logs:', err);
    }
  };

  const handlePetUpdated = async () => {
    if (!userData) {
      return;
    }

    try {
      const userPets = await getPets(userData.token!, userData.isAnonymous);
      setPets(userPets);
    } catch (err) {
      console.error('Failed to refresh pets:', err);
    }
  };

  const handlePetDeleted = async () => {
    if (!userData) {
      return;
    }

    try {
      const userPets = await getPets(userData.token!, userData.isAnonymous);
      setPets(userPets);

      if (userPets.length === 0) {
        // No pets left - redirect to add first pet
        navigate('/add-first-pet');
      } else {
        // Select first pet if the deleted pet was selected
        const deletedPetId = selectedPetId;
        const petStillExists = userPets.some(p => p.id === deletedPetId);

        if (!petStillExists) {
          const newPetId = userPets[0].id;
          setSelectedPetId(newPetId);
          localStorage.setItem('selectedPetId', newPetId);
          setVisibleCount(5); // Reset visible count
        }
      }
    } catch (err) {
      console.error('Failed to refresh pets after deletion:', err);
    }
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
      {/* Pet Profile Card */}
      {selectedPet && (
        <Paper
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            mb: 3,
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, #2D2D2D 0%, #3A3A3A 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #F9F7F4 100%)',
            position: 'relative',
            overflow: 'visible',
          }}
        >
          {/* Settings Icon */}
          <IconButton
            onClick={() => setEditPetDialogOpen(true)}
            aria-label="edit pet"
            size="small"
            sx={{
              position: 'absolute',
              top: { xs: 8, sm: 16 },
              right: { xs: 8, sm: 16 },
              bgcolor: 'background.paper',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <Settings fontSize="small" />
          </IconButton>

          {/* Pet Avatar - Prominent */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
            {(selectedPet.photoBase64 || selectedPet.photoUrl) ? (
              <Avatar
                src={selectedPet.photoBase64 || selectedPet.photoUrl}
                alt={selectedPet.name}
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  border: { xs: 3, sm: 4 },
                  borderColor: 'primary.light',
                  boxShadow: 3,
                }}
              />
            ) : (
              <Avatar
                sx={{
                  width: { xs: 80, sm: 100, md: 120 },
                  height: { xs: 80, sm: 100, md: 120 },
                  bgcolor: 'primary.main',
                  border: { xs: 3, sm: 4 },
                  borderColor: 'primary.light',
                  boxShadow: 3,
                }}
              >
                <Pets sx={{ fontSize: { xs: 40, sm: 50, md: 60 } }} />
              </Avatar>
            )}
            <Typography variant="h4" sx={{ mt: { xs: 1.5, sm: 2 }, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}>
              {selectedPet.name}
            </Typography>
            {(selectedPet.breed || selectedPet.age) && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: { xs: '0.8rem', sm: '0.875rem' }, textAlign: 'center', px: 1 }}>
                {selectedPet.breed}
                {selectedPet.breed && selectedPet.age && ' • '}
                {selectedPet.age && `${selectedPet.age} years old`}
              </Typography>
            )}
          </Box>

          {/* Pet Switcher / Add Pet */}
          <FormControl fullWidth size="small">
            <Select
              value={selectedPetId}
              onChange={handlePetChange}
              sx={{
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'divider',
                },
              }}
            >
              {pets.map((pet) => (
                <MenuItem key={pet.id} value={pet.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {(pet.photoBase64 || pet.photoUrl) ? (
                      <Avatar
                        src={pet.photoBase64 || pet.photoUrl}
                        sx={{ width: 24, height: 24 }}
                      />
                    ) : (
                      <Avatar sx={{ width: 24, height: 24, fontSize: 14 }}>
                        <Pets sx={{ fontSize: 14 }} />
                      </Avatar>
                    )}
                    <span>{pet.name}</span>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem value="add-new">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Add fontSize="small" />
                  <span>Add another pet</span>
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Paper>
      )}

      {/* Journal Section */}
      <Box>
        {/* Header with CTA */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, mb: 3, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Journal
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Track {selectedPet?.name}'s daily journey
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<Add />}
            onClick={() => setAddLogDialogOpen(true)}
            disabled={!selectedPetId}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              boxShadow: 2,
              '&:hover': {
                boxShadow: 4,
              },
            }}
          >
            Add Entry
          </Button>
        </Box>

        {loadingLogs ? (
          <Paper sx={{ p: { xs: 3, sm: 4, md: 6 } }}>
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <CircularProgress />
              <Typography color="text.secondary">Loading journal entries...</Typography>
            </Box>
          </Paper>
        ) : healthLogs.length === 0 ? (
          <Paper sx={{ p: { xs: 3, sm: 4, md: 6 }, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Start {selectedPet?.name}'s health journal
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3, fontSize: { xs: '0.875rem', sm: '1rem' } }}>
              Keep track of daily observations, symptoms, and special moments.
              It helps you notice patterns and share updates with your vet.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setAddLogDialogOpen(true)}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Add First Entry
            </Button>
          </Paper>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            {/* Timeline View */}
            {Object.entries(groupedLogs).map(([dateHeader, logs]) => (
              <Paper key={dateHeader} sx={{ p: { xs: 2, sm: 3 } }}>
                {/* Date Header */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    mb: 2,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontSize: '0.75rem',
                  }}
                >
                  {dateHeader}
                </Typography>

                {/* Logs for this date */}
                <List disablePadding>
                  {logs.map((log, index) => (
                    <Box key={log.id}>
                      {index > 0 && <Divider sx={{ my: 2 }} />}
                      <ListItem
                        disablePadding
                        sx={{
                          alignItems: 'flex-start',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1, pr: 2 }}>
                            <Typography variant="body1" sx={{ mb: 0.5 }}>
                              {log.entryText}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(log.loggedAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                            <IconButton
                              size="small"
                              aria-label="edit"
                              onClick={() => handleEditClick(log)}
                              sx={{ color: 'text.secondary' }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              aria-label="delete"
                              onClick={() => handleDeleteClick(log.id)}
                              sx={{ color: 'error.main' }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Paper>
            ))}

            {/* Load More */}
            {hasMoreLogs && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleShowMore}
                  size="large"
                >
                  Show More Entries
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>

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

      <EditPetDialog
        open={editPetDialogOpen}
        onClose={() => setEditPetDialogOpen(false)}
        pet={selectedPet || null}
        onPetUpdated={handlePetUpdated}
        onPetDeleted={handlePetDeleted}
      />
    </Box>
  );
};

export default HealthJournal;