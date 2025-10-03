import type { ReactNode } from 'react';
import { Grid } from '@mui/material';

export interface ResponsiveGridProps {
  children: ReactNode;
  spacing?: number;
  itemsPerRow?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

/**
 * Grid responsivo que ajusta automaticamente o número de colunas
 * baseado no tamanho da tela
 */
export const ResponsiveGrid = ({
  children,
  spacing = 2,
  itemsPerRow = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }
}: ResponsiveGridProps) => {
  const getGridSize = () => {
    const gridSizes: any = {};
    
    if (itemsPerRow.xs) gridSizes.xs = 12 / itemsPerRow.xs;
    if (itemsPerRow.sm) gridSizes.sm = 12 / itemsPerRow.sm;
    if (itemsPerRow.md) gridSizes.md = 12 / itemsPerRow.md;
    if (itemsPerRow.lg) gridSizes.lg = 12 / itemsPerRow.lg;
    if (itemsPerRow.xl) gridSizes.xl = 12 / itemsPerRow.xl;
    
    return gridSizes;
  };

  const gridSizes = getGridSize();

  return (
    <Grid container spacing={spacing}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <Grid item key={index} {...gridSizes}>
            {child}
          </Grid>
        ))
      ) : (
        <Grid item {...gridSizes}>
          {children}
        </Grid>
      )}
    </Grid>
  );
};