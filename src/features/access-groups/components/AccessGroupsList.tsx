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
import type { AccessGroup } from '../../../shared/types';
import { formatDate } from '../../../shared/utils/date.utils';

export interface AccessGroupsListProps {
  accessGroups: AccessGroup[];
  loading?: boolean;
  onEdit: (accessGroup: AccessGroup) => void;
  onDelete: (accessGroup: AccessGroup) => void;
  onToggleStatus?: (accessGroup: AccessGroup) => void;
  emptyMessage?: string;
  // Propriedades de paginação
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * Lista responsiva de Access Groups com ações inline e paginação
 * Exibe dados de forma clara e acessível
 */
export const AccessGroupsList = ({
  accessGroups,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyMessage = 'Nenhum grupo de acesso encontrado',
  totalCount = 0,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}: AccessGroupsListProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedAccessGroup, setSelectedAccessGroup] = useState<AccessGroup | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, accessGroup: AccessGroup) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedAccessGroup(accessGroup);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedAccessGroup(null);
  };

  const handleEdit = () => {
    if (selectedAccessGroup) {
      onEdit(selectedAccessGroup);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedAccessGroup) {
      onDelete(selectedAccessGroup);
    }
    handleMenuClose();
  };

  const handleToggle = () => {
    if (selectedAccessGroup && onToggleStatus) {
      onToggleStatus(selectedAccessGroup);
    }
    handleMenuClose();
  };

  // Handlers para paginação
  const handlePageChange = (_event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage + 1); // Material-UI usa 0-based, nossa API usa 1-based
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  const columns: DataTableColumn<AccessGroup>[] = [
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
      id: 'code',
      label: 'Código',
      minWidth: 120,
      format: (value) => (
        value ? (
          <Chip
            label={value}
            size="small"
            variant="outlined"
            sx={{
              fontFamily: 'monospace',
              fontWeight: 600,
              backgroundColor: 'grey.50',
              borderColor: 'grey.300',
            }}
          />
        ) : (
          <Box sx={{ fontSize: '0.875rem', color: 'text.disabled', fontStyle: 'italic' }}>
            Sem código
          </Box>
        )
      ),
    },
    {
      id: 'groupTypeName',
      label: 'Tipo',
      minWidth: 140,
      format: (value, row) => (
        <Chip
          label={row.groupTypeName || value || 'N/A'}
          size="small"
          variant="filled"
          color="secondary"
          sx={{
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
            sx={{ ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        Carregando grupos de acesso...
      </Box>
    );
  }

  if (!accessGroups.length) {
    return (
      <Alert severity="info">
        <AlertTitle>Nenhum grupo de acesso encontrado</AlertTitle>
        {emptyMessage}
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={accessGroups}
        emptyMessage={emptyMessage}
        showPagination={!!onPageChange && !!onPageSizeChange}
        page={currentPage - 1} // Material-UI usa 0-based, nossa API usa 1-based
        rowsPerPage={pageSize}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handlePageSizeChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Menu de ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 8,
          sx: {
            minWidth: 160,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        
        {onToggleStatus && (
          <MenuItem onClick={handleToggle}>
            <ListItemIcon>
              {selectedAccessGroup?.isActive ? (
                <InactiveIcon fontSize="small" color="warning" />
              ) : (
                <ActiveIcon fontSize="small" color="success" />
              )}
            </ListItemIcon>
            <ListItemText>
              {selectedAccessGroup?.isActive ? 'Desativar' : 'Ativar'}
            </ListItemText>
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={handleDelete}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};