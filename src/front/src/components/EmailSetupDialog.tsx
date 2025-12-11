import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { Close, Visibility, VisibilityOff, CheckCircle, Security } from '@mui/icons-material';
import { ApiError } from '../utils/apiClientSingleton';

interface EmailSetupDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string, token: string, refreshToken: string) => void;
  anonymousToken: string;
}

const EmailSetupDialog = ({ open, onClose, onSuccess, anonymousToken }: EmailSetupDialogProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { convertAnonymousToEmail } = await import('../services/emailAuthService');
      const response = await convertAnonymousToEmail(email, password, anonymousToken);

      setShowVerificationMessage(true);

      setTimeout(() => {
        onSuccess(response.email, response.firebaseToken, response.refreshToken);
      }, 3000);
    } catch (err) {
      console.error('Failed to convert account:', err);
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError(err.message);
        } else if (err.status === 400) {
          setError(err.message);
        } else {
          setError('Failed to set up email. Please try again.');
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to set up email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading && !showVerificationMessage) {
      setEmail('');
      setPassword('');
      setError(null);
      onClose();
    }
  };

  if (showVerificationMessage) {
    return (
      <Dialog open={open} maxWidth="sm" fullWidth>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <CheckCircle sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            Check Your Email
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            We sent a verification link to:
          </Typography>
          <Typography sx={{ fontWeight: 600, mb: 3 }}>
            {email}
          </Typography>
          <Alert severity="info" sx={{ textAlign: 'left' }}>
            Your account is set up, but you'll need to verify your email before you can sign in on other devices.
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Security color="primary" />
            <Typography variant="h6" component="span" sx={{ fontWeight: 600 }}>
              Secure Your Account
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small" disabled={loading}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Protect your health data and lifetime access with email login
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
          autoComplete="new-password"
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

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
          Minimum 8 characters
        </Typography>

        <List dense>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Sign in from any device"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Recover access if you lose your phone"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem disableGutters>
            <ListItemIcon sx={{ minWidth: 32 }}>
              <CheckCircle fontSize="small" color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Keep your data secure"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Later
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          endIcon={loading && <CircularProgress size={16} />}
        >
          Set Up Email
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailSetupDialog;
