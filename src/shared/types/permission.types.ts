// Tipos de Permissões
export interface Permission {
  id: string;
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
  roleId?: string;
  moduleId?: string;
  moduleName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  operations?: Operation[];
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
  code?: string; // Código da operação (ex: 'READ', 'CREATE', 'UPDATE', 'DELETE')
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
  tenantId?: string;          // ID do tenant (opcional)
  roleId?: string;            // ID do papel (opcional) 
  moduleId: string;           // ID do módulo (obrigatório)
  operationIds?: string[];    // IDs das operações (opcional)
  isActive?: boolean;         // Se está ativa (opcional, padrão true)
}

export interface UpdatePermissionRequest {
  tenantId?: string;          // ID do tenant (opcional)
  roleId?: string;            // ID do papel (opcional) 
  moduleId: string;           // ID do módulo (obrigatório)
  operationIds?: string[];    // IDs das operações (opcional)
  isActive?: boolean;         // Se está ativa (opcional)
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

// Permission Operations - Relacionamento entre Permissões e Operações
export interface PermissionOperation {
  id: string;
  permissionId: string;
  operationId: string;
  permissionName: string;
  operationName: string;
  operationCode: string;
  operationDescription: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePermissionOperationRequest {
  permissionId: string;
  operationId: string;
  isActive?: boolean;
}

export interface UpdatePermissionOperationRequest {
  isActive?: boolean;
}

export interface PermissionOperationBulkRequest {
  permissionId: string;
  operationIds: string[];
}