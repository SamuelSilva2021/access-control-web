import type { MenuItemConfig } from '../types/permission.types';
import { ModuleKey } from '../types/permission.types';

export const menuConfig: MenuItemConfig[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    moduleKey: ModuleKey.USER_MODULE, // Usar um módulo básico para dashboard
    operation: 'SELECT',
    path: '/dashboard'
  },
  {
    key: 'users',
    label: 'Usuários',
    icon: 'users',
    moduleKey: ModuleKey.USER_MODULE,
    operation: 'SELECT',
    path: '/users',
    children: [
      {
        key: 'users-list',
        label: 'Lista de Usuários',
        icon: 'list',
        moduleKey: ModuleKey.USER_MODULE,
        operation: 'SELECT',
        path: '/users'
      },
      {
        key: 'users-create',
        label: 'Criar Usuário',
        icon: 'plus',
        moduleKey: ModuleKey.USER_MODULE,
        operation: 'CREATE',
        path: '/users/create'
      }
    ]
  },
  {
    key: 'orders',
    label: 'Pedidos',
    icon: 'shopping-cart',
    moduleKey: ModuleKey.ORDER_MODULE,
    operation: 'SELECT',
    path: '/orders',
    children: [
      {
        key: 'orders-list',
        label: 'Lista de Pedidos',
        icon: 'list',
        moduleKey: ModuleKey.ORDER_MODULE,
        operation: 'SELECT',
        path: '/orders'
      },
      {
        key: 'orders-create',
        label: 'Criar Pedido',
        icon: 'plus',
        moduleKey: ModuleKey.ORDER_MODULE,
        operation: 'CREATE',
        path: '/orders/create'
      }
    ]
  },
  {
    key: 'access-control',
    label: 'Controle de Acesso',
    icon: 'shield',
    moduleKey: ModuleKey.ACCESS_GROUP,
    operation: 'SELECT',
    path: '/access-control',
    children: [
      {
        key: 'access-groups',
        label: 'Grupos de Acesso',
        icon: 'users-cog',
        moduleKey: ModuleKey.ACCESS_GROUP,
        operation: 'SELECT',
        path: '/access-groups'
      },
      {
        key: 'roles',
        label: 'Papéis',
        icon: 'user-tag',
        moduleKey: ModuleKey.ACCESS_GROUP,
        operation: 'SELECT',
        path: '/roles'
      },
      {
        key: 'permissions',
        label: 'Permissões',
        icon: 'key',
        moduleKey: ModuleKey.ACCESS_GROUP,
        operation: 'SELECT',
        path: '/permissions'
      }
    ]
  },
  {
    key: 'products',
    label: 'Produtos',
    icon: 'package',
    moduleKey: ModuleKey.PRODUCT_MODULE,
    operation: 'SELECT',
    path: '/products'
  },
  {
    key: 'payments',
    label: 'Pagamentos',
    icon: 'credit-card',
    moduleKey: ModuleKey.PAYMENT_MODULE,
    operation: 'SELECT',
    path: '/payments'
  },
  {
    key: 'reports',
    label: 'Relatórios',
    icon: 'chart-bar',
    moduleKey: ModuleKey.REPORT_MODULE,
    operation: 'SELECT',
    path: '/reports'
  }
];