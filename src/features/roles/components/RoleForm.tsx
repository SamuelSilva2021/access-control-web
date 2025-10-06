import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Alert,
  Stack
} from '@mui/material';
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../../../shared/types';

interface RoleFormProps {
  role?: Role | null;
  onSubmit: (data: CreateRoleRequest | UpdateRoleRequest) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

interface FormData {
  name: string;
  description: string;
  code: string;
  isActive: boolean;
  tenantId?: string;
  applicationId?: string;
}

/**
 * Componente de formulário para criação e edição de roles
 * 
 * Features:
 * - Formulário responsivo com validação
 * - Modo criação e edição
 * - Campos otimizados para role
 * - Validação em tempo real
 * - Estados de loading e error
 * - Auto-preenchimento para edição
 */
export const RoleForm = ({
  role,
  onSubmit,
  loading = false,
  error
}: RoleFormProps) => {
  
  // Estado do formulário
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    code: '',
    isActive: true,
    tenantId: undefined,
    applicationId: undefined,
  });

  // Estado de validação
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Modo de edição
  const isEditing = Boolean(role);

  // Preenche formulário quando role é fornecido
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        code: role.code || '',
        isActive: role.isActive,
        tenantId: role.tenantId,
        applicationId: role.applicationId,
      });
    } else {
      // Reset para modo criação
      setFormData({
        name: '',
        description: '',
        code: '',
        isActive: true,
        tenantId: undefined,
        applicationId: undefined,
      });
    }
    setFieldErrors({});
  }, [role]);

  /**
   * Validação dos campos
   */
  const validateField = (name: keyof FormData, value: any): string => {
    switch (name) {
      case 'name':
        if (!value || value.trim().length === 0) {
          return 'Nome é obrigatório';
        }
        if (value.trim().length < 2) {
          return 'Nome deve ter pelo menos 2 caracteres';
        }
        if (value.trim().length > 255) {
          return 'Nome deve ter no máximo 255 caracteres';
        }
        return '';

      case 'description':
        if (!value || value.trim().length === 0) {
          return 'Descrição é obrigatória';
        }
        if (value.trim().length < 5) {
          return 'Descrição deve ter pelo menos 5 caracteres';
        }
        if (value.length > 500) {
          return 'Descrição deve ter no máximo 500 caracteres';
        }
        return '';

      case 'code':
        if (value && value.length > 50) {
          return 'Código deve ter no máximo 50 caracteres';
        }
        // Código deve ser apenas maiúsculas, números, underscore e hífen
        if (value && !/^[A-Z0-9_-]*$/.test(value)) {
          return 'Código deve conter apenas letras maiúsculas, números, _ e -';
        }
        return '';

      default:
        return '';
    }
  };

  /**
   * Valida todo o formulário
   */
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    (Object.keys(formData) as Array<keyof FormData>).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle mudança de campo
   */
  const handleFieldChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.type === 'checkbox' 
      ? event.target.checked 
      : event.target.value;

    // Aplica uppercase para o campo code
    if (field === 'code' && typeof value === 'string') {
      value = value.toUpperCase();
    }

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpa erro do campo quando usuário começa a digitar
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Handle submit do formulário
   * 
   * CORREÇÃO: Inclui tenantId e applicationId na atualização para evitar 
   * que o backend os altere para null inadvertidamente
   */
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      // Prepara dados para submissão
      let submitData: CreateRoleRequest | UpdateRoleRequest;
      
      if (isEditing) {
        // Para edição, inclui tenantId e applicationId para preservar valores originais
        submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          code: formData.code.trim().toUpperCase() || undefined,
          isActive: formData.isActive,
          tenantId: formData.tenantId,
          applicationId: formData.applicationId,
        };
      } else {
        // Para criação, só inclui campos básicos
        submitData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          code: formData.code.trim().toUpperCase() || undefined,
        };
      }

      await onSubmit(submitData);
      
    } catch (err) {
      console.error('Erro no submit do formulário:', err);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate id="role-form">
      
      {/* Título do formulário */}
      <Typography variant="h6" gutterBottom>
        {isEditing ? 'Editar Role' : 'Novo Role'}
      </Typography>

      {/* Erro geral */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        
        {/* Nome e Código */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Nome do Role"
            name="name"
            value={formData.name}
            onChange={handleFieldChange('name')}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name || 'Nome identificador do role (ex: Administrador)'}
            required
            fullWidth
            disabled={loading}
            autoFocus={!isEditing}
          />

          <TextField
            label="Código"
            name="code"
            value={formData.code}
            onChange={handleFieldChange('code')}
            error={Boolean(fieldErrors.code)}
            helperText={fieldErrors.code || 'Código único do role (opcional) - letras maiúsculas, números, _ e -'}
            fullWidth
            disabled={loading}
            placeholder="ex: ADMIN, USER, MANAGER"
            inputProps={{
              style: { fontFamily: 'monospace', fontWeight: 600 }
            }}
          />
        </Stack>

        {/* Descrição */}
        <TextField
          label="Descrição"
          name="description"
          value={formData.description}
          onChange={handleFieldChange('description')}
          error={Boolean(fieldErrors.description)}
          helperText={fieldErrors.description || 'Descrição detalhada do papel no sistema (obrigatório)'}
          required
          fullWidth
          multiline
          rows={3}
          disabled={loading}
          placeholder="Descreva as responsabilidades e funcionalidades deste role..."
        />

        {/* Status (apenas para edição) */}
        {isEditing && (
          <FormControlLabel
            control={
              <Switch
                checked={formData.isActive}
                onChange={handleFieldChange('isActive')}
                disabled={loading}
                color="primary"
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  Role {formData.isActive ? 'Ativo' : 'Inativo'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formData.isActive 
                    ? 'Role disponível para uso no sistema'
                    : 'Role desabilitado e não disponível para novos usuários'
                  }
                </Typography>
              </Box>
            }
          />
        )}

      </Stack>

      {/* Botão de submit é renderizado pelo componente pai (Dialog) */}
    </Box>
  );
};