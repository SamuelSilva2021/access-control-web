import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import type { GroupType, CreateGroupTypeRequest, UpdateGroupTypeRequest } from '../../../shared/types';

export interface GroupTypeFormData {
  name: string;
  description: string;
  code: string;
  isActive: boolean;
}

export interface GroupTypeFormProps {
  initialData?: GroupType | null;
  onSubmit: (data: CreateGroupTypeRequest | UpdateGroupTypeRequest) => void;
  isSubmitting?: boolean;
}

/**
 * Formulário reutilizável para criar/editar Group Types
 * Validação client-side e UX otimizada
 */
export const GroupTypeForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}: GroupTypeFormProps) => {
  const [formData, setFormData] = useState<GroupTypeFormData>({
    name: '',
    description: '',
    code: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche formulário para edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        code: initialData.code,
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  // Validation helpers
  const validateField = (name: string, value: string) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
        if (value.length > 100) return 'Nome deve ter no máximo 100 caracteres';
        break;
      case 'code':
        if (!value.trim()) return 'Código é obrigatório';
        if (!/^[A-Z0-9_]+$/.test(value)) return 'Código deve conter apenas letras maiúsculas, números e underscore';
        if (value.length < 2) return 'Código deve ter pelo menos 2 caracteres';
        if (value.length > 50) return 'Código deve ter no máximo 50 caracteres';
        break;
      case 'description':
        if (value && value.length > 500) return 'Descrição deve ter no máximo 500 caracteres';
        break;
    }
    return '';
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field] && value) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    // Validate field if it's a string
    if (typeof value === 'string') {
      const error = validateField(field, value);
      if (error) {
        setErrors(prev => ({
          ...prev,
          [field]: error,
        }));
      }
    }
  };

  const handleSubmit = () => {
    // Validate all fields
    const newErrors: Record<string, string> = {};
    
    newErrors.name = validateField('name', formData.name);
    newErrors.code = validateField('code', formData.code);
    newErrors.description = validateField('description', formData.description);

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) delete newErrors[key];
    });

    setErrors(newErrors);

    // Submit if no errors
    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        code: formData.code.trim().toUpperCase(),
        isActive: formData.isActive,
      });
    }
  };

  return (
    <Box 
      component="form" 
      id="group-type-form"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
    >
      <Stack spacing={3}>
        {/* Nome */}
        <TextField
          fullWidth
          label="Nome"
          placeholder="Ex: Administradores"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name || 'Nome descritivo do tipo de grupo'}
          disabled={isSubmitting}
          required
        />

        {/* Código */}
        <TextField
          fullWidth
          label="Código"
          placeholder="Ex: ADMIN"
          value={formData.code}
          onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
          error={!!errors.code}
          helperText={errors.code || 'Código único para identificação (apenas letras maiúsculas, números e _)'}
          disabled={isSubmitting}
          required
          inputProps={{
            style: { fontFamily: 'monospace', fontWeight: 600 }
          }}
        />

        {/* Descrição */}
        <TextField
          fullWidth
          label="Descrição"
          placeholder="Descreva a finalidade deste tipo de grupo..."
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description || 'Descrição opcional do tipo de grupo'}
          disabled={isSubmitting}
          multiline
          rows={3}
        />

        {/* Status Ativo */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              disabled={isSubmitting}
              color="primary"
            />
          }
          label="Tipo de grupo ativo"
        />
      </Stack>
    </Box>
  );
};