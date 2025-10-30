export interface User {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  avatarUrl?: string | null;
  googleId?: string | null;
  authProvider?: 'local' | 'google';
  isActive?: boolean;
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
