import { useState } from 'react';
import {
  PageHeader,
  ResponsiveContainer,
  StyledCard
} from '../../shared/components';
import { Add as AddIcon, Settings as OperationIcon } from '@mui/icons-material';
import { Typography, Box, CircularProgress, Alert } from '@mui/material';
import { 
  OperationsList, 
  OperationDialog 
} from '../operations/components';
import { useOperations } from '../operations/hooks';
import type { Operation, CreateOperationRequest, UpdateOperationRequest } from '../../shared/types';

/**
 * Página de Operações
 * Gerencia todas as operações do sistema
 */
export const OperationsPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOperation, setEditingOperation] = useState<Operation | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    operations,
    loading,
    error,
    createOperation,
    updateOperation,
    deleteOperation,
    toggleStatus,
    clearError,
  } = useOperations();

  const handleCreateOperation = () => {
    setEditingOperation(null);
    setDialogOpen(true);
  };

  const handleEditOperation = (operation: Operation) => {
    setEditingOperation(operation);
    setDialogOpen(true);
  };

  const handleDeleteOperation = async (operation: Operation) => {
    if (window.confirm(`Tem certeza que deseja excluir a operação "${operation.name}"?`)) {
      await deleteOperation(operation.id);
    }
  };

  const handleToggleStatus = async (operation: Operation) => {
    await toggleStatus(operation.id);
  };

  const handleDialogSubmit = async (data: CreateOperationRequest | UpdateOperationRequest) => {
    try {
      if (editingOperation) {
        const result = await updateOperation(editingOperation.id, data as UpdateOperationRequest);
        console.log('✅ Update result:', result);
        setSuccessMessage('Operação atualizada com sucesso!');
      } else {
        const result = await createOperation(data as CreateOperationRequest);
        console.log('✅ Create result:', result);
        setSuccessMessage('Operação criada com sucesso!');
      }
      
      // Se chegou até aqui, a operação foi bem-sucedida
      // Fechar o dialog e limpar estados
      setDialogOpen(false);
      setEditingOperation(null);
      clearError();
      
      // Remove a mensagem de sucesso após 5 segundos
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('❌ Erro na operação:', error);
      // NÃO fechar o dialog em caso de erro para permitir correção
      // O erro já foi capturado pelo hook e será exibido no UI
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingOperation(null);
    clearError();
    setSuccessMessage(null); // Limpa mensagem de sucesso ao fechar
  };

  return (
    <ResponsiveContainer>
      <PageHeader
        title="Operações"
        subtitle="Gerencie as operações disponíveis no sistema"
        icon={<OperationIcon />}
        actionButton={{
          label: 'Criar Operação',
          onClick: handleCreateOperation,
          icon: <AddIcon />
        }}
      />

      <StyledCard>
        {successMessage && (
          <Alert 
            severity="success" 
            onClose={() => setSuccessMessage(null)}
            sx={{ mb: 2 }}
          >
            {successMessage}
          </Alert>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            onClose={clearError}
            sx={{ mb: 2 }}
          >
            {error}
          </Alert>
        )}

        {loading && (!operations || operations.length === 0) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (!operations || operations.length === 0) ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <OperationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nenhuma operação encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crie a primeira operação para começar a definir as ações do sistema.
            </Typography>
          </Box>
        ) : (
          <OperationsList
            operations={operations || []}
            loading={loading}
            onEdit={handleEditOperation}
            onDelete={handleDeleteOperation}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </StyledCard>

      <OperationDialog
        open={dialogOpen}
        operation={editingOperation}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        isSubmitting={loading}
      />
    </ResponsiveContainer>
  );
};