import { useState, useEffect, useCallback, useRef } from 'react';
import type { GroupType, CreateGroupTypeRequest, UpdateGroupTypeRequest } from '../../../shared/types';
import { GroupTypeService } from '../../../shared/services';
import { logger } from '../../../shared/config';

interface UseGroupTypesOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

interface GroupTypesState {
  groupTypes: GroupType[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface GroupTypesActions {
  loadGroupTypes: (page?: number, search?: string) => Promise<void>;
  createGroupType: (data: CreateGroupTypeRequest) => Promise<GroupType | null>;
  updateGroupType: (id: string, data: UpdateGroupTypeRequest) => Promise<GroupType | null>;
  deleteGroupType: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UseGroupTypesResult extends GroupTypesState, GroupTypesActions {}

/**
 * Hook personalizado para gerenciar estado e operações de Group Types
 * Centraliza lógica de negócio e integração com API
 */
export const useGroupTypes = (options: UseGroupTypesOptions = {}): UseGroupTypesResult => {
  const { autoLoad = true, pageSize = 10 } = options;
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState<GroupTypesState>({
    groupTypes: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const loadGroupTypes = useCallback(async (page = 1, search?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const params = {
        page,
        limit: pageSize,
        ...(search && { search }),
      };

      const response = await GroupTypeService.getGroupTypes(params);
      
      setState(prev => ({
        ...prev,
        groupTypes: response.data,
        totalCount: response.totalCount,
        currentPage: response.pageNumber,
        totalPages: response.totalPages,
        loading: false,
      }));
      
      logger.info(`✅ Tipos de grupos carregados: ${response.data.length} encontrados`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar tipos de grupos';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Erro ao carregar tipos de grupos:', errorMessage);
    }
  }, [pageSize]);

  // Auto-load inicial - apenas uma vez
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadGroupTypes();
    }
  }, [autoLoad, loadGroupTypes]);

  const createGroupType = useCallback(async (data: CreateGroupTypeRequest): Promise<GroupType | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🚀 Iniciando criação de group type:', data);
      const newGroupType = await GroupTypeService.createGroupType(data);
      console.log('✅ Group type criado com sucesso:', newGroupType);
      
      // Atualiza a lista local
      setState(prev => {
        console.log('📋 Lista antes da criação:', prev.groupTypes);
        const updatedList = [newGroupType, ...prev.groupTypes];
        console.log('📋 Lista depois da criação:', updatedList);
        
        return {
          ...prev,
          groupTypes: updatedList,
          totalCount: prev.totalCount + 1,
          loading: false,
        };
      });

      logger.info('✅ Success: Tipo de grupo criado com sucesso!');
      return newGroupType;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar tipo de grupo';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Error:', errorMessage);
      return null;
    }
  }, []);

  const updateGroupType = useCallback(async (id: string, data: UpdateGroupTypeRequest): Promise<GroupType | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🚀 Iniciando atualização:', { id, data });
      
      const updatedGroupType = await GroupTypeService.updateGroupType(id, data);
      
      console.log('✅ Tipo atualizado retornado da API:', updatedGroupType);
      
      // Atualiza a lista local
      setState(prev => {
        console.log('📋 Lista antes da atualização:', prev.groupTypes);
        const updatedList = prev.groupTypes.map(gt => 
          gt.id === id ? updatedGroupType : gt
        );
        console.log('📋 Lista depois da atualização:', updatedList);
        console.log('🔍 Item encontrado para atualizar:', prev.groupTypes.find(gt => gt.id === id));
        
        return {
          ...prev,
          groupTypes: updatedList,
          loading: false,
        };
      });

      console.log('✅ Success: Tipo de grupo atualizado com sucesso!');
      return updatedGroupType;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar tipo de grupo';
      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      logger.error('❌ Error:', errorMessage);
      return null;
    }
  }, []);

  const deleteGroupType = useCallback(async (id: string): Promise<boolean> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await GroupTypeService.deleteGroupType(id);
      
      // Remove da lista local
      setState(prev => ({
        ...prev,
        groupTypes: prev.groupTypes.filter(gt => gt.id !== id),
        totalCount: prev.totalCount - 1,
        loading: false,
      }));

      console.log('✅ Success: Tipo de grupo removido com sucesso!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao remover tipo de grupo';
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
      const updatedGroupType = await GroupTypeService.toggleGroupTypeStatus(id);
      
      // Atualiza a lista local
      setState(prev => ({
        ...prev,
        groupTypes: prev.groupTypes.map(gt => 
          gt.id === id ? updatedGroupType : gt
        ),
      }));

      const status = updatedGroupType.isActive ? 'ativado' : 'desativado';
      logger.info(`✅ Success: Tipo de grupo ${status} com sucesso!`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status';
      logger.error('❌ Error:', errorMessage);
      return false;
    }
  }, []);

  const refreshData = useCallback(async () => {
    await loadGroupTypes(1); // Sempre recarrega a primeira página
  }, [loadGroupTypes]);

  return {
    ...state,
    loadGroupTypes,
    createGroupType,
    updateGroupType,
    deleteGroupType,
    toggleStatus,
    refreshData,
    clearError,
  };
};