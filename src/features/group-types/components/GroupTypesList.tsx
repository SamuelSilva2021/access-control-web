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
import type { GroupType } from '../../../shared/types';
import { formatDate } from '../../../shared/utils/date.utils';

export interface GroupTypesListProps {
  groupTypes: GroupType[];
  loading?: boolean;
  onEdit: (groupType: GroupType) => void;
  onDelete: (groupType: GroupType) => void;
  onToggleStatus?: (groupType: GroupType) => void;
  emptyMessage?: string;
}

/**
 * Lista responsiva de Group Types com ações inline
 * Exibe dados de forma clara e acessível
 */
export const GroupTypesList = ({
  groupTypes,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyMessage = 'Nenhum tipo de grupo encontrado',
}: GroupTypesListProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedGroupType, setSelectedGroupType] = useState<GroupType | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, groupType: GroupType) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedGroupType(groupType);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedGroupType(null);
  };

  const handleEdit = () => {
    if (selectedGroupType) {
      onEdit(selectedGroupType);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (selectedGroupType) {
      onDelete(selectedGroupType);
    }
    handleMenuClose();
  };

  const handleToggle = () => {
    if (selectedGroupType && onToggleStatus) {
      onToggleStatus(selectedGroupType);
    }
    handleMenuClose();
  };

  const columns: DataTableColumn<GroupType>[] = [
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
        Carregando tipos de grupo...
      </Box>
    );
  }

  if (!groupTypes.length) {
    return (
      <Alert severity="info">
        <AlertTitle>Nenhum tipo de grupo encontrado</AlertTitle>
        {emptyMessage}
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={groupTypes}
        emptyMessage={emptyMessage}
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
              {selectedGroupType?.isActive ? (
                <InactiveIcon fontSize="small" color="warning" />
              ) : (
                <ActiveIcon fontSize="small" color="success" />
              )}
            </ListItemIcon>
            <ListItemText>
              {selectedGroupType?.isActive ? 'Desativar' : 'Ativar'}
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