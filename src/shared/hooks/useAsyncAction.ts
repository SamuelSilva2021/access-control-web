import { useState, useCallback } from 'react';

/**
 * Hook para gerenciar ações assíncronas com loading state
 * Padroniza o tratamento de loading e erro para operações async
 */
export const useAsyncAction = () => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(async <T>(action: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true);
      const result = await action();
      return result;
    } catch (error) {
      // Re-throw para permitir tratamento específico no componente
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    execute,
  };
};