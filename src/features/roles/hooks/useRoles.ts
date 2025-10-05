import { useState, useEffect, useCallback } from 'react';
import { RoleService } from '../../../shared/services';
import type { Role, CreateRoleRequest, UpdateRoleRequest, AccessGroup, Permission } from '../../../shared/types';

interface UseRolesOptions {
  autoLoad?: boolean;
  pageSize?: number;
}

interface UseRolesResult {
  // Estado
  roles: Role[];
  loading: boolean;
  error: string | null;
  totalItems: number;
  currentPage: number;
  totalPages: number;

  // Ações CRUD
  loadRoles: (page?: number) => Promise<void>;
  createRole: (role: CreateRoleRequest) => Promise<Role>;
  updateRole: (id: string, role: UpdateRoleRequest) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  toggleStatus: (role: Role) => Promise<Role>;
  clearError: () => void;
  refetch: () => Promise<void>;

  // Ações de Grupos de Acesso
  getRoleAccessGroups: (roleId: string) => Promise<AccessGroup[]>;
  assignAccessGroupsToRole: (roleId: string, accessGroupIds: string[]) => Promise<void>;
  removeAccessGroupsFromRole: (roleId: string, accessGroupIds: string[]) => Promise<void>;

  // Ações de Permissões
  getRolePermissions: (roleId: string) => Promise<Permission[]>;
  assignPermissionsToRole: (roleId: string, permissionIds: string[]) => Promise<void>;
  removePermissionsFromRole: (roleId: string, permissionIds: string[]) => Promise<void>;
}

/**
 * Hook personalizado para gerenciar roles
 * Centraliza toda a lógica de estado e operações CRUD dos roles
 * 
 * Features:
 * - Carregamento automático opcional
 * - Paginação integrada
 * - Estados de loading e error
 * - Operações CRUD completas
 * - Toggle de status ativo/inativo
 * - Cache local dos dados
 * 
 * @param options - Configurações do hook
 */
export const useRoles = (options: UseRolesOptions = {}): UseRolesResult => {
  // Configurações padrão
  const { autoLoad = true, pageSize = 10 } = options;

  // Estados
  const [roles, setRoles] = useState<Role[]>([]);
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
   * Carrega roles com paginação
   */
  const loadRoles = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useRoles: Carregando roles...', { page, pageSize });
      
      const response = await RoleService.getRoles({
        page,
        limit: pageSize
      });

      console.log('✅ useRoles: Roles carregados:', response);

      setRoles(response.items || []);
      setCurrentPage(response.page || page);
      setTotalItems(response.total || 0);
      setTotalPages(response.totalPages || 0);
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao carregar roles:', err);
      setError(err.message || 'Erro ao carregar roles');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  /**
   * Cria um novo role
   */
  const createRole = useCallback(async (roleData: CreateRoleRequest): Promise<Role> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useRoles: Criando novo role...', roleData);
      
      const newRole = await RoleService.createRole(roleData);
      
      console.log('✅ useRoles: Role criado:', newRole);

      // Recarrega a lista para refletir mudanças
      await loadRoles(currentPage);
      
      return newRole;
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao criar role:', err);
      setError(err.message || 'Erro ao criar role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loadRoles, currentPage]);

  /**
   * Atualiza um role existente
   */
  const updateRole = useCallback(async (id: string, roleData: UpdateRoleRequest): Promise<Role> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useRoles: Atualizando role...', { id, roleData });
      
      const updatedRole = await RoleService.updateRole(id, roleData);
      
      console.log('✅ useRoles: Role atualizado:', updatedRole);

      // Atualiza o role na lista local
      setRoles(prev => prev.map(role => 
        role.id === id ? updatedRole : role
      ));
      
      return updatedRole;
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao atualizar role:', err);
      setError(err.message || 'Erro ao atualizar role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Remove um role
   */
  const deleteRole = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useRoles: Removendo role...', id);
      
      await RoleService.deleteRole(id);
      
      console.log('✅ useRoles: Role removido:', id);

      // Remove o role da lista local
      setRoles(prev => prev.filter(role => role.id !== id));
      
      // Se a página atual ficou vazia e não é a primeira, volta uma página
      const remainingItems = roles.length - 1;
      if (remainingItems === 0 && currentPage > 1) {
        await loadRoles(currentPage - 1);
      } else {
        // Atualiza o total de itens
        setTotalItems(prev => Math.max(0, prev - 1));
      }
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao remover role:', err);
      setError(err.message || 'Erro ao remover role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [roles.length, currentPage, loadRoles]);

  /**
   * Alterna o status ativo/inativo de um role
   */
  const toggleStatus = useCallback(async (role: Role): Promise<Role> => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 useRoles: Alternando status do role...', { 
        id: role.id, 
        currentStatus: role.isActive 
      });
      
      const updatedRole = await RoleService.toggleRoleStatus(role);
      
      console.log('✅ useRoles: Status do role alterado:', updatedRole);

      // Atualiza o role na lista local
      setRoles(prev => prev.map(r => 
        r.id === role.id ? updatedRole : r
      ));
      
      return updatedRole;
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao alterar status do role:', err);
      setError(err.message || 'Erro ao alterar status do role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarrega os dados da página atual
   */
  const refetch = useCallback(async () => {
    await loadRoles(currentPage);
  }, [loadRoles, currentPage]);

  /**
   * Busca grupos de acesso associados a um role
   */
  const getRoleAccessGroups = useCallback(async (roleId: string): Promise<AccessGroup[]> => {
    try {
      console.log('🔄 useRoles: Buscando grupos de acesso do role...', roleId);
      
      const groups = await RoleService.getAccessGroupsByRole(roleId);
      
      console.log('✅ useRoles: Grupos de acesso encontrados:', groups.length);
      return groups;
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao buscar grupos de acesso:', err);
      throw new Error(err.message || 'Erro ao buscar grupos de acesso do role');
    }
  }, []);

  /**
   * Atribui grupos de acesso a um role
   */
  const assignAccessGroupsToRole = useCallback(async (roleId: string, accessGroupIds: string[]): Promise<void> => {
    try {
      console.log('🔄 useRoles: Atribuindo grupos de acesso ao role...', { roleId, count: accessGroupIds.length });
      
      await RoleService.assignAccessGroupsToRole(roleId, accessGroupIds);
      
      console.log('✅ useRoles: Grupos de acesso atribuídos com sucesso');
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao atribuir grupos de acesso:', err);
      throw new Error(err.message || 'Erro ao atribuir grupos de acesso ao role');
    }
  }, []);

  /**
   * Remove grupos de acesso de um role
   */
  const removeAccessGroupsFromRole = useCallback(async (roleId: string, accessGroupIds: string[]): Promise<void> => {
    try {
      console.log('🔄 useRoles: Removendo grupos de acesso do role...', { roleId, count: accessGroupIds.length });
      
      await RoleService.removeAccessGroupsFromRole(roleId, accessGroupIds);
      
      console.log('✅ useRoles: Grupos de acesso removidos com sucesso');
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao remover grupos de acesso:', err);
      throw new Error(err.message || 'Erro ao remover grupos de acesso do role');
    }
  }, []);

  // ========== PERMISSÕES ==========

  /**
   * Busca permissões de um role
   */
  const getRolePermissions = useCallback(async (roleId: string): Promise<Permission[]> => {
    try {
      console.log('🔄 useRoles: Buscando permissões do role...', roleId);
      
      const permissions = await RoleService.getPermissionsByRole(roleId);
      
      console.log('✅ useRoles: Permissões encontradas:', permissions.length);
      return permissions;
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao buscar permissões:', err);
      throw new Error(err.message || 'Erro ao buscar permissões do role');
    }
  }, []);

  /**
   * Atribui permissões a um role
   */
  const assignPermissionsToRole = useCallback(async (roleId: string, permissionIds: string[]): Promise<void> => {
    try {
      console.log('🔄 useRoles: Atribuindo permissões ao role...', { roleId, count: permissionIds.length });
      
      await RoleService.assignPermissionsToRole(roleId, permissionIds);
      
      console.log('✅ useRoles: Permissões atribuídas com sucesso');
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao atribuir permissões:', err);
      throw new Error(err.message || 'Erro ao atribuir permissões ao role');
    }
  }, []);

  /**
   * Remove permissões de um role
   */
  const removePermissionsFromRole = useCallback(async (roleId: string, permissionIds: string[]): Promise<void> => {
    try {
      console.log('🔄 useRoles: Removendo permissões do role...', { roleId, count: permissionIds.length });
      
      await RoleService.removePermissionsFromRole(roleId, permissionIds);
      
      console.log('✅ useRoles: Permissões removidas com sucesso');
      
    } catch (err: any) {
      console.error('❌ useRoles: Erro ao remover permissões:', err);
      throw new Error(err.message || 'Erro ao remover permissões do role');
    }
  }, []);

  // Carregamento automático na inicialização
  useEffect(() => {
    if (autoLoad) {
      loadRoles(1);
    }
  }, [autoLoad, loadRoles]);

  return {
    // Estado
    roles,
    loading,
    error,
    totalItems,
    currentPage,
    totalPages,

    // Ações CRUD
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    toggleStatus,
    clearError,
    refetch,

    // Ações de Grupos de Acesso
    getRoleAccessGroups,
    assignAccessGroupsToRole,
    removeAccessGroupsFromRole,

    // Ações de Permissões
    getRolePermissions,
    assignPermissionsToRole,
    removePermissionsFromRole,
  };
};