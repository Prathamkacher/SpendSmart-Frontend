import { ApiResponse, AuthResponse, UserProfile } from '../app/core/models/auth.models';

export const mockUser: UserProfile = {
  userId: 7,
  fullName: 'Alex Spend',
  email: 'alex@example.com',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  avatarUrl: null,
  bio: 'Finance enthusiast',
  provider: 'LOCAL',
  role: 'USER',
  isActive: true,
  monthlyBudget: 50000,
  planType: 'FREE',
  planStartDate: null,
  planExpiryDate: null,
  isTrialUsed: false,
  createdAt: '2026-01-01T00:00:00Z'
};

export function createApiResponse<T>(
  data: T,
  overrides: Partial<ApiResponse<T>> = {}
): ApiResponse<T> {
  return {
    success: true,
    message: 'OK',
    data,
    timestamp: '2026-05-08T00:00:00Z',
    ...overrides
  };
}

export function createAuthResponse(
  overrides: Partial<AuthResponse> = {}
): AuthResponse {
  return {
    accessToken: createJwtToken(Math.floor(Date.now() / 1000) + 3600),
    refreshToken: 'refresh-token',
    tokenType: 'Bearer',
    expiresIn: 3600,
    user: mockUser,
    ...overrides
  };
}

export function createJwtToken(expirationSeconds: number): string {
  return `header.${btoa(JSON.stringify({ exp: expirationSeconds }))}.signature`;
}
