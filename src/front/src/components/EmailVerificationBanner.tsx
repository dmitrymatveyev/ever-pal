import { Alert, Button } from '@mui/material';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { resendVerification } from '../services/emailAuthService';

const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [resending, setResending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!user || user.isAnonymous || user.emailVerified) {
    return null;
  }

  const handleResend = async () => {
    if (!user.email) {
      return;
    }

    setResending(true);

    try {
      await resendVerification(user.email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Resend verification failed:', err);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <Alert severity="success" sx={{ mb: 2 }}>
        Verification email sent to {user.email}
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button
          color="inherit"
          size="small"
          onClick={handleResend}
          disabled={resending}
        >
          {resending ? 'Sending...' : 'Resend'}
        </Button>
      }
    >
      Please verify your email ({user.email}) to sign in from other devices
    </Alert>
  );
};

export default EmailVerificationBanner;
