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
  tenantId?: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}

export interface UpdateUserAccountRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  status?: UserAccountStatus;
}