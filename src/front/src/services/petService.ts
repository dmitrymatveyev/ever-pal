const API_BASE_URL = 'https://localhost:5001/api';

export interface Pet {
  id: string;
  ownerId: string;
  name: string;
  photoUrl?: string;
  breed?: string;
  weight?: number;
  age?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePetRequest {
  name: string;
  photoUrl?: string;
  breed?: string;
  weight?: number;
  age?: number;
}

export interface UpdatePetRequest {
  name?: string;
  photoUrl?: string;
  breed?: string;
  weight?: number;
  age?: number;
}

export const getPets = async (token: string, isAnonymous: boolean = false): Promise<Pet[]> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch pets');
  }

  return response.json();
};

export const createPet = async (
  token: string,
  petData: CreatePetRequest,
  isAnonymous: boolean = false
): Promise<Pet> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/pets`, {
    method: 'POST',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });

  if (!response.ok) {
    throw new Error('Failed to create pet');
  }

  return response.json();
};

export const updatePet = async (
  petId: string,
  petData: UpdatePetRequest,
  token: string,
  isAnonymous: boolean = false
): Promise<Pet> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
    method: 'PUT',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(petData),
  });

  if (!response.ok) {
    throw new Error('Failed to update pet');
  }

  return response.json();
};

export const deletePet = async (
  token: string,
  petId: string,
  isAnonymous: boolean = false
): Promise<void> => {
  const authHeader = isAnonymous ? `Anonymous ${token}` : `Bearer ${token}`;
  
  const response = await fetch(`${API_BASE_URL}/pets/${petId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete pet');
  }
};