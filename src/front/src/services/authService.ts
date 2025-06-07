interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  displayName: string;
}

export const getAnonymousAuth = async (): Promise<AuthResponse> => {
  const response = await fetch('https://localhost:5001/api/anonymous', {
    method: 'POST',
  });
  
  if (!response.ok) {
    throw new Error('Failed to get anonymous auth');
  }
  
  return response.json();
};

export const getMainData = async (token: string) => {
  const response = await fetch('https://localhost:5001/api/main', {
    headers: {
      'Authorization': `Anonymous ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch main data');
  }
  
  return response.json();
};
