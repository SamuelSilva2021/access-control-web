import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon, Lock as PermissionIcon } from '@mui/icons-material';
import { PermissionForm } from './PermissionForm';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../../../shared/types';

interface PermissionDialogProps {
  open: boolean;
  permission?: Permission | null;
  onClose: () => void;
  onSubmit: (data: CreatePermissionRequest | UpdatePermissionRequest) => Promise<void>;
  loading?: boolean;
}

/**
 * Dialog para Criar/Editar Permissão
 * Wrapper do PermissionForm em um modal responsivo
 */
export const PermissionDialog: React.FC<PermissionDialogProps> = ({
  open,
  permission,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!permission;
  const title = isEdit ? 'Editar Permissão' : 'Nova Permissão';

  const handleSubmit = async (data: CreatePermissionRequest | UpdatePermissionRequest) => {
    await onSubmit(data);
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PermissionIcon color="primary" />
          <Typography variant="h6" component="span" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <IconButton
            onClick={onClose}
            disabled={loading}
            edge="end"
            color="inherit"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <PermissionForm
          permission={permission}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};