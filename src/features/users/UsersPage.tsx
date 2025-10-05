import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Paper,
  TextField,
  InputAdornment,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import { UsersList } from './components/UsersList';
import { UserForm } from './components/UserForm';
import { UserAccessGroups } from './components/UserAccessGroups';
import { useUsers } from './hooks/useUsers';
import type { UserAccount } from '../../shared/types';

/**
 * Página principal de gerenciamento de usuários
 * 
 * Features:
 * - Listagem paginada de usuários
 * - Busca e filtros
 * - Criação e edição de usuários
 * - Exclusão com confirmação
 * - Toggle de status ativo/inativo
 * - Estados de loading e error
 * - Interface responsiva
 */
export function UsersPage() {
  // Hook de usuários
  const {
    users,
    loading,
    error,
    totalItems,
    currentPage,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    toggleStatus,
    clearError,
    refetch,
    validateEmail
  } = useUsers();

  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Estados do gerenciamento de grupos
  const [accessGroupsOpen, setAccessGroupsOpen] = useState(false);
  const [selectedUserForGroups, setSelectedUserForGroups] = useState<UserAccount | null>(null);

  /**
   * Abre formulário para criar novo usuário
   */
  const handleCreateUser = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  /**
   * Abre formulário para editar usuário
   */
  const handleEditUser = (user: UserAccount) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  /**
   * Fecha formulário
   */
  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedUser(null);
  };

  /**
   * Submete formulário (criar ou editar)
   */
  const handleSubmitForm = async (data: any) => {
    setFormLoading(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data);
      } else {
        await createUser(data);
      }
      handleCloseForm();
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Abre confirmação de exclusão
   */
  const handleDeleteUser = (user: UserAccount) => {
    setUserToDelete(user);
    setDeleteConfirmOpen(true);
  };

  /**
   * Abre gerenciamento de grupos para o usuário
   */
  const handleManageGroups = (user: UserAccount) => {
    setSelectedUserForGroups(user);
    setAccessGroupsOpen(true);
  };

  /**
   * Fecha gerenciamento de grupos
   */
  const handleCloseAccessGroups = () => {
    setAccessGroupsOpen(false);
    setSelectedUserForGroups(null);
  };

  /**
   * Confirma exclusão do usuário
   */
  const handleConfirmDelete = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setDeleteConfirmOpen(false);
        setUserToDelete(null);
      } catch (error) {
        // Erro já é tratado pelo hook
      }
    }
  };

  /**
   * Cancela exclusão
   */
  const handleCancelDelete = () => {
    setDeleteConfirmOpen(false);
    setUserToDelete(null);
  };

  /**
   * Alterna status do usuário
   */
  const handleToggleStatus = async (user: UserAccount) => {
    try {
      await toggleStatus(user);
    } catch (error) {
      // Erro já é tratado pelo hook
    }
  };

  /**
   * Manipula mudança de página
   */
  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  /**
   * Manipula mudança de tamanho da página
   */
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    loadUsers(1); // Volta para primeira página
  };

  /**
   * Recarrega dados
   */
  const handleRefresh = () => {
    refetch();
  };

  /**
   * Manipula busca (implementação futura)
   */
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // TODO: Implementar busca na API
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <PersonIcon sx={{ mr: 1, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            Usuários
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateUser}
            sx={{ ml: 2 }}
          >
            Novo Usuário
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Gerencie os usuários do sistema, suas permissões e status de acesso.
        </Typography>
      </Box>

      {/* Erro global */}
      {error && (
        <Alert 
          severity="error" 
          onClose={clearError}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Barra de ferramentas */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Busca */}
          <TextField
            placeholder="Buscar usuários..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 300, flexGrow: 1 }}
            size="small"
          />

          {/* Botão Atualizar */}
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Atualizar
          </Button>
        </Box>
      </Paper>

      {/* Lista de usuários */}
      <UsersList
        users={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onToggleStatus={handleToggleStatus}
        onManageGroups={handleManageGroups}
        totalItems={totalItems}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Formulário de usuário */}
      <UserForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmitForm}
        user={selectedUser}
        loading={formLoading}
        onValidateEmail={validateEmail}
      />

      {/* Confirmação de exclusão */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCancelDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja excluir o usuário <strong>{userToDelete?.fullName || userToDelete?.username}</strong>?
            <br /><br />
            Esta ação não pode ser desfeita e removerá permanentemente:
            <br />• Todos os dados do usuário
            <br />• Histórico de atividades
            <br />• Associações com grupos e roles
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gerenciamento de grupos de acesso */}
      <UserAccessGroups
        open={accessGroupsOpen}
        onClose={handleCloseAccessGroups}
        user={selectedUserForGroups}
      />
    </Container>
  );
}