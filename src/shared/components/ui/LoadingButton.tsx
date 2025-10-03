import { Button, CircularProgress } from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
}

/**
 * Botão com estado de loading integrado
 */
export const LoadingButton = ({
  loading = false,
  loadingText,
  children,
  disabled,
  startIcon,
  ...props
}: LoadingButtonProps) => {
  return (
    <Button
      {...props}
      disabled={loading || disabled}
      startIcon={
        loading ? (
          <CircularProgress size={16} color="inherit" />
        ) : (
          startIcon
        )
      }
    >
      {loading && loadingText ? loadingText : children}
    </Button>
  );
};