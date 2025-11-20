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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { createHealthLog, type CreateHealthLogRequest, type Tag } from '../services/healthLogService';
import QuickLogTags from './QuickLogTags';
import { getPets } from '../services/petService';
import { getTags } from '../services/tagService';

interface AddLogEventDialogProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  onLogAdded: () => void;
}

const AddLogEventDialog = ({ open, onClose, petId, onLogAdded }: AddLogEventDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [petName, setPetName] = useState<string>('');

  // Fetch pet name and tags when dialog opens
  useEffect(() => {
    if (open && petId) {
      const fetchData = async () => {
        try {
          const userStr = localStorage.getItem('user');
          const userData = JSON.parse(userStr!);
          const pets = await getPets(userData.token, userData.isAnonymous);
          const pet = pets.find(p => p.id === petId);
          if (pet) {
            setPetName(pet.name);
          }

          const tags = await getTags();
          setAvailableTags(tags);
        } catch (err) {
          console.error('Failed to fetch data:', err);
        }
      };
      fetchData();
    }
  }, [open, petId]);

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

  const handleSubmit = async () => {
    if (selectedTags.length === 0 && !notes.trim()) {
      setError('Please select at least one observation or add notes');
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
        entryText: notes.trim(),
        tags: selectedTags,
        loggedAt: loggedAtISO
      };

      await createHealthLog(logData, userData.token, userData.isAnonymous);

      // Reset form
      setSelectedTags([]);
      setNotes('');
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
      setSelectedTags([]);
      setNotes('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          How is {petName || 'your pet'} today?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Quick tags or write a note - whatever works best for you
        </Typography>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Free-form Notes */}
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
              What did you notice?
            </Typography>
            <TextField
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              disabled={saving}
              placeholder="Type anything you noticed... e.g., 'Limping after walk' or 'Very playful today'"
            />
          </Box>

          {/* Quick Tag Selection */}
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
              Or pick quick tags (Optional)
            </Typography>
            <QuickLogTags
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          </Box>

          {/* Date/Time Pickers */}
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
              When did you notice this?
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
        <Button onClick={handleClose} disabled={saving}>
          Cancel
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
    </Dialog>
  );
};

export default AddLogEventDialog;