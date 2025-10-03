import type { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  disableSubmit?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Dialog reutilizável para formulários
 * Responsivo e com design consistente
 */
export const FormDialog = ({
  open,
  onClose,
  title,
  children,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  cancelLabel = 'Cancelar',
  isSubmitting = false,
  disableSubmit = false,
  maxWidth = 'sm',
}: FormDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  const handleSubmit = () => {
    onSubmit?.();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: isMobile ? 0 : 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ fontWeight: 600, fontSize: '1.25rem' }}>
          {title}
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ ml: 1 }}
          aria-label="fechar dialog"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2 }}>
        {children}
      </DialogContent>

      {(onSubmit || onCancel) && (
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCancel}
            color="inherit"
            disabled={isSubmitting}
            size="large"
          >
            {cancelLabel}
          </Button>
          
          {onSubmit && (
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={disableSubmit || isSubmitting}
              size="large"
              sx={{ minWidth: 120 }}
            >
              {isSubmitting ? 'Salvando...' : submitLabel}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};