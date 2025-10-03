import { Chip } from '@mui/material';

export interface StatusChipProps {
  label: string;
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning';
  size?: 'small' | 'medium';
  variant?: 'filled' | 'outlined';
}

/**
 * Componente para exibir status com cores padronizadas
 * Mapeia status para cores do Material-UI
 */
export const StatusChip = ({ 
  label, 
  status, 
  size = 'small',
  variant = 'filled' 
}: StatusChipProps) => {
  const getChipColor = (status: StatusChipProps['status']) => {
    switch (status) {
      case 'active':
      case 'success':
        return 'success';
      case 'inactive':
        return 'default';
      case 'pending':
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Chip
      label={label}
      color={getChipColor(status)}
      size={size}
      variant={variant}
    />
  );
};