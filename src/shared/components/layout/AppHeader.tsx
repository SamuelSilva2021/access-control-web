import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useAuthStore } from '../../stores';
import { layout } from '../../theme';

export interface AppHeaderProps {
  open: boolean;
  onMenuClick: () => void;
}

/**
 * Header da aplicação com navegação e menu do usuário
 */
export const AppHeader = ({ open, onMenuClick }: AppHeaderProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const { user, logout } = useAuthStore();
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const handleSettings = () => {
    // TODO: Navegar para configurações
    console.log('🔧 Abrir configurações');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      elevation={1}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        ...(open && !isMobile && {
          width: `calc(100% - ${layout.sidebarWidth}px)`,
          marginLeft: `${layout.sidebarWidth}px`,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }),
      }}
    >
      <Toolbar sx={{ minHeight: `${layout.headerHeight}px !important` }}>
        {/* Menu Button */}
        <IconButton
          color="inherit"
          aria-label="toggle drawer"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        {/* Title */}
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
          Sistema de Controle de Acesso
        </Typography>

        {/* User Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* User Info */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            flexDirection: 'column', 
            alignItems: 'flex-end',
            mr: 1 
          }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.fullName || 'Usuário'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'usuario@exemplo.com'}
            </Typography>
          </Box>

          {/* User Avatar */}
          <IconButton
            size="large"
            edge="end"
            aria-label="user menu"
            aria-controls="user-menu"
            aria-haspopup="true"
            onClick={handleProfileMenuOpen}
            color="inherit"
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() || <AccountCircle />}
            </Avatar>
          </IconButton>
        </Box>

        {/* User Menu Dropdown */}
        <Menu
          id="user-menu"
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            elevation: 3,
            sx: {
              mt: 1,
              minWidth: 200,
              '& .MuiMenuItem-root': {
                gap: 1,
              },
            },
          }}
        >
          {/* User Info Mobile */}
          <Box sx={{ px: 2, py: 1, display: { sm: 'none' } }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {user?.fullName || 'Usuário'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email || 'usuario@exemplo.com'}
            </Typography>
          </Box>
          
          <Divider sx={{ display: { sm: 'none' } }} />

          <MenuItem onClick={handleSettings}>
            <SettingsIcon fontSize="small" />
            Configurações
          </MenuItem>
          
          <Divider />
          
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
            Sair
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};