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
import { useLanguage } from '../i18n/LanguageContext';

/**
 * Paywall screen shown when trial expires and user hasn't paid
 * Full-screen takeover to encourage upgrade
 */
const PaywallScreen = () => {
  const { t } = useLanguage();

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
          {t('paywall_title')}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph align="center">
          {t('paywall_subtitle')}
        </Typography>

        <Card sx={{ mt: 3, width: '100%', maxWidth: 400 }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <Typography variant="h3" color="primary" gutterBottom>
                ${LIFETIME_PRICE}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {t('paywall_price_label')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t('paywall_monthly_equiv')}
              </Typography>
              <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 1 }}>
                {t('paywall_limited', { limit: FOUNDING_MEMBER_LIMIT })}
              </Typography>
              <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                {t('paywall_less_than_vet')}
              </Typography>
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={t('paywall_feature_pdf')} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={t('paywall_feature_logs')} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={t('paywall_feature_pets')} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={t('paywall_feature_future')} />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircleIcon color="success" />
                </ListItemIcon>
                <ListItemText primary={t('paywall_feature_support')} />
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
              {t('paywall_cta')}
            </Button>

            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 2, textAlign: 'center', fontWeight: 500 }}>
              {t('paywall_guarantee')}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, textAlign: 'center' }}>
              {t('paywall_after_limit', { limit: FOUNDING_MEMBER_LIMIT, yearlyPrice: YEARLY_PRICE })}
            </Typography>
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
          {t('paywall_contact')}
        </Typography>
      </Box>
    </Container>
  );
};

export default PaywallScreen;
