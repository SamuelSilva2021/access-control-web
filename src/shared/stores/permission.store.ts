import { create } from 'zustand';
import type { UserPermissions, OperationType } from '../types/permission.types';

interface PermissionState {
  permissions: UserPermissions | null;
  setPermissions: (permissions: UserPermissions) => void;
  clearPermissions: () => void;
  hasModuleAccess: (moduleKey: string) => boolean;
  canPerformOperation: (moduleKey: string, operation: OperationType) => boolean;
  getAccessibleModules: () => string[];
  getModuleOperations: (moduleKey: string) => OperationType[];
}

export const usePermissionStore = create<PermissionState>((set, get) => ({
  permissions: null,

  setPermissions: (permissions: UserPermissions) => set({ permissions }),

  clearPermissions: () => set({ permissions: null }),

  hasModuleAccess: (moduleKey: string): boolean => {
    const { permissions } = get();
    if (!permissions) return false;

    return permissions.accessGroups.some(group =>
      group.roles.some(role =>
        role.modules.some(module => module.key === moduleKey)
      )
    );
  },

  canPerformOperation: (moduleKey: string, operation: OperationType): boolean => {
    const { permissions } = get();
    if (!permissions) return false;

    return permissions.accessGroups.some(group =>
      group.roles.some(role =>
        role.modules.some(module =>
          module.key === moduleKey && module.operations.includes(operation)
        )
      )
    );
  },

  getAccessibleModules: (): string[] => {
    const { permissions } = get();
    if (!permissions) return [];

    const modules = new Set<string>();
    
    permissions.accessGroups.forEach(group =>
      group.roles.forEach(role =>
        role.modules.forEach(module =>
          modules.add(module.key)
        )
      )
    );

    return Array.from(modules);
  },

  getModuleOperations: (moduleKey: string): OperationType[] => {
    const { permissions } = get();
    if (!permissions) return [];

    const operations = new Set<OperationType>();
    
    permissions.accessGroups.forEach(group =>
      group.roles.forEach(role =>
        role.modules.forEach(module => {
          if (module.key === moduleKey) {
            module.operations.forEach(op => operations.add(op));
          }
        })
      )
    );

    return Array.from(operations);
  }
}));

// Hook personalizado para usar permissões
export const usePermissions = () => {
  const {
    hasModuleAccess,
    canPerformOperation,
    getAccessibleModules,
    getModuleOperations
  } = usePermissionStore();

  return {
    hasAccess: (moduleKey: string, operation?: OperationType) => {
      if (!operation) {
        return hasModuleAccess(moduleKey);
      }
      return canPerformOperation(moduleKey, operation);
    },
    getAccessibleModules,
    getModuleOperations,
    canCreate: (moduleKey: string) => canPerformOperation(moduleKey, 'CREATE'),
    canRead: (moduleKey: string) => canPerformOperation(moduleKey, 'SELECT'),
    canUpdate: (moduleKey: string) => canPerformOperation(moduleKey, 'UPDATE'),
    canDelete: (moduleKey: string) => canPerformOperation(moduleKey, 'DELETE')
  };
};