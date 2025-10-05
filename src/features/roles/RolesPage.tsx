import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard
} from '../../shared/components';
import { Add as AddIcon, AdminPanelSettings as RoleIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert, Button } from '@mui/material';
import { 
  RolesList, 
  RoleDialog,
  RoleAccessGroups,
  RolePermissions
} from '../roles/components';
import { useRoles } from '../roles/hooks';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../shared/types';

/**
 * Página principal de Roles
 * Gerencia todos os papéis/funções do sistema
 * 
 * Features:
 * - Lista paginada de roles
 * - Criação de novos roles
 * - Edição de roles existentes
 * - Remoção de roles
 * - Toggle de status ativo/inativo
 * - Estados de loading e error
 * - Interface responsiva
 */
export const RolesPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [accessGroupsOpen, setAccessGroupsOpen] = useState(false);
  const [selectedRoleForGroups, setSelectedRoleForGroups] = useState<Role | null>(null);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState<Role | null>(null);

  const {
    roles,
    loading,
    error,
    totalItems,
    currentPage,
    loadRoles,
    createRole,
    updateRole,
    deleteRole,
    toggleStatus,
    clearError,
  } = useRoles({ 
    autoLoad: true, 
    pageSize: 10 
  });

  /**
   * Abre dialog para criar novo role
   */
  const handleCreateRole = () => {
    setEditingRole(null);
    setDialogOpen(true);
  };

  /**
   * Abre dialog para editar role existente
   */
  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setDialogOpen(true);
  };

  /**
   * Remove um role com confirmação
   */
  const handleDeleteRole = async (role: Role) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o role "${role.name}"?\n\n` +
      `Esta ação não pode ser desfeita e pode afetar usuários que possuem este role.`
    );

    if (confirmed) {
      try {
        await deleteRole(role.id);
      } catch (err) {
        console.error('Erro ao deletar role:', err);
      }
    }
  };

  /**
   * Alterna status ativo/inativo do role
   */
  const handleToggleStatus = async (role: Role) => {
    try {
      await toggleStatus(role);
    } catch (err) {
      console.error('Erro ao alterar status do role:', err);
    }
  };

  /**
   * Abre dialog para gerenciar grupos de acesso do role
   */
  const handleManageGroups = (role: Role) => {
    setSelectedRoleForGroups(role);
    setAccessGroupsOpen(true);
  };

  /**
   * Fecha dialog de grupos de acesso
   */
  const handleCloseAccessGroups = () => {
    setAccessGroupsOpen(false);
    setSelectedRoleForGroups(null);
  };

  /**
   * Abre dialog para gerenciar permissões do role
   */
  const handleManagePermissions = (role: Role) => {
    setSelectedRoleForPermissions(role);
    setPermissionsOpen(true);
  };

  /**
   * Fecha dialog de permissões
   */
  const handleClosePermissions = () => {
    setPermissionsOpen(false);
    setSelectedRoleForPermissions(null);
  };

  /**
   * Submete formulário do dialog (criar ou atualizar)
   */
  const handleDialogSubmit = async (data: CreateRoleRequest | UpdateRoleRequest): Promise<void> => {
    try {
      if (editingRole) {
        // Modo edição
        await updateRole(editingRole.id, data as UpdateRoleRequest);
      } else {
        // Modo criação
        await createRole(data as CreateRoleRequest);
      }
      
      setDialogOpen(false);
      setEditingRole(null);
      
    } catch (err) {
      // Erro já é propagado para o dialog
      throw err;
    }
  };

  /**
   * Fecha dialog e limpa estado
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRole(null);
    clearError();
  };

  /**
   * Handle mudança de página
   */
  const handlePageChange = async (page: number) => {
    await loadRoles(page);
  };

  return (
    <ResponsiveContainer>
      
      {/* Header da página */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <PageHeader
          title="Roles"
          subtitle="Gerenciamento de papéis e funções do sistema"
          icon={<RoleIcon />}
        />
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateRole}
          disabled={loading}
        >
          Novo Role
        </Button>
      </Box>

      {/* Conteúdo principal */}
      <Box sx={{ mt: 3 }}>

        {/* Estados de loading geral */}
        {loading && roles.length === 0 && (
          <StyledCard>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Carregando roles...
              </Typography>
            </Box>
          </StyledCard>
        )}

        {/* Estados de erro */}
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* Lista de roles */}
        {!loading || roles.length > 0 ? (
          <RolesList
            roles={roles}
            loading={loading}
            onEdit={handleEditRole}
            onDelete={handleDeleteRole}
            onToggleStatus={handleToggleStatus}
            onManageGroups={handleManageGroups}
            onManagePermissions={handleManagePermissions}
            totalItems={totalItems}
            currentPage={currentPage}
            pageSize={10}
            onPageChange={handlePageChange}
          />
        ) : null}

      </Box>

      {/* Dialog de criação/edição */}
      <RoleDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        role={editingRole}
        onSubmit={handleDialogSubmit}
        loading={loading}
        error={error}
      />

      {/* Dialog de grupos de acesso */}
      <RoleAccessGroups
        open={accessGroupsOpen}
        onClose={handleCloseAccessGroups}
        role={selectedRoleForGroups}
      />

      {/* Dialog de permissões */}
      <RolePermissions
        open={permissionsOpen}
        onClose={handleClosePermissions}
        role={selectedRoleForPermissions}
      />

    </ResponsiveContainer>
  );
};