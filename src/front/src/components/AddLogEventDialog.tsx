import { useState, useEffect } from 'react';
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
  useMediaQuery,
  useTheme,
  Paper,
  Grid,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { createHealthLog, type CreateHealthLogRequest, type Tag } from '../services/healthLogService';
import QuickLogTags from './QuickLogTags';
import PhotoUpload from './PhotoUpload';
import { getPets } from '../services/petService';
import { getTagsByLogType } from '../services/tagService';

interface AddLogEventDialogProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  onLogAdded: () => void;
}

interface LogTypeOption {
  value: string;
  label: string;
  icon: string;
}

const LOG_TYPES: LogTypeOption[] = [
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'stool', label: 'Stool', icon: '💩' },
  { value: 'medication', label: 'Medication', icon: '💊' },
  { value: 'vomit', label: 'Vomit', icon: '🤮' },
  { value: 'urine', label: 'Urine', icon: '💧' },
  { value: 'general', label: 'General', icon: '🐾' },
];

const AddLogEventDialog = ({ open, onClose, petId, onLogAdded }: AddLogEventDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [selectedLogType, setSelectedLogType] = useState<string | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs());
  const [saving, setSaving] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petName, setPetName] = useState<string>('');

  useEffect(() => {
    if (open && petId) {
      const fetchPetName = async () => {
        try {
          const userStr = localStorage.getItem('user');
          const userData = JSON.parse(userStr!);
          const pets = await getPets(userData.token, userData.isAnonymous);
          const pet = pets.find(p => p.id === petId);
          if (pet) {
            setPetName(pet.name);
          }
        } catch (err) {
          console.error('Failed to fetch pet:', err);
        }
      };
      fetchPetName();
    }
  }, [open, petId]);

  useEffect(() => {
    if (selectedLogType) {
      const fetchTags = async () => {
        setLoadingTags(true);
        try {
          const tags = await getTagsByLogType(selectedLogType);
          setAvailableTags(tags);
        } catch (err) {
          console.error('Failed to fetch tags:', err);
        } finally {
          setLoadingTags(false);
        }
      };
      fetchTags();
    }
  }, [selectedLogType]);

  const handleLogTypeSelect = (logType: string) => {
    setSelectedLogType(logType);
    setSelectedTags([]);
    setNotes('');
    setPhotoBase64(null);
  };

  const handleBack = () => {
    setSelectedLogType(null);
    setSelectedTags([]);
    setNotes('');
    setPhotoBase64(null);
    setError(null);
  };

  const handleTagToggle = (tag: Tag) => {
    setSelectedTags(prev => {
      const isSelected = prev.some(t => t.id === tag.id);
      if (isSelected) {
        return prev.filter(t => t.id !== tag.id);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handlePhotoChange = (base64: string | null) => {
    setPhotoBase64(base64);
  };

  const handleSubmit = async () => {
    if (!selectedLogType) {
      setError('Please select a log type');
      return;
    }

    if (selectedTags.length === 0 && !notes.trim() && !photoBase64) {
      setError('Please select at least one tag, add notes, or attach a photo');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const userStr = localStorage.getItem('user');
      const userData = JSON.parse(userStr!);

      let loggedAtISO: string | undefined = undefined;
      if (selectedDate && selectedTime) {
        const combinedDateTime = selectedDate
          .hour(selectedTime.hour())
          .minute(selectedTime.minute())
          .second(0)
          .millisecond(0);
        loggedAtISO = combinedDateTime.toISOString();
      } else if (selectedDate) {
        loggedAtISO = selectedDate.toISOString();
      }

      const logData: CreateHealthLogRequest = {
        petId: petId,
        logType: selectedLogType,
        entryText: notes.trim(),
        tags: selectedTags,
        photoBase64: photoBase64 || undefined,
        loggedAt: loggedAtISO
      };

      await createHealthLog(logData, userData.token, userData.isAnonymous);

      setSelectedLogType(null);
      setSelectedTags([]);
      setNotes('');
      setPhotoBase64(null);
      setSelectedDate(dayjs());
      setSelectedTime(dayjs());

      onLogAdded();
      onClose();
    } catch (err) {
      console.error('Failed to create health log:', err);
      setError('Failed to create health log. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      setError(null);
      setSelectedLogType(null);
      setSelectedTags([]);
      setNotes('');
      setPhotoBase64(null);
      onClose();
    }
  };

  const renderLogTypeSelection = () => (
    <>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Log health event for {petName || 'your pet'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          What type of event are you logging?
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          {LOG_TYPES.map((logType) => (
            <Grid item xs={6} sm={4} key={logType.value}>
              <Paper
                onClick={() => handleLogTypeSelect(logType.value)}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  border: '2px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: 2,
                  },
                }}
              >
                <Typography variant="h3" sx={{ mb: 1 }}>
                  {logType.icon}
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {logType.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
      </DialogActions>
    </>
  );

  const renderLogDetails = () => {
    const logTypeInfo = LOG_TYPES.find(lt => lt.value === selectedLogType);

    return (
      <>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h5" component="span">
              {logTypeInfo?.icon}
            </Typography>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              {logTypeInfo?.label} Log
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {petName || 'Your pet'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                Select tags
              </Typography>
              {loadingTags ? (
                <CircularProgress size={24} />
              ) : (
                <QuickLogTags
                  availableTags={availableTags}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                />
              )}
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                Notes (Optional)
              </Typography>
              <TextField
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
                multiline
                rows={3}
                disabled={saving}
                placeholder="Add any additional notes..."
              />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                Photo (Optional)
              </Typography>
              <PhotoUpload onPhotoChange={handlePhotoChange} />
            </Box>

            <Box>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1,
                  fontWeight: 600,
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                When did this occur?
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <DatePicker
                    label="Date"
                    value={selectedDate}
                    onChange={(newValue) => setSelectedDate(newValue)}
                    disabled={saving}
                    slotProps={{ textField: { sx: { flex: 1, minWidth: 200 } } }}
                  />
                  <TimePicker
                    label="Time"
                    value={selectedTime}
                    onChange={(newValue) => setSelectedTime(newValue)}
                    disabled={saving}
                    slotProps={{ textField: { sx: { flex: 1, minWidth: 150 } } }}
                  />
                </Box>
              </LocalizationProvider>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleBack} disabled={saving}>
            Back
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={saving}
            size="large"
          >
            {saving ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </>
    );
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      {!selectedLogType ? renderLogTypeSelection() : renderLogDetails()}
    </Dialog>
  );
};

export default AddLogEventDialog;
