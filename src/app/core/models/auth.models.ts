// src/app/core/models/auth.models.ts
// These interfaces mirror the backend DTOs exactly — no refactoring needed.

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  currency?: string;
  timezone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  email: string;
  currency: string;
  timezone: string;
  avatarUrl: string | null;
  bio?: string;
  provider: 'LOCAL' | 'GOOGLE' | 'GITHUB';
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  monthlyBudget: number;
  planType: 'FREE' | 'TRIAL' | 'PRO';
  planStartDate: string | null;
  planExpiryDate: string | null;
  isTrialUsed: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: UserProfile;
}

// Generic wrapper matching backend ApiResponse<T>
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatarUrl?: string;
  currency?: string;
  timezone?: string;
  monthlyBudget?: number;
  bio?: string;
}