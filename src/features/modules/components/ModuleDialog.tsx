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
import { ModuleForm } from './ModuleForm';
import type { Module, CreateModuleRequest, UpdateModuleRequest } from '../../../shared/types';

export interface ModuleDialogProps {
  open: boolean;
  module?: Module | null;
  onClose: () => void;
  onSubmit: (data: CreateModuleRequest | UpdateModuleRequest) => Promise<void>;
  isSubmitting?: boolean;
}

/**
 * Diálogo modal para criar/editar módulos
 * Reutilizável para ambos os casos de uso
 */
export const ModuleDialog = ({
  open,
  module,
  onClose,
  onSubmit,
  isSubmitting = false,
}: ModuleDialogProps) => {
  const [localSubmitting, setLocalSubmitting] = useState(false);
  const isEditing = !!module;

  const handleSubmit = async (data: CreateModuleRequest | UpdateModuleRequest) => {
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
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isSubmitting || localSubmitting}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEditing ? 'Editar Módulo' : 'Criar Módulo'}
        
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
          <ModuleForm
            initialData={module}
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
          form="module-form"
          variant="contained"
          disabled={isSubmitting || localSubmitting}
        >
          {isEditing ? 'Atualizar' : 'Criar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};