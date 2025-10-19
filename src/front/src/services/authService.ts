import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';

interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  displayName: string;
}

export const getAnonymousAuth = async (): Promise<AuthResponse> => {
  return apiClient.fetch<AuthResponse>(`${API_BASE_URL}/anonymous`, {
    method: 'POST',
  });
};
