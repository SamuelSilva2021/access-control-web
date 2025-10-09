import { useState, useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Group as GroupIcon,
  Security as SecurityIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  PlayArrow as OperationIcon,
  AdminPanelSettings as RoleIcon,
  ExpandLess,
  ExpandMore,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePermissions, usePermissionStore } from '../../stores/permission.store';
import { ModuleKey } from '../../types/permission.types';
import { layout } from '../../theme';

export interface SidebarProps {
  open: boolean;
  onClose: () => void;
  onToggle: () => void;
}

interface MenuSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  moduleKey?: string; // Chave do módulo para verificar permissão
  operation?: string; // Operação necessária (padrão: SELECT)
}

interface MenuItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  moduleKey?: string; // Chave do módulo para verificar permissão
  operation?: string; // Operação necessária (padrão: SELECT)
}

/**
 * Sidebar de navegação com módulos do Access Control
 * Suporte a seções expansíveis e navegação responsiva
 */
export const Sidebar = ({ open, onClose, onToggle }: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { hasAccess } = usePermissions();
  const permissions = usePermissionStore(state => state.permissions);

  const [expandedSections, setExpandedSections] = useState<string[]>(['access-control']);

  // Definição dos módulos e seções com permissões
  const menuSections: MenuSection[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/dashboard',
      // Dashboard não precisa de permissão específica - sempre visível
    },
    {
      id: 'access-control',
      title: 'Controle de Acesso',
      icon: <SecurityIcon />,
      children: [
        {
          id: 'access-groups',
          title: 'Grupos de Acesso',
          icon: <GroupIcon />,
          path: '/access-groups',
          moduleKey: ModuleKey.ACCESS_GROUP,
          operation: 'SELECT',
        },
        {
          id: 'group-types',
          title: 'Tipos de Grupo',
          icon: <GroupIcon />,
          path: '/group-types',
          moduleKey: ModuleKey.GROUP_TYPE,
          operation: 'SELECT',
        },
        {
          id: 'modules',
          title: 'Módulos',
          icon: <SecurityIcon />,
          path: '/modules',
          moduleKey: ModuleKey.MODULES,
          operation: 'SELECT',
        },
        {
          id: 'operations',
          title: 'Operações',
          icon: <OperationIcon />,
          path: '/operations',
          moduleKey: ModuleKey.OPERATION_MODULE,
          operation: 'SELECT',
        },
        {
          id: 'roles',
          title: 'Papéis',
          icon: <RoleIcon />,
          path: '/roles',
          moduleKey: ModuleKey.ROLE_MODULE,
          operation: 'SELECT',
        },
        {
          id: 'permissions',
          title: 'Permissões',
          icon: <SecurityIcon />,
          path: '/permissions',
          moduleKey: ModuleKey.PERMISSION_MODULE,
          operation: 'SELECT',
        },
        {
          id: 'users',
          title: 'Usuários',
          icon: <PersonIcon />,
          path: '/users',
          moduleKey: ModuleKey.USER_MODULE,
          operation: 'SELECT',
        },

      ],
    },
    {
      id: 'settings',
      title: 'Configurações',
      icon: <SettingsIcon />,
      children: [
        {
          id: 'system',
          title: 'Sistema',
          icon: <SettingsIcon />,
          path: '/settings/system',
          badge: 'Em breve',
          // Configurações não precisam de permissão específica por enquanto
        },
        {
          id: 'profile',
          title: 'Perfil',
          icon: <PersonIcon />,
          path: '/settings/profile',
          badge: 'Em breve',
          // Perfil sempre visível para usuário logado
        },
      ],
    },
  ];

  // Função para verificar se um item tem permissão
  const hasPermissionForItem = (item: MenuItem | MenuSection): boolean => {
    if (!item.moduleKey) return true; // Se não tem moduleKey, sempre visível
    const operation = item.operation || 'SELECT';
    return hasAccess(item.moduleKey, operation as any);
  };

  // Filtrar itens do menu baseado nas permissões
  const filteredMenuSections = useMemo(() => {
    // Se as permissões ainda não foram carregadas, retorna menu vazio
    if (!permissions) {
      return [];
    }

    return menuSections
      .map(section => {
        // Se a seção tem filhos, filtra os filhos primeiro
        if (section.children) {
          const filteredChildren = section.children.filter(hasPermissionForItem);
          
          // Se não sobrou nenhum filho com permissão, esconde a seção inteira
          if (filteredChildren.length === 0) {
            return null;
          }
          
          return {
            ...section,
            children: filteredChildren
          };
        }
        
        // Para seções sem filhos, verifica a permissão da própria seção
        return hasPermissionForItem(section) ? section : null;
      })
      .filter((section): section is MenuSection => section !== null);
  }, [permissions, hasAccess]);

  const handleSectionClick = (section: MenuSection) => {
    if (section.path) {
      navigate(section.path);
      if (isMobile) onClose();
    } else if (section.children) {
      setExpandedSections(prev =>
        prev.includes(section.id)
          ? prev.filter(id => id !== section.id)
          : [...prev, section.id]
      );
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (!item.badge) {
      navigate(item.path);
      if (isMobile) onClose();
    }
  };

  const isActiveItem = (path: string) => {
    return location.pathname === path;
  };

  const isActiveSection = (section: MenuSection) => {
    if (section.path) return isActiveItem(section.path);
    return section.children?.some(item => isActiveItem(item.path)) || false;
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: layout.headerHeight,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          🔐 Access Control
        </Typography>
        {!isMobile && (
          <IconButton onClick={onToggle} size="small">
            <ChevronLeftIcon />
          </IconButton>
        )}
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!permissions ? (
          // Mostra loading enquanto as permissões não carregam
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Carregando permissões...
            </Typography>
          </Box>
        ) : (
          <List sx={{ py: 1 }}>
            {filteredMenuSections.map((section, sectionIndex) => (
            <Box key={section.id}>
              {sectionIndex > 0 && <Divider sx={{ my: 1 }} />}
              
              {/* Section Item */}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleSectionClick(section)}
                  selected={isActiveSection(section)}
                  sx={{
                    mx: 1,
                    borderRadius: 1,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                      '& .MuiListItemIcon-root': {
                        color: 'primary.contrastText',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {section.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={section.title}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: isActiveSection(section) ? 600 : 400,
                    }}
                  />
                  {section.children && (
                    expandedSections.includes(section.id) ? <ExpandLess /> : <ExpandMore />
                  )}
                </ListItemButton>
              </ListItem>

              {/* Section Children */}
              {section.children && (
                <Collapse
                  in={expandedSections.includes(section.id)}
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {section.children.map((item) => (
                      <ListItem key={item.id} disablePadding>
                        <ListItemButton
                          onClick={() => handleItemClick(item)}
                          selected={isActiveItem(item.path)}
                          disabled={!!item.badge}
                          sx={{
                            pl: 4,
                            mx: 1,
                            borderRadius: 1,
                            '&.Mui-selected': {
                              backgroundColor: 'primary.light',
                              color: 'primary.contrastText',
                            },
                            '&.Mui-disabled': {
                              opacity: 0.6,
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.title}
                            primaryTypographyProps={{
                              fontSize: '0.8rem',
                              fontWeight: isActiveItem(item.path) ? 600 : 400,
                            }}
                          />
                          {item.badge && (
                            <Typography
                              variant="caption"
                              sx={{
                                bgcolor: 'warning.light',
                                color: 'warning.contrastText',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                              }}
                            >
                              {item.badge}
                            </Typography>
                          )}
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
        )}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[50],
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Versão 1.0.0
        </Typography>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: layout.sidebarWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="persistent"
      open={open}
      sx={{
        width: open ? layout.sidebarWidth : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: layout.sidebarWidth,
          boxSizing: 'border-box',
          transition: theme.transitions.create(['width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};