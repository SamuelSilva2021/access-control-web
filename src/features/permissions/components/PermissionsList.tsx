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
  Lock as PermissionIcon
} from '@mui/icons-material';
import type { Permission } from '../../../shared/types';

interface PermissionsListProps {
  permissions: Permission[];
  loading?: boolean;
  onEdit: (permission: Permission) => void;
  onDelete: (permission: Permission) => void;
  onToggleStatus: (permission: Permission) => void;
}

/**
 * Lista de Permissões
 * Componente responsável por exibir as permissões em formato de tabela
 */
export const PermissionsList: React.FC<PermissionsListProps> = ({
  permissions,
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

  if (loading && permissions.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (permissions.length === 0) {
    return (
      <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
        <PermissionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nenhuma permissão encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Clique no botão "Adicionar Permissão" para criar uma nova permissão.
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
              <TableCell>Nome</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {permissions.map((permission) => (
              <TableRow key={permission.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {permission.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {permission.code || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {permission.description || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={permission.isActive ? 'Ativo' : 'Inativo'}
                    color={permission.isActive ? 'success' : 'default'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(permission.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box display="flex" gap={0.5} justifyContent="center">
                    <Tooltip title="Editar permissão">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(permission)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={permission.isActive ? 'Desativar' : 'Ativar'}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleStatus(permission)}
                        color={permission.isActive ? 'warning' : 'success'}
                      >
                        <ToggleIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Excluir permissão">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(permission)}
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