import type { 
  Role, 
  CreateRoleRequest, 
  UpdateRoleRequest,
  Permission,
  AccessGroup
} from '../types';
import { httpClient } from '../utils';
import { API_ENDPOINTS } from '../constants';

interface GetRolesParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface RolesApiResponse {
  items: Role[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class RoleService {
  static async getRoles(params: GetRolesParams = {}): Promise<RolesApiResponse> {
    try {
      const { page = 1, limit = 10, search } = params;
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const url = `${API_ENDPOINTS.ROLES}?${searchParams}`;
      const response = await httpClient.get<RolesApiResponse>(url);
      
      if (!response.succeeded) {
        throw new Error(response.errors?.join(', ') || 'API retornou succeeded=false');
      }
      
      return response.data || {
        items: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };
      
    } catch (error: any) {
      if (error.status === 404) {
        return {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      throw error;
    }
  }

  static async getAllRoles(): Promise<Role[]> {
    const response = await this.getRoles({ page: 1, limit: 1000 });
    return response.items || [];
  }

  static async getRoleById(id: string): Promise<Role> {
    const response = await httpClient.get<Role>(API_ENDPOINTS.ROLE_BY_ID(id));
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Role não encontrado');
    }
    
    return response.data;
  }

  static async createRole(role: CreateRoleRequest): Promise<Role> {
    const response = await httpClient.post<Role>(API_ENDPOINTS.ROLES, role);
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Erro ao criar role');
    }
    
    return response.data;
  }

  static async updateRole(id: string, role: UpdateRoleRequest): Promise<Role> {
    const response = await httpClient.put<Role>(API_ENDPOINTS.ROLE_BY_ID(id), role);
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Erro ao atualizar role');
    }
    
    return response.data;
  }

  static async deleteRole(id: string): Promise<void> {
    const response = await httpClient.delete(API_ENDPOINTS.ROLE_BY_ID(id));
    
    if (!response.succeeded) {
      throw new Error(response.errors?.join(', ') || 'Erro ao remover role');
    }
  }

  // ===== PERMISSIONS =====

  static async getPermissionsByRole(roleId: string): Promise<Permission[]> {
    const response = await httpClient.get<Permission[]>(`${API_ENDPOINTS.ROLES}/${roleId}/permissions`);
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Erro ao buscar permissões do role');
    }
    
    return response.data;
  }

  static async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    const response = await httpClient.post<boolean>(
      `${API_ENDPOINTS.ROLES}/${roleId}/permissions`, 
      permissionIds
    );
    
    if (!response.succeeded) {
      throw new Error(response.errors?.join(', ') || 'Erro ao atribuir permissões ao role');
    }
  }

  static async removePermissionsFromRole(roleId: string, permissionIds: string[]): Promise<void> {
    const response = await httpClient.delete<boolean>(
      `${API_ENDPOINTS.ROLES}/${roleId}/permissions`,
      { data: permissionIds }
    );
    
    if (!response.succeeded) {
      throw new Error(response.errors?.join(', ') || 'Erro ao remover permissões do role');
    }
  }

  // ===== ACCESS GROUPS =====

  static async getAccessGroupsByRole(roleId: string): Promise<AccessGroup[]> {
    const response = await httpClient.get<AccessGroup[]>(`${API_ENDPOINTS.ROLES}/${roleId}/access-groups`);
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Erro ao buscar grupos de acesso do role');
    }
    
    return response.data;
  }

  static async assignAccessGroupsToRole(roleId: string, accessGroupIds: string[]): Promise<void> {
    const response = await httpClient.post<boolean>(
      `${API_ENDPOINTS.ROLES}/${roleId}/access-groups`, 
      accessGroupIds
    );
    
    if (!response.succeeded) {
      throw new Error(response.errors?.join(', ') || 'Erro ao atribuir grupos de acesso ao role');
    }
  }

  static async removeAccessGroupsFromRole(roleId: string, accessGroupIds: string[]): Promise<void> {
    const response = await httpClient.delete<boolean>(
      `${API_ENDPOINTS.ROLES}/${roleId}/access-groups`,
      { data: accessGroupIds }
    );
    
    if (!response.succeeded) {
      throw new Error(response.errors?.join(', ') || 'Erro ao remover grupos de acesso do role');
    }
  }

  static async toggleRoleStatus(role: Role): Promise<Role> {
    return this.updateRole(role.id, { 
      isActive: !role.isActive 
    });
  }
}