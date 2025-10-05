import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import { 
  LogoutOutlined,
  Group as GroupIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  BugReport as BugReportIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/hooks';
import { ROUTES } from '../../shared/constants';

export const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const quickActions = [
    {
      title: 'Grupos de Acesso',
      description: 'Gerenciar grupos e tipos de acesso',
      icon: GroupIcon,
      path: ROUTES.ACCESS_GROUPS,
      color: 'primary',
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários do sistema',
      icon: PeopleIcon,
      path: ROUTES.USERS,
      color: 'secondary',
    },
    {
      title: 'Roles',
      description: 'Gerenciar papéis e funções',
      icon: SecurityIcon,
      path: ROUTES.ROLES,
      color: 'primary',
    },
    {
      title: 'Permissões',
      description: 'Configurar permissões e operações',
      icon: SecurityIcon,
      path: ROUTES.PERMISSIONS,
      color: 'success',
    },
    {
      title: 'Configurações',
      description: 'Configurações do sistema',
      icon: SettingsIcon,
      path: '/settings',
      color: 'warning',
    },
    {
      title: '🧪 Teste Group Types',
      description: 'Testar API de tipos de grupo',
      icon: BugReportIcon,
      path: ROUTES.GROUP_TYPES_TEST,
      color: 'info',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<LogoutOutlined />}
          onClick={handleLogout}
        >
          Sair
        </Button>
      </Box>

      {/* Informações do usuário */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bem-vindo ao Access Control System!
          </Typography>
          
          {user && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1">
                <strong>Usuário:</strong> {user.fullName}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {user.email}
              </Typography>
              {user.tenant && (
                <Typography variant="body1">
                  <strong>Tenant:</strong> {user.tenant.name}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Ações rápidas */}
      <Typography variant="h6" gutterBottom>
        Módulos Disponíveis
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 3 
      }}>
        {quickActions.map((action) => (
          <Card 
            key={action.title}
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: 3,
              }
            }}
            onClick={() => navigate(action.path)}
          >
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <action.icon 
                sx={{ 
                  fontSize: 48, 
                  color: `${action.color}.main`,
                  mb: 2 
                }} 
              />
              <Typography variant="h6" gutterBottom>
                {action.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {action.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};