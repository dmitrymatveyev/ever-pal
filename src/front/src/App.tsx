import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainPage from './pages/MainPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {

  return (
    <Router>
      <Routes>
        <Route 
          path="/main" 
          element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } 
        />
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/main" replace />} />
        {/* Catch all unmatched routes */}
        <Route path="*" element={<Navigate to="/main" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
