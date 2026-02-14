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
import 'dayjs/locale/pl';
import { exportHealthLogsPdf, downloadPdf } from '../services/pdfExportService';
import { CheckCircle } from '@mui/icons-material';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { t, language } = useLanguage();

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
          language,
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
        return t('last_7_days');
      case '30':
        return t('last_30_days');
      case '90':
        return t('last_90_days');
      case 'all':
        return t('all_time');
      case 'custom':
        return customStartDate && customEndDate
          ? `${customStartDate.format('MMM D, YYYY')} - ${customEndDate.format('MMM D, YYYY')}`
          : t('select_dates');
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
        {t('export_title', { petName })}
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
              {t('pdf_success_title')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pdf_success_subtitle')}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('export_subtitle', { petName })}
            </Typography>

            <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
              <FormLabel component="legend">{t('date_range')}</FormLabel>
              <RadioGroup
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              >
                <FormControlLabel value="7" control={<Radio />} label={t('last_7_days')} />
                <FormControlLabel value="30" control={<Radio />} label={t('last_30_days')} />
                <FormControlLabel value="90" control={<Radio />} label={t('last_90_days')} />
                <FormControlLabel value="all" control={<Radio />} label={t('all_time')} />
                <FormControlLabel value="custom" control={<Radio />} label={t('custom_range')} />
              </RadioGroup>
            </FormControl>

            {dateRange === 'custom' && (
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={language}>
                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <DatePicker
                    label={t('start_date')}
                    value={customStartDate}
                    onChange={setCustomStartDate}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                  <DatePicker
                    label={t('end_date')}
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
              label={t('include_photos')}
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
                {t('report_summary')}
              </Typography>
              <Typography variant="body2">
                {t('period_label', { period: getDateRangeDescription() })}
              </Typography>
              <Typography variant="body2">
                {t('photos_label', { status: includePhotos ? t('photos_included') : t('photos_not_included') })}
              </Typography>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('pdf_disclaimer')}
              </Typography>
            </Alert>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {success ? t('close') : t('cancel')}
        </Button>
        {!success && (
          <Button
            onClick={handleExport}
            variant="contained"
            disabled={loading}
            startIcon={loading && <CircularProgress size={20} />}
          >
            {loading ? t('generating') : t('export_pdf')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ExportVetPDFDialog;
