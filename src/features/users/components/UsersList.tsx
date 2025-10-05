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
  TablePagination,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  ToggleOff as InactiveIcon,
  ToggleOn as ActiveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  VerifiedUser as VerifiedIcon,
  Cancel as UnverifiedIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import type { UserAccount } from '../../../shared/types';

interface UsersListProps {
  users: UserAccount[];
  loading?: boolean;
  onEdit: (user: UserAccount) => void;
  onDelete: (user: UserAccount) => void;
  onToggleStatus: (user: UserAccount) => void;
  onManageGroups: (user: UserAccount) => void;
  
  // Paginação
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

/**
 * Componente de listagem de usuários com tabela paginada
 * 
 * Features:
 * - Tabela responsiva com Material-UI
 * - Chips coloridos para status
 * - Ações inline (editar, excluir, toggle status)
 * - Paginação integrada
 * - Indicadores visuais (avatars, badges)
 * - Tooltips informativos
 * - Loading states
 */
export function UsersList({ 
  users, 
  loading = false,
  onEdit, 
  onDelete, 
  onToggleStatus,
  onManageGroups,
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange
}: UsersListProps) {

  /**
   * Retorna cor do chip baseado no status
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Inactive': return 'default';
      case 'Pending': return 'warning';
      case 'Suspended': return 'error';
      default: return 'default';
    }
  };

  /**
   * Retorna texto do status em português
   */
  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Ativo';
      case 'Inactive': return 'Inativo';
      case 'Pending': return 'Pendente';
      case 'Suspended': return 'Suspenso';
      default: return status;
    }
  };

  /**
   * Gera iniciais para o avatar
   */
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || '?';
  };

  /**
   * Manipula mudança de página
   */
  const handlePageChange = (_event: unknown, newPage: number) => {
    onPageChange(newPage + 1); // Material-UI usa índice zero
  };

  /**
   * Manipula mudança de tamanho da página
   */
  const handlePageSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange(newPageSize);
    onPageChange(1); // Volta para primeira página
  };

  if (loading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          Carregando usuários...
        </Typography>
      </Paper>
    );
  }

  if (!users || users.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <PersonIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Nenhum usuário encontrado
        </Typography>
        <Typography color="text.secondary">
          Comece criando seu primeiro usuário do sistema.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Usuário</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Telefone</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Email Verificado</TableCell>
              <TableCell align="center">Último Login</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                hover
                sx={{ 
                  '&:hover': { backgroundColor: 'action.hover' },
                  opacity: user.status === 'Active' ? 1 : 0.7
                }}
              >
                {/* Coluna Usuário */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar 
                      sx={{ 
                        width: 40, 
                        height: 40,
                        bgcolor: user.status === 'Active' ? 'primary.main' : 'grey.400',
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(user.firstName, user.lastName)}
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600}
                        sx={{ 
                          color: user.status === 'Active' ? 'text.primary' : 'text.secondary'
                        }}
                      >
                        {user.fullName || `${user.firstName} ${user.lastName}`.trim()}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                      >
                        <PersonIcon sx={{ fontSize: 12 }} />
                        @{user.username}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                {/* Coluna Email */}
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {user.email}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Coluna Telefone */}
                <TableCell>
                  {user.phoneNumber ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {user.phoneNumber}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </TableCell>

                {/* Coluna Status */}
                <TableCell align="center">
                  <Chip
                    label={getStatusText(user.status)}
                    color={getStatusColor(user.status) as any}
                    size="small"
                    variant={user.status === 'Active' ? 'filled' : 'outlined'}
                  />
                </TableCell>

                {/* Coluna Email Verificado */}
                <TableCell align="center">
                  <Tooltip title={user.isEmailVerified ? 'Email verificado' : 'Email não verificado'}>
                    {user.isEmailVerified ? (
                      <VerifiedIcon sx={{ color: 'success.main', fontSize: 20 }} />
                    ) : (
                      <UnverifiedIcon sx={{ color: 'warning.main', fontSize: 20 }} />
                    )}
                  </Tooltip>
                </TableCell>

                {/* Coluna Último Login */}
                <TableCell align="center">
                  <Typography variant="body2" color="text.secondary">
                    {user.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Nunca'
                    }
                  </Typography>
                </TableCell>

                {/* Coluna Ações */}
                <TableCell align="center">
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                    {/* Toggle Status */}
                    <Tooltip title={user.status === 'Active' ? 'Desativar usuário' : 'Ativar usuário'}>
                      <IconButton
                        size="small"
                        onClick={() => onToggleStatus(user)}
                        color={user.status === 'Active' ? 'success' : 'default'}
                      >
                        {user.status === 'Active' ? <ActiveIcon /> : <InactiveIcon />}
                      </IconButton>
                    </Tooltip>

                    {/* Editar */}
                    <Tooltip title="Editar usuário">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(user)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Gerenciar Grupos */}
                    <Tooltip title="Gerenciar grupos de acesso">
                      <IconButton
                        size="small"
                        onClick={() => onManageGroups(user)}
                        color="secondary"
                      >
                        <SecurityIcon />
                      </IconButton>
                    </Tooltip>

                    {/* Excluir */}
                    <Tooltip title="Excluir usuário">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(user)}
                        color="error"
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
        page={currentPage - 1} // Material-UI usa índice zero
        onPageChange={handlePageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={handlePageSizeChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Itens por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
        sx={{
          borderTop: 1,
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            px: 2
          }
        }}
      />
    </Paper>
  );
}