import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isDemoMode } from '../utils/demoData';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!user && !isDemoMode() && location.pathname !== '/add-first-pet') {
    return <Navigate to="/add-first-pet" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
