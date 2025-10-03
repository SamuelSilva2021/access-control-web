import type { ReactNode } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';

export interface ActionButton {
  icon: ReactNode;
  tooltip: string;
  onClick: () => void;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  disabled?: boolean;
}

export interface ActionButtonsProps {
  actions: ActionButton[];
  size?: 'small' | 'medium' | 'large';
  spacing?: number;
}

/**
 * Componente para grupos de botões de ação
 * Usado em listas, tabelas e cards
 */
export const ActionButtons = ({ 
  actions, 
  size = 'small',
  spacing = 1 
}: ActionButtonsProps) => {
  return (
    <Box sx={{ display: 'flex', gap: spacing }}>
      {actions.map((action, index) => (
        <Tooltip key={index} title={action.tooltip}>
          <span>
            <IconButton
              size={size}
              color={action.color || 'default'}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
    </Box>
  );
};