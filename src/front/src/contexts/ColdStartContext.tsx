import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiClient } from '../utils/apiClientSingleton';

interface ColdStartContextType {
  isWakingUp: boolean;
  setIsWakingUp: (value: boolean) => void;
  message: string;
  setMessage: (value: string) => void;
}

const ColdStartContext = createContext<ColdStartContextType | undefined>(undefined);

export const useColdStart = () => {
  const context = useContext(ColdStartContext);
  if (!context) {
    throw new Error('useColdStart must be used within a ColdStartProvider');
  }
  return context;
};

interface ColdStartProviderProps {
  children: ReactNode;
}

export const ColdStartProvider = ({ children }: ColdStartProviderProps) => {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [message, setMessage] = useState('Waking up the server...');

  // Register callback with the API client singleton
  useEffect(() => {
    apiClient.registerColdStartCallback((wakingUp, msg) => {
      setIsWakingUp(wakingUp);
      if (msg) {
        setMessage(msg);
      }
    });
  }, []);

  return (
    <ColdStartContext.Provider value={{ isWakingUp, setIsWakingUp, message, setMessage }}>
      {children}
    </ColdStartContext.Provider>
  );
};
