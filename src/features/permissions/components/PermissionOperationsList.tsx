import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PowerSettingsNew as ToggleIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import type { PermissionOperation } from '../../../shared/types';

interface PermissionOperationsListProps {
  permissionOperations: PermissionOperation[];
  loading?: boolean;
  onEdit: (permissionOperation: PermissionOperation) => void;
  onDelete: (permissionOperation: PermissionOperation) => void;
  onToggleStatus: (permissionOperation: PermissionOperation) => void;
}

/**
 * Lista de Relações Permissão-Operação
 * Componente responsável por exibir as relações em formato de tabela
 */
export const PermissionOperationsList: React.FC<PermissionOperationsListProps> = ({
  permissionOperations,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && permissionOperations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (permissionOperations.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <LinkIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nenhuma relação encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Clique no botão "Adicionar Relação" para criar uma nova relação permissão-operação.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={1}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Permissão</TableCell>
              <TableCell>Operação</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissionOperations.map((permissionOperation) => (
              <TableRow key={permissionOperation.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {permissionOperation.permissionName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {permissionOperation.operationName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {permissionOperation.operationCode || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {permissionOperation.operationDescription || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={permissionOperation.isActive ? 'Ativo' : 'Inativo'}
                    color={permissionOperation.isActive ? 'success' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(permissionOperation.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="Editar relação">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(permissionOperation)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={permissionOperation.isActive ? 'Desativar' : 'Ativar'}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleStatus(permissionOperation)}
                        color={permissionOperation.isActive ? 'warning' : 'success'}
                      >
                        <ToggleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir relação">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(permissionOperation)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};