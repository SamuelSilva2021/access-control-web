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
  moduleTypeId?: string;
  moduleTypeName?: string;
  applicationName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  permissions?: Permission[];
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
  value?: string; // Valor da operação (ex: 'CREATE', 'READ', 'UPDATE', 'DELETE')
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOperationRequest {
  name: string;
  description?: string;
  value: string; // Obrigatório conforme DTO do backend
  isActive?: boolean;
}

export interface UpdateOperationRequest {
  name?: string;
  description?: string;
  value?: string;
  isActive?: boolean;
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

// Módulos - DTOs para integração com API
export interface CreateModuleRequest {
  name: string;
  description: string;
  url: string;
  moduleKey?: string;
  code?: string;
  applicationId?: string;
  isActive: boolean;
}

export interface UpdateModuleRequest {
  name?: string;
  description?: string;
  url?: string;
  moduleKey?: string;
  code?: string;
  applicationId?: string;
  moduleTypeId?: string;
  isActive?: boolean;
}