// Gerenciamento de autenticação no localStorage
const TOKEN_KEY = 'access_control_token';
const REFRESH_TOKEN_KEY = 'access_control_refresh_token';
const USER_KEY = 'access_control_user';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (refreshToken: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const getStoredUser = (): any | null => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearAuth = (): void => {
  removeToken();
};

/**
 * Verifica se o token JWT é válido (não expirado)
 * Faz parse básico do token para verificar exp
 */
export const isTokenValid = (): boolean => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Decodifica o payload do JWT (sem verificar assinatura)
    const base64Url = token.split('.')[1];
    if (!base64Url) return false;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const payload = JSON.parse(jsonPayload);
    const now = Math.floor(Date.now() / 1000);
    
    // Verifica se o token não expirou (com margem de 30 segundos)
    return payload.exp && payload.exp > (now + 30);
  } catch (error) {
    console.error('🔐 Erro ao validar token:', error);
    return false;
  }
};