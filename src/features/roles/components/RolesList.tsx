import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Chip,
  Tooltip,
  Typography,
  Box,
  TablePagination
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff as InactiveIcon,
  ToggleOn as ActiveIcon,
  AdminPanelSettings as RoleIcon,
  Security as SecurityIcon,
  Key as PermissionIcon
} from '@mui/icons-material';
import type { Role } from '../../../shared/types';

interface RolesListProps {
  roles: Role[];
  loading?: boolean;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  onToggleStatus: (role: Role) => void;
  onManageGroups?: (role: Role) => void;
  onManagePermissions?: (role: Role) => void;
  // Paginação
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/**
 * Componente de lista de roles com tabela responsiva
 * 
 * Features:
 * - Tabela responsiva com dados dos roles
 * - Indicadores visuais de status (ativo/inativo)
 * - Ações inline (editar, deletar, toggle status)
 * - Paginação integrada
 * - Estados de loading
 * - Tooltips informativos
 */
export const RolesList = ({
  roles,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onManageGroups,
  onManagePermissions,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}: RolesListProps) => {

  const handlePageChange = (_: unknown, newPage: number) => {
    onPageChange(newPage + 1); // MUI usa 0-indexed, nossa API usa 1-indexed
  };

  if (roles.length === 0 && !loading) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <RoleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nenhum role encontrado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Comece criando o primeiro role do sistema
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nome</TableCell>
              <TableCell>Descrição</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Criado em</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {roles.map((role) => (
              <TableRow 
                key={role.id} 
                hover
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 },
                  opacity: role.isActive ? 1 : 0.6
                }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RoleIcon color="primary" fontSize="small" />
                    <Typography variant="body2" fontWeight="medium">
                      {role.name}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {role.description || '-'}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  {role.code ? (
                    <Chip 
                      label={role.code} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">-</Typography>
                  )}
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={role.isActive ? 'Ativo' : 'Inativo'}
                    color={role.isActive ? 'success' : 'default'}
                    size="small"
                    variant={role.isActive ? 'filled' : 'outlined'}
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(role.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </TableCell>
                
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    
                    {/* Gerenciar Permissões */}
                    {onManagePermissions && (
                      <Tooltip title="Gerenciar permissões">
                        <IconButton
                          size="small"
                          onClick={() => onManagePermissions(role)}
                          color="secondary"
                          disabled={loading}
                        >
                          <PermissionIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Gerenciar Grupos de Acesso */}
                    {onManageGroups && (
                      <Tooltip title="Gerenciar grupos de acesso">
                        <IconButton
                          size="small"
                          onClick={() => onManageGroups(role)}
                          color="info"
                          disabled={loading}
                        >
                          <SecurityIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {/* Toggle Status */}
                    <Tooltip title={role.isActive ? 'Desativar role' : 'Ativar role'}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleStatus(role)}
                        color={role.isActive ? 'warning' : 'success'}
                        disabled={loading}
                      >
                        {role.isActive ? <ActiveIcon /> : <InactiveIcon />}
                      </IconButton>
                    </Tooltip>

                    {/* Editar */}
                    <Tooltip title="Editar role">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(role)}
                        color="primary"
                        disabled={loading}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Deletar */}
                    <Tooltip title="Excluir role">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(role)}
                        color="error"
                        disabled={loading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>

                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={totalItems}
        page={currentPage - 1} // MUI usa 0-indexed
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[]} // Desabilita a opção de mudar rows per page
        labelDisplayedRows={({ from, to, count }) => 
          `${from}–${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        labelRowsPerPage=""
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            pl: 2,
            pr: 1,
          },
        }}
      />
    </Paper>
  );
};