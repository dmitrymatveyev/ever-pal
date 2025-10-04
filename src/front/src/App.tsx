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
            main: '#579291',
          },
          secondary: {
            main: '#2f7b7c',
          }
        },
      }),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <Box
            component="img"
            src="/logo.png"
            alt="EverPal Logo"
            sx={{
              maxWidth: '100%',
              maxHeight: { xs: 120, sm: 150, md: 200 },
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
