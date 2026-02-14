import { useState } from 'react';
import {
  Alert,
  Button,
  Box,
  TextField,
  Typography,
  CircularProgress,
  Collapse,
} from '@mui/material';
import { Schedule } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_PAYMENT_LINK, LIFETIME_PRICE } from '../config/stripe';
import { updateUserEmail } from '../services/userService';
import { trackEvent } from '../utils/analytics';
import { useLanguage } from '../i18n/LanguageContext';

const TrialBanner = () => {
  const { t } = useLanguage();
  const { trialStatus, hasEngaged, user } = useAuth();
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!trialStatus || trialStatus.isPaid || !trialStatus.isTrialActive || !hasEngaged) {
    return null;
  }

  const daysLeft = trialStatus.daysRemaining || 0;
  const hasEmail = user?.email && !user.email.includes('@anonymous');
  const showLayer3 = daysLeft <= 2 && !hasEmail;

  const handleUpgrade = () => {
    // Get current user ID from localStorage
    const userStr = localStorage.getItem('user');
    let userId = '';
    let userEmail = '';

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        userId = userData.userId || '';
        userEmail = userData.email || '';
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }

    // Construct Stripe Payment Link with metadata
    const params = new URLSearchParams({
      client_reference_id: userId,
    });

    if (userEmail) {
      params.append('prefilled_email', userEmail);
    }

    const paymentUrl = `${STRIPE_PAYMENT_LINK}?${params.toString()}`;

    // Navigate to Stripe (same window to return to success page)
    window.location.href = paymentUrl;
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setError(t('error_email_required'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('error_email_invalid'));
      return;
    }

    if (!user) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await updateUserEmail(user.token, email.trim(), user.isAnonymous || false);

      // Update user in localStorage
      const updatedUser = { ...user, email: email.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      trackEvent('trial_email_layer3_submitted', {
        daysLeft,
        timestamp: new Date().toISOString()
      });

      setShowEmailInput(false);
      setEmail('');
    } catch (err) {
      console.error('Failed to save email:', err);
      setError(t('error_save_email_failed'));
      trackEvent('trial_email_layer3_error', {
        error: err instanceof Error ? err.message : 'unknown_error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !submitting) {
      handleEmailSubmit();
    }
  };

  const handleMaybeLater = () => {
    trackEvent('trial_email_layer3_dismissed', {
      daysLeft,
      timestamp: new Date().toISOString()
    });
    setShowEmailInput(false);
  };

  // Layer 3: Enhanced trial warning with email collection
  if (showLayer3 && !showEmailInput) {
    return (
      <Alert
        severity="warning"
        icon={<Schedule />}
        sx={{
          mb: 2,
          alignItems: 'flex-start',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
            {t('trial_ends_title', { days: daysLeft, plural: daysLeft === 1 ? '' : 's' })}
          </Typography>

          <Typography variant="body2" sx={{ mb: 1.5, color: 'text.secondary' }}>
            {t('trial_without_email')}
          </Typography>

          <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
            <li>
              <Typography variant="body2">{t('trial_data_loss')}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t('trial_no_other_device')}</Typography>
            </li>
            <li>
              <Typography variant="body2">{t('trial_no_backup')}</Typography>
            </li>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setShowEmailInput(true);
                trackEvent('trial_email_layer3_clicked', {
                  daysLeft,
                  timestamp: new Date().toISOString()
                });
              }}
              sx={{ fontWeight: 600 }}
            >
              {t('add_email_now')}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleUpgrade}
              sx={{ fontWeight: 600 }}
            >
              {t('view_payment_plan')}
            </Button>
          </Box>
        </Box>
      </Alert>
    );
  }

  // Layer 3: Email input form
  if (showLayer3 && showEmailInput) {
    return (
      <Alert
        severity="warning"
        icon={<Schedule />}
        sx={{
          mb: 2,
          alignItems: 'flex-start',
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <Box sx={{ width: '100%' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 2 }}>
            {t('protect_data')}
          </Typography>

          <Collapse in={error !== null}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          </Collapse>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={submitting}
              autoFocus
              sx={{ flex: 1, minWidth: 200 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={handleEmailSubmit}
              disabled={submitting}
              sx={{ minWidth: 100 }}
            >
              {submitting ? <CircularProgress size={20} /> : t('add_email')}
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleUpgrade}
              disabled={submitting}
            >
              {t('view_payment_plan')}
            </Button>
            <Button
              variant="text"
              size="small"
              onClick={handleMaybeLater}
              disabled={submitting}
            >
              {t('maybe_later')}
            </Button>
          </Box>
        </Box>
      </Alert>
    );
  }

  // Standard trial banner (when not near end or email already collected)
  return (
    <Alert
      severity={daysLeft <= 2 ? 'warning' : 'info'}
      sx={{ mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={handleUpgrade}>
          {t('upgrade')}
        </Button>
      }
    >
      <Box>
        <strong>
          {t('trial_days_left', { days: daysLeft, plural: daysLeft === 1 ? '' : 's' })}
        </strong>
        {' '}- {t('trial_upgrade_message', { price: `$${LIFETIME_PRICE}` })}
      </Box>
    </Alert>
  );
};

export default TrialBanner;
