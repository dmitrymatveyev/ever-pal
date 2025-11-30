import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { STRIPE_PAYMENT_LINK, LIFETIME_PRICE, FOUNDING_MEMBER_LIMIT, YEARLY_PRICE } from '../config/stripe';

/**
 * Paywall screen shown when trial expires and user hasn't paid
 * Full-screen takeover to encourage upgrade
 */
const PaywallScreen = () => {
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

    // Navigate to Stripe (same window for paywall)
    window.location.href = paymentUrl;
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          py: 4,
        }}
      >
        <Typography variant="h4" gutterBottom align="center">
          Your Trial Has Ended
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          Continue tracking your pet's health with lifetime access
        </Typography>

        <Card sx={{ mt: 3, width: '100%', maxWidth: 400 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                ${LIFETIME_PRICE}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                One-time payment - Lifetime access
              </Typography>
              <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                Limited to first {FOUNDING_MEMBER_LIMIT} customers
              </Typography>
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Unlimited health logs" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Photo uploads & tracking" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Multiple pets" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="All future features included" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary="Founding Member badge" />
              </ListItem>
            </List>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleUpgrade}
              sx={{ mt: 2 }}
            >
              Upgrade to Lifetime Access
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              After {FOUNDING_MEMBER_LIMIT} customers: ${YEARLY_PRICE}/year
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          Questions? Contact support@everpal.app
        </Typography>
      </Box>
    </Container>
  );
};

export default PaywallScreen;
