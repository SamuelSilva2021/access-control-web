// Tipos para o sistema de permissões baseado em módulos (nova estrutura)

export type OperationType = 'CREATE' | 'SELECT' | 'UPDATE' | 'DELETE';

export interface ModulePermission {
  id: string;
  key: string;
  operations: OperationType[];
}

export interface RolePermission {
  id: string;
  code: string;
  modules: ModulePermission[];
}

export interface AccessGroupPermission {
  id: string;
  code: string;
  roles: RolePermission[];
}

export interface UserPermissions {
  userId: string;
  accessGroups: AccessGroupPermission[];
}

// Chaves de módulos conhecidos
export const ModuleKey = {
  USER_MODULE: 'USER_MODULE',
  ORDER_MODULE: 'ORDER_MODULE',
  ACCESS_GROUP: 'ACCESS_GROUP',
  PRODUCT_MODULE: 'PRODUCT_MODULE',
  PAYMENT_MODULE: 'PAYMENT_MODULE',
  REPORT_MODULE: 'REPORT_MODULE',
  MODULES: 'MODULES',
  GROUP_TYPE: 'GROUP_TYPE',
  ROLE_MODULE: 'ROLE_MODULE',
  OPERATION_MODULE: 'OPERATION_MODULE',
  PERMISSION_MODULE: 'PERMISSION_MODULE',
} as const;

export type ModuleKey = typeof ModuleKey[keyof typeof ModuleKey];

// Interface para configuração de rota protegida
export interface ProtectedRouteConfig {
  path: string;
  moduleKey: ModuleKey;
  operation?: OperationType;
  component: React.ComponentType;
  exact?: boolean;
}

// Interface para item de menu
export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  moduleKey: ModuleKey;
  operation: OperationType;
  path: string;
  children?: MenuItemConfig[];
}

// Tipos de Permissões (estrutura anterior - manter compatibilidade)
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
  key?: string; // Mudança: moduleKey → key (conforme backend)
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

// Módulos - DTOs para integração com API (atualizados conforme backend)
export interface CreateModuleRequest {
  name: string;                    // Required
  description: string;             // Required (pode ser string vazia)
  url: string;                     // Required (pode ser string vazia)
  key: string;                     // Required - chave obrigatória (mudança: moduleKey → key)
  code?: string;                   // Optional
  applicationId?: string;          // Optional (Guid como string)
  isActive: boolean;               // Required
}

export interface UpdateModuleRequest {
  name: string;                    // Required
  description: string;             // Required (pode ser string vazia)
  url: string;                     // Required (pode ser string vazia)
  key: string;                     // Required - chave obrigatória (mudança: moduleKey → key)
  code?: string;                   // Optional
  applicationId?: string;          // Optional (Guid como string)
  moduleTypeId?: string;           // Optional (Guid como string)
  isActive: boolean;               // Required
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