import type { ReactNode } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';

export interface PageToolbarProps {
  title: string;
  onAdd?: () => void;
  addLabel?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  actions?: ReactNode;
}

/**
 * Toolbar reutilizável para páginas de listagem
 * Com busca e botão de adicionar padronizados
 */
export const PageToolbar = ({
  title,
  onAdd,
  addLabel = 'Novo',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  children,
  actions,
}: PageToolbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: 2,
        mb: 3,
        p: 2,
        backgroundColor: 'background.paper',
        borderRadius: 1,
        boxShadow: 1,
      }}
    >
      {/* Título e busca */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: 2,
        flex: 1,
      }}>
        <Typography
          variant={isMobile ? 'h5' : 'h4'}
          sx={{
            fontWeight: 600,
            color: 'text.primary',
            minWidth: 'fit-content',
          }}
        >
          {title}
        </Typography>

        {onSearchChange && (
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: isMobile ? 'auto' : 300,
              maxWidth: 400,
            }}
          />
        )}
      </Box>

      {/* Ações e botão adicionar */}
      <Box sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: 1,
      }}>
        {actions}
        {children}
        
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              minWidth: isMobile ? 'auto' : 120,
              whiteSpace: 'nowrap',
            }}
          >
            {addLabel}
          </Button>
        )}
      </Box>
    </Box>
  );
};