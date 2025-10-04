import { useState } from 'react';
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';
import { DataTable } from '../../../shared/components/data-display/DataTable';
import type { DataTableColumn } from '../../../shared/components/data-display/DataTable';
import type { Operation } from '../../../shared/types';
import { formatDate } from '../../../shared/utils/date.utils';

export interface OperationsListProps {
  operations: Operation[];
  loading?: boolean;
  onEdit: (operation: Operation) => void;
  onDelete: (operation: Operation) => void;
  onToggleStatus?: (operation: Operation) => void;
  emptyMessage?: string;
}

/**
 * Lista responsiva de Operations com ações inline
 * Exibe dados de forma clara e acessível
 */
export const OperationsList = ({
  operations,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyMessage = 'Nenhuma operação encontrada',
}: OperationsListProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, operation: Operation) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedOperation(operation);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedOperation(null);
  };

  const handleEdit = () => {
    if (selectedOperation) {
      onEdit(selectedOperation);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedOperation) {
      onDelete(selectedOperation);
    }
    handleMenuClose();
  };

  const handleToggle = () => {
    if (selectedOperation && onToggleStatus) {
      onToggleStatus(selectedOperation);
    }
    handleMenuClose();
  };

  const columns: DataTableColumn<Operation>[] = [
    {
      id: 'name',
      label: 'Nome',
      minWidth: 200,
      format: (value, row) => (
        <Box>
          <Box sx={{ fontWeight: 600, color: 'text.primary' }}>
            {value}
          </Box>
          {row.description && (
            <Box sx={{ fontSize: '0.875rem', color: 'text.secondary', mt: 0.5 }}>
              {row.description}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'value',
      label: 'Valor',
      minWidth: 120,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          variant="outlined"
          sx={{
            fontFamily: 'monospace',
            fontWeight: 600,
          }}
        />
      ),
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 120,
      align: 'center',
      format: (value) => (
        <Chip
          icon={value ? <ActiveIcon /> : <InactiveIcon />}
          label={value ? 'Ativo' : 'Inativo'}
          color={value ? 'success' : 'default'}
          size="small"
          variant={value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Criado em',
      minWidth: 140,
      format: (value) => (
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {formatDate(value)}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      minWidth: 80,
      align: 'center',
      format: (_, row) => (
        <Tooltip title="Mais opções">
          <IconButton
            size="small"
            onClick={(e) => handleMenuOpen(e, row)}
            sx={{
              opacity: 0.7,
              '&:hover': { opacity: 1 },
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        Carregando operações...
      </Box>
    );
  }

  if (!operations.length) {
    return (
      <Alert severity="info">
        <AlertTitle>Nenhuma operação encontrada</AlertTitle>
        {emptyMessage}
      </Alert>
    );
  }

  return (
    <Box>
      <DataTable
        columns={columns}
        data={operations}
        emptyMessage={emptyMessage}
      />

      {/* Menu de ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: { minWidth: 160 },
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>

        {onToggleStatus && selectedOperation && (
          <MenuItem onClick={handleToggle}>
            <ListItemIcon>
              {selectedOperation.isActive ? (
                <InactiveIcon fontSize="small" />
              ) : (
                <ActiveIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {selectedOperation.isActive ? 'Desativar' : 'Ativar'}
            </ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: 'error.main' }} />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};