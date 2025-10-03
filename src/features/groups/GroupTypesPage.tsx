import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard
} from '../../shared/components';
import { Add as AddIcon, Group as GroupIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { 
  GroupTypesList, 
  GroupTypeDialog 
} from '../group-types/components';
import { useGroupTypes } from '../group-types/hooks';
import type { GroupType, CreateGroupTypeRequest, UpdateGroupTypeRequest } from '../../shared/types';

/**
 * Página de Tipos de Grupo
 * Gerencia todos os tipos de grupos de acesso
 */
export const GroupTypesPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroupType, setEditingGroupType] = useState<GroupType | null>(null);

  const {
    groupTypes,
    loading,
    error,
    createGroupType,
    updateGroupType,
    deleteGroupType,
    toggleStatus,
    clearError,
  } = useGroupTypes();

  const handleCreateGroupType = () => {
    setEditingGroupType(null);
    setDialogOpen(true);
  };

  const handleEditGroupType = (groupType: GroupType) => {
    setEditingGroupType(groupType);
    setDialogOpen(true);
  };

  const handleDeleteGroupType = async (groupType: GroupType) => {
    if (window.confirm(`Tem certeza que deseja excluir o tipo "${groupType.name}"?`)) {
      await deleteGroupType(groupType.id);
    }
  };

  const handleToggleStatus = async (groupType: GroupType) => {
    await toggleStatus(groupType.id);
  };

  const handleDialogSubmit = async (data: CreateGroupTypeRequest | UpdateGroupTypeRequest) => {
    try {
      if (editingGroupType) {
        const result = await updateGroupType(editingGroupType.id, data as UpdateGroupTypeRequest);
        console.log('✅ Update result:', result);
      } else {
        const result = await createGroupType(data as CreateGroupTypeRequest);
        console.log('✅ Create result:', result);
      }
      // Se chegou até aqui, a operação foi bem-sucedida
      setDialogOpen(false);
      setEditingGroupType(null);
      clearError();
    } catch (error) {
      console.error('❌ Erro na operação:', error);
      // O erro já foi tratado pelo hook, não precisamos fechar o dialog
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingGroupType(null);
    clearError();
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Tipos de Grupo"
        subtitle="Gerencie os tipos de grupos de acesso disponíveis"
        icon={<GroupIcon />}
        actionButton={{
          label: 'Criar Tipo',
          onClick: handleCreateGroupType,
          icon: <AddIcon />
        }}
      />

      <StyledCard>
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {loading && (!groupTypes || groupTypes.length === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (!groupTypes || groupTypes.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <GroupIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum tipo de grupo encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie o primeiro tipo de grupo para começar a organizar os acessos.
            </Typography>
          </Box>
        ) : (
          <GroupTypesList
            groupTypes={groupTypes || []}
            loading={loading}
            onEdit={handleEditGroupType}
            onDelete={handleDeleteGroupType}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </StyledCard>

      <GroupTypeDialog
        open={dialogOpen}
        groupType={editingGroupType}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isSubmitting={loading}
      />
    </ResponsiveContainer>
  );
};