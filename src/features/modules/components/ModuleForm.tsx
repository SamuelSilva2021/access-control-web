import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Stack,
} from '@mui/material';
import type { Module, CreateModuleRequest, UpdateModuleRequest } from '../../../shared/types';

export interface ModuleFormData {
  name: string;
  description: string;
  url: string;
  key: string; // Mudança: moduleKey → key
  code: string;
  applicationId: string;
  isActive: boolean;
}

export interface ModuleFormProps {
  initialData?: Module | null;
  onSubmit: (data: CreateModuleRequest | UpdateModuleRequest) => void;
  isSubmitting?: boolean;
}

export const ModuleForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}: ModuleFormProps) => {
  const [formData, setFormData] = useState<ModuleFormData>({
    name: '',
    description: '',
    url: '',
    key: '', // Mudança: moduleKey → key
    code: '',
    applicationId: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        url: initialData.url || '',
        key: initialData.key || '', // Mudança: moduleKey → key
        code: initialData.code || '',
        applicationId: initialData.applicationId || '',
        isActive: initialData.isActive,
      });
    }
  }, [initialData]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Nome é obrigatório';
        if (value.length > 255) return 'Nome não pode exceder 255 caracteres';
        return '';
      
      case 'description':
        if (value.length > 500) return 'Descrição não pode exceder 500 caracteres';
        return '';
      
      case 'url':
        if (value.length > 500) return 'URL não pode exceder 500 caracteres';
        return '';
      
      case 'key': // Mudança: moduleKey → key
        if (!value.trim()) return 'Chave do módulo é obrigatória';
        if (value.length > 100) return 'Chave do módulo não pode exceder 100 caracteres';
        if (!/^[A-Z0-9_-]+$/.test(value)) return 'Chave deve conter apenas letras maiúsculas, números, underscore e hífen (sem espaços)';
        return '';
      
      default:
        return '';
    }
  };

  const handleInputChange = (field: keyof ModuleFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    
    if (field === 'key' && typeof value === 'string') { // Mudança: moduleKey → key
      value = value.toUpperCase();
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (typeof value === 'string') {
      const error = validateField(field, value);
      setErrors(prev => ({
        ...prev,
        [field]: error,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.name = validateField('name', formData.name);
    newErrors.description = validateField('description', formData.description);
    newErrors.url = validateField('url', formData.url);
    newErrors.key = validateField('key', formData.key); // Mudança: moduleKey → key

    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData: CreateModuleRequest | UpdateModuleRequest = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      url: formData.url.trim(),
      // key é obrigatório agora (mudança: moduleKey → key)
      key: formData.key.trim(),
      code: formData.code.trim() || undefined,
      applicationId: formData.applicationId.trim() || undefined,
      isActive: formData.isActive,
    };

    console.log('📤 Enviando dados do módulo:', {
      ...submitData,
      key: `"${submitData.key}"` // Para ver exatamente o que está sendo enviado (mudança: moduleKey → key)
    });
    onSubmit(submitData);
  };

  return (
    <Box
      component="form"
      id="module-form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        width: '100%',
        maxWidth: 500,
      }}
    >
      <Stack spacing={3}>
        {/* Nome do Módulo */}
        <TextField
          label="Nome do Módulo"
          placeholder="Digite o nome do módulo"
          value={formData.name}
          onChange={handleInputChange('name')}
          error={!!errors.name}
          helperText={errors.name || 'Nome único e descritivo do módulo'}
          required
          fullWidth
          disabled={isSubmitting}
          inputProps={{ maxLength: 255 }}
        />

        {/* Descrição */}
        <TextField
          label="Descrição"
          placeholder="Descreva o propósito do módulo"
          value={formData.description}
          onChange={handleInputChange('description')}
          error={!!errors.description}
          helperText={errors.description || 'Descrição detalhada do módulo'}
          fullWidth
          multiline
          rows={3}
          disabled={isSubmitting}
          inputProps={{ maxLength: 500 }}
        />

        {/* URL */}
        <TextField
          label="URL"
          placeholder="https://exemplo.com/modulo"
          value={formData.url}
          onChange={handleInputChange('url')}
          error={!!errors.url}
          helperText={errors.url || 'URL de acesso ao módulo'}
          fullWidth
          disabled={isSubmitting}
          inputProps={{ maxLength: 500 }}
        />

        {/* Chave do Módulo */}
        <TextField
          label="Chave do Módulo"
          placeholder="Ex: PERMISSION_MODULE, BILLING_MODULE, etc."
          value={formData.key}
          onChange={handleInputChange('key')}
          error={!!errors.key}
          helperText={errors.key || 'Identificador único do módulo (obrigatório) - Ex: PERMISSION_MODULE'}
          required
          fullWidth
          disabled={isSubmitting}
          inputProps={{ 
            maxLength: 100,
            style: { fontFamily: 'monospace', fontWeight: 600 }
          }}
        />

        {/* Código */}
        <TextField
          label="Código"
          placeholder="001"
          value={formData.code}
          onChange={handleInputChange('code')}
          error={!!errors.code}
          helperText={errors.code || 'Código numérico do módulo (opcional)'}
          fullWidth
          disabled={isSubmitting}
        />

        {/* ID da Aplicação */}
        <TextField
          label="ID da Aplicação"
          placeholder="00000000-0000-0000-0000-000000000000"
          value={formData.applicationId}
          onChange={handleInputChange('applicationId')}
          error={!!errors.applicationId}
          helperText={errors.applicationId || 'ID da aplicação à qual pertence (opcional)'}
          fullWidth
          disabled={isSubmitting}
        />

        {/* Status Ativo */}
        <FormControlLabel
          control={
            <Switch
              checked={formData.isActive}
              onChange={handleInputChange('isActive')}
              disabled={isSubmitting}
              color="primary"
            />
          }
          label="Módulo Ativo"
          sx={{
            alignSelf: 'flex-start',
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
            },
          }}
        />
      </Stack>
    </Box>
  );
};