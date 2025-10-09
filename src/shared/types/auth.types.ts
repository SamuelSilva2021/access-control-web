// Tipos de Autenticação baseados na API
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  fullName: string;
  accessGroups: string[];
  roles: string[];
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    slug: string;
    customDomain: string | null;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    customDomain: string | null;
  };
  permissions: string[];
  roles: string[];
  accessGroups: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
}