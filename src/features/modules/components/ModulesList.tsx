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
  Link,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { DataTable } from '../../../shared/components/data-display/DataTable';
import type { DataTableColumn } from '../../../shared/components/data-display/DataTable';
import type { Module } from '../../../shared/types';
import { formatDate } from '../../../shared/utils/date.utils';

export interface ModulesListProps {
  modules: Module[];
  loading?: boolean;
  onEdit: (module: Module) => void;
  onDelete: (module: Module) => void;
  onToggleStatus?: (module: Module) => void;
  emptyMessage?: string;
}

/**
 * Lista responsiva de Módulos com ações inline
 * Exibe dados de forma clara e acessível
 */
export const ModulesList = ({
  modules,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  emptyMessage = 'Nenhum módulo encontrado',
}: ModulesListProps) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, module: Module) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedModule(module);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedModule(null);
  };

  const handleEdit = () => {
    if (selectedModule) {
      onEdit(selectedModule);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedModule) {
      onDelete(selectedModule);
      handleMenuClose();
    }
  };

  const handleToggleStatus = () => {
    if (selectedModule && onToggleStatus) {
      onToggleStatus(selectedModule);
      handleMenuClose();
    }
  };

  const columns: DataTableColumn<Module>[] = [
    {
      id: 'name',
      label: 'Nome',
      minWidth: 200,
      format: (_, module: Module) => (
        <Box>
          <Box sx={{ fontWeight: 600, fontSize: '0.875rem' }}>
            {module.name}
          </Box>
          {module.description && (
            <Box sx={{ fontSize: '0.75rem', color: 'text.secondary', mt: 0.5 }}>
              {module.description}
            </Box>
          )}
        </Box>
      ),
    },
    {
      id: 'url',
      label: 'URL',
      minWidth: 250,
      format: (_, module: Module) => 
        module.url ? (
          <Link
            href={module.url}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              fontSize: '0.875rem',
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {module.url.length > 30 ? `${module.url.substring(0, 30)}...` : module.url}
            <OpenInNewIcon sx={{ fontSize: 14 }} />
          </Link>
        ) : (
          <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            —
          </Box>
        ),
    },
    {
      id: 'moduleKey',
      label: 'Chave',
      minWidth: 120,
      format: (_, module: Module) => 
        module.moduleKey ? (
          <Chip
            label={module.moduleKey}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        ) : (
          <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            —
          </Box>
        ),
    },
    {
      id: 'code',
      label: 'Código',
      minWidth: 100,
      format: (_, module: Module) => 
        module.code ? (
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {module.code}
          </Box>
        ) : (
          <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            —
          </Box>
        ),
    },
    {
      id: 'isActive',
      label: 'Status',
      minWidth: 100,
      format: (_, module: Module) => (
        <Chip
          icon={module.isActive ? <ActiveIcon /> : <InactiveIcon />}
          label={module.isActive ? 'Ativo' : 'Inativo'}
          size="small"
          color={module.isActive ? 'success' : 'default'}
          variant={module.isActive ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      id: 'createdAt',
      label: 'Criado em',
      minWidth: 120,
      format: (_, module: Module) => (
        <Box sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
          {formatDate(module.createdAt)}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: 'Ações',
      minWidth: 80,
      align: 'center',
      format: (_, module: Module) => (
        <Tooltip title="Mais opções">
          <IconButton
            size="small"
            onClick={(event) => handleMenuOpen(event, module)}
            sx={{ ml: 1 }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  if (modules.length === 0 && !loading) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>Nenhum módulo encontrado</AlertTitle>
        {emptyMessage}
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        data={modules}
        columns={columns}
        emptyMessage={emptyMessage}
        maxHeight={600}
      />

      {/* Menu de Ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: {
            mt: 1,
            minWidth: 160,
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
            },
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
          <MenuItem onClick={handleToggleStatus}>
            <ListItemIcon>
              {selectedModule?.isActive ? (
                <InactiveIcon fontSize="small" />
              ) : (
                <ActiveIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {selectedModule?.isActive ? 'Desativar' : 'Ativar'}
            </ListItemText>
          </MenuItem>
        )}

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};