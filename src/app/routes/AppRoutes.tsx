import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth';
import { DashboardPage } from '../../features/dashboard';
import { AccessGroupsPage } from '../../features/access-groups';
import { GroupTypesTestPage, GroupTypesPage } from '../../features/groups';
import { ModulesPage } from '../../features/modules';
import { OperationsPage, OperationsTestPage } from '../../features/operations';
import { PermissionsPage } from '../../features/permissions';
import { RolesPage } from '../../features/roles';
import { UsersPage } from '../../features/users';
import { ProtectedRoute } from './ProtectedRoute';
import { MainLayout } from '../../shared/components';
import { ROUTES } from '../../shared/constants';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Rota raiz - redireciona para dashboard */}
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      
      {/* Rota de login - pública */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      {/* Rotas protegidas com layout */}
      <Route 
        path={ROUTES.DASHBOARD} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <DashboardPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Access Groups */}
      <Route 
        path={ROUTES.ACCESS_GROUPS} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <AccessGroupsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Group Types */}
      <Route 
        path={ROUTES.GROUP_TYPES} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <GroupTypesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rota de teste para Group Types */}
      <Route 
        path={ROUTES.GROUP_TYPES_TEST} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <GroupTypesTestPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Módulos */}
      <Route 
        path={ROUTES.MODULES} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <ModulesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Operações */}
      <Route 
        path={ROUTES.OPERATIONS} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <OperationsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rota de teste para Operations */}
      <Route 
        path={ROUTES.OPERATIONS_TEST} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <OperationsTestPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Permissões */}
      <Route 
        path={ROUTES.PERMISSIONS} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <PermissionsPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Roles */}
      <Route 
        path={ROUTES.ROLES} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <RolesPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* Rotas de Usuários */}
      <Route 
        path={ROUTES.USERS} 
        element={
          <ProtectedRoute>
            <MainLayout>
              <UsersPage />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      
      {/* TODO: Adicionar mais rotas conforme necessário */}
      
      {/* Rota de fallback - redireciona para dashboard */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};