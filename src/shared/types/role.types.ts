import type { Permission } from './permission.types';
import type { AccessGroup } from './access-group.types';

// Tipos de Roles (Papéis)
export interface Role {
  id: string;
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
  applicationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  permissions?: Permission[];
  accessGroups?: AccessGroup[];
}

export interface CreateRoleRequest {
  name: string;
  description: string; // Agora obrigatório
  code?: string;
  tenantId?: string;
  applicationId?: string;
  permissionIds?: string[];
  accessGroupIds?: string[];
  isActive?: boolean;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
  tenantId?: string;
  applicationId?: string;
  permissionIds?: string[];
  accessGroupIds?: string[];
}

// Tipos para associação de grupos de acesso a roles
export interface AssignRoleAccessGroupsRequest {
  accessGroupIds: string[];
}

export interface RoleAccessGroupsResponse {
  id: string;
  name: string;
  description?: string;
  groupType: string;
  isActive: boolean;
}

// Tipos para associação de permissões a roles
export interface AssignRolePermissionsRequest {
  permissionIds: string[];
}

export interface RolePermissionsResponse {
  id: string;
  name: string;
  description?: string;
  code?: string;
  moduleId?: string;
  moduleName?: string;
  isActive: boolean;
  operations?: {
    id: string;
    name: string;
    value: string;
  }[];
}