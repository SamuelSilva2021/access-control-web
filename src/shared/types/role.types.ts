// Tipos de Roles (Papéis)
export interface Role {
  id: string;
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}