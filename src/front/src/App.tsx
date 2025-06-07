import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAnonymousAuth } from './services/authService';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    const initializeAuth = async () => {
      const user = localStorage.getItem('user');
      if (!user) {
        try {
          const anonymousAuth = await getAnonymousAuth();
          localStorage.setItem('user', JSON.stringify({ 
            ...anonymousAuth,
            isAnonymous: true 
          }));
        } catch (error) {
          console.error('Failed to initialize anonymous auth:', error);
        }
      }
    };

    initializeAuth();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route 
          path="/main" 
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } 
        />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
