import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getAnonymousAuth } from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        try {
          const anonymousAuth = await getAnonymousAuth();
          localStorage.setItem('user', JSON.stringify({ 
            ...anonymousAuth,
            isAnonymous: true 
          }));
        } catch (error) {
          console.error('Failed to get anonymous auth:', error);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
