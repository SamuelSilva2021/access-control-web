import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControlLabel,
  Switch,
  Button,
  Stack,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { 
  PermissionOperation, 
  CreatePermissionOperationRequest, 
  UpdatePermissionOperationRequest,
  Permission,
  Operation 
} from '../../../shared/types';
import { PermissionService, OperationService } from '../../../shared/services';

interface PermissionOperationFormProps {
  permissionOperation?: PermissionOperation | null;
  onSubmit: (data: CreatePermissionOperationRequest | UpdatePermissionOperationRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * Formulário de Relação Permissão-Operação
 * Componente para criar/editar relações permissão-operação
 */
export const PermissionOperationForm: React.FC<PermissionOperationFormProps> = ({
  permissionOperation,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    permissionId: '',
    operationId: '',
    isActive: true,
  });
  
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!permissionOperation;

  // Carrega dados necessários
  useEffect(() => {
    const loadData = async () => {
      setLoadingData(true);
      try {
        const [permissionsResponse, operationsResponse] = await Promise.all([
          PermissionService.getPermissions({ limit: 100, isActive: true }),
          OperationService.getOperations({ limit: 100, isActive: true })
        ]);
        
        setPermissions(permissionsResponse.data);
        setOperations(operationsResponse.data);
      } catch (err) {
        setError('Erro ao carregar dados necessários');
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, []);

  // Preenche o formulário quando editing
  useEffect(() => {
    if (permissionOperation) {
      setFormData({
        permissionId: permissionOperation.permissionId,
        operationId: permissionOperation.operationId,
        isActive: permissionOperation.isActive,
      });
    }
  }, [permissionOperation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const submitData = isEdit 
        ? {
            isActive: formData.isActive,
          } as UpdatePermissionOperationRequest
        : {
            permissionId: formData.permissionId,
            operationId: formData.operationId,
            isActive: formData.isActive,
          } as CreatePermissionOperationRequest;

      await onSubmit(submitData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar relação');
    }
  };

  const handlePermissionChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, permissionId: event.target.value }));
  };

  const handleOperationChange = (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({ ...prev, operationId: event.target.value }));
  };

  if (loadingData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        {isEdit ? (
          <Box>
            <Typography variant="h6" gutterBottom>
              Editando Relação
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Permissão:</strong> {permissionOperation?.permissionName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Operação:</strong> {permissionOperation?.operationName} ({permissionOperation?.operationCode})
            </Typography>
          </Box>
        ) : (
          <>
            <FormControl fullWidth>
              <InputLabel>Permissão</InputLabel>
              <Select
                value={formData.permissionId}
                onChange={handlePermissionChange}
                disabled={loading}
                label="Permissão"
              >
                <MenuItem value="">
                  <em>Selecione uma permissão</em>
                </MenuItem>
                {permissions.map((permission) => (
                  <MenuItem key={permission.id} value={permission.id}>
                    {permission.name} {permission.code && `(${permission.code})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Operação</InputLabel>
              <Select
                value={formData.operationId}
                onChange={handleOperationChange}
                disabled={loading}
                label="Operação"
              >
                <MenuItem value="">
                  <em>Selecione uma operação</em>
                </MenuItem>
                {operations.map((operation) => (
                  <MenuItem key={operation.id} value={operation.id}>
                    {operation.name} ({operation.value})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </>
        )}

        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              disabled={loading}
            />
          }
          label="Relação Ativa"
        />

        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || (!isEdit && (!formData.permissionId || !formData.operationId))}
            startIcon={loading ? <CircularProgress size={20} /> : undefined}
          >
            {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};