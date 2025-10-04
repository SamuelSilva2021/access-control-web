import { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';

interface Operation {
  id: string;
  name: string;
  description: string;
  value: string; // Campo valor que existe na sua estrutura
  isActive: boolean;
  createdAt?: string; // Campo created_at do seu banco
}

/**
 * Página de teste para Operations
 * Permite verificar se a API está funcionando e se há dados no banco
 */
export const OperationsTestPage = () => {
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadOperations = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🔄 Testando API de Operations...');
      
      // Usando fetch diretamente para testar a rota
      const response = await fetch('/api/operation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Incluir token se necessário
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Response data:', data);

      // Verifica se a resposta tem a estrutura esperada
      if (data && Array.isArray(data.data)) {
        setOperations(data.data);
        setSuccess(`✅ Sucesso! Encontradas ${data.data.length} operações.`);
      } else if (data && Array.isArray(data)) {
        // Caso a API retorne diretamente um array
        setOperations(data);
        setSuccess(`✅ Sucesso! Encontradas ${data.length} operações.`);
      } else {
        throw new Error('Formato de resposta inesperado');
      }

    } catch (err: any) {
      console.error('❌ Erro ao testar Operations:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  // Carrega automaticamente na inicialização
  useEffect(() => {
    loadOperations();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🧪 Teste da API - Operations
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Esta página testa a conectividade com a API de Operações da saas-authentication-api.
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            onClick={loadOperations}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Carregando...' : 'Testar API'}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {operations.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Operações encontradas:
            </Typography>
            <List>
              {operations.map((operation) => (
                <ListItem key={operation.id} divider>
                  <ListItemText
                    primary={`${operation.name} (${operation.value})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {operation.description}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          ID: {operation.id} | Status: {operation.isActive ? 'Ativo' : 'Inativo'}
                          {operation.createdAt && ` | Criado em: ${new Date(operation.createdAt).toLocaleString()}`}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            🔍 Informações de Debug:
          </Typography>
          <Typography variant="caption" component="div">
            • Endpoint: <code>/api/operation</code>
          </Typography>
          <Typography variant="caption" component="div">
            • Método: <code>GET</code>
          </Typography>
          <Typography variant="caption" component="div">
            • Total de operações: <code>{operations.length}</code>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};