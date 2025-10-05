import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  IconButton
} from '@mui/material';
import {
  Group as GroupIcon,
  Security as SecurityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useUsers } from '../hooks/useUsers';
import { AccessGroupService } from '../../../shared/services';
import type { UserAccount, AccessGroup } from '../../../shared/types';

interface UserAccessGroupsProps {
  open: boolean;
  onClose: () => void;
  user: UserAccount | null;
}

export function UserAccessGroups({ open, onClose, user }: UserAccessGroupsProps) {
  const { 
    getUserAccessGroups, 
    assignUserAccessGroups, 
    revokeUserAccessGroup,
    loading,
    error 
  } = useUsers({ autoLoad: false });

  const [userGroups, setUserGroups] = useState<AccessGroup[]>([]);
  const [allGroups, setAllGroups] = useState<AccessGroup[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Carrega dados quando o dialog é aberto
  useEffect(() => {
    if (open && user) {
      loadData();
    }
  }, [open, user]);

  const loadData = async () => {
    if (!user) return;

    setLocalLoading(true);
    setLocalError(null);

    try {
      // Carrega grupos do usuário e todos os grupos disponíveis em paralelo
      const [userGroupsData, allGroupsData] = await Promise.all([
        getUserAccessGroups(user.id),
        AccessGroupService.getAllAccessGroups()
      ]);

      setUserGroups(userGroupsData);
      setAllGroups(allGroupsData);
      
      // Pré-seleciona os grupos já atribuídos ao usuário
      setSelectedGroups(userGroupsData.map(group => group.id));
      
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setLocalError(err.message || 'Erro ao carregar dados');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    setSelectedGroups(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });
  };

  const handleSave = async () => {
    if (!user) return;

    setLocalLoading(true);
    setLocalError(null);

    try {
      const currentGroupIds = userGroups.map(group => group.id);
      const newGroupIds = selectedGroups;

      // Grupos a serem adicionados
      const groupsToAdd = newGroupIds.filter(id => !currentGroupIds.includes(id));
      
      // Grupos a serem removidos
      const groupsToRemove = currentGroupIds.filter(id => !newGroupIds.includes(id));

      // Executa as operações
      if (groupsToAdd.length > 0) {
        await assignUserAccessGroups(user.id, groupsToAdd);
      }

      // Remove grupos um por vez (conforme API)
      for (const groupId of groupsToRemove) {
        await revokeUserAccessGroup(user.id, groupId);
      }

      // Recarrega dados para refletir as mudanças
      await loadData();
      
      // Fecha o dialog
      onClose();
      
    } catch (err: any) {
      console.error('Erro ao salvar grupos:', err);
      setLocalError(err.message || 'Erro ao salvar alterações');
    } finally {
      setLocalLoading(false);
    }
  };

  const isLoading = loading || localLoading;
  const displayError = error || localError;

  const getGroupsByType = () => {
    const groupedByType: Record<string, AccessGroup[]> = {};
    
    allGroups.forEach(group => {
      const type = group.groupTypeName || 'Outros';
      if (!groupedByType[type]) {
        groupedByType[type] = [];
      }
      groupedByType[type].push(group);
    });
    
    return groupedByType;
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon />
            <div>
              <Typography variant="h6">
                Grupos de Acesso
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.fullName || user?.email}
              </Typography>
            </div>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {displayError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {displayError}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Grupos atuais */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon fontSize="small" />
                Grupos Atuais ({userGroups.length})
              </Typography>
              
              {userGroups.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {userGroups.map(group => (
                    <Chip
                      key={group.id}
                      label={group.name}
                      color="primary"
                      variant="filled"
                      size="small"
                      icon={<GroupIcon />}
                    />
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  Nenhum grupo atribuído
                </Typography>
              )}
            </Box>

            <Divider />

            {/* Todos os grupos disponíveis */}
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Selecionar Grupos
              </Typography>

              <Stack spacing={2}>
                {Object.entries(getGroupsByType()).map(([typeName, groups]) => (
                  <Card key={typeName} variant="outlined">
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        {typeName}
                      </Typography>
                      
                      <Stack spacing={1}>
                        {groups.map(group => (
                          <FormControlLabel
                            key={group.id}
                            control={
                              <Checkbox
                                checked={selectedGroups.includes(group.id)}
                                onChange={() => handleGroupToggle(group.id)}
                                disabled={!group.isActive}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2">
                                  {group.name}
                                </Typography>
                                {group.description && (
                                  <Typography variant="caption" color="text.secondary">
                                    {group.description}
                                  </Typography>
                                )}
                                {!group.isActive && (
                                  <Chip label="Inativo" size="small" color="warning" sx={{ ml: 1 }} />
                                )}
                              </Box>
                            }
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>

              {allGroups.length === 0 && (
                <Typography color="text.secondary" sx={{ fontStyle: 'italic', textAlign: 'center', p: 2 }}>
                  Nenhum grupo disponível
                </Typography>
              )}
            </Box>
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : <SecurityIcon />}
        >
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}