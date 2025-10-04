import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard
} from '../../shared/components';
import { Add as AddIcon, Lock as PermissionIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { 
  PermissionsList, 
  PermissionDialog 
} from '../permissions/components';
import { usePermissions } from '../permissions/hooks';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../../shared/types';

/**
 * Página de Permissões
 * Gerencia todas as permissões do sistema
 */
export const PermissionsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

  const {
    permissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    toggleStatus,
    clearError,
  } = usePermissions();

  const handleCreatePermission = () => {
    setEditingPermission(null);
    setDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setDialogOpen(true);
  };

  const handleDeletePermission = async (permission: Permission) => {
    if (window.confirm(`Tem certeza que deseja excluir a permissão "${permission.name}"?`)) {
      await deletePermission(permission.id);
    }
  };

  const handleToggleStatus = async (permission: Permission) => {
    await toggleStatus(permission.id);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingPermission(null);
  };

  const handleSubmitPermission = async (data: CreatePermissionRequest | UpdatePermissionRequest) => {
    if (editingPermission) {
      await updatePermission(editingPermission.id, data as UpdatePermissionRequest);
    } else {
      await createPermission(data as CreatePermissionRequest);
    }
  };

  const handleClearError = () => {
    clearError();
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Gerenciamento de Permissões"
        subtitle="Gerencie as permissões do sistema e suas operações"
        icon={<PermissionIcon />}
        actionButton={{
          label: 'Adicionar Permissão',
          onClick: handleCreatePermission,
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

        {loading && permissions.length === 0 ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Permissões Cadastradas ({permissions.length})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gerencie as permissões que controlam o acesso às funcionalidades do sistema
              </Typography>
            </Box>

            <PermissionsList
              permissions={permissions}
              loading={loading}
              onEdit={handleEditPermission}
              onDelete={handleDeletePermission}
              onToggleStatus={handleToggleStatus}
            />
          </>
        )}
      </StyledCard>

      {/* Dialog para Criar/Editar */}
      <PermissionDialog
        open={dialogOpen}
        permission={editingPermission}
        onClose={handleCloseDialog}
        onSubmit={handleSubmitPermission}
        loading={loading}
      />
    </ResponsiveContainer>
  );
};