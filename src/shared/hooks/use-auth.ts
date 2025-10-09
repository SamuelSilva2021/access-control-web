import { useCallback } from 'react';
import { useAuthStore } from '../stores';
import { usePermissions } from '../stores/permission.store';
import type { LoginRequest } from '../types';
import type { OperationType } from '../types/permission.types';

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

  const {
    hasAccess,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    getAccessibleModules
  } = usePermissions();

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

  // Métodos de permissão usando o novo sistema
  const hasModuleAccess = useCallback(
    (moduleKey: string, operation?: OperationType): boolean => {
      return hasAccess(moduleKey, operation);
    },
    [hasAccess]
  );

  const canPerformOperation = useCallback(
    (moduleKey: string, operation: OperationType): boolean => {
      return hasAccess(moduleKey, operation);
    },
    [hasAccess]
  );

  // Compatibilidade com métodos antigos (deprecated)
  const hasPermission = useCallback(
    (_permission: string): boolean => {
      console.warn('hasPermission é deprecated. Use hasModuleAccess com moduleKey e operation.');
      return false; // Por compatibilidade, sempre retorna false
    },
    []
  );

  const hasRole = useCallback(
    (_role: string): boolean => {
      console.warn('hasRole é deprecated. Use hasModuleAccess com moduleKey.');
      return false; // Por compatibilidade, sempre retorna false
    },
    []
  );

  const hasAnyPermission = useCallback(
    (_permissions: string[]): boolean => {
      console.warn('hasAnyPermission é deprecated. Use hasModuleAccess.');
      return false; // Por compatibilidade, sempre retorna false
    },
    []
  );

  const hasAllPermissions = useCallback(
    (_permissions: string[]): boolean => {
      console.warn('hasAllPermissions é deprecated. Use hasModuleAccess.');
      return false; // Por compatibilidade, sempre retorna false
    },
    []
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
    
    // Novos métodos de permissão baseados em módulos
    hasModuleAccess,
    canPerformOperation,
    canCreate: (moduleKey: string) => canCreate(moduleKey),
    canRead: (moduleKey: string) => canRead(moduleKey),
    canUpdate: (moduleKey: string) => canUpdate(moduleKey),
    canDelete: (moduleKey: string) => canDelete(moduleKey),
    getAccessibleModules,
    
    // Métodos antigos (deprecated - mantidos para compatibilidade)
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
};