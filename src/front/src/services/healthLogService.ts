const API_BASE_URL = 'https://localhost:5001/api';

export interface HealthLog {
  id: string;
  petId: string;
  entryText: string;
  loggedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthLogRequest {
  petId: string;
  entryText: string;
  loggedAt?: string;
}

export interface UpdateHealthLogRequest {
  entryText?: string;
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

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch health logs');
  }

  return response.json();
};

export const createHealthLog = async (
  logData: CreateHealthLogRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<HealthLog> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/healthlogs`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });

  if (!response.ok) {
    throw new Error('Failed to create health log');
  }

  return response.json();
};

export const updateHealthLog = async (
  logId: string,
  logData: UpdateHealthLogRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<HealthLog> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/healthlogs/${logId}`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(logData),
  });

  if (!response.ok) {
    throw new Error('Failed to update health log');
  }

  return response.json();
};

export const deleteHealthLog = async (
  logId: string,
  token: string,
  isAnonymous: boolean = false
): Promise<void> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/healthlogs/${logId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete health log');
  }
};