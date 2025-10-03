# Configuração de Ambiente

Este projeto utiliza variáveis de ambiente para configuração diferenciada entre desenvolvimento e produção.

## Arquivos de Ambiente

- `.env` - Configurações padrão (fallback)
- `.env.development` - Configurações específicas para desenvolvimento
- `.env.production` - Configurações específicas para produção
- `.env.example` - Template de exemplo

## Variáveis Disponíveis

### API
- `VITE_API_BASE_URL` - URL base da API
  - **Desenvolvimento**: `https://localhost:7019`
  - **Produção**: `https://api.accesscontrol.com`

### Aplicação
- `VITE_APP_TITLE` - Título da aplicação
- `VITE_APP_VERSION` - Versão da aplicação

### Debug
- `VITE_DEBUG_MODE` - Habilita modo debug (`true`/`false`)
- `VITE_LOG_LEVEL` - Nível de log (`debug`, `info`, `warn`, `error`)

### Autenticação
- `VITE_TOKEN_EXPIRY_TIME` - Tempo de expiração do token (ms)
- `VITE_REFRESH_TOKEN_EXPIRY_TIME` - Tempo de expiração do refresh token (ms)

## Scripts NPM

### Desenvolvimento
```bash
npm run dev          # Inicia em modo desenvolvimento
npm run build:dev    # Build para desenvolvimento
```

### Produção
```bash
npm run dev:prod     # Inicia simulando produção
npm run build:prod   # Build para produção
npm run preview:prod # Preview do build de produção
```

## Configuração

As configurações são centralizadas em `src/shared/config/app.config.ts` e fornecem:

- Tipagem TypeScript para todas as configurações
- Valores padrão para todas as variáveis
- Helpers para verificar ambiente atual
- Sistema de logging condicional

### Exemplo de Uso

```typescript
import { config, isDevelopment, logger } from '@/shared/config';

// Usar configuração
const apiUrl = config.api.baseUrl;

// Verificar ambiente
if (isDevelopment()) {
  logger.debug('Modo desenvolvimento ativo');
}

// Logging condicional
logger.info('Aplicação iniciada');
logger.error('Erro crítico');
```

## Segurança

⚠️ **Importante**: 
- Apenas variáveis prefixadas com `VITE_` são expostas ao cliente
- Nunca coloque informações sensíveis em variáveis `VITE_`
- O arquivo `.env` deve estar no `.gitignore` se contiver dados sensíveis