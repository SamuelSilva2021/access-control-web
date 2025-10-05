import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  FormGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useRoles } from '../hooks';
import { AccessGroupService } from '../../../shared/services';
import type { Role, AccessGroup } from '../../../shared/types';

interface RoleAccessGroupsProps {
  open: boolean;
  onClose: () => void;
  role: Role | null;
}

/**
 * Dialog para gerenciar grupos de acesso de um role
 * 
 * Features:
 * - Lista todos os grupos de acesso disponíveis
 * - Mostra grupos já associados ao role
 * - Permite associar/desassociar grupos
 * - Organização por tipo de grupo
 * - Estados de loading e error
 * - Validação e feedback
 */
export const RoleAccessGroups = ({ 
  open, 
  onClose, 
  role 
}: RoleAccessGroupsProps) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allGroups, setAllGroups] = useState<AccessGroup[]>([]);
  const [roleGroups, setRoleGroups] = useState<AccessGroup[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(new Set());

  const { 
    getRoleAccessGroups, 
    assignAccessGroupsToRole, 
    removeAccessGroupsFromRole 
  } = useRoles();

  // Carregar dados quando dialog abre
  useEffect(() => {
    if (open && role) {
      loadData();
    } else {
      resetState();
    }
  }, [open, role]);

  const resetState = () => {
    setAllGroups([]);
    setRoleGroups([]);
    setSelectedGroupIds(new Set());
    setError(null);
    setLoading(false);
    setSaving(false);
  };

  const loadData = async () => {
    if (!role) return;

    setLoading(true);
    setError(null);

    try {
      // Carregar grupos de acesso do role e todos os grupos disponíveis
      const [currentGroups, availableGroups] = await Promise.all([
        getRoleAccessGroups(role.id),
        AccessGroupService.getAllAccessGroups(),
      ]);

      console.log('🔄 RoleAccessGroups: Dados carregados:', {
        role: role.name,
        currentGroups: currentGroups.length,
        availableGroups: availableGroups.length,
      });

      setRoleGroups(currentGroups);
      setAllGroups(availableGroups);
      
      // Marcar grupos já associados como selecionados
      const currentGroupIds = new Set(currentGroups.map((g: AccessGroup) => g.id));
      setSelectedGroupIds(currentGroupIds);

    } catch (err: any) {
      console.error('❌ RoleAccessGroups: Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar grupos de acesso');
    } finally {
      setLoading(false);
    }
  };

  const handleGroupToggle = (groupId: string) => {
    const newSelected = new Set(selectedGroupIds);
    
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    
    setSelectedGroupIds(newSelected);
  };

  const handleSave = async () => {
    if (!role) return;

    setSaving(true);
    setError(null);

    try {
      const currentGroupIds = new Set(roleGroups.map(g => g.id));
      const newSelectedIds = selectedGroupIds;

      // Grupos para adicionar (novos selecionados)
      const toAdd = Array.from(newSelectedIds).filter(id => !currentGroupIds.has(id));
      
      // Grupos para remover (não selecionados que estavam associados)
      const toRemove = Array.from(currentGroupIds).filter(id => !newSelectedIds.has(id));

      console.log('💾 RoleAccessGroups: Salvando alterações:', {
        role: role.name,
        toAdd: toAdd.length,
        toRemove: toRemove.length,
      });

      // Executar operações
      const promises = [];
      
      if (toAdd.length > 0) {
        promises.push(assignAccessGroupsToRole(role.id, toAdd));
      }
      
      if (toRemove.length > 0) {
        promises.push(removeAccessGroupsFromRole(role.id, toRemove));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        console.log('✅ RoleAccessGroups: Grupos de acesso atualizados com sucesso');
      }

      onClose();

    } catch (err: any) {
      console.error('❌ RoleAccessGroups: Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar grupos de acesso');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onClose();
    }
  };

  // Agrupar por tipo de grupo
  const groupsByType = allGroups.reduce((acc, group) => {
    const groupType = group.groupTypeName || 'Outros';
    if (!acc[groupType]) {
      acc[groupType] = [];
    }
    acc[groupType].push(group);
    return acc;
  }, {} as Record<string, AccessGroup[]>);

  const getGroupTypeTitle = (groupType: string): string => {
    const typeMap: Record<string, string> = {
      'Sistema': '🔧 Sistema',
      'Funcional': '⚙️ Funcional', 
      'Departamental': '🏢 Departamental',
      'Projeto': '📋 Projeto',
      'Outros': '📁 Outros',
    };
    return typeMap[groupType] || `📁 ${groupType}`;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: '70vh', maxHeight: '90vh' }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon color="primary" />
          <Box>
            <Typography variant="h6">
              Grupos de Acesso do Role
            </Typography>
            {role && (
              <Typography variant="body2" color="text.secondary">
                {role.name}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Carregando grupos de acesso...
            </Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && allGroups.length === 0 && (
          <Alert severity="info">
            Nenhum grupo de acesso disponível.
          </Alert>
        )}

        {!loading && allGroups.length > 0 && (
          <Box>
            {/* Resumo */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>{selectedGroupIds.size}</strong> de <strong>{allGroups.length}</strong> grupos selecionados
              </Typography>
              
              {roleGroups.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Grupos atuais: 
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {roleGroups.slice(0, 5).map(group => (
                      <Chip
                        key={group.id}
                        label={group.name}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                    {roleGroups.length > 5 && (
                      <Chip
                        label={`+${roleGroups.length - 5} mais`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>
              )}
            </Box>

            {/* Lista de grupos por tipo */}
            {Object.entries(groupsByType).map(([groupType, groups]) => (
              <Accordion key={groupType} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                    {getGroupTypeTitle(groupType)}
                  </Typography>
                  <Chip 
                    label={groups.length} 
                    size="small" 
                    sx={{ ml: 2 }}
                  />
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {groups.map(group => (
                      <FormControlLabel
                        key={group.id}
                        control={
                          <Checkbox
                            checked={selectedGroupIds.has(group.id)}
                            onChange={() => handleGroupToggle(group.id)}
                            disabled={saving}
                          />
                        }
                        label={
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {group.name}
                            </Typography>
                            {group.description && (
                              <Typography variant="caption" color="text.secondary">
                                {group.description}
                              </Typography>
                            )}
                            {!group.isActive && (
                              <Chip 
                                label="Inativo" 
                                size="small" 
                                variant="outlined" 
                                color="warning"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={saving}
          startIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || saving || allGroups.length === 0}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};