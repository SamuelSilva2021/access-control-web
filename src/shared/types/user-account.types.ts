// Tipos baseados na API saas-authentication-api
export const UserAccountStatus = {
  Active: 'Active',
  Inactive: 'Inactive',
  Pending: 'Pending',
  Suspended: 'Suspended'
} as const;

export type UserAccountStatus = typeof UserAccountStatus[keyof typeof UserAccountStatus];

export interface UserAccount {
  id: string;
  tenantId?: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  status: UserAccountStatus;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  fullName: string;
}

export interface CreateUserAccountRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  tenantId?: string; // Será preenchido automaticamente pelo contexto do usuário logado
}

export interface UpdateUserAccountRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: UserAccountStatus;
}

// Tipos para associação de grupos a usuários
export interface AssignUserAccessGroupsRequest {
  accessGroupIds: string[];
}

export interface UserAccessGroupsResponse {
  id: string;
  name: string;
  description?: string;
  groupType: string;
  isActive: boolean;
}