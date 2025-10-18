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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { updateHealthLog, type UpdateHealthLogRequest, type HealthLog } from '../services/healthLogService';
import QuickLogTags, { SENIOR_PET_TAGS } from './QuickLogTags';

interface EditHealthLogDialogProps {
  open: boolean;
  onClose: () => void;
  healthLog: HealthLog | null;
  onLogUpdated: () => void;
}

const EditHealthLogDialog = ({ open, onClose, healthLog, onLogUpdated }: EditHealthLogDialogProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (healthLog) {
      // Parse entry text to extract tags and notes
      const allTagLabels = SENIOR_PET_TAGS.map(t => t.label);
      const foundTags: string[] = [];
      let remainingText = healthLog.entryText;

      // Find tags in the entry text
      allTagLabels.forEach(tagLabel => {
        if (healthLog.entryText.includes(tagLabel)) {
          foundTags.push(tagLabel);
          // Remove tag from remaining text
          remainingText = remainingText.replace(tagLabel, '').trim();
        }
      });

      // Clean up remaining text (remove leading comma/period/spaces)
      remainingText = remainingText.replace(/^[,.\s]+/, '').trim();

      setSelectedTags(foundTags);
      setNotes(remainingText);

      const loggedAtDate = dayjs(healthLog.loggedAt);
      setSelectedDate(loggedAtDate);
      setSelectedTime(loggedAtDate);
    }
  }, [healthLog]);

  const handleTagToggle = (label: string) => {
    setSelectedTags(prev =>
      prev.includes(label)
        ? prev.filter(t => t !== label)
        : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (!healthLog) {
      return;
    }

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

      // Combine tags and notes into entry text
      const tagText = selectedTags.join(', ');
      const entryText = notes.trim()
        ? `${tagText}${tagText ? '. ' : ''}${notes.trim()}`
        : tagText;

      const logData: UpdateHealthLogRequest = {
        entryText: entryText,
        loggedAt: loggedAtISO
      };

      await updateHealthLog(healthLog.id, logData, userData.token, userData.isAnonymous);

      onLogUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update health log:', err);
      setError('Failed to update health log. Please try again.');
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
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
          Update Journal Entry
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
          {saving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHealthLogDialog;