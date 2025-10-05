import { useState, useEffect, useCallback } from 'react';
import { UserService } from '../../../shared/services';
import type { UserAccount, CreateUserAccountRequest, UpdateUserAccountRequest } from '../../../shared/types';
import type { AccessGroup } from '../../../shared/types';

interface UseUsersOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

interface UseUsersResult {
  // Estado
  users: UserAccount[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;

  // Ações
  loadUsers: (page?: number) => Promise<void>;
  createUser: (user: CreateUserAccountRequest) => Promise<UserAccount>;
  updateUser: (id: string, user: UpdateUserAccountRequest) => Promise<UserAccount>;
  deleteUser: (id: string) => Promise<void>;
  toggleStatus: (user: UserAccount) => Promise<UserAccount>;
  clearError: () => void;
  refetch: () => Promise<void>;
  
  // Validações
  validateEmail: (email: string, excludeUserId?: string) => Promise<boolean>;
  
  // Gerenciamento de grupos
  getUserAccessGroups: (userId: string) => Promise<AccessGroup[]>;
  assignUserAccessGroups: (userId: string, accessGroupIds: string[]) => Promise<void>;
  revokeUserAccessGroup: (userId: string, groupId: string) => Promise<void>;
  
  // Utilitários
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
}

/**
 * Hook personalizado para gerenciar usuários
 * Centraliza toda a lógica de estado e operações CRUD dos usuários
 * 
 * Features:
 * - Carregamento automático opcional
 * - Paginação integrada
 * - Estados de loading e error
 * - Operações CRUD completas
 * - Toggle de status ativo/inativo
 * - Validações de email e username
 * - Gerenciamento de senha (esqueci/reset)
 * - Cache local dos dados
 * 
 * @param options - Configurações do hook
 */
export const useUsers = (options: UseUsersOptions = {}): UseUsersResult => {
  // Configurações padrão
  const { autoLoad = true, pageSize = 10 } = options;

  // Estados
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  /**
   * Limpa mensagens de erro
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Carrega usuários com paginação
   */
  const loadUsers = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Carregando usuários...', { page, pageSize });
      
      const response = await UserService.getUsers({
        page,
        limit: pageSize
      });

      console.log('✅ useUsers: Usuários carregados:', response);

      setUsers(response.items || []);
      setCurrentPage(response.page || page);
      setTotalItems(response.total || 0);
      setTotalPages(response.totalPages || 0);
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao carregar usuários:', err);
      setError(err.message || 'Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  /**
   * Cria um novo usuário
   */
  const createUser = useCallback(async (userData: CreateUserAccountRequest): Promise<UserAccount> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Criando usuário...', { ...userData, password: '[HIDDEN]' });
      
      const newUser = await UserService.createUser(userData);
      
      console.log('✅ useUsers: Usuário criado:', newUser);
      
      // Adiciona o novo usuário à lista local
      setUsers(prevUsers => [newUser, ...prevUsers]);
      setTotalItems(prev => prev + 1);
      
      return newUser;
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao criar usuário:', err);
      setError(err.message || 'Erro ao criar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza um usuário existente
   */
  const updateUser = useCallback(async (id: string, userData: UpdateUserAccountRequest): Promise<UserAccount> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Atualizando usuário:', id, userData);
      
      const updatedUser = await UserService.updateUser(id, userData);
      
      console.log('✅ useUsers: Usuário atualizado:', updatedUser);
      
      // Atualiza o usuário na lista local
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === id ? updatedUser : user)
      );
      
      return updatedUser;
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao atualizar usuário:', err);
      setError(err.message || 'Erro ao atualizar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove um usuário
   */
  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Removendo usuário:', id);
      
      await UserService.deleteUser(id);
      
      console.log('✅ useUsers: Usuário removido com sucesso');
      
      // Remove o usuário da lista local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      setTotalItems(prev => prev - 1);
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao remover usuário:', err);
      setError(err.message || 'Erro ao remover usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Alterna status ativo/inativo do usuário
   */
  const toggleStatus = useCallback(async (user: UserAccount): Promise<UserAccount> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Alterando status do usuário:', user.id, 'para:', user.status === 'Active' ? 'Inactive' : 'Active');
      
      const updatedUser = await UserService.toggleUserStatus(user);
      
      console.log('✅ useUsers: Status alterado:', updatedUser);
      
      // Atualiza o usuário na lista local
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === user.id ? updatedUser : u)
      );
      
      return updatedUser;
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao alterar status:', err);
      setError(err.message || 'Erro ao alterar status do usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarrega a lista atual
   */
  const refetch = useCallback(async () => {
    await loadUsers(currentPage);
  }, [loadUsers, currentPage]);

  // ========== VALIDAÇÕES ==========

  /**
   * Valida se email já está em uso
   */
  const validateEmail = useCallback(async (email: string, excludeUserId?: string): Promise<boolean> => {
    try {
      return await UserService.validateEmail(email, excludeUserId);
    } catch (error) {
      console.warn('useUsers: Erro ao validar email:', error);
      return true; // Assume válido em caso de erro
    }
  }, []);

  // ========== GERENCIAMENTO DE SENHA ==========

  /**
   * Inicia fluxo de esqueci a senha
   */
  const forgotPassword = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Iniciando fluxo esqueci senha:', email);
      
      await UserService.forgotPassword(email);
      
      console.log('✅ useUsers: Email de recuperação enviado');
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao enviar email de recuperação:', err);
      setError(err.message || 'Erro ao enviar email de recuperação');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reseta senha usando token
   */
  const resetPassword = useCallback(async (email: string, token: string, newPassword: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Resetando senha:', email);
      
      await UserService.resetPassword(email, token, newPassword);
      
      console.log('✅ useUsers: Senha resetada com sucesso');
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao resetar senha:', err);
      setError(err.message || 'Erro ao resetar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== GERENCIAMENTO DE GRUPOS ==========

  /**
   * Lista grupos de acesso de um usuário
   */
  const getUserAccessGroups = useCallback(async (userId: string): Promise<AccessGroup[]> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Buscando grupos do usuário:', userId);
      
      const groups = await UserService.getUserAccessGroups(userId);
      
      console.log('✅ useUsers: Grupos encontrados:', groups.length);
      return groups;
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao buscar grupos:', err);
      setError(err.message || 'Erro ao buscar grupos do usuário');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atribui grupos de acesso a um usuário
   */
  const assignUserAccessGroups = useCallback(async (userId: string, accessGroupIds: string[]): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Atribuindo grupos:', userId, accessGroupIds);
      
      await UserService.assignUserAccessGroups(userId, accessGroupIds);
      
      console.log('✅ useUsers: Grupos atribuídos com sucesso');
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao atribuir grupos:', err);
      setError(err.message || 'Erro ao atribuir grupos');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove um grupo de acesso de um usuário
   */
  const revokeUserAccessGroup = useCallback(async (userId: string, groupId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useUsers: Removendo grupo:', userId, groupId);
      
      await UserService.revokeUserAccessGroup(userId, groupId);
      
      console.log('✅ useUsers: Grupo removido com sucesso');
      
    } catch (err: any) {
      console.error('❌ useUsers: Erro ao remover grupo:', err);
      setError(err.message || 'Erro ao remover grupo');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ========== EFEITOS ==========

  /**
   * Carregamento automático na inicialização
   */
  useEffect(() => {
    if (autoLoad) {
      loadUsers(1);
    }
  }, [autoLoad, loadUsers]);

  // ========== RETURN ==========

  return {
    // Estado
    users,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,

    // Ações
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    clearError,
    refetch,

    // Validações
    validateEmail,

    // Gerenciamento de grupos
    getUserAccessGroups,
    assignUserAccessGroups,
    revokeUserAccessGroup,

    // Gerenciamento de senha
    forgotPassword,
    resetPassword,
  };
};