import { useState, useEffect, useCallback, useRef } from 'react';
import type { 
  AccessGroup,
  CreateAccessGroupRequest, 
  UpdateAccessGroupRequest
} from '../types';
import { AccessGroupService } from '../services';
import { logger } from '../config';

interface UseAccessGroupsOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

interface AccessGroupsState {
  accessGroups: AccessGroup[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

interface AccessGroupsActions {
  loadAccessGroups: (page?: number, search?: string) => Promise<void>;
  createAccessGroup: (data: CreateAccessGroupRequest) => Promise<AccessGroup | null>;
  updateAccessGroup: (id: string, data: UpdateAccessGroupRequest) => Promise<AccessGroup | null>;
  deleteAccessGroup: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  setPageSize: (pageSize: number) => void;
}

export interface UseAccessGroupsResult extends AccessGroupsState, AccessGroupsActions {
  data: AccessGroup[]; // Alias para compatibilidade com a página
  isLoading: boolean; // Alias para compatibilidade com a página
}

/**
 * Hook personalizado para gerenciar estado e operações de Access Groups
 * Centraliza lógica de negócio e integração com API
 */
export const useAccessGroups = (options: UseAccessGroupsOptions = {}): UseAccessGroupsResult => {
  const { autoLoad = true, pageSize = 10 } = options;
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState<AccessGroupsState>({
    accessGroups: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
    pageSize,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadAccessGroups = useCallback(async (page = 1, search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = {
        page,
        limit: state.pageSize,
        ...(search && { search }),
      };

      const response = await AccessGroupService.getAccessGroups(params);
      
      setState(prev => ({
        ...prev,
        accessGroups: response.items,
        totalCount: response.total,
        currentPage: response.page,
        totalPages: response.totalPages,
        loading: false,
      }));
      
      logger.info(`✅ Grupos de acesso carregados: ${response.items.length} encontrados`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar grupos de acesso';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Erro ao carregar grupos de acesso:', error);
    }
  }, [state.pageSize]);

  const setPageSize = useCallback((newPageSize: number) => {
    setState(prev => ({
      ...prev,
      pageSize: newPageSize,
      currentPage: 1, // Reset para primeira página
    }));
  }, []);

  const createAccessGroup = useCallback(async (data: CreateAccessGroupRequest): Promise<AccessGroup | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('➕ Criando grupo de acesso:', data);
      const newAccessGroup = await AccessGroupService.createAccessGroup(data);
      
      logger.info('🔄 Atualizando estado local com novo grupo:', newAccessGroup);
      setState(prev => {
        const newState = {
          ...prev,
          accessGroups: [newAccessGroup, ...prev.accessGroups],
          totalCount: prev.totalCount + 1,
          loading: false,
        };
        logger.info('📊 Novo estado:', { 
          totalItems: newState.accessGroups.length,
          firstItem: newState.accessGroups[0]?.name 
        });
        return newState;
      });
      
      logger.info('✅ Grupo de acesso criado com sucesso:', newAccessGroup);
      return newAccessGroup;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar grupo de acesso';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Erro ao criar grupo de acesso:', error);
      return null;
    }
  }, []);

  const updateAccessGroup = useCallback(async (id: string, data: UpdateAccessGroupRequest): Promise<AccessGroup | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('✏️ Atualizando grupo de acesso:', { id, data });
      const updatedAccessGroup = await AccessGroupService.updateAccessGroup(id, data);
      
      setState(prev => ({
        ...prev,
        accessGroups: prev.accessGroups.map(group => 
          group.id === id ? updatedAccessGroup : group
        ),
        loading: false,
      }));
      
      logger.info('✅ Grupo de acesso atualizado com sucesso:', updatedAccessGroup);
      return updatedAccessGroup;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar grupo de acesso';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Erro ao atualizar grupo de acesso:', error);
      return null;
    }
  }, []);

  const deleteAccessGroup = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      logger.info('🗑️ Deletando grupo de acesso:', id);
      await AccessGroupService.deleteAccessGroup(id);
      
      setState(prev => ({
        ...prev,
        accessGroups: prev.accessGroups.filter(group => group.id !== id),
        totalCount: prev.totalCount - 1,
        loading: false,
      }));
      
      logger.info('✅ Grupo de acesso deletado com sucesso');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar grupo de acesso';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Erro ao deletar grupo de acesso:', error);
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadAccessGroups(state.currentPage);
  }, [loadAccessGroups, state.currentPage]);

  // Auto load on mount
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAccessGroups();
    }
  }, [autoLoad, loadAccessGroups]);

  return {
    ...state,
    data: state.accessGroups, // Alias para compatibilidade
    isLoading: state.loading, // Alias para compatibilidade
    loadAccessGroups,
    createAccessGroup,
    updateAccessGroup,
    deleteAccessGroup,
    refreshData,
    clearError,
    setPageSize,
  };
};