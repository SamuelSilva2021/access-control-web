import type { ReactNode } from 'react';
import { Container, Box } from '@mui/material';
import { layout } from '../../theme';

export interface ResponsiveContainerProps {
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  fullHeight?: boolean;
}

/**
 * Container responsivo com padding dinâmico
 * Ajusta espaçamento baseado no tamanho da tela
 */
export const ResponsiveContainer = ({
  children,
  maxWidth = 'lg',
  disableGutters = false,
  fullHeight = false
}: ResponsiveContainerProps) => {

  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        px: {
          xs: `${layout.contentPadding.mobile}px`,
          sm: `${layout.contentPadding.tablet}px`,
          lg: `${layout.contentPadding.desktop}px`,
        },
        py: {
          xs: 2,
          sm: 3,
          lg: 4,
        },
        minHeight: fullHeight ? '100vh' : 'auto',
        ...(fullHeight && {
          display: 'flex',
          flexDirection: 'column',
        }),
      }}
    >
      <Box
        sx={{
          ...(fullHeight && {
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }),
        }}
      >
        {children}
      </Box>
    </Container>
  );
};