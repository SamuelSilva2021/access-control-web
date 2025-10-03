import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../../features/auth';
import { DashboardPage } from '../../features/dashboard';
import { AccessGroupsPage } from '../../features/access-groups';
import { GroupTypesTestPage, GroupTypesPage } from '../../features/groups';
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
      
      {/* TODO: Adicionar rotas para group types, usuários, roles, etc. */}
      
      {/* Rota de fallback - redireciona para dashboard */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
};