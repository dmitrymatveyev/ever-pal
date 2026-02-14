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
import { useLanguage } from '../i18n/LanguageContext';

const SignIn = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useLanguage();
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
      setError(t('error_email_password_required'));
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
          setError(t('error_incorrect_credentials'));
        } else if (err.message.includes('404')) {
          setError(t('error_no_account'));
        } else {
          setError(t('error_sign_in_failed'));
        }
      } else {
        setError(t('error_sign_in_failed'));
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
      setSessionExpiryMessage(t('verification_sent', { email: unverifiedEmail }));
    } catch (err) {
      console.error('Resend verification failed:', err);
      setSessionExpiryMessage(t('verification_sent', { email: unverifiedEmail }));
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
          {t('sign_in')}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          {t('welcome_back')}
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
                {resendingVerification ? t('resending') : t('resend')}
              </Button>
            }
          >
            {t('verify_email_before_signin')}
          </Alert>
        )}

        <TextField
          fullWidth
          label={t('email_label')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
          autoComplete="email"
        />

        <TextField
          fullWidth
          label={t('password_label')}
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
            {t('forgot_password')}
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
          {t('sign_in')}
        </Button>

        <Divider sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t('or_divider')}
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
            {t('start_fresh')}
          </Button>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', px: 2 }}>
            {t('start_fresh_note')}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ display: 'inline' }}>
            {t('no_account_question')}{' '}
          </Typography>
          <Link
            component="button"
            variant="body2"
            onClick={handleStartTrial}
            disabled={loading}
            sx={{ textDecoration: 'none', fontWeight: 600 }}
          >
            {t('start_free_trial')}
          </Link>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => setLanguage(language === 'en' ? 'pl' : 'en')}
            sx={{ textDecoration: 'none', color: 'text.secondary' }}
          >
            {language === 'en' ? 'Polski' : 'English'}
          </Link>
        </Box>
      </Paper>

      <Dialog open={forgotPasswordOpen} onClose={handleForgotPasswordClose} maxWidth="xs" fullWidth>
        <DialogTitle>{t('reset_password')}</DialogTitle>
        <DialogContent>
          {forgotPasswordSuccess ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              {t('reset_password_sent', { email: forgotPasswordEmail })}
            </Alert>
          ) : (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
                {t('reset_password_instructions')}
              </Typography>
              <TextField
                fullWidth
                label={t('email_label')}
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
            <Button onClick={handleForgotPasswordClose}>{t('close')}</Button>
          ) : (
            <>
              <Button onClick={handleForgotPasswordClose} disabled={forgotPasswordLoading}>{t('cancel')}</Button>
              <Button
                onClick={handleForgotPasswordSubmit}
                disabled={forgotPasswordLoading || !forgotPasswordEmail}
                endIcon={forgotPasswordLoading && <CircularProgress size={16} />}
              >
                {t('send_reset_link')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SignIn;
