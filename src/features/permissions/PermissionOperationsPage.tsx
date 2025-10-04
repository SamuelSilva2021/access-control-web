import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard
} from '../../shared/components';
import { Add as AddIcon, Link as LinkIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { 
  PermissionOperationsList, 
  PermissionOperationDialog 
} from '../permissions/components';
import { usePermissionOperations } from '../permissions/hooks';
import type { 
  PermissionOperation, 
  CreatePermissionOperationRequest, 
  UpdatePermissionOperationRequest 
} from '../../shared/types';

/**
 * Página de Relações Permissão-Operação
 * Gerencia todas as relações entre permissões e operações do sistema
 */
export const PermissionOperationsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermissionOperation, setEditingPermissionOperation] = useState<PermissionOperation | null>(null);

  const {
    permissionOperations,
    loading,
    error,
    createPermissionOperation,
    updatePermissionOperation,
    deletePermissionOperation,
    toggleStatus,
    clearError,
  } = usePermissionOperations();

  const handleCreatePermissionOperation = () => {
    setEditingPermissionOperation(null);
    setDialogOpen(true);
  };

  const handleEditPermissionOperation = (permissionOperation: PermissionOperation) => {
    setEditingPermissionOperation(permissionOperation);
    setDialogOpen(true);
  };

  const handleDeletePermissionOperation = async (permissionOperation: PermissionOperation) => {
    const confirmMessage = `Tem certeza que deseja excluir a relação "${permissionOperation.permissionName}" -> "${permissionOperation.operationName}"?`;
    if (window.confirm(confirmMessage)) {
      await deletePermissionOperation(permissionOperation.id);
    }
  };

  const handleToggleStatus = async (permissionOperation: PermissionOperation) => {
    await toggleStatus(permissionOperation.id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPermissionOperation(null);
  };

  const handleSubmitPermissionOperation = async (data: CreatePermissionOperationRequest | UpdatePermissionOperationRequest) => {
    if (editingPermissionOperation) {
      await updatePermissionOperation(editingPermissionOperation.id, data as UpdatePermissionOperationRequest);
    } else {
      await createPermissionOperation(data as CreatePermissionOperationRequest);
    }
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Relações Permissão-Operação"
        subtitle="Gerencie as relações entre permissões e operações do sistema"
        icon={<LinkIcon />}
        actionButton={{
          label: 'Adicionar Relação',
          onClick: handleCreatePermissionOperation,
          icon: <AddIcon />,
          variant: 'contained'
        }}
      />

      {/* Conteúdo Principal */}
      <StyledCard>
        {error && (
          <Alert 
            severity="error" 
            onClose={handleClearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {loading && permissionOperations.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Relações Cadastradas ({permissionOperations.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie as relações que definem quais operações cada permissão pode executar
              </Typography>
            </Box>

            <PermissionOperationsList
              permissionOperations={permissionOperations}
              loading={loading}
              onEdit={handleEditPermissionOperation}
              onDelete={handleDeletePermissionOperation}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </StyledCard>

      {/* Dialog para Criar/Editar */}
      <PermissionOperationDialog
        open={dialogOpen}
        permissionOperation={editingPermissionOperation}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitPermissionOperation}
        loading={loading}
      />
    </ResponsiveContainer>
  );
};