import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../contexts/AuthContext';
import SecurityPromptCard from '../components/SecurityPromptCard';
import EmailSetupDialog from '../components/EmailSetupDialog';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refetchTrialStatus, trialStatus, user, convertToEmail } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'timeout' | 'cancelled'>('loading');
  const [pollCount, setPollCount] = useState(0);
  const [emailSetupOpen, setEmailSetupOpen] = useState(false);

  const cancelled = searchParams.get('cancelled') === 'true';

  useEffect(() => {
    if (cancelled) {
      setStatus('cancelled');
      return;
    }

    let pollInterval: number;

    const poll = async () => {
      try {
        await refetchTrialStatus();
        setPollCount(prev => prev + 1);
      } catch (error) {
        console.error('Failed to poll trial status:', error);
      }
    };

    pollInterval = window.setInterval(() => {
      poll();
    }, 2000);

    poll();

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [cancelled, refetchTrialStatus]);

  useEffect(() => {
    if (trialStatus?.isPaid) {
      setStatus('success');
    } else if (pollCount >= 15 && !cancelled) {
      setStatus('timeout');
    }
  }, [trialStatus, pollCount, cancelled]);

  const handleGoToJournal = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    window.location.href = window.location.pathname;
  };

  const handleSetUpEmail = () => {
    setEmailSetupOpen(true);
  };

  const handleSkipEmailSetup = () => {
    navigate('/');
  };

  const handleEmailSetupSuccess = (email: string, firebaseToken: string, refreshToken: string) => {
    convertToEmail(email, firebaseToken, refreshToken);
    setEmailSetupOpen(false);
    setTimeout(() => {
      navigate('/');
    }, 2000);
  };

  if (status === 'cancelled') {
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
          <CancelIcon color="warning" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom align="center">
            Payment Cancelled
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph align="center">
            Your payment was cancelled. No charges were made to your account.
          </Typography>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleGoToJournal}>
              Back to Journal
            </Button>
            <Button variant="contained" onClick={handleTryAgain}>
              Try Again
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (status === 'timeout') {
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
            Payment Processing
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph align="center">
            Your payment is taking longer than expected to process. This is normal - Stripe payments can take a few minutes.
          </Typography>

          <Card sx={{ mt: 3, width: '100%' }}>
            <CardContent>
              <Typography variant="body2" paragraph>
                Your payment should be processed within a few minutes. You can:
              </Typography>
              <Typography variant="body2" component="ul">
                <li>Wait a few minutes and refresh this page</li>
                <li>Check your email for a payment confirmation from Stripe</li>
                <li>Contact support at support@everpal.app if you were charged but still don't have access</li>
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button variant="outlined" onClick={handleGoToJournal}>
              Back to Journal
            </Button>
            <Button variant="contained" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  if (status === 'success') {
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
          <CheckCircleIcon color="success" sx={{ fontSize: 80, mb: 2 }} />
          <Typography variant="h4" gutterBottom align="center">
            Welcome to EverPal!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph align="center">
            Your lifetime access is now active. Thank you for being a founding member!
          </Typography>

          <Card sx={{ mt: 3, width: '100%' }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                What's next?
              </Typography>
              <Typography variant="body2" component="ul">
                <li>Track your pet's health with unlimited logs</li>
                <li>Upload photos to document symptoms</li>
                <li>Get access to all future features (included in your lifetime plan)</li>
              </Typography>
            </CardContent>
          </Card>

          {user?.isAnonymous && (
            <SecurityPromptCard
              onSetUpEmail={handleSetUpEmail}
              onSkip={handleSkipEmailSetup}
            />
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleGoToJournal}
            sx={{ mt: 3 }}
          >
            Go to Journal
          </Button>
        </Box>

        {user && (
          <EmailSetupDialog
            open={emailSetupOpen}
            onClose={() => setEmailSetupOpen(false)}
            onSuccess={handleEmailSetupSuccess}
            anonymousToken={user.token}
          />
        )}
      </Container>
    );
  }

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
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h5" gutterBottom align="center">
          Processing your payment...
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center">
          This usually takes just a few seconds
        </Typography>
      </Box>
    </Container>
  );
};

export default PaymentSuccess;
