import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { getAnonymousAuth } from '../services/authService';
import { identifyUser } from '../utils/analytics';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        // New user - get anonymous auth
        try {
          const anonymousAuth = await getAnonymousAuth();
          const userData = {
            ...anonymousAuth,
            isAnonymous: true
          };
          localStorage.setItem('user', JSON.stringify(userData));

          // Identify user in PostHog
          identifyUser(anonymousAuth.userId, {
            email: anonymousAuth.email,
            displayName: anonymousAuth.displayName,
            isAnonymous: true
          });
        } catch (error) {
          console.error('Failed to get anonymous auth:', error);
        }
      } else {
        // Existing user - identify them in PostHog
        try {
          const userData = JSON.parse(userStr);
          if (userData.userId) {
            identifyUser(userData.userId, {
              email: userData.email,
              displayName: userData.displayName,
              isAnonymous: userData.isAnonymous
            });
          }
        } catch (error) {
          console.error('Failed to identify user in PostHog:', error);
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
