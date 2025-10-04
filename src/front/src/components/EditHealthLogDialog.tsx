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
  Alert
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { updateHealthLog, type UpdateHealthLogRequest, type HealthLog } from '../services/healthLogService';

interface EditHealthLogDialogProps {
  open: boolean;
  onClose: () => void;
  healthLog: HealthLog | null;
  onLogUpdated: () => void;
}

const EditHealthLogDialog = ({ open, onClose, healthLog, onLogUpdated }: EditHealthLogDialogProps) => {
  const [entryText, setEntryText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (healthLog) {
      setEntryText(healthLog.entryText);
      const loggedAtDate = dayjs(healthLog.loggedAt);
      setSelectedDate(loggedAtDate);
      setSelectedTime(loggedAtDate);
    }
  }, [healthLog]);

  const handleSubmit = async () => {
    if (!healthLog) {
      return;
    }

    if (!entryText.trim()) {
      setError('Health event description is required');
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
        entryText: entryText.trim(),
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Health Event</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Event Description"
            value={entryText}
            onChange={(e) => setEntryText(e.target.value)}
            required
            fullWidth
            multiline
            rows={4}
            disabled={saving}
            placeholder="Describe the health event (e.g., 'Had trouble walking up stairs', 'Refused breakfast')"
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Event Date"
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              disabled={saving}
            />
            <TimePicker
              label="Event Time"
              value={selectedTime}
              onChange={(newValue) => setSelectedTime(newValue)}
              disabled={saving}
            />
          </LocalizationProvider>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditHealthLogDialog;