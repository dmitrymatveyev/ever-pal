import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';

export interface TrialStatus {
  isTrialActive: boolean;
  isPaid: boolean;
  trialStarted: boolean;
  trialEndsAt: string | null;
  daysRemaining: number | null;
  disclaimerAcknowledged: boolean;
  emailVerified: boolean;
}

/**
 * Fetch the current user's trial status
 */
export const getTrialStatus = async (token: string, isAnonymous: boolean = false): Promise<TrialStatus> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<TrialStatus>(`${API_BASE_URL}/users/trial-status`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Mark the disclaimer as acknowledged for the current user
 */
export const acknowledgeDisclaimer = async (token: string, isAnonymous: boolean = false): Promise<void> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  await apiClient.fetch<void>(`${API_BASE_URL}/users/acknowledge-disclaimer`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
};
