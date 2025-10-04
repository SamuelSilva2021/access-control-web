import { useState, useEffect, useCallback, useRef } from 'react';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../../../shared/types';
import { PermissionService } from '../../../shared/services';
import { logger } from '../../../shared/config';

interface UsePermissionsOptions {
  autoLoad?: boolean;
  pageSize?: number;
  moduleId?: string;
  roleId?: string;
}

interface PermissionsState {
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface PermissionsActions {
  loadPermissions: (page?: number, search?: string) => Promise<void>;
  createPermission: (data: CreatePermissionRequest) => Promise<Permission | null>;
  updatePermission: (id: string, data: UpdatePermissionRequest) => Promise<Permission | null>;
  deletePermission: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UsePermissionsResult extends PermissionsState, PermissionsActions {}

/**
 * Hook personalizado para gerenciar estado e operações de Permissions
 * Centraliza lógica de negócio e integração com API
 */
export const usePermissions = (options: UsePermissionsOptions = {}): UsePermissionsResult => {
  const { autoLoad = true, pageSize = 10, moduleId, roleId } = options;
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState<PermissionsState>({
    permissions: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadPermissions = useCallback(async (page = 1, search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Carregando permissões - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      const response = await PermissionService.getPermissions({
        page,
        limit: pageSize,
        search,
        moduleId,
        roleId,
        isActive: true, // Por padrão só mostra ativos
        sortBy: 'name',
        sortOrder: 'asc'
      });

      logger.info('✅ Permissões carregadas com sucesso:', {
        total: response.totalCount,
        página: response.pageNumber,
        totalPáginas: response.totalPages
      });

      setState(prev => ({
        ...prev,
        permissions: response.data,
        totalCount: response.totalCount,
        currentPage: response.pageNumber,
        totalPages: response.totalPages,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar permissões';
      logger.error('❌ Erro ao carregar permissões:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        permissions: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      }));
    }
  }, [pageSize, moduleId, roleId]);

  const createPermission = useCallback(async (data: CreatePermissionRequest): Promise<Permission | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('🔄 Criando nova permissão:', data);
      
      const newPermission = await PermissionService.createPermission(data);
      
      logger.info('✅ Permissão criada com sucesso:', newPermission);
      
      // Recarrega os dados para manter sincronizado
      await loadPermissions(state.currentPage);
      
      setState(prev => ({ ...prev, loading: false }));
      return newPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar permissão';
      logger.error('❌ Erro ao criar permissão:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [loadPermissions, state.currentPage]);

  const updatePermission = useCallback(async (id: string, data: UpdatePermissionRequest): Promise<Permission | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Atualizando permissão ${id}:`, data);
      
      const updatedPermission = await PermissionService.updatePermission(id, data);
      
      logger.info('✅ Permissão atualizada com sucesso:', updatedPermission);
      
      // Atualiza o estado local diretamente para UX mais responsiva
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.map(permission => 
          permission.id === id ? updatedPermission : permission
        ),
        loading: false
      }));
      
      return updatedPermission;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar permissão';
      logger.error('❌ Erro ao atualizar permissão:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  const deletePermission = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Removendo permissão ${id}`);
      
      await PermissionService.deletePermission(id);
      
      logger.info('✅ Permissão removida com sucesso');
      
      // Remove do estado local
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.filter(permission => permission.id !== id),
        totalCount: prev.totalCount - 1,
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover permissão';
      logger.error('❌ Erro ao remover permissão:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const toggleStatus = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Alternando status da permissão ${id}`);
      
      const updatedPermission = await PermissionService.togglePermissionStatus(id);
      
      logger.info('✅ Status da permissão alternado com sucesso:', updatedPermission);
      
      // Atualiza o estado local
      setState(prev => ({
        ...prev,
        permissions: prev.permissions.map(permission => 
          permission.id === id ? updatedPermission : permission
        ),
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status da permissão';
      logger.error('❌ Erro ao alterar status da permissão:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadPermissions(state.currentPage);
  }, [loadPermissions, state.currentPage]);

  // Carregamento automático
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPermissions();
    }
  }, [autoLoad, loadPermissions]);

  return {
    permissions: state.permissions,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loadPermissions,
    createPermission,
    updatePermission,
    deletePermission,
    toggleStatus,
    refreshData,
    clearError,
  };
};