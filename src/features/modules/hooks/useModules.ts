import { useState, useEffect, useCallback, useRef } from 'react';
import type { Module, CreateModuleRequest, UpdateModuleRequest } from '../../../shared/types';
import { ModuleService } from '../../../shared/services';
import { logger } from '../../../shared/config';

interface UseModulesOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

interface ModulesState {
  modules: Module[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

interface ModulesActions {
  loadModules: (page?: number, search?: string) => Promise<void>;
  createModule: (data: CreateModuleRequest) => Promise<Module | null>;
  updateModule: (id: string, data: UpdateModuleRequest) => Promise<Module | null>;
  deleteModule: (id: string) => Promise<boolean>;
  toggleStatus: (id: string) => Promise<boolean>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

export interface UseModulesResult extends ModulesState, ModulesActions {}

/**
 * Hook personalizado para gerenciar estado e operações de Módulos
 * Centraliza lógica de negócio e integração com API
 */
export const useModules = (options: UseModulesOptions = {}): UseModulesResult => {
  const { autoLoad = true, pageSize = 10 } = options;
  const hasLoadedRef = useRef(false);

  const [state, setState] = useState<ModulesState>({
    modules: [],
    loading: false,
    error: null,
    totalCount: 0,
    currentPage: 1,
    totalPages: 0,
  });

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  }, []);

  /**
   * Carrega lista de módulos
   */
  const loadModules = useCallback(async (page = 1, search?: string): Promise<void> => {
    try {
      setLoading(true);
      clearError();

      logger.info('[useModules] Carregando módulos', { page, search, pageSize });

      const response = await ModuleService.getModules({
        page,
        limit: pageSize,
        search,
        sortBy: 'name',
        sortOrder: 'asc',
      });

      setState(prev => ({
        ...prev,
        modules: response.data,
        totalCount: response.totalCount,
        currentPage: response.pageNumber,
        totalPages: response.totalPages,
        loading: false,
        error: null,
      }));

      logger.info('[useModules] Módulos carregados com sucesso', {
        count: response.data.length,
        totalCount: response.totalCount,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao carregar módulos';
      logger.error('[useModules] Erro ao carregar módulos', error);
      setError(errorMessage);
    }
  }, [pageSize, setLoading, clearError, setError]);

  /**
   * Cria um novo módulo
   */
  const createModule = useCallback(async (data: CreateModuleRequest): Promise<Module | null> => {
    try {
      setLoading(true);
      clearError();

      logger.info('[useModules] Criando módulo', { data });

      const newModule = await ModuleService.createModule(data);

      // Recarrega a lista para manter sincronia
      await loadModules(state.currentPage);

      logger.info('[useModules] Módulo criado com sucesso', { id: newModule.id });
      return newModule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar módulo';
      logger.error('[useModules] Erro ao criar módulo', error);
      setError(errorMessage);
      return null;
    }
  }, [state.currentPage, loadModules, setLoading, clearError, setError]);

  /**
   * Atualiza um módulo existente
   */
  const updateModule = useCallback(async (id: string, data: UpdateModuleRequest): Promise<Module | null> => {
    try {
      setLoading(true);
      clearError();

      logger.info('[useModules] Atualizando módulo', { id, data });

      const updatedModule = await ModuleService.updateModule(id, data);

      // Recarrega a lista para manter sincronia
      await loadModules(state.currentPage);

      logger.info('[useModules] Módulo atualizado com sucesso', { id });
      return updatedModule;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar módulo';
      logger.error('[useModules] Erro ao atualizar módulo', error);
      setError(errorMessage);
      return null;
    }
  }, [state.currentPage, loadModules, setLoading, clearError, setError]);

  /**
   * Exclui um módulo
   */
  const deleteModule = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      logger.info('[useModules] Excluindo módulo', { id });

      await ModuleService.deleteModule(id);

      // Recarrega a lista para manter sincronia
      await loadModules(state.currentPage);

      logger.info('[useModules] Módulo excluído com sucesso', { id });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao excluir módulo';
      logger.error('[useModules] Erro ao excluir módulo', error);
      setError(errorMessage);
      return false;
    }
  }, [state.currentPage, loadModules, setLoading, clearError, setError]);

  /**
   * Alterna status ativo/inativo do módulo
   */
  const toggleStatus = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      clearError();

      logger.info('[useModules] Alternando status do módulo', { id });

      await ModuleService.toggleModuleStatus(id);

      // Recarrega a lista para manter sincronia
      await loadModules(state.currentPage);

      logger.info('[useModules] Status do módulo alterado com sucesso', { id });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar status do módulo';
      logger.error('[useModules] Erro ao alterar status do módulo', error);
      setError(errorMessage);
      return false;
    }
  }, [state.currentPage, loadModules, setLoading, clearError, setError]);

  /**
   * Recarrega os dados da página atual
   */
  const refreshData = useCallback(async (): Promise<void> => {
    await loadModules(state.currentPage);
  }, [state.currentPage, loadModules]);

  // Carregamento automático na inicialização
  useEffect(() => {
    if (autoLoad && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadModules();
    }
  }, [autoLoad, loadModules]);

  return {
    // Estado
    modules: state.modules,
    loading: state.loading,
    error: state.error,
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    // Ações
    loadModules,
    createModule,
    updateModule,
    deleteModule,
    toggleStatus,
    refreshData,
    clearError,
  };
};