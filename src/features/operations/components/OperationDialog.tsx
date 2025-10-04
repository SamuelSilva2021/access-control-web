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
import { OperationForm } from './OperationForm';
import type { Operation, CreateOperationRequest, UpdateOperationRequest } from '../../../shared/types';

export interface OperationDialogProps {
  open: boolean;
  operation?: Operation | null;
  onClose: () => void;
  onSubmit: (data: CreateOperationRequest | UpdateOperationRequest) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Diálogo modal para criar/editar operações
 * Reutilizável para ambos os casos de uso
 */
export const OperationDialog = ({
  open,
  operation,
  onClose,
  onSubmit,
  isSubmitting = false,
}: OperationDialogProps) => {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isEditing = !!operation;

  const handleSubmit = async (data: CreateOperationRequest | UpdateOperationRequest) => {
    setLocalSubmitting(true);
    try {
      await onSubmit(data);
      // Não fechamos o dialog aqui - deixamos para o componente pai decidir
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
        {isEditing ? 'Editar Operação' : 'Criar Operação'}
        
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
          <OperationForm
            initialData={operation}
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
          form="operation-form"
          variant="contained"
          disabled={isSubmitting || localSubmitting}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};