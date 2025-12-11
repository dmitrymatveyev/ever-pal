import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Link,
  Divider,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login, forgotPassword, resendVerification } from '../services/emailAuthService';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [sessionExpiryMessage, setSessionExpiryMessage] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resendingVerification, setResendingVerification] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem('sessionExpiryMessage');
    if (message) {
      setSessionExpiryMessage(message);
      localStorage.removeItem('sessionExpiryMessage');
    }
  }, []);

  const handleSignIn = async () => {
    setError(null);
    setUnverifiedEmail(null);
    setSessionExpiryMessage(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);

      const userData = {
        token: response.token,
        refreshToken: response.refreshToken,
        userId: response.userId,
        email: response.email,
        displayName: email.split('@')[0],
        isAnonymous: false,
        emailVerified: response.emailVerified,
      };

      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Sign-in failed:', err);
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          setError('Incorrect email or password');
        } else if (err.message.includes('404')) {
          setError('No account found with this email');
        } else {
          setError('Failed to sign in. Please try again.');
        }
      } else {
        setError('Failed to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueAsGuest = () => {
    navigate('/add-first-pet');
  };

  const handleForgotPassword = () => {
    setForgotPasswordEmail(email);
    setForgotPasswordOpen(true);
    setForgotPasswordSuccess(false);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail) {
      return;
    }

    setForgotPasswordLoading(true);

    try {
      await forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
    } catch (err) {
      console.error('Forgot password failed:', err);
      setForgotPasswordSuccess(true);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
    setForgotPasswordEmail('');
    setForgotPasswordSuccess(false);
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) {
      return;
    }

    setResendingVerification(true);

    try {
      await resendVerification(unverifiedEmail);
      setError(null);
      setUnverifiedEmail(null);
      setSessionExpiryMessage(`Verification email sent to ${unverifiedEmail}`);
    } catch (err) {
      console.error('Resend verification failed:', err);
      setSessionExpiryMessage(`Verification email sent to ${unverifiedEmail}`);
    } finally {
      setResendingVerification(false);
    }
  };

  const handleStartTrial = () => {
    handleContinueAsGuest();
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1, textAlign: 'center' }}>
          Sign In
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Welcome back to EverPal
        </Typography>

        {sessionExpiryMessage && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {sessionExpiryMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {unverifiedEmail && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={handleResendVerification}
                disabled={resendingVerification}
              >
                {resendingVerification ? 'Sending...' : 'Resend'}
              </Button>
            }
          >
            Please verify your email before signing in
          </Alert>
        )}

        <TextField
          fullWidth
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          autoComplete="email"
        />

        <TextField
          fullWidth
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          sx={{ mb: 1 }}
          autoComplete="current-password"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSignIn();
            }
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword(!showPassword)}
                  edge="end"
                  disabled={loading}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <Link
            component="button"
            variant="body2"
            onClick={handleForgotPassword}
            disabled={loading}
            sx={{ textDecoration: 'none' }}
          >
            Forgot Password?
          </Link>
        </Box>

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleSignIn}
          disabled={loading}
          endIcon={loading && <CircularProgress size={16} />}
          sx={{ mb: 2 }}
        >
          Sign In
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            or
          </Typography>
        </Divider>

        <Box>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleContinueAsGuest}
            disabled={loading}
            sx={{ mb: 1 }}
          >
            Start fresh without an account
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', px: 2 }}>
            This creates a new account. To access existing data, sign in above.
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
            Don't have an account?{' '}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={handleStartTrial}
            disabled={loading}
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            Start Free Trial
          </Link>
        </Box>
      </Paper>

      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose} maxWidth="xs" fullWidth>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {forgotPasswordSuccess ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              Password reset email sent to {forgotPasswordEmail}
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={forgotPasswordLoading}
                autoComplete="email"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleForgotPasswordSubmit();
                  }
                }}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          {forgotPasswordSuccess ? (
            <Button onClick={handleForgotPasswordClose}>Close</Button>
          ) : (
            <>
              <Button onClick={handleForgotPasswordClose} disabled={forgotPasswordLoading}>Cancel</Button>
              <Button
                onClick={handleForgotPasswordSubmit}
                disabled={forgotPasswordLoading || !forgotPasswordEmail}
                endIcon={forgotPasswordLoading && <CircularProgress size={16} />}
              >
                Send Reset Link
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignIn;
