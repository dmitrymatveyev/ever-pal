import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  Typography,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { trackEvent } from '../utils/analytics';
import { useLanguage } from '../i18n/LanguageContext';

interface TrialStartEmailModalProps {
  open: boolean;
  onClose: () => void;
  onEmailSubmit: (email: string) => Promise<void>;
  petName: string;
}

const TrialStartEmailModal = ({ open, onClose, onEmailSubmit, petName }: TrialStartEmailModalProps) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSkip = () => {
    trackEvent('trial_email_layer1_skipped', {
      petName,
      timestamp: new Date().toISOString()
    });
    onClose();
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(t('error_email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('error_email_invalid'));
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onEmailSubmit(email.trim());

      trackEvent('trial_email_layer1_submitted', {
        petName,
        timestamp: new Date().toISOString()
      });

      onClose();
    } catch (err) {
      console.error('Failed to save email:', err);
      setError(t('error_save_email_failed'));
      trackEvent('trial_email_layer1_error', {
        error: err instanceof Error ? err.message : 'unknown_error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting) {
      handleSubmit();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        }
      }}
    >
      <DialogContent>
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Favorite sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            {t('layer1_title', { petName })}
          </Typography>

          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', lineHeight: 1.6 }}>
            {t('layer1_body')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label={t('email_address_label')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={submitting}
            autoFocus
            sx={{ mb: 2 }}
          />

          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontSize: '0.875rem' }}>
            {t('layer1_hint')}
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              size="large"
              onClick={handleSkip}
              disabled={submitting}
              sx={{ minWidth: 120 }}
            >
              {t('skip_for_now')}
            </Button>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ minWidth: 120 }}
            >
              {submitting ? <CircularProgress size={24} /> : t('add_email')}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default TrialStartEmailModal;
