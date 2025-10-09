import React from 'react';
import {
  Pagination as MuiPagination,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  loading?: boolean;
}

/**
 * Componente de Paginação Reutilizável
 * Inclui controle de página e tamanho da página
 */
export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  loading = false,
}) => {
  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    onPageChange(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newPageSize = event.target.value as number;
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    }
  };

  // Calcular o range de itens exibidos
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  if (totalCount === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Informações da paginação */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Mostrando {startItem} a {endItem} de {totalCount} registros
        </Typography>

        {/* Seletor de itens por página */}
        {onPageSizeChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Itens por página:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 70 }}>
              <Select
                value={pageSize}
                onChange={handlePageSizeChange}
                disabled={loading}
                variant="outlined"
              >
                {pageSizeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      {/* Controles de navegação */}
      {totalPages > 1 && (
        <MuiPagination
          count={totalPages}
          page={page}
          onChange={handlePageChange}
          disabled={loading}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
          siblingCount={1}
          boundaryCount={1}
        />
      )}
    </Box>
  );
};