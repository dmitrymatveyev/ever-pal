import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Container, useMediaQuery, Box } from '@mui/material';
import { useMemo } from 'react';
import HealthJournal from './pages/HealthJournal';
import AddFirstPet from './pages/AddFirstPet';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Detect system preference for dark mode
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
  );
}

export default App;
