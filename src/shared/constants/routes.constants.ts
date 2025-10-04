// Constantes de rotas da aplicação
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  
  // Test/Debug
  GROUP_TYPES_TEST: '/group-types-test',
  OPERATIONS_TEST: '/operations-test',
  
  // Users
  USERS: '/users',
  USER_CREATE: '/users/create',
  USER_EDIT: (id: string) => `/users/${id}/edit`,
  USER_DETAIL: (id: string) => `/users/${id}`,
  
  // Access Groups
  ACCESS_GROUPS: '/access-groups',
  ACCESS_GROUP_CREATE: '/access-groups/create',
  ACCESS_GROUP_EDIT: (id: string) => `/access-groups/${id}/edit`,
  ACCESS_GROUP_DETAIL: (id: string) => `/access-groups/${id}`,
  
  // Group Types
  GROUP_TYPES: '/group-types',
  GROUP_TYPE_CREATE: '/group-types/create',
  GROUP_TYPE_EDIT: (id: string) => `/group-types/${id}/edit`,
  GROUP_TYPE_DETAIL: (id: string) => `/group-types/${id}`,
  
  // Roles
  ROLES: '/roles',
  ROLE_CREATE: '/roles/create',
  ROLE_EDIT: (id: string) => `/roles/${id}/edit`,
  ROLE_DETAIL: (id: string) => `/roles/${id}`,
  
  // Permissions
  PERMISSIONS: '/permissions',
  PERMISSION_CREATE: '/permissions/create',
  PERMISSION_EDIT: (id: string) => `/permissions/${id}/edit`,
  PERMISSION_DETAIL: (id: string) => `/permissions/${id}`,
  
  // Modules
  MODULES: '/modules',
  MODULE_CREATE: '/modules/create',
  MODULE_EDIT: (id: string) => `/modules/${id}/edit`,
  MODULE_DETAIL: (id: string) => `/modules/${id}`,
  
  // Operations
  OPERATIONS: '/operations',
  OPERATION_CREATE: '/operations/create',
  OPERATION_EDIT: (id: string) => `/operations/${id}/edit`,
  OPERATION_DETAIL: (id: string) => `/operations/${id}`,
  
  // Settings
  SETTINGS: '/settings',
  PROFILE: '/profile',
} as const;