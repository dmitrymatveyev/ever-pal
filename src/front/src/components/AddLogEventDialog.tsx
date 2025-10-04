import { useState } from 'react';
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
import { createHealthLog, type CreateHealthLogRequest } from '../services/healthLogService';

interface AddLogEventDialogProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  onLogAdded: () => void;
}

const AddLogEventDialog = ({ open, onClose, petId, onLogAdded }: AddLogEventDialogProps) => {
  const [entryText, setEntryText] = useState('');
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
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

      const logData: CreateHealthLogRequest = {
        petId: petId,
        entryText: entryText.trim(),
        loggedAt: loggedAtISO
      };

      await createHealthLog(logData, userData.token, userData.isAnonymous);

      // Reset form
      setEntryText('');
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
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Log Health Event</DialogTitle>
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
          {saving ? <CircularProgress size={24} /> : 'Log Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddLogEventDialog;