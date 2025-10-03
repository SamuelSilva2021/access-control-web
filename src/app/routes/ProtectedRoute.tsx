import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../shared/hooks';
import { ROUTES } from '../../shared/constants';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

/**
 * Componente que protege rotas baseado na autenticação e permissões
 */
export const ProtectedRoute = ({ 
  children, 
  requiredPermissions = [], 
  requiredRoles = [] 
}: ProtectedRouteProps) => {
  const { isAuthenticated, hasAnyPermission, hasRole } = useAuth();
  const location = useLocation();

  // Redireciona para login se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Verifica permissões se necessário
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return (
      <Navigate to={ROUTES.DASHBOARD} state={{ error: 'Acesso negado' }} replace />
    );
  }

  // Verifica roles se necessário
  if (requiredRoles.length > 0 && !requiredRoles.some(role => hasRole(role))) {
    return (
      <Navigate to={ROUTES.DASHBOARD} state={{ error: 'Acesso negado' }} replace />
    );
  }

  return <>{children}</>;
};