import React from 'react';
import { usePermissions } from '../../stores/permission.store';
import type { OperationType } from '../../types/permission.types';

interface ProtectedRouteProps {
  moduleKey: string;
  operation?: OperationType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  moduleKey,
  operation,
  children,
  fallback = null
}) => {
  const { hasAccess } = usePermissions();

  if (!hasAccess(moduleKey, operation)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

interface ProtectedComponentProps {
  moduleKey: string;
  operation: OperationType;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  moduleKey,
  operation,
  children,
  fallback = null
}) => {
  const { hasAccess } = usePermissions();

  if (!hasAccess(moduleKey, operation)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Componente de fallback padrão para acesso negado
export const AccessDenied: React.FC<{ message?: string }> = ({ 
  message = "Você não tem permissão para acessar este recurso." 
}) => (
  <div className="flex items-center justify-center min-h-[200px] p-8">
    <div className="text-center">
      <div className="text-6xl mb-4">🔒</div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Acesso Negado</h2>
      <p className="text-gray-500">{message}</p>
    </div>
  </div>
);