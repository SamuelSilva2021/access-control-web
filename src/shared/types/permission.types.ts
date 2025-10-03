// Tipos de Permissões
export interface Permission {
  id: string;
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Module {
  id: string;
  name: string;
  description?: string;
  url?: string;
  moduleKey: string;
  code?: string;
  applicationId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Operation {
  id: string;
  name: string;
  description?: string;
  code?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}