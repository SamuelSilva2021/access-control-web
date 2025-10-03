import { useCallback } from 'react';
import { useAuthStore } from '../stores';
import type { LoginRequest } from '../types';

/**
 * Hook personalizado para gerenciar autenticação
 * Abstrai a lógica de autenticação e fornece uma interface simples
 * A inicialização é feita no AuthProvider para evitar problemas de hooks
 */
export const useAuth = () => {
  const {
    isAuthenticated,
    user,
    token,
    isLoading,
    login: loginAction,
    logout: logoutAction,
    setLoading,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        await loginAction(credentials);
      } catch (error) {
        console.error('Erro no login:', error);
        throw error;
      }
    },
    [loginAction]
  );

  const logout = useCallback(() => {
    logoutAction();
  }, [logoutAction]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return user?.permissions?.includes(permission) || false;
    },
    [user?.permissions]
  );

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles?.includes(role) || false;
    },
    [user?.roles]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]): boolean => {
      return permissions.some(permission => hasPermission(permission));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      return permissions.every(permission => hasPermission(permission));
    },
    [hasPermission]
  );

  return {
    // Estado
    isAuthenticated,
    user,
    token,
    isLoading,
    
    // Actions
    login,
    logout,
    setLoading,
    
    // Helpers de permissão
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
};