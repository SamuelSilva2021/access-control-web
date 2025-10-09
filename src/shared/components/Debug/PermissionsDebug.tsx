import React from 'react';
import { Box, Typography, Chip, Paper } from '@mui/material';
import { usePermissions, usePermissionStore } from '../../stores/permission.store';
import { ModuleKey } from '../../types/permission.types';
import type { OperationType } from '../../types/permission.types';

export const PermissionsDebug: React.FC = () => {
  const { getAccessibleModules, getModuleOperations, hasAccess } = usePermissions();
  const permissions = usePermissionStore(state => state.permissions);
  
  // Só mostrar em desenvolvimento
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  const accessibleModules = getAccessibleModules();

  return (
    <Paper 
      elevation={3}
      sx={{ 
        position: 'fixed', 
        bottom: 16, 
        right: 16, 
        p: 2, 
        maxWidth: 300,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider'
      }}
    >
      <Typography variant="h6" gutterBottom>
        🔍 Debug - Permissões
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Status:</strong> {permissions ? '✅ Carregadas' : '❌ Não carregadas'}
      </Typography>
      
      {permissions && (
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>User:</strong> {permissions.userId.slice(0, 8)}...
        </Typography>
      )}
      
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Módulos Acessíveis:
      </Typography>
      
      {accessibleModules.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum módulo acessível
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {Object.values(ModuleKey).map((moduleKey: string) => {
            const operations = getModuleOperations(moduleKey);
            const hasModule = hasAccess(moduleKey);
            
            if (!hasModule) return null;
            
            return (
              <Box key={moduleKey}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {moduleKey}:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {operations.map((operation: OperationType) => (
                    <Chip
                      key={operation}
                      label={operation}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
      
      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        Este debug só aparece em desenvolvimento
      </Typography>
    </Paper>
  );
};