import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Checkbox,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { exportHealthLogsPdf, downloadPdf } from '../services/pdfExportService';
import { CheckCircle } from '@mui/icons-material';

interface ExportVetPDFDialogProps {
  open: boolean;
  onClose: () => void;
  petId: string;
  petName: string;
}

type DateRangeOption = '7' | '30' | '90' | 'all' | 'custom';

const ExportVetPDFDialog = ({ open, onClose, petId, petName }: ExportVetPDFDialogProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  const [dateRange, setDateRange] = useState<DateRangeOption>('30');
  const [customStartDate, setCustomStartDate] = useState<Dayjs | null>(dayjs().subtract(30, 'day'));
  const [customEndDate, setCustomEndDate] = useState<Dayjs | null>(dayjs());
  const [includePhotos, setIncludePhotos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user data found');
      }

      const userData = JSON.parse(userStr);

      let startDate: string | undefined;
      let endDate: string | undefined;

      if (dateRange === 'custom') {
        if (customStartDate) {
          startDate = customStartDate.startOf('day').toISOString();
        }
        if (customEndDate) {
          endDate = customEndDate.endOf('day').toISOString();
        }
      } else if (dateRange !== 'all') {
        const days = parseInt(dateRange);
        startDate = dayjs().subtract(days, 'day').startOf('day').toISOString();
        endDate = dayjs().endOf('day').toISOString();
      }

      const blob = await exportHealthLogsPdf(
        {
          petId,
          startDate,
          endDate,
          includePhotos,
        },
        userData.token,
        userData.isAnonymous
      );

      const fileName = `${petName}-health-report-${dayjs().format('YYYY-MM-DD')}.pdf`;
      downloadPdf(blob, fileName);

      setSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to export PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDateRange('30');
      setCustomStartDate(dayjs().subtract(30, 'day'));
      setCustomEndDate(dayjs());
      setIncludePhotos(true);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  const getDateRangeDescription = () => {
    switch (dateRange) {
      case '7':
        return 'Last 7 days';
      case '30':
        return 'Last 30 days';
      case '90':
        return 'Last 90 days';
      case 'all':
        return 'All time';
      case 'custom':
        return customStartDate && customEndDate
          ? `${customStartDate.format('MMM D, YYYY')} - ${customEndDate.format('MMM D, YYYY')}`
          : 'Select dates';
      default:
        return '';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Export Health Report for {petName}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              PDF Downloaded Successfully!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check your downloads folder for the health report.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a complete symptom timeline that helps your vet diagnose and treat {petName}.
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend">Date Range</FormLabel>
              <RadioGroup
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              >
                <FormControlLabel value="7" control={<Radio />} label="Last 7 days" />
                <FormControlLabel value="30" control={<Radio />} label="Last 30 days (Recommended)" />
                <FormControlLabel value="90" control={<Radio />} label="Last 90 days" />
                <FormControlLabel value="all" control={<Radio />} label="All time" />
                <FormControlLabel value="custom" control={<Radio />} label="Custom date range" />
              </RadioGroup>
            </FormControl>

            {dateRange === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <DatePicker
                    label="Start Date"
                    value={customStartDate}
                    onChange={setCustomStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label="End Date"
                    value={customEndDate}
                    onChange={setCustomEndDate}
                    minDate={customStartDate || undefined}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </Box>
              </LocalizationProvider>
            )}

            <FormControlLabel
              control={
                <Checkbox
                  checked={includePhotos}
                  onChange={(e) => setIncludePhotos(e.target.checked)}
                />
              }
              label="Include photos (up to 50)"
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                p: 2,
                borderRadius: 1,
                mb: 2,
              }}
            >
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                Report Summary
              </Typography>
              <Typography variant="body2">
                Period: {getDateRangeDescription()}
              </Typography>
              <Typography variant="body2">
                Photos: {includePhotos ? 'Included' : 'Not included'}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                The PDF will include a medical disclaimer and is designed to be printer-friendly.
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? 'Generating...' : 'Export PDF'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExportVetPDFDialog;
