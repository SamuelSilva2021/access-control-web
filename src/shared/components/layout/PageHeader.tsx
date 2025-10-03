import type { ReactNode } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: ReactNode;
    variant?: 'contained' | 'outlined' | 'text';
    color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  };
  children?: ReactNode;
}

/**
 * Componente padrão para cabeçalhos de páginas responsivos
 * Inclui título, subtítulo opcional e botão de ação
 */
export const PageHeader = ({ 
  title, 
  subtitle, 
  icon, 
  actionButton, 
  children 
}: PageHeaderProps) => {
  return (
    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 2, sm: 0 }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'flex-start' }}
        sx={{ mb: subtitle ? 1 : 0 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          {icon}
          <Typography 
            variant="h4" 
            component="h1"
            sx={{
              fontSize: { xs: '1.5rem', sm: '2rem' },
              fontWeight: 600,
              wordBreak: 'break-word',
            }}
          >
            {title}
          </Typography>
        </Box>
        
        {actionButton && (
          <Box sx={{ 
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            <Button
              variant={actionButton.variant || 'contained'}
              color={actionButton.color || 'primary'}
              startIcon={actionButton.icon}
              onClick={actionButton.onClick}
              fullWidth={{ xs: true, sm: false } as any}
              sx={{
                minWidth: { sm: '140px' },
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {actionButton.label}
            </Button>
          </Box>
        )}
      </Stack>
      
      {subtitle && (
        <Typography 
          variant="body1" 
          color="text.secondary" 
          gutterBottom
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mt: { xs: 0, sm: 1 }
          }}
        >
          {subtitle}
        </Typography>
      )}
      
      {children}
    </Box>
  );
};