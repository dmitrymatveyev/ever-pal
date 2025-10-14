import { API_BASE_URL } from '../config';

interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  displayName: string;
}

export const getAnonymousAuth = async (): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/anonymous`, {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get anonymous auth');
  }
  
  return response.json();
};
