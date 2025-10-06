import { useState, useEffect, useCallback, useRef } from 'react';
import type { Operation, CreateOperationRequest, UpdateOperationRequest } from '../../../shared/types';
import { OperationService } from '../../../shared/services';
import { logger } from '../../../shared/config';

interface UseOperationsOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

interface OperationsState {
  operations: Operation[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface OperationsActions {
  loadOperations: (page?: number, search?: string) => Promise<void>;
  createOperation: (data: CreateOperationRequest) => Promise<Operation | null>;
  updateOperation: (id: string, data: UpdateOperationRequest) => Promise<Operation | null>;
  deleteOperation: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UseOperationsResult extends OperationsState, OperationsActions {}

/**
 * Hook personalizado para gerenciar estado e operações de Operations
 * Centraliza lógica de negócio e integração com API
 */
export const useOperations = (options: UseOperationsOptions = {}): UseOperationsResult => {
  const { autoLoad = true, pageSize = 10 } = options;
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState<OperationsState>({
    operations: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadOperations = useCallback(async (page = 1, search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Carregando operações - Página: ${page}, Busca: ${search || 'N/A'}`);
      
      const response = await OperationService.getOperations({
        page,
        limit: pageSize,
        search,
      });

      setState(prev => ({
        ...prev,
        operations: response.data,
        totalCount: response.totalCount,
        currentPage: response.pageNumber,
        totalPages: response.totalPages,
        loading: false,
      }));

      logger.info(`✅ Success: ${response.data.length} operações carregadas`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar operações';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Error:', errorMessage);
    }
  }, [pageSize]);

  const createOperation = useCallback(async (data: CreateOperationRequest): Promise<Operation | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('🔄 Criando nova operação:', data);
      const newOperation = await OperationService.createOperation(data);
      
      // Atualiza a lista local
      setState(prev => ({
        ...prev,
        operations: [newOperation, ...prev.operations],
        totalCount: prev.totalCount + 1,
        loading: false,
      }));

      logger.info('✅ Success: Operação criada com sucesso!', newOperation);
      return newOperation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar operação';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Error:', errorMessage);
      // Propaga o erro para o componente pai poder tratar
      throw error;
    }
  }, []);

  const updateOperation = useCallback(async (id: string, data: UpdateOperationRequest): Promise<Operation | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Atualizando operação ${id}:`, data);
      const updatedOperation = await OperationService.updateOperation(id, data);
      
      // Atualiza a lista local
      setState(prev => ({
        ...prev,
        operations: prev.operations.map(op => 
          op.id === id ? updatedOperation : op
        ),
        loading: false,
      }));

      logger.info('✅ Success: Operação atualizada com sucesso!', updatedOperation);
      return updatedOperation;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar operação';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Error:', errorMessage);
      // Propaga o erro para o componente pai poder tratar
      throw error;
    }
  }, []);

  const deleteOperation = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info(`🔄 Excluindo operação ${id}`);
      await OperationService.deleteOperation(id);
      
      // Remove da lista local
      setState(prev => ({
        ...prev,
        operations: prev.operations.filter(op => op.id !== id),
        totalCount: prev.totalCount - 1,
        loading: false,
      }));

      logger.info('✅ Success: Operação excluída com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir operação';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Error:', errorMessage);
      return false;
    }
  }, []);

  const toggleStatus = useCallback(async (id: string): Promise<boolean> => {
    try {
      const operation = state.operations.find(op => op.id === id);
      if (!operation) {
        logger.error('❌ Error: Operação não encontrada');
        return false;
      }

      const updatedOperation = await updateOperation(id, {
        isActive: !operation.isActive,
      });

      if (!updatedOperation) {
        return false;
      }

      // Atualiza a lista local
      setState(prev => ({
        ...prev,
        operations: prev.operations.map(op => 
          op.id === id ? updatedOperation : op
        ),
      }));

      const status = updatedOperation.isActive ? 'ativada' : 'desativada';
      logger.info(`✅ Success: Operação ${status} com sucesso!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status';
      logger.error('❌ Error:', errorMessage);
      return false;
    }
  }, [updateOperation, state.operations]);

  const refreshData = useCallback(async () => {
    await loadOperations(1); // Sempre recarrega a primeira página
  }, [loadOperations]);

  // Carrega dados automaticamente na inicialização
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadOperations();
    }
  }, [autoLoad, loadOperations]);

  return {
    ...state,
    loadOperations,
    createOperation,
    updateOperation,
    deleteOperation,
    toggleStatus,
    refreshData,
    clearError,
  };
};