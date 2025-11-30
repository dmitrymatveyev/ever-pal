import { useState, useEffect } from 'react';
import { getTrialStatus } from '../services/trialService';
import type { TrialStatus } from '../services/trialService';

/**
 * Hook to fetch and manage trial status
 */
export const useTrialStatus = () => {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialStatus = async () => {
    try {
      setLoading(true);

      // Get user from localStorage
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('No user found in localStorage');
      }

      const userData = JSON.parse(userStr);
      const token = userData.token;
      const isAnonymous = userData.isAnonymous || false;

      if (!token) {
        throw new Error('No token found');
      }

      const status = await getTrialStatus(token, isAnonymous);
      setTrialStatus(status);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch trial status:', err);
      setError(err instanceof Error ? err.message : 'Failed to load trial status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  return { trialStatus, loading, error, refetch: fetchTrialStatus };
};
