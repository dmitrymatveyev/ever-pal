import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';

export interface Tag {
  id: string;
  label: string;
  icon: string;
  category?: string;
}

export interface HealthLog {
  id: string;
  petId: string;
  entryText: string;
  tags: Tag[];
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthLogRequest {
  petId: string;
  entryText: string;
  tags: Tag[];
  loggedAt?: string;
}

export interface UpdateHealthLogRequest {
  entryText?: string;
  tags?: Tag[];
  loggedAt?: string;
}

export const getHealthLogs = async (
  petId: string,
  token: string,
  isAnonymous: boolean = false,
  limit: number = 10,
  offset: number = 0
): Promise<HealthLog[]> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  const url = `${API_BASE_URL}/healthlogs/pet/${petId}?limit=${limit}&offset=${offset}`;

  return apiClient.fetch<HealthLog[]>(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
};

export const createHealthLog = async (
  logData: CreateHealthLogRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<HealthLog> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<HealthLog>(`${API_BASE_URL}/healthlogs`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });
};

export const updateHealthLog = async (
  logId: string,
  logData: UpdateHealthLogRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<HealthLog> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<HealthLog>(`${API_BASE_URL}/healthlogs/${logId}`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });
};

export const deleteHealthLog = async (
  logId: string,
  token: string,
  isAnonymous: boolean = false
): Promise<void> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<void>(`${API_BASE_URL}/healthlogs/${logId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
};