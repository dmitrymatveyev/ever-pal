import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container, useMediaQuery, Box } from '@mui/material';
import { useMemo, useState, useEffect } from 'react';
import HealthJournal from './pages/HealthJournal';
import AddFirstPet from './pages/AddFirstPet';
import ProtectedRoute from './components/ProtectedRoute';
import { ColdStartProvider } from './contexts/ColdStartContext';
import ColdStartIndicator from './components/ColdStartIndicator';
import OfflineIndicator from './components/OfflineIndicator';
import InstallButton from './components/InstallButton';
import PWAInstallDebug from './components/PWAInstallDebug';
import DisclaimerModal from './components/DisclaimerModal';
import PaywallScreen from './components/PaywallScreen';
import TrialBanner from './components/TrialBanner';
import { useTrialStatus } from './hooks/useTrialStatus';

function App() {
  // Detect system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  // Trial status management
  const { trialStatus, loading } = useTrialStatus();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Show disclaimer modal if user hasn't acknowledged it
  useEffect(() => {
    if (trialStatus && !trialStatus.disclaimerAcknowledged) {
      setShowDisclaimer(true);
    }
  }, [trialStatus]);

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
      <ColdStartProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            Loading...
          </Box>
        </ThemeProvider>
      </ColdStartProvider>
    );
  }

  // Show paywall if trial expired and not paid
  if (trialStatus && !trialStatus.isTrialActive && !trialStatus.isPaid) {
    return (
      <ColdStartProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <PaywallScreen />
        </ThemeProvider>
      </ColdStartProvider>
    );
  }

  return (
    <ColdStartProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ColdStartIndicator />
        <OfflineIndicator />
        <InstallButton />
        <PWAInstallDebug />

        {/* Disclaimer Modal */}
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

          {/* Trial Banner */}
          <TrialBanner />

          <Router>
            <Routes>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </Container>
      </ThemeProvider>
    </ColdStartProvider>
  );
}

export default App;
