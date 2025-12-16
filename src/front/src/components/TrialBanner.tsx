import { Alert, Button, Box } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { STRIPE_PAYMENT_LINK, LIFETIME_PRICE } from '../config/stripe';

const TrialBanner = () => {
  const { trialStatus, hasEngaged } = useAuth();

  if (!trialStatus || trialStatus.isPaid || !trialStatus.isTrialActive || !hasEngaged) {
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

    // Navigate to Stripe (same window to return to success page)
    window.location.href = paymentUrl;
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
          Trial: {daysLeft} day{daysLeft === 1 ? '' : 's'} left
        </strong>
        {' '}- Keep unlimited PDF exports and symptom tracking: ${LIFETIME_PRICE} lifetime
      </Box>
    </Alert>
  );
};

export default TrialBanner;
