import type { ReactNode } from 'react';
import { Card, CardContent, CardActions, Typography, Box } from '@mui/material';

export interface StyledCardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
  elevated?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

/**
 * Card estilizado com hover effects e layout responsivo
 */
export const StyledCard = ({
  title,
  subtitle,
  children,
  actions,
  elevated = false,
  clickable = false,
  onClick
}: StyledCardProps) => {
  return (
    <Card
      elevation={elevated ? 4 : 1}
      onClick={clickable ? onClick : undefined}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        cursor: clickable ? 'pointer' : 'default',
        '&:hover': {
          transform: clickable ? 'translateY(-2px)' : 'none',
          boxShadow: clickable ? '0 8px 25px rgba(0,0,0,0.15)' : undefined,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography
                variant="h6"
                component="h3"
                gutterBottom={!!subtitle}
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        )}
        <Box sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
          {children}
        </Box>
      </CardContent>
      
      {actions && (
        <CardActions
          sx={{
            p: 2,
            pt: 0,
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          {actions}
        </CardActions>
      )}
    </Card>
  );
};