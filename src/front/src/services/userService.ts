import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';

export interface UpdateEmailRequest {
  email: string;
}

export const updateUserEmail = async (
  token: string,
  email: string,
  isAnonymous: boolean = false
): Promise<void> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<void>(`${API_BASE_URL}/users/email`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
};
