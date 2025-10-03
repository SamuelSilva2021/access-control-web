import type { ReactNode } from 'react';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  severity?: 'error' | 'warning' | 'info';
  onRetry?: () => void;
  retryLabel?: string;
  children?: ReactNode;
}

/**
 * Componente padrão para exibir erros
 * Inclui opção de retry e diferentes severidades
 */
export const ErrorDisplay = ({
  title = 'Erro',
  message,
  severity = 'error',
  onRetry,
  retryLabel = 'Tentar Novamente',
  children
}: ErrorDisplayProps) => {
  return (
    <Box sx={{ p: 4 }}>
      <Alert 
        severity={severity}
        action={
          onRetry && (
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={onRetry}
            >
              {retryLabel}
            </Button>
          )
        }
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
      {children}
    </Box>
  );
};