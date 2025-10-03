import { config } from '../config';

// Constantes da API baseadas na configuração do ambiente
export const API_BASE_URL = config.api.baseUrl;

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  REFRESH: '/api/auth/refresh',
  LOGOUT: '/api/auth/logout',
  VALIDATE: '/api/auth/validate',
  ME: '/api/auth/me',
  USER_PERMISSIONS: '/api/auth/permissions',
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  
  // Tenants
  TENANTS: '/api/tenants',
  TENANT_BY_ID: (id: string) => `/api/tenants/${id}`,
  TENANT_BY_SLUG: (slug: string) => `/api/tenants/slug/${slug}`,
  
  // Access Groups
  ACCESS_GROUPS: '/api/access-group',
  ACCESS_GROUP_BY_ID: (id: string) => `/api/access-group/${id}`,
  GROUP_TYPES: '/api/access-group/group-types',
  GROUP_TYPE_BY_ID: (id: string) => `/api/access-group/group-types/${id}`,
  
  // Roles
  ROLES: '/api/roles',
  ROLE_BY_ID: (id: string) => `/api/roles/${id}`,
  
  // Permissions
  PERMISSIONS: '/api/permissions',
  PERMISSION_BY_ID: (id: string) => `/api/permissions/${id}`,
  
  // Modules
  MODULES: '/api/modules',
  MODULE_BY_ID: (id: string) => `/api/modules/${id}`,
  
  // Applications
  APPLICATIONS: '/api/applications',
  APPLICATION_BY_ID: (id: string) => `/api/applications/${id}`,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;