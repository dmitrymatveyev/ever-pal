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
import { updateHealthLog, type UpdateHealthLogRequest, type HealthLog, type Tag } from '../services/healthLogService';
import QuickLogTags from './QuickLogTags';
import PhotoUpload from './PhotoUpload';
import { getTagsByLogType } from '../services/tagService';
import { OfflineError } from '../utils/apiClientSingleton';

interface EditHealthLogDialogProps {
  open: boolean;
  onClose: () => void;
  healthLog: HealthLog | null;
  onLogUpdated: () => void;
}

const EditHealthLogDialog = ({ open, onClose, healthLog, onLogUpdated }: EditHealthLogDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState('');
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingTags, setLoadingTags] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && healthLog) {
      setLoadingTags(true);
      getTagsByLogType(healthLog.logType)
        .then(tags => setAvailableTags(tags))
        .catch(err => console.error('Failed to fetch tags:', err))
        .finally(() => setLoadingTags(false));
    }
  }, [open, healthLog]);

  useEffect(() => {
    if (healthLog) {
      setSelectedTags(healthLog.tags);
      setNotes(healthLog.entryText);
      setPhotoBase64(healthLog.photoBase64 || null);

      const loggedAtDate = dayjs(healthLog.loggedAt);
      setSelectedDate(loggedAtDate);
      setSelectedTime(loggedAtDate);
    }
  }, [healthLog]);

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
    if (!healthLog) {
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

      const logData: UpdateHealthLogRequest = {
        entryText: notes.trim(),
        tags: selectedTags,
        photoBase64: photoBase64 || undefined,
        loggedAt: loggedAtISO
      };

      await updateHealthLog(healthLog.id, logData, userData.token, userData.isAnonymous);

      onLogUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update health log:', err);

      if (err instanceof OfflineError) {
        setError('You are currently offline. Please check your connection and try again.');
      } else {
        setError('Failed to update health log. Please try again.');
      }
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

  const getLogTypeIcon = (logType: string) => {
    const icons: Record<string, string> = {
      food: '🍽️',
      stool: '💩',
      medication: '💊',
      vomit: '🤮',
      urine: '💧',
      general: '🐾',
    };
    return icons[logType] || '🐾';
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth fullScreen={fullScreen}>
      <DialogTitle>
        {healthLog && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h5" component="span">
              {getLogTypeIcon(healthLog.logType)}
            </Typography>
            <Typography variant="h5" component="span" sx={{ fontWeight: 600 }}>
              Edit {healthLog.logType.charAt(0).toUpperCase() + healthLog.logType.slice(1)} Log
            </Typography>
          </Box>
        )}
        <Typography variant="body2" color="text.secondary">
          Update tags, notes, photo, or timing
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
            <PhotoUpload
              onPhotoChange={handlePhotoChange}
              currentPhoto={photoBase64 || undefined}
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
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
          size="large"
        >
          {saving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHealthLogDialog;
