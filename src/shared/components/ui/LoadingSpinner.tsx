import { Box, CircularProgress } from '@mui/material';
import type { SxProps, Theme } from '@mui/material/styles';

interface LoadingSpinnerProps {
  size?: number;
  sx?: SxProps<Theme>;
  fullScreen?: boolean;
}

/**
 * Componente de loading spinner reutilizável
 */
export const LoadingSpinner = ({ 
  size = 40, 
  sx, 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const content = <CircularProgress size={size} sx={sx} />;

  if (fullScreen) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        ...sx,
      }}
    >
      {content}
    </Box>
  );
};