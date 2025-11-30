import { Alert, Button, Box } from '@mui/material';
import { useTrialStatus } from '../hooks/useTrialStatus';
import { STRIPE_PAYMENT_LINK, LIFETIME_PRICE } from '../config/stripe';

/**
 * Trial banner that shows remaining trial days and upgrade button
 * Only displays when user is on trial (not paid and trial is active)
 */
const TrialBanner = () => {
  const { trialStatus } = useTrialStatus();

  // Don't show banner if:
  // - Trial status not loaded yet
  // - User has paid
  // - Trial is not active
  if (!trialStatus || trialStatus.isPaid || !trialStatus.isTrialActive) {
    return null;
  }

  const daysLeft = trialStatus.daysRemaining || 0;

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

    // Open in new tab
    window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <Alert
      severity={daysLeft <= 2 ? 'warning' : 'info'}
      sx={{ mb: 2 }}
      action={
        <Button color="inherit" size="small" onClick={handleUpgrade}>
          Upgrade
        </Button>
      }
    >
      <Box>
        <strong>
          Trial: {daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining
        </strong>
        {' '}- Upgrade to lifetime access for ${LIFETIME_PRICE} (limited to first 20 customers)
      </Box>
    </Alert>
  );
};

export default TrialBanner;
