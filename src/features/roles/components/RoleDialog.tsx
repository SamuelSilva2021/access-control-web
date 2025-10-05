import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  IconButton,
  Box
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { RoleForm } from './RoleForm';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../shared/types';

interface RoleDialogProps {
  open: boolean;
  onClose: () => void;
  role?: Role | null;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

/**
 * Dialog modal para criação e edição de roles
 * 
 * Features:
 * - Modal responsivo
 * - Formulário integrado
 * - Ações de salvar/cancelar
 * - Estados de loading
 * - Validação integrada
 */
export const RoleDialog = ({
  open,
  onClose,
  role,
  onSubmit,
  loading = false,
  error
}: RoleDialogProps) => {
  
  const isEditing = Boolean(role);
  const title = isEditing ? 'Editar Role' : 'Novo Role';

  const handleSubmit = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    try {
      await onSubmit(data);
      onClose(); // Fecha dialog apenas em caso de sucesso
    } catch (err) {
      // Erro já é tratado pelo componente pai
      console.error('Erro no submit do dialog:', err);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: 400 }
      }}
    >
      {/* Header */}
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="fechar"
            disabled={loading}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent dividers>
        <RoleForm
          role={role}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          color="inherit"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          onClick={() => {
            // Trigger submit do form
            const form = document.getElementById('role-form') as HTMLFormElement;
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}
        >
          {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Criar')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};