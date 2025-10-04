import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Box,
} from '@mui/material';
import { Close as CloseIcon, Link as LinkIcon } from '@mui/icons-material';
import { PermissionOperationForm } from './PermissionOperationForm';
import type { 
  PermissionOperation, 
  CreatePermissionOperationRequest, 
  UpdatePermissionOperationRequest 
} from '../../../shared/types';

interface PermissionOperationDialogProps {
  open: boolean;
  permissionOperation?: PermissionOperation | null;
  onClose: () => void;
  onSubmit: (data: CreatePermissionOperationRequest | UpdatePermissionOperationRequest) => Promise<void>;
  loading?: boolean;
}

/**
 * Dialog para Criar/Editar Relação Permissão-Operação
 * Wrapper do PermissionOperationForm em um modal responsivo
 */
export const PermissionOperationDialog: React.FC<PermissionOperationDialogProps> = ({
  open,
  permissionOperation,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const isEdit = !!permissionOperation;
  const title = isEdit ? 'Editar Relação Permissão-Operação' : 'Nova Relação Permissão-Operação';

  const handleSubmit = async (data: CreatePermissionOperationRequest | UpdatePermissionOperationRequest) => {
    await onSubmit(data);
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: '400px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <LinkIcon color="primary" />
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
        <PermissionOperationForm
          permissionOperation={permissionOperation}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};