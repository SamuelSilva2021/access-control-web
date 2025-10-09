import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { AdminPanelSettings } from '@mui/icons-material';
import { useAuth } from '../../shared/hooks';
import { ROUTES } from '../../shared/constants';
import { LoginForm } from './LoginForm';

export const LoginPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading && !hasRedirected.current) {
      hasRedirected.current = true;

      // Timeout para garantir que o estado estabilize
      setTimeout(() => {
        navigate(ROUTES.DASHBOARD, { replace: true });
      }, 100);
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleLoginSuccess = () => {
    hasRedirected.current = true;

    // Timeout para permitir que o store atualize
    setTimeout(() => {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }, 200);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: theme.palette.grey[100],
        display: 'flex',
        alignItems: 'center',
        backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            minHeight: '80vh',
            flexDirection: { xs: 'column', md: 'row' }
          }}
        >
          {/* Lado esquerdo - Informações */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px 0 0 16px',
              p: 4,
              color: 'white',
            }}
          >
            <AdminPanelSettings sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" component="h1" gutterBottom align="center">
              Access Control
            </Typography>
            <Typography variant="h6" align="center" sx={{ opacity: 0.9, mb: 4 }}>
              Sistema de Gerenciamento de Usuários, Grupos e Permissões
            </Typography>
    
          </Box>

          {/* Lado direito - Formulário de login */}
          <Box sx={{ flex: 1 }}>
            <Paper
              elevation={24}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                height: '100%',
                minHeight: { xs: '100vh', md: '80vh' },
                borderRadius: { xs: 0, md: '0 16px 16px 0' },
              }}
            >
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <LoginForm onSuccess={handleLoginSuccess} />
              </Box>

              <Typography
                variant="caption"
                color="text.secondary"
                align="center"
                sx={{ mt: 4 }}
              >
                © 2025 Samuel System. Todos os direitos reservados.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};