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
import { GroupTypeForm } from './GroupTypeForm';
import type { GroupType, CreateGroupTypeRequest, UpdateGroupTypeRequest } from '../../../shared/types';

export interface GroupTypeDialogProps {
  open: boolean;
  groupType?: GroupType | null;
  onClose: () => void;
  onSubmit: (data: CreateGroupTypeRequest | UpdateGroupTypeRequest) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Diálogo modal para criar/editar tipos de grupos
 * Reutilizável para ambos os casos de uso
 */
export const GroupTypeDialog = ({
  open,
  groupType,
  onClose,
  onSubmit,
  isSubmitting = false,
}: GroupTypeDialogProps) => {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isEditing = !!groupType;

  const handleSubmit = async (data: CreateGroupTypeRequest | UpdateGroupTypeRequest) => {
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
        {isEditing ? 'Editar Tipo de Grupo' : 'Criar Tipo de Grupo'}
        
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
          <GroupTypeForm
            initialData={groupType}
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
          form="group-type-form"
          variant="contained"
          disabled={isSubmitting || localSubmitting}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};