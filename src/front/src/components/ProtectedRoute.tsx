import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnonymousAuth } from '../services/authService';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
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
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
