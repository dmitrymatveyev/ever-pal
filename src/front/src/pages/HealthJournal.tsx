import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Avatar,
  Chip,
  Snackbar
} from '@mui/material';
import { Add, Pets, Edit, Delete, Settings } from '@mui/icons-material';
import { getPets, type Pet } from '../services/petService';
import { getHealthLogs, deleteHealthLog, type HealthLog } from '../services/healthLogService';
import AddPetDialog from '../components/AddPetDialog';
import AddLogEventDialog from '../components/AddLogEventDialog';
import EditHealthLogDialog from '../components/EditHealthLogDialog';
import EditPetDialog from '../components/EditPetDialog';
import { isDemoMode, getDemoPet, getDemoHealthLogs, disableDemoMode } from '../utils/demoData';
import { trackEvent } from '../utils/analytics';

interface UserData {
  email: string;
  isAnonymous?: boolean;
  token?: string;
}

const HealthJournal = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>('');
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHealthLog, setSelectedHealthLog] = useState<HealthLog | null>(null);
  const [visibleCount, setVisibleCount] = useState(50);
  const [demoMode, setDemoMode] = useState(false);
  const [demoModeSnackbar, setDemoModeSnackbar] = useState(false);

  // Dialog states derived from URL params
  const dialog = searchParams.get('dialog');
  const logId = searchParams.get('logId');

  const addPetDialogOpen = dialog === 'add-pet';
  const addLogDialogOpen = dialog === 'add-log';
  const editLogDialogOpen = dialog === 'edit-log';
  const editPetDialogOpen = dialog === 'edit-pet';

  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check for demo mode first
        if (isDemoMode()) {
          setDemoMode(true);
          const demoPet = getDemoPet();
          setPets([demoPet]);
          setSelectedPetId(demoPet.id);
          setHealthLogs(getDemoHealthLogs());
          setLoading(false);

          // Track demo mode session
          trackEvent('demo_mode_session_started', {
            timestamp: new Date().toISOString()
          });
          return;
        }

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

  // Effect to select health log when edit dialog is opened via URL
  useEffect(() => {
    if (editLogDialogOpen && logId && healthLogs.length > 0) {
      const log = healthLogs.find(l => l.id === logId);
      if (log) {
        setSelectedHealthLog(log);
      }
    }
  }, [editLogDialogOpen, logId, healthLogs]);

  useEffect(() => {
    const fetchHealthLogs = async () => {
      if (!selectedPetId || !userData) {
        return;
      }

      setLoadingLogs(true);
      try {
        // Fetch initial 50 logs (approximately 14 days of entries)
        const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, 50, 0);
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
      if (demoMode) {
        setDemoModeSnackbar(true);
        trackEvent('demo_mode_action_blocked', { action: 'add_pet' });
        return;
      }
      setSearchParams({ dialog: 'add-pet' });
    } else {
      setSelectedPetId(value);
      setVisibleCount(50); // Reset visible count when switching pets
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
      // Fetch initial 50 logs after adding (approximately 14 days)
      const logs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, 50, 0);
      setHealthLogs(logs);
      setVisibleCount(50); // Reset visible count
    } catch (err) {
      console.error('Failed to refresh health logs:', err);
    }
  };

  const handleEditClick = (log: HealthLog) => {
    if (demoMode) {
      setDemoModeSnackbar(true);
      trackEvent('demo_mode_action_blocked', { action: 'edit_log' });
      return;
    }
    setSelectedHealthLog(log);
    setSearchParams({ dialog: 'edit-log', logId: log.id });
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
    if (demoMode) {
      setDemoModeSnackbar(true);
      trackEvent('demo_mode_action_blocked', { action: 'delete_log' });
      return;
    }

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
  // Show "Load More" if we've fetched exactly the number we requested (indicates there might be more)
  const hasMoreLogs = healthLogs.length === visibleCount;
  const groupedLogs = groupLogsByDate(visibleLogs);

  const handleShowMore = async () => {
    if (!selectedPetId || !userData) {
      return;
    }

    const loadMoreCount = 20; // Load 20 more entries at a time (roughly 1 week)
    const newVisibleCount = visibleCount + loadMoreCount;

    try {
      // Fetch additional logs
      const newLogs = await getHealthLogs(selectedPetId, userData.token!, userData.isAnonymous, loadMoreCount, visibleCount);

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
          setVisibleCount(50); // Reset visible count
        }
      }
    } catch (err) {
      console.error('Failed to refresh pets after deletion:', err);
    }
  };

  // Helper function to close dialogs
  const closeDialog = () => {
    setSearchParams({});
  };

  // Helper functions to open dialogs
  const openAddLogDialog = () => {
    if (demoMode) {
      setDemoModeSnackbar(true);
      trackEvent('demo_mode_action_blocked', { action: 'add_log' });
      return;
    }
    setSearchParams({ dialog: 'add-log' });
  };

  const openEditPetDialog = () => {
    if (demoMode) {
      setDemoModeSnackbar(true);
      trackEvent('demo_mode_action_blocked', { action: 'edit_pet' });
      return;
    }
    setSearchParams({ dialog: 'edit-pet' });
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

  const handleExitDemoMode = () => {
    trackEvent('demo_mode_exited', {
      timestamp: new Date().toISOString(),
      action: 'add_pet_clicked'
    });

    // Exit demo mode and navigate to add pet
    disableDemoMode();
    navigate('/add-first-pet');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      {/* Demo Mode Banner */}
      {demoMode && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            alignItems: 'center',
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              onClick={handleExitDemoMode}
              sx={{
                whiteSpace: 'nowrap',
                fontWeight: 600
              }}
            >
              Add Your Pet
            </Button>
          }
        >
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            You're viewing a demo with sample data
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
            Explore how EverPal works, then add your pet to start tracking for real
          </Typography>
        </Alert>
      )}

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
            onClick={openEditPetDialog}
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
        {/* Header with CTA - Only show when there are entries */}
        {!loadingLogs && healthLogs.length > 0 && (
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
              onClick={openAddLogDialog}
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
        )}

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
              onClick={openAddLogDialog}
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
                            {/* Display log type */}
                            {log.logType && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                                <Chip
                                  label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      <span style={{ fontSize: '1rem' }}>
                                        {log.logType === 'food' && '🍽️'}
                                        {log.logType === 'stool' && '💩'}
                                        {log.logType === 'medication' && '💊'}
                                        {log.logType === 'vomit' && '🤮'}
                                        {log.logType === 'urine' && '💧'}
                                        {log.logType === 'general' && '🐾'}
                                      </span>
                                      <span style={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                                        {log.logType.charAt(0).toUpperCase() + log.logType.slice(1)}
                                      </span>
                                    </Box>
                                  }
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{
                                    height: 'auto',
                                    py: 0.5,
                                    '& .MuiChip-label': {
                                      px: 1,
                                      py: 0.25,
                                    }
                                  }}
                                />
                              </Box>
                            )}
                            {/* Display tags as chips */}
                            {log.tags && log.tags.length > 0 && (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: log.entryText || log.photoBase64 ? 1 : 0.5 }}>
                                {log.tags.map((tag) => (
                                  <Chip
                                    key={tag.id}
                                    label={
                                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <span style={{ fontSize: '1rem' }}>{tag.icon}</span>
                                        <span style={{ fontSize: '0.8125rem' }}>{tag.label}</span>
                                      </Box>
                                    }
                                    size="small"
                                    sx={{
                                      height: 'auto',
                                      py: 0.5,
                                      '& .MuiChip-label': {
                                        px: 1,
                                        py: 0.25,
                                      }
                                    }}
                                  />
                                ))}
                              </Box>
                            )}
                            {/* Display photo */}
                            {log.photoBase64 && (
                              <Box sx={{ mb: 1 }}>
                                <Box
                                  component="img"
                                  src={log.photoBase64}
                                  alt="Health log photo"
                                  sx={{
                                    maxWidth: '100%',
                                    maxHeight: 200,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    cursor: 'pointer',
                                    '&:hover': {
                                      opacity: 0.9,
                                    }
                                  }}
                                  onClick={() => window.open(log.photoBase64, '_blank')}
                                />
                              </Box>
                            )}
                            {/* Display notes as text */}
                            {log.entryText && (
                              <Typography variant="body1" sx={{ mb: 0.5 }}>
                                {log.entryText}
                              </Typography>
                            )}
                            {/* Display time */}
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
        onClose={closeDialog}
        onPetAdded={handlePetAdded}
      />

      {selectedPetId && (
        <AddLogEventDialog
          open={addLogDialogOpen}
          onClose={closeDialog}
          petId={selectedPetId}
          onLogAdded={handleLogAdded}
        />
      )}

      <EditHealthLogDialog
        open={editLogDialogOpen}
        onClose={closeDialog}
        healthLog={selectedHealthLog}
        onLogUpdated={handleLogUpdated}
      />

      <EditPetDialog
        open={editPetDialogOpen}
        onClose={closeDialog}
        pet={selectedPet || null}
        onPetUpdated={handlePetUpdated}
        onPetDeleted={handlePetDeleted}
      />

      {/* Demo Mode Snackbar */}
      <Snackbar
        open={demoModeSnackbar}
        autoHideDuration={4000}
        onClose={() => setDemoModeSnackbar(false)}
        message="This is a demo. Click 'Add Your Pet' above to start tracking for real"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default HealthJournal;