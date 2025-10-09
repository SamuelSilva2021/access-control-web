import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '../../stores/permission.store';
import { menuConfig } from '../../config/menu.config';
import type { MenuItemConfig } from '../../types/permission.types';

interface DynamicMenuProps {
  className?: string;
}

export const DynamicMenu: React.FC<DynamicMenuProps> = ({ className = '' }) => {
  const { hasAccess } = usePermissions();
  const location = useLocation();

  const filterMenuItems = (items: MenuItemConfig[]): MenuItemConfig[] => {
    return items.filter(item => {
      // Verificar se o usuário tem acesso ao item principal
      if (!hasAccess(item.moduleKey, item.operation)) {
        return false;
      }

      // Se tem filhos, filtrar recursivamente
      if (item.children) {
        item.children = filterMenuItems(item.children);
        // Se não sobrou nenhum filho acessível, esconder o item pai
        return item.children.length > 0;
      }

      return true;
    });
  };

  const filteredMenu = filterMenuItems([...menuConfig]);

  const renderMenuItem = (item: MenuItemConfig, level = 0) => {
    const isActive = location.pathname === item.path;
    const hasChildren = item.children && item.children.length > 0;

    return (
      <li key={item.key} className={`menu-item level-${level}`}>
        <Link
          to={item.path}
          className={`
            flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
            ${isActive 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700' 
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
            ${level > 0 ? 'ml-4 text-xs' : ''}
          `}
        >
          <span className="mr-3 text-lg" role="img" aria-label={item.label}>
            {getIconByName(item.icon)}
          </span>
          {item.label}
        </Link>
        
        {hasChildren && (
          <ul className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  if (filteredMenu.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>Nenhum menu disponível</p>
        <p className="text-xs">Contate o administrador</p>
      </div>
    );
  }

  return (
    <nav className={`dynamic-menu ${className}`}>
      <ul className="space-y-1">
        {filteredMenu.map(item => renderMenuItem(item))}
      </ul>
    </nav>
  );
};

// Helper para mapear nomes de ícones para emojis ou componentes
const getIconByName = (iconName: string): string => {
  const iconMap: Record<string, string> = {
    dashboard: '📊',
    users: '👥',
    'users-cog': '⚙️',
    'user-tag': '🏷️',
    list: '📋',
    plus: '➕',
    'shopping-cart': '🛒',
    shield: '🛡️',
    key: '🔑',
    package: '📦',
    'credit-card': '💳',
    'chart-bar': '📈',
  };

  return iconMap[iconName] || '📄';
};