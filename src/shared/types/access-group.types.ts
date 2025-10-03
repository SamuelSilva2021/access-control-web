// Tipos de Grupos de Acesso
export interface AccessGroup {
  id: string;
  name: string;
  description?: string;
  code?: string;
  tenantId?: string;
  groupTypeId?: string;
  groupTypeName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAccessGroupRequest {
  name: string;
  description: string; // Obrigatório conforme DTO do backend
  code?: string;
  tenantId?: string;
  groupTypeId: string; // Obrigatório conforme DTO do backend
}

export interface UpdateAccessGroupRequest {
  name?: string;
  description?: string;
  code?: string;
  groupTypeId?: string;
  isActive?: boolean;
}

export interface GroupType {
  id: string;
  name: string;
  description?: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateGroupTypeRequest {
  name: string;
  description?: string;
  code: string;
  isActive?: boolean;
}

export interface UpdateGroupTypeRequest {
  name?: string;
  description?: string;
  code?: string;
  isActive?: boolean;
}