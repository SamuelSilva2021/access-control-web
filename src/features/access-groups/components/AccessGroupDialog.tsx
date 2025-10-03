import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { AccessGroupForm } from './AccessGroupForm';
import type { AccessGroup, CreateAccessGroupRequest, UpdateAccessGroupRequest, GroupType } from '../../../shared/types';

export interface AccessGroupDialogProps {
  open: boolean;
  accessGroup?: AccessGroup | null;
  groupTypes?: GroupType[];
  onClose: () => void;
  onSubmit: (data: CreateAccessGroupRequest | UpdateAccessGroupRequest) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Diálogo modal para criar/editar grupos de acesso
 * Reutilizável para ambos os casos de uso
 */
export const AccessGroupDialog = ({
  open,
  accessGroup,
  groupTypes = [],
  onClose,
  onSubmit,
  isSubmitting = false,
}: AccessGroupDialogProps) => {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isEditing = !!accessGroup;

  const handleSubmit = async (data: CreateAccessGroupRequest | UpdateAccessGroupRequest) => {
    setLocalSubmitting(true);
    try {
      await onSubmit(data);
      // Não fechamos o dialog aqui - deixamos para o componente pai decidir
      // onClose(); // Removido
    } catch (error) {
      // Error já foi tratado no parent component
      console.error('Erro no dialog submit:', error);
    } finally {
      setLocalSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !localSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isSubmitting || localSubmitting}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEditing ? 'Editar Grupo de Acesso' : 'Criar Grupo de Acesso'}
        
        <IconButton
          onClick={handleClose}
          disabled={isSubmitting || localSubmitting}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ pt: 1 }}>
          <AccessGroupForm
            initialData={accessGroup}
            groupTypes={groupTypes}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting || localSubmitting}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isSubmitting || localSubmitting}
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          form="access-group-form"
          variant="contained"
          disabled={isSubmitting || localSubmitting}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};