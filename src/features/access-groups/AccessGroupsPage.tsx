import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard,
  PermissionsDebug
} from '../../shared/components';
import { Add as AddIcon, Groups as GroupsIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { useAccessGroups } from '../../shared/hooks';
import { useGroupTypes } from '../group-types/hooks';
import { usePermissions } from '../../shared/stores';
import { AccessGroupsList, AccessGroupDialog } from './components';
import { ModuleKey } from '../../shared/types/permission.types';
import type { AccessGroup, CreateAccessGroupRequest, UpdateAccessGroupRequest } from '../../shared/types';

/**
 * Página de Grupos de Acesso
 * Gerencia todos os grupos de acesso do sistema
 * Protegida por permissões de módulo ACCESS_GROUP
 */
export const AccessGroupsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccessGroup, setEditingAccessGroup] = useState<AccessGroup | null>(null);

  // Hook de permissões para controle de acesso
  const { canCreate, canUpdate, canDelete, hasAccess } = usePermissions();

  const {
    data: accessGroups = [],
    isLoading: loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    createAccessGroup,
    updateAccessGroup,
    deleteAccessGroup,
    loadAccessGroups,
    refreshData,
    clearError,
    setPageSize,
  } = useAccessGroups();

  const {
    groupTypes = [],
  } = useGroupTypes();

  // Verificar se tem permissão básica para visualizar
  if (!hasAccess(ModuleKey.ACCESS_GROUP, 'SELECT')) {
    return (
      <ResponsiveContainer>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <GroupsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Acesso Negado
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Você não tem permissão para visualizar grupos de acesso.
          </Typography>
        </Box>
      </ResponsiveContainer>
    );
  }

  // Debug: Log quando o componente re-renderiza
  console.log('🔄 AccessGroupsPage renderizou com:', {
    accessGroupsCount: accessGroups.length,
    loading,
    error: !!error
  });

  const handleCreateAccessGroup = () => {
    if (!canCreate(ModuleKey.ACCESS_GROUP)) {
      alert('Você não tem permissão para criar grupos de acesso.');
      return;
    }
    setEditingAccessGroup(null);
    setDialogOpen(true);
  };

  const handleEditAccessGroup = (accessGroup: AccessGroup) => {
    if (!canUpdate(ModuleKey.ACCESS_GROUP)) {
      alert('Você não tem permissão para editar grupos de acesso.');
      return;
    }
    setEditingAccessGroup(accessGroup);
    setDialogOpen(true);
  };

  const handleDeleteAccessGroup = async (accessGroup: AccessGroup) => {
    if (!canDelete(ModuleKey.ACCESS_GROUP)) {
      alert('Você não tem permissão para excluir grupos de acesso.');
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o grupo "${accessGroup.name}"?`)) {
      await deleteAccessGroup(accessGroup.id);
      await refreshData(); // Recarrega a lista
    }
  };

  const handleToggleStatus = async (accessGroup: AccessGroup) => {
    // TODO: Implementar toggleStatus quando disponível na API
    console.log(`🔄 Toggle status: ${accessGroup.name}`);
  };

  // Handlers para paginação
  const handlePageChange = async (page: number) => {
    console.log(`📄 Mudando para página: ${page}`);
    await loadAccessGroups(page);
  };

  const handlePageSizeChange = async (newPageSize: number) => {
    console.log(`📊 Mudando tamanho da página: ${newPageSize}`);
    setPageSize(newPageSize);
    // Volta para primeira página quando muda o tamanho
    await loadAccessGroups(1);
  };

  const handleDialogSubmit = async (data: CreateAccessGroupRequest | UpdateAccessGroupRequest) => {
    try {
      if (editingAccessGroup) {
        const result = await updateAccessGroup(editingAccessGroup.id, data as UpdateAccessGroupRequest);
        console.log('✏️ Update result:', result);
      } else {
        const result = await createAccessGroup(data as CreateAccessGroupRequest);
        console.log('➕ Create result:', result);
      }
      
      // Se chegou até aqui, a operação foi bem-sucedida
      setDialogOpen(false);
      setEditingAccessGroup(null);
      clearError();
      
      // Força recarregamento da lista após operação bem-sucedida
      console.log('🔄 Recarregando lista...');
      await refreshData();
    } catch (error) {
      console.error('❌ Erro na operação:', error);
      // O erro já foi tratado pelo hook, não precisamos fechar o dialog
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingAccessGroup(null);
    clearError();
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Grupos de Acesso"
        subtitle="Gerencie os grupos de acesso e suas permissões"
        icon={<GroupsIcon />}
        actionButton={canCreate(ModuleKey.ACCESS_GROUP) ? {
          label: 'Criar Grupo',
          onClick: handleCreateAccessGroup,
          icon: <AddIcon />
        } : undefined}
      />

      <StyledCard>
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {typeof error === 'string' ? error : 'Erro ao carregar grupos de acesso'}
          </Alert>
        )}

        {loading && (!accessGroups || accessGroups.length === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (!accessGroups || accessGroups.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <GroupsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Nenhum grupo de acesso encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique em "Criar Grupo" para adicionar seu primeiro grupo de acesso
            </Typography>
          </Box>
        ) : (
          <AccessGroupsList
            accessGroups={accessGroups}
            loading={loading}
            onEdit={handleEditAccessGroup}
            onDelete={handleDeleteAccessGroup}
            onToggleStatus={handleToggleStatus}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            canEdit={canUpdate(ModuleKey.ACCESS_GROUP)}
            canDelete={canDelete(ModuleKey.ACCESS_GROUP)}
          />
        )}
      </StyledCard>

      <AccessGroupDialog
        open={dialogOpen}
        accessGroup={editingAccessGroup}
        groupTypes={groupTypes}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isSubmitting={loading}
      />
      
      {/* Debug de permissões - só aparece em desenvolvimento */}
      <PermissionsDebug />
    </ResponsiveContainer>
  );
};