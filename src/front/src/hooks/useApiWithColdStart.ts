import { useCallback } from 'react';
import { useColdStart } from '../contexts/ColdStartContext';
import { fetchWithColdStart } from '../utils/apiClient';

/**
 * Hook that provides API call methods with automatic cold start detection
 */
export const useApiWithColdStart = () => {
  const { setIsWakingUp, setMessage } = useColdStart();

  const apiCall = useCallback(
    async <T>(url: string, options: RequestInit = {}): Promise<T> => {
      const response = await fetchWithColdStart(url, {
        ...options,
        onColdStartDetected: () => {
          setIsWakingUp(true);
          setMessage('Waking up the server...');
        },
        onColdStartResolved: () => {
          setIsWakingUp(false);
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      // Handle empty responses (like DELETE operations)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }

      return undefined as T;
    },
    [setIsWakingUp, setMessage]
  );

  return { apiCall };
};
