import { useState } from 'react';
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
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { login } from '../services/emailAuthService';
import { getAnonymousAuth } from '../services/authService';

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);

    try {
      const response = await login(email, password);

      const userData = {
        token: response.token,
        refreshToken: '',
        userId: response.userId,
        email: response.email,
        displayName: email.split('@')[0],
        isAnonymous: false,
      };

      localStorage.setItem('user', JSON.stringify(userData));

      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Sign-in failed:', err);
      if (err instanceof Error) {
        if (err.message.includes('401')) {
          setError('Incorrect email or password');
        } else if (err.message.includes('403')) {
          setError('Please verify your email before signing in');
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

  const handleContinueAsGuest = async () => {
    setLoading(true);
    setError(null);

    try {
      const anonymousAuth = await getAnonymousAuth();
      const userData = {
        ...anonymousAuth,
        isAnonymous: true,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error('Failed to create guest account:', err);
      setError('Failed to continue as guest. Please try again.');
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot password clicked');
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

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
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

        <Button
          fullWidth
          variant="outlined"
          size="large"
          onClick={handleContinueAsGuest}
          disabled={loading}
          sx={{ mb: 2 }}
        >
          Continue as Guest
        </Button>

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
    </Box>
  );
};

export default SignIn;
