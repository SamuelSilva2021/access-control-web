import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  PermissionOperation, 
  CreatePermissionOperationRequest, 
  UpdatePermissionOperationRequest,
  PermissionOperationBulkRequest 
} from '../../../shared/types';
import { PermissionOperationService } from '../../../shared/services';
import { logger } from '../../../shared/config';

interface UsePermissionOperationsOptions {
  autoLoad?: boolean;
  pageSize?: number;
  permissionId?: string;
  operationId?: string;
}

interface PermissionOperationsState {
  permissionOperations: PermissionOperation[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface PermissionOperationsActions {
  loadPermissionOperations: (page?: number, search?: string) => Promise<void>;
  loadByPermissionId: (permissionId: string) => Promise<PermissionOperation[]>;
  loadByOperationId: (operationId: string) => Promise<PermissionOperation[]>;
  createPermissionOperation: (data: CreatePermissionOperationRequest) => Promise<PermissionOperation | null>;
  createPermissionOperationsBulk: (data: PermissionOperationBulkRequest) => Promise<PermissionOperation[] | null>;
  updatePermissionOperation: (id: string, data: UpdatePermissionOperationRequest) => Promise<PermissionOperation | null>;
  deletePermissionOperation: (id: string) => Promise<boolean>;
  deleteAllByPermissionId: (permissionId: string) => Promise<boolean>;
  deleteByPermissionAndOperations: (permissionId: string, operationIds: string[]) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UsePermissionOperationsResult extends PermissionOperationsState, PermissionOperationsActions {}

/**
 * Hook personalizado para gerenciar estado e operações de Permission Operations
 * Centraliza lógica de negócio e integração com API
 */
export const usePermissionOperations = (options: UsePermissionOperationsOptions = {}): UsePermissionOperationsResult => {
  const { autoLoad = true, pageSize = 10, permissionId, operationId } = options;
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState<PermissionOperationsState>({
    permissionOperations: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadPermissionOperations = useCallback(async (page = 1, search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Carregando relações permissão-operação - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      const response = await PermissionOperationService.getPermissionOperations({
        page,
        limit: pageSize,
        search,
        permissionId,
        operationId,
        isActive: true, // Por padrão só mostra ativos
        sortBy: 'permissionName',
        sortOrder: 'asc'
      });

      logger.info('✅ Relações permissão-operação carregadas com sucesso:', {
        total: response.totalCount,
        página: response.pageNumber,
        totalPáginas: response.totalPages
      });

      setState(prev => ({
        ...prev,
        permissionOperations: response.data,
        totalCount: response.totalCount,
        currentPage: response.pageNumber,
        totalPages: response.totalPages,
        loading: false,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar relações permissão-operação';
      logger.error('❌ Erro ao carregar relações permissão-operação:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        permissionOperations: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      }));
    }
  }, [pageSize, permissionId, operationId]);

  const loadByPermissionId = useCallback(async (permissionId: string): Promise<PermissionOperation[]> => {
    try {
      logger.info(`🔄 Carregando relações por permissão: ${permissionId}`);
      
      const operations = await PermissionOperationService.getByPermissionId(permissionId);
      
      logger.info('✅ Relações por permissão carregadas com sucesso:', operations);
      
      return operations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar operações da permissão';
      logger.error('❌ Erro ao carregar operações da permissão:', error);
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      return [];
    }
  }, []);

  const loadByOperationId = useCallback(async (operationId: string): Promise<PermissionOperation[]> => {
    try {
      logger.info(`🔄 Carregando relações por operação: ${operationId}`);
      
      const permissions = await PermissionOperationService.getByOperationId(operationId);
      
      logger.info('✅ Relações por operação carregadas com sucesso:', permissions);
      
      return permissions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar permissões da operação';
      logger.error('❌ Erro ao carregar permissões da operação:', error);
      
      setState(prev => ({
        ...prev,
        error: errorMessage
      }));
      
      return [];
    }
  }, []);

  const createPermissionOperation = useCallback(async (data: CreatePermissionOperationRequest): Promise<PermissionOperation | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('🔄 Criando nova relação permissão-operação:', data);
      
      const newPermissionOperation = await PermissionOperationService.createPermissionOperation(data);
      
      logger.info('✅ Relação permissão-operação criada com sucesso:', newPermissionOperation);
      
      // Recarrega os dados para manter sincronizado
      await loadPermissionOperations(state.currentPage);
      
      setState(prev => ({ ...prev, loading: false }));
      return newPermissionOperation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar relação permissão-operação';
      logger.error('❌ Erro ao criar relação permissão-operação:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [loadPermissionOperations, state.currentPage]);

  const createPermissionOperationsBulk = useCallback(async (data: PermissionOperationBulkRequest): Promise<PermissionOperation[] | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('🔄 Criando relações permissão-operação em lote:', data);
      
      const newPermissionOperations = await PermissionOperationService.createPermissionOperationsBulk(data);
      
      logger.info('✅ Relações permissão-operação criadas em lote com sucesso:', newPermissionOperations);
      
      // Recarrega os dados para manter sincronizado
      await loadPermissionOperations(state.currentPage);
      
      setState(prev => ({ ...prev, loading: false }));
      return newPermissionOperations;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar relações permissão-operação em lote';
      logger.error('❌ Erro ao criar relações permissão-operação em lote:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, [loadPermissionOperations, state.currentPage]);

  const updatePermissionOperation = useCallback(async (id: string, data: UpdatePermissionOperationRequest): Promise<PermissionOperation | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Atualizando relação permissão-operação ${id}:`, data);
      
      const updatedPermissionOperation = await PermissionOperationService.updatePermissionOperation(id, data);
      
      logger.info('✅ Relação permissão-operação atualizada com sucesso:', updatedPermissionOperation);
      
      // Atualiza o estado local diretamente para UX mais responsiva
      setState(prev => ({
        ...prev,
        permissionOperations: prev.permissionOperations.map(permissionOperation => 
          permissionOperation.id === id ? updatedPermissionOperation : permissionOperation
        ),
        loading: false
      }));
      
      return updatedPermissionOperation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar relação permissão-operação';
      logger.error('❌ Erro ao atualizar relação permissão-operação:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return null;
    }
  }, []);

  const deletePermissionOperation = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Removendo relação permissão-operação ${id}`);
      
      await PermissionOperationService.deletePermissionOperation(id);
      
      logger.info('✅ Relação permissão-operação removida com sucesso');
      
      // Remove do estado local
      setState(prev => ({
        ...prev,
        permissionOperations: prev.permissionOperations.filter(permissionOperation => permissionOperation.id !== id),
        totalCount: prev.totalCount - 1,
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover relação permissão-operação';
      logger.error('❌ Erro ao remover relação permissão-operação:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const deleteAllByPermissionId = useCallback(async (permissionId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Removendo todas as relações da permissão ${permissionId}`);
      
      await PermissionOperationService.deleteAllByPermissionId(permissionId);
      
      logger.info('✅ Todas as relações da permissão removidas com sucesso');
      
      // Remove do estado local
      setState(prev => ({
        ...prev,
        permissionOperations: prev.permissionOperations.filter(po => po.permissionId !== permissionId),
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover relações da permissão';
      logger.error('❌ Erro ao remover relações da permissão:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const deleteByPermissionAndOperations = useCallback(async (permissionId: string, operationIds: string[]): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Removendo relações específicas da permissão ${permissionId}:`, operationIds);
      
      await PermissionOperationService.deleteByPermissionAndOperations(permissionId, operationIds);
      
      logger.info('✅ Relações específicas da permissão removidas com sucesso');
      
      // Remove do estado local
      setState(prev => ({
        ...prev,
        permissionOperations: prev.permissionOperations.filter(po => 
          !(po.permissionId === permissionId && operationIds.includes(po.operationId))
        ),
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover relações específicas da permissão';
      logger.error('❌ Erro ao remover relações específicas da permissão:', error);
      
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
      logger.info(`🔄 Alternando status da relação permissão-operação ${id}`);
      
      const updatedPermissionOperation = await PermissionOperationService.togglePermissionOperationStatus(id);
      
      logger.info('✅ Status da relação permissão-operação alternado com sucesso:', updatedPermissionOperation);
      
      // Atualiza o estado local
      setState(prev => ({
        ...prev,
        permissionOperations: prev.permissionOperations.map(permissionOperation => 
          permissionOperation.id === id ? updatedPermissionOperation : permissionOperation
        ),
        loading: false
      }));
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status da relação permissão-operação';
      logger.error('❌ Erro ao alterar status da relação permissão-operação:', error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadPermissionOperations(state.currentPage);
  }, [loadPermissionOperations, state.currentPage]);

  // Carregamento automático
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadPermissionOperations();
    }
  }, [autoLoad, loadPermissionOperations]);

  return {
    permissionOperations: state.permissionOperations,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    loadPermissionOperations,
    loadByPermissionId,
    loadByOperationId,
    createPermissionOperation,
    createPermissionOperationsBulk,
    updatePermissionOperation,
    deletePermissionOperation,
    deleteAllByPermissionId,
    deleteByPermissionAndOperations,
    toggleStatus,
    refreshData,
    clearError,
  };
};