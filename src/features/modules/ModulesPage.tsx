import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard
} from '../../shared/components';
import { Add as AddIcon, ViewModule as ModuleIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { 
  ModulesList, 
  ModuleDialog 
} from './components';
import { useModules } from './hooks';
import type { Module, CreateModuleRequest, UpdateModuleRequest } from '../../shared/types';

/**
 * Página de Módulos
 * Gerencia todos os módulos do sistema
 */
export const ModulesPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const {
    modules,
    loading,
    error,
    createModule,
    updateModule,
    deleteModule,
    toggleStatus,
    clearError,
  } = useModules();

  const handleCreateModule = () => {
    setEditingModule(null);
    setDialogOpen(true);
  };

  const handleEditModule = (module: Module) => {
    setEditingModule(module);
    setDialogOpen(true);
  };

  const handleDeleteModule = async (module: Module) => {
    if (window.confirm(`Tem certeza que deseja excluir o módulo "${module.name}"?`)) {
      await deleteModule(module.id);
    }
  };

  const handleToggleStatus = async (module: Module) => {
    await toggleStatus(module.id);
  };

  const handleDialogSubmit = async (data: CreateModuleRequest | UpdateModuleRequest) => {
    try {
      if (editingModule) {
        const result = await updateModule(editingModule.id, data as UpdateModuleRequest);
        console.log('✅ Module update result:', result);
      } else {
        const result = await createModule(data as CreateModuleRequest);
        console.log('✅ Module create result:', result);
      }
      // Se chegou até aqui, a operação foi bem-sucedida
      setDialogOpen(false);
      setEditingModule(null);
      clearError();
    } catch (error) {
      console.error('❌ Erro na operação de módulo:', error);
      // O erro já foi tratado pelo hook, não precisamos fechar o dialog
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingModule(null);
    clearError();
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Módulos"
        subtitle="Gerencie os módulos disponíveis no sistema"
        icon={<ModuleIcon />}
        actionButton={{
          label: 'Criar Módulo',
          onClick: handleCreateModule,
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

        {loading && (!modules || modules.length === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (!modules || modules.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ModuleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhum módulo encontrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie o primeiro módulo para começar a estruturar o sistema.
            </Typography>
          </Box>
        ) : (
          <ModulesList
            modules={modules || []}
            loading={loading}
            onEdit={handleEditModule}
            onDelete={handleDeleteModule}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </StyledCard>

      <ModuleDialog
        open={dialogOpen}
        module={editingModule}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isSubmitting={loading}
      />
    </ResponsiveContainer>
  );
};