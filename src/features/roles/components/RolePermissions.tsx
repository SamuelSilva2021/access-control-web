import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useRoles } from '../hooks';
import { PermissionService, ModuleService } from '../../../shared/services';
import type { Role, Permission, Module } from '../../../shared/types';

interface RolePermissionsProps {
  /** Se o dialog está aberto */
  open: boolean;
  /** Função para fechar o dialog */
  onClose: () => void;
  /** Role selecionado para gerenciar permissões */
  role: Role | null;
}

interface PermissionsByModule {
  [moduleId: string]: {
    module: Module;
    permissions: Permission[];
  };
}

/**
 * Componente para gerenciar permissões de um role
 * 
 * Features:
 * - Exibição hierárquica por módulo
 * - Seleção múltipla de permissões
 * - Visualização de operações por permissão
 * - Estados de loading e error
 * - Integração com API via hooks
 * 
 * Baseado na análise da API saas-authentication-api:
 * - GET /api/roles/{roleId}/permissions - Buscar permissões do role
 * - POST /api/roles/{roleId}/permissions - Atribuir permissões
 * - DELETE /api/roles/{roleId}/permissions - Remover permissões
 * - GET /api/permissions - Buscar todas as permissões
 * - GET /api/modules - Buscar módulos para organização
 */
export const RolePermissions: React.FC<RolePermissionsProps> = ({
  open,
  onClose,
  role
}) => {
  // ========== ESTADO ==========
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [permissionsByModule, setPermissionsByModule] = useState<PermissionsByModule>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== HOOKS ==========
  const { 
    getRolePermissions, 
    assignPermissionsToRole, 
    removePermissionsFromRole 
  } = useRoles({ autoLoad: false });

  // ========== EFEITOS ==========

  /**
   * Carrega dados quando o dialog é aberto
   */
  useEffect(() => {
    if (open && role) {
      loadData();
    }
  }, [open, role]);

  /**
   * Organiza permissões por módulo quando os dados mudam
   */
  useEffect(() => {
    if (allPermissions.length > 0 && allModules.length > 0) {
      organizePermissionsByModule();
    }
  }, [allPermissions, allModules]);

  /**
   * Atualiza seleções quando permissões do role mudam
   */
  useEffect(() => {
    const selected = new Set(rolePermissions.map(p => p.id));
    setSelectedPermissions(selected);
  }, [rolePermissions]);

  // ========== FUNÇÕES ==========

  /**
   * Carrega todos os dados necessários
   */
  const loadData = async () => {
    if (!role) return;

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 RolePermissions: Carregando dados...', role.id);

      // Carrega dados em paralelo
      const [permissions, modules, currentRolePermissions] = await Promise.all([
        PermissionService.getPermissions(),
        ModuleService.getModules(),
        getRolePermissions(role.id)
      ]);

      console.log('✅ RolePermissions: Dados carregados', {
        permissions: permissions.data?.length || 0,
        modules: modules.data?.length || 0,
        rolePermissions: currentRolePermissions.length
      });

      setAllPermissions(permissions.data || []);
      setAllModules(modules.data || []);
      setRolePermissions(currentRolePermissions);

    } catch (err: any) {
      console.error('❌ RolePermissions: Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Organiza permissões por módulo para exibição hierárquica
   */
  const organizePermissionsByModule = () => {
    const organized: PermissionsByModule = {};

    allPermissions.forEach(permission => {
      const moduleId = permission.moduleId || 'no-module';
      
      if (!organized[moduleId]) {
        const module = allModules.find(m => m.id === moduleId) || {
          id: 'no-module',
          name: 'Sem Módulo',
          description: 'Permissões sem módulo definido',
          url: '',
          moduleKey: 'no-module',
          isActive: true,
          createdAt: new Date().toISOString()
        };
        
        organized[moduleId] = {
          module,
          permissions: []
        };
      }
      
      organized[moduleId].permissions.push(permission);
    });

    // Ordena permissões dentro de cada módulo
    Object.values(organized).forEach(group => {
      group.permissions.sort((a, b) => a.name.localeCompare(b.name));
    });

    setPermissionsByModule(organized);
  };

  /**
   * Altera seleção de uma permissão
   */
  const handlePermissionToggle = (permissionId: string) => {
    const newSelected = new Set(selectedPermissions);
    
    if (newSelected.has(permissionId)) {
      newSelected.delete(permissionId);
    } else {
      newSelected.add(permissionId);
    }
    
    setSelectedPermissions(newSelected);
  };

  /**
   * Seleciona/deseleciona todas as permissões de um módulo
   */
  const handleModuleToggle = (moduleId: string) => {
    const modulePermissions = permissionsByModule[moduleId]?.permissions || [];
    const modulePermissionIds = modulePermissions.map(p => p.id);
    const allSelected = modulePermissionIds.every(id => selectedPermissions.has(id));
    
    const newSelected = new Set(selectedPermissions);
    
    if (allSelected) {
      // Remove todas do módulo
      modulePermissionIds.forEach(id => newSelected.delete(id));
    } else {
      // Adiciona todas do módulo
      modulePermissionIds.forEach(id => newSelected.add(id));
    }
    
    setSelectedPermissions(newSelected);
  };

  /**
   * Salva as alterações nas permissões
   */
  const handleSave = async () => {
    if (!role) return;

    setSaving(true);
    setError(null);

    try {
      console.log('🔄 RolePermissions: Salvando alterações...', {
        roleId: role.id,
        selectedCount: selectedPermissions.size,
        currentCount: rolePermissions.length
      });

      const currentPermissionIds = new Set(rolePermissions.map(p => p.id));
      const newSelectedIds = Array.from(selectedPermissions);

      // Identifica permissões a adicionar e remover
      const toAdd = newSelectedIds.filter(id => !currentPermissionIds.has(id));
      const toRemove = rolePermissions
        .filter(p => !selectedPermissions.has(p.id))
        .map(p => p.id);

      // Executa alterações
      const promises: Promise<void>[] = [];

      if (toAdd.length > 0) {
        console.log('➕ RolePermissions: Adicionando permissões:', toAdd.length);
        promises.push(assignPermissionsToRole(role.id, toAdd));
      }

      if (toRemove.length > 0) {
        console.log('➖ RolePermissions: Removendo permissões:', toRemove.length);
        promises.push(removePermissionsFromRole(role.id, toRemove));
      }

      if (promises.length > 0) {
        await Promise.all(promises);
        
        // Recarrega permissões do role
        const updatedPermissions = await getRolePermissions(role.id);
        setRolePermissions(updatedPermissions);
      }

      console.log('✅ RolePermissions: Alterações salvas com sucesso');
      onClose();

    } catch (err: any) {
      console.error('❌ RolePermissions: Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar permissões');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Verifica se um módulo tem todas as permissões selecionadas
   */
  const isModuleFullySelected = (moduleId: string): boolean => {
    const modulePermissions = permissionsByModule[moduleId]?.permissions || [];
    return modulePermissions.length > 0 && 
           modulePermissions.every(p => selectedPermissions.has(p.id));
  };

  /**
   * Verifica se um módulo tem algumas permissões selecionadas
   */
  const isModulePartiallySelected = (moduleId: string): boolean => {
    const modulePermissions = permissionsByModule[moduleId]?.permissions || [];
    return modulePermissions.some(p => selectedPermissions.has(p.id)) &&
           !isModuleFullySelected(moduleId);
  };

  // ========== RENDER ==========

  if (!role) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh', display: 'flex', flexDirection: 'column' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <SecurityIcon color="primary" />
          <Typography variant="h6" component="span">
            Gerenciar Permissões
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Role: <strong>{role.name}</strong>
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ flex: 1, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Carregando permissões...
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Selecione as permissões que este role deve ter acesso.
                As permissões estão organizadas por módulo.
              </Typography>
            </Box>

            {Object.entries(permissionsByModule).map(([moduleId, group]) => (
              <Accordion key={moduleId} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={isModuleFullySelected(moduleId)}
                          indeterminate={isModulePartiallySelected(moduleId)}
                          onChange={() => handleModuleToggle(moduleId)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label=""
                      sx={{ mr: 0 }}
                    />
                    <Box flex={1}>
                      <Typography variant="subtitle1" fontWeight="medium">
                        {group.module.name}
                      </Typography>
                      {group.module.description && (
                        <Typography variant="body2" color="text.secondary">
                          {group.module.description}
                        </Typography>
                      )}
                    </Box>
                    <Chip
                      size="small"
                      label={`${group.permissions.filter(p => selectedPermissions.has(p.id)).length}/${group.permissions.length}`}
                      color={isModuleFullySelected(moduleId) ? "primary" : isModulePartiallySelected(moduleId) ? "secondary" : "default"}
                    />
                  </Box>
                </AccordionSummary>
                
                <AccordionDetails>
                  <Box display="grid" gridTemplateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={1}>
                    {group.permissions.map((permission) => (
                      <Box key={permission.id}>
                        <Box 
                          sx={{ 
                            p: 2, 
                            border: 1, 
                            borderColor: 'divider', 
                            borderRadius: 1,
                            bgcolor: selectedPermissions.has(permission.id) ? 'action.selected' : 'transparent'
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedPermissions.has(permission.id)}
                                onChange={() => handlePermissionToggle(permission.id)}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {permission.name}
                                </Typography>
                                {permission.description && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    {permission.description}
                                  </Typography>
                                )}
                                {permission.operations && permission.operations.length > 0 && (
                                  <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                                    {permission.operations.map((op) => (
                                      <Chip
                                        key={op.id}
                                        label={op.value || op.name}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.6rem', height: 20 }}
                                      />
                                    ))}
                                  </Box>
                                )}
                              </Box>
                            }
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}

            {Object.keys(permissionsByModule).length === 0 && !loading && (
              <Box textAlign="center" py={4}>
                <Typography variant="body1" color="text.secondary">
                  Nenhuma permissão encontrada
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          startIcon={<CloseIcon />}
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || saving}
          startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
        >
          {saving ? 'Salvando...' : 'Salvar Permissões'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};