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

interface GroupType {
  id: string;
  name: string;
  description: string;
  code: string;        // Campo código que existe na sua estrutura
  isActive: boolean;
  createdAt?: string;  // Campo created_at do seu banco
}

/**
 * Página de teste para Group Types
 * Permite verificar se a API está funcionando e se há dados no banco
 */
export const GroupTypesTestPage = () => {
  const [groupTypes, setGroupTypes] = useState<GroupType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadGroupTypes = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('🔄 Testando API de Group Types...');
      
      // Usando o serviço existente para testar a rota
      const response = await fetch('https://localhost:7019/api/access-group/group-types', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Resposta da API:', response.status, response.statusText);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Dados recebidos:', data);
        
        if (data.succeeded && data.data) {
          setGroupTypes(data.data);
          setSuccess(`✅ ${data.data.length} Group Types encontrados!`);
        } else {
          setError('API retornou sucesso=false');
        }
      } else if (response.status === 404) {
        setError('🔍 Nenhum Group Type encontrado (404) - Execute o script SQL primeiro');
      } else if (response.status === 401) {
        setError('🔐 Não autorizado (401) - Verifique se está logado');
      } else {
        setError(`❌ Erro HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('💥 Erro na requisição:', err);
      setError(`💥 Erro de conexão: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGroupTypes();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          🧪 Teste Group Types API
        </Typography>
        
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Esta página testa se a API de Group Types está funcionando corretamente.
        </Typography>

        <Box sx={{ my: 3 }}>
          <Button 
            variant="contained" 
            onClick={loadGroupTypes}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={16} /> : null}
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

        {groupTypes.length > 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Group Types encontrados:
            </Typography>
            <List>
              {groupTypes.map((groupType) => (
                <ListItem key={groupType.id} divider>
                  <ListItemText
                    primary={`${groupType.name} (${groupType.code})`}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          {groupType.description}
                        </Typography>
                        <br />
                        <Typography component="span" variant="caption" color="text.secondary">
                          ID: {groupType.id} | Código: {groupType.code} | Ativo: {groupType.isActive ? 'Sim' : 'Não'}
                          {groupType.createdAt && ` | Criado: ${new Date(groupType.createdAt).toLocaleDateString()}`}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            📋 Próximos passos:
          </Typography>
          <Typography variant="body2" component="div">
            1. Se aparecer erro 404: Execute <code>.\setup-group-types.ps1</code><br />
            2. Se aparecer erro 401: Verifique se está logado<br />
            3. Se funcionar: Pode criar Access Groups baseados nestes tipos
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};