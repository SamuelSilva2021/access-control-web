import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import type { ReactNode } from 'react';
import { theme } from '../../shared/theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provider do tema Material-UI customizado
 * Aplica o tema responsivo e estilos globais
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};