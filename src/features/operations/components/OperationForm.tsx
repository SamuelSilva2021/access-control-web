import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import type { Operation, CreateOperationRequest, UpdateOperationRequest } from '../../../shared/types';

export interface OperationFormData {
  name: string;
  description: string;
  value: string;
  isActive: boolean;
}

export interface OperationFormProps {
  initialData?: Operation | null;
  onSubmit: (data: CreateOperationRequest | UpdateOperationRequest) => void;
  isSubmitting?: boolean;
}

/**
 * Formulário reutilizável para criar/editar Operations
 * Validação client-side e UX otimizada
 */
export const OperationForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}: OperationFormProps) => {
  const [formData, setFormData] = useState<OperationFormData>({
    name: '',
    description: '',
    value: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Preenche formulário para edição
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        value: (initialData.value || '').toUpperCase(), // Garante UpperCase na inicialização
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
      case 'value':
        if (!value.trim()) return 'Valor é obrigatório';
        if (!/^[A-Z0-9_]+$/.test(value)) return 'Valor deve conter apenas letras maiúsculas, números e underscore';
        if (value.length < 2) return 'Valor deve ter pelo menos 2 caracteres';
        if (value.length > 50) return 'Valor deve ter no máximo 50 caracteres';
        break;
      case 'description':
        if (value && value.length > 500) return 'Descrição deve ter no máximo 500 caracteres';
        break;
    }
    return '';
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    // Garante que o campo 'value' seja sempre UpperCase
    const processedValue = field === 'value' && typeof value === 'string' 
      ? value.toUpperCase() 
      : value;

    setFormData(prev => ({
      ...prev,
      [field]: processedValue,
    }));

    // Clear error when user starts typing
    if (errors[field] && value) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }

    // Validate field if it's a string
    if (typeof processedValue === 'string') {
      const error = validateField(field, processedValue);
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
    newErrors.value = validateField('value', formData.value);
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
        value: formData.value.trim().toUpperCase(),
        isActive: formData.isActive,
      });
    }
  };

  return (
    <Box 
      component="form" 
      id="operation-form"
      onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
    >
      <Stack spacing={3}>
        {/* Nome */}
        <TextField
          fullWidth
          label="Nome"
          placeholder="Ex: Criar Usuário"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={!!errors.name}
          helperText={errors.name || 'Nome descritivo da operação'}
          disabled={isSubmitting}
          required
        />

        {/* Valor */}
        <TextField
          fullWidth
          label="Valor"
          placeholder="Ex: CREATE, READ, UPDATE, DELETE"
          value={formData.value}
          onChange={(e) => handleInputChange('value', e.target.value)}
          error={!!errors.value}
          helperText={errors.value || 'Código da operação (sempre em maiúsculas - CREATE, READ, UPDATE, DELETE, etc.)'}
          disabled={isSubmitting}
          required
          inputProps={{
            style: { textTransform: 'uppercase' }
          }}
        />

        {/* Descrição */}
        <TextField
          fullWidth
          label="Descrição"
          placeholder="Ex: Permite criar novos usuários no sistema"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          error={!!errors.description}
          helperText={errors.description || 'Descrição detalhada da operação (opcional)'}
          disabled={isSubmitting}
          multiline
          rows={3}
        />

        {/* Status */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              disabled={isSubmitting}
            />
          }
          label={formData.isActive ? 'Ativo' : 'Inativo'}
        />
      </Stack>
    </Box>
  );
};