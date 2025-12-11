import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container, useMediaQuery, Box } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import HealthJournal from './pages/HealthJournal';
import AddFirstPet from './pages/AddFirstPet';
import PaymentSuccess from './pages/PaymentSuccess';
import SignIn from './pages/SignIn';
import ProtectedRoute from './components/ProtectedRoute';
import { ColdStartProvider } from './contexts/ColdStartContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ColdStartIndicator from './components/ColdStartIndicator';
import OfflineIndicator from './components/OfflineIndicator';
import InstallButton from './components/InstallButton';
import PWAInstallDebug from './components/PWAInstallDebug';
import DisclaimerModal from './components/DisclaimerModal';
import PaywallScreen from './components/PaywallScreen';
import TrialBanner from './components/TrialBanner';
import EmailVerificationBanner from './components/EmailVerificationBanner';

function AppContent() {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const { trialStatus, loading } = useAuth();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (trialStatus && !trialStatus.disclaimerAcknowledged) {
      setShowDisclaimer(true);
    }
  }, [trialStatus]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('[Network] Online - Internet connection restored');
    };

    const handleOffline = () => {
      console.log('[Network] Offline - No internet connection');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    console.log('[Network] Initial state:', navigator.onLine ? 'Online' : 'Offline');

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
          primary: {
            main: '#4A9B9A',
            light: '#7DBCBB',
            dark: '#2A7B7A',
          },
          secondary: {
            main: '#E07A5F',
            light: '#F4A79D',
            dark: '#C55A3F',
          },
          background: {
            default: prefersDarkMode ? '#1A1A1A' : '#F9F7F4',
            paper: prefersDarkMode ? '#2D2D2D' : '#FFFFFF',
          },
        },
        typography: {
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          h4: {
            fontWeight: 600,
            letterSpacing: '-0.02em',
          },
          h5: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
          },
          h6: {
            fontWeight: 600,
          },
          button: {
            textTransform: 'none',
            fontWeight: 500,
          },
        },
        shape: {
          borderRadius: 12,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 24,
                paddingLeft: 24,
                paddingRight: 24,
              },
              contained: {
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none',
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                boxShadow: prefersDarkMode
                  ? '0 2px 8px rgba(0,0,0,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.08)',
              },
            },
          },
        },
      }),
    [prefersDarkMode],
  );

  // Show loading state while checking trial status
  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          Loading...
        </Box>
      </ThemeProvider>
    );
  }

  // Only show paywall if trial has started, is no longer active, and user hasn't paid
  if (trialStatus && trialStatus.trialStarted && !trialStatus.isTrialActive && !trialStatus.isPaid) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <PaywallScreen />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ColdStartIndicator />
      <OfflineIndicator />
      <InstallButton />
      <PWAInstallDebug />

      <DisclaimerModal open={showDisclaimer} onClose={() => setShowDisclaimer(false)} />

      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="EverPal Logo"
            sx={{
              maxWidth: '100%',
              maxHeight: { xs: 80, sm: 120, md: 150 },
              width: 'auto',
              height: 'auto',
            }}
          />
        </Box>

        <EmailVerificationBanner />
        <TrialBanner />

        <Router>
          <Routes>
            <Route path="/signin" element={<SignIn />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HealthJournal />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-first-pet"
              element={
                <ProtectedRoute>
                  <AddFirstPet />
                </ProtectedRoute>
              }
            />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </Container>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ColdStartProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ColdStartProvider>
  );
}

export default App;
