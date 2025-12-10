import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { getAnonymousAuth } from '../services/authService';
import { getTrialStatus, type TrialStatus } from '../services/trialService';
import { identifyUser } from '../utils/analytics';

interface AuthContextValue {
  user: UserData | null;
  trialStatus: TrialStatus | null;
  loading: boolean;
  error: string | null;
  refetchTrialStatus: () => Promise<void>;
  hasEngaged: boolean;
  markEngaged: () => void;
  createAnonymousUser: () => Promise<UserData>;
  loginWithEmail: (token: string, userId: string, email: string, emailVerified: boolean) => void;
  logout: () => void;
  convertToEmail: (email: string, firebaseToken: string) => void;
}

interface UserData {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  displayName: string;
  isAnonymous?: boolean;
  emailVerified?: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasEngaged, setHasEngaged] = useState(false);

  const fetchTrialStatus = async (userData: UserData) => {
    try {
      const status = await getTrialStatus(userData.token, userData.isAnonymous || false);
      setTrialStatus(status);

      if (status.emailVerified !== userData.emailVerified) {
        const updatedUser = { ...userData, emailVerified: status.emailVerified };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trial status');
    }
  };

  const refetchTrialStatus = async () => {
    if (!user) {
      return;
    }
    await fetchTrialStatus(user);
  };

  const markEngaged = () => {
    setHasEngaged(true);
    localStorage.setItem('userEngaged', 'true');
  };

  const loginWithEmail = (token: string, userId: string, email: string, emailVerified: boolean) => {
    const userData: UserData = {
      token,
      refreshToken: '',
      userId,
      email,
      displayName: email.split('@')[0],
      isAnonymous: false,
      emailVerified,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    identifyUser(userId, {
      email,
      displayName: userData.displayName,
      isAnonymous: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedPetId');
    setUser(null);
    setTrialStatus(null);
    window.location.href = '/signin';
  };

  const createAnonymousUser = async (): Promise<UserData> => {
    const anonymousAuth = await getAnonymousAuth();
    const userData: UserData = {
      ...anonymousAuth,
      isAnonymous: true
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    identifyUser(anonymousAuth.userId, {
      email: anonymousAuth.email,
      displayName: anonymousAuth.displayName,
      isAnonymous: true
    });

    await fetchTrialStatus(userData);
    return userData;
  };

  const convertToEmail = (email: string, firebaseToken: string) => {
    if (!user) {
      return;
    }
    const userData: UserData = {
      ...user,
      token: firebaseToken,
      email,
      isAnonymous: false,
      emailVerified: false,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    identifyUser(userData.userId, {
      email,
      displayName: email.split('@')[0],
      isAnonymous: false,
    });
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);

        const userStr = localStorage.getItem('user');
        const engaged = localStorage.getItem('userEngaged') === 'true';
        setHasEngaged(engaged);

        if (userStr) {
          const userData = JSON.parse(userStr) as UserData;
          setUser(userData);

          if (userData.userId) {
            identifyUser(userData.userId, {
              email: userData.email,
              displayName: userData.displayName,
              isAnonymous: userData.isAnonymous
            });
          }

          await fetchTrialStatus(userData);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        trialStatus,
        loading,
        error,
        refetchTrialStatus,
        hasEngaged,
        markEngaged,
        createAnonymousUser,
        loginWithEmail,
        logout,
        convertToEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
