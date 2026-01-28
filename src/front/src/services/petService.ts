import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  photoUrl?: string;
  photoBase64?: string;
  breed?: string;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetRequest {
  name: string;
  photoUrl?: string;
  photoBase64?: string;
  breed?: string;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  age?: number;
}

export interface UpdatePetRequest {
  name?: string;
  photoUrl?: string;
  photoBase64?: string;
  breed?: string;
  weight?: number;
  weightUnit?: 'lbs' | 'kg';
  age?: number;
}

export const getPets = async (token: string, isAnonymous: boolean = false): Promise<Pet[]> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<Pet[]>(`${API_BASE_URL}/pets`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
};

export const createPet = async (
  token: string,
  petData: CreatePetRequest,
  isAnonymous: boolean = false
): Promise<Pet> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<Pet>(`${API_BASE_URL}/pets`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });
};

export const updatePet = async (
  petId: string,
  petData: UpdatePetRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<Pet> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<Pet>(`${API_BASE_URL}/pets/${petId}`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });
};

export const deletePet = async (
  token: string,
  petId: string,
  isAnonymous: boolean = false
): Promise<void> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;

  return apiClient.fetch<void>(`${API_BASE_URL}/pets/${petId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });
};