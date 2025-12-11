import { API_BASE_URL } from '../config';
import { apiClient } from '../utils/apiClientSingleton';

interface ConvertAnonymousRequest {
  email: string;
  password: string;
}

interface ConvertAnonymousResponse {
  success: boolean;
  userId: string;
  email: string;
  emailVerified: boolean;
  message: string;
  firebaseToken: string;
  refreshToken: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token: string;
  refreshToken: string;
  userId: string;
  email: string;
  emailVerified: boolean;
  trialStatus: {
    trialStarted: boolean;
    daysRemaining: number;
    isTrialActive: boolean;
    isPaid: boolean;
  };
}

interface ResendVerificationRequest {
  email: string;
}

interface ResendVerificationResponse {
  success: boolean;
  message: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export const convertAnonymousToEmail = async (
  email: string,
  password: string,
  anonymousToken: string
): Promise<ConvertAnonymousResponse> => {
  return apiClient.fetch<ConvertAnonymousResponse>(`${API_BASE_URL}/auth/convert-anonymous`, {
    method: 'POST',
    headers: {
      'Authorization': `Anonymous ${anonymousToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password } as ConvertAnonymousRequest),
  });
};

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  return apiClient.fetch<LoginResponse>(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password } as LoginRequest),
  });
};

export const resendVerification = async (email: string): Promise<ResendVerificationResponse> => {
  return apiClient.fetch<ResendVerificationResponse>(`${API_BASE_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email } as ResendVerificationRequest),
  });
};

export const forgotPassword = async (email: string): Promise<ForgotPasswordResponse> => {
  return apiClient.fetch<ForgotPasswordResponse>(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email } as ForgotPasswordRequest),
  });
};

interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
};
