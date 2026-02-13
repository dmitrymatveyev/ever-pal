import { useState } from 'react';
import {
  Alert,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Collapse,
} from '@mui/material';
import { Lightbulb, Close } from '@mui/icons-material';
import { trackEvent } from '../utils/analytics';

interface TrialCheckInBannerProps {
  petName: string;
  onEmailSubmit: (email: string) => Promise<void>;
  onDismiss: () => void;
}

const TrialCheckInBanner = ({ petName, onEmailSubmit, onDismiss }: TrialCheckInBannerProps) => {
  const [showInput, setShowInput] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNotNow = () => {
    trackEvent('trial_email_layer2_dismissed', {
      petName,
      timestamp: new Date().toISOString()
    });
    onDismiss();
  };

  const handleAddEmail = () => {
    setShowInput(true);
    trackEvent('trial_email_layer2_clicked', {
      petName,
      timestamp: new Date().toISOString()
    });
  };

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter an email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onEmailSubmit(email.trim());

      trackEvent('trial_email_layer2_submitted', {
        petName,
        timestamp: new Date().toISOString()
      });

      onDismiss();
    } catch (err) {
      console.error('Failed to save email:', err);
      setError('Failed to save email. Please try again.');
      trackEvent('trial_email_layer2_error', {
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
    <Alert
      severity="info"
      icon={<Lightbulb />}
      sx={{
        mb: 3,
        alignItems: 'flex-start',
        '& .MuiAlert-message': {
          width: '100%',
          pt: 0.5
        }
      }}
      action={
        !showInput && (
          <Button
            color="inherit"
            size="small"
            onClick={handleNotNow}
            startIcon={<Close />}
            sx={{ minWidth: 'auto' }}
          >
            Not right now
          </Button>
        )
      }
    >
      {!showInput ? (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
            Have questions about tracking {petName}?
          </Typography>
          <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
            We can send helpful tips during your trial.
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddEmail}
            sx={{ fontWeight: 600 }}
          >
            + Add Email
          </Button>
        </Box>
      ) : (
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 500, mb: 2 }}>
            Enter your email to receive helpful tips
          </Typography>

          <Collapse in={error !== null}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Collapse>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
            <TextField
              size="small"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={submitting}
              autoFocus
              sx={{ flex: 1 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleSubmit}
              disabled={submitting}
              sx={{ minWidth: 80 }}
            >
              {submitting ? <CircularProgress size={20} /> : 'Add'}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={handleNotNow}
              disabled={submitting}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      )}
    </Alert>
  );
};

export default TrialCheckInBanner;
