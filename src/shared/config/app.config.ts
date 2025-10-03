/**
 * Configurações da aplicação baseadas em variáveis de ambiente
 * Centraliza o acesso às variáveis de ambiente com valores padrão
 */

export interface AppConfig {
  api: {
    baseUrl: string;
  };
  app: {
    title: string;
    version: string;
    mode: string;
  };
  debug: {
    enabled: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  auth: {
    tokenExpiryTime: number;
    refreshTokenExpiryTime: number;
  };
}

/**
 * Configuração da aplicação baseada no ambiente atual
 */
export const config: AppConfig = {
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://localhost:7019',
  },
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Access Control System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    mode: import.meta.env.MODE || 'development',
  },
  debug: {
    enabled: import.meta.env.VITE_DEBUG_MODE === 'true' || import.meta.env.DEV,
    logLevel: (import.meta.env.VITE_LOG_LEVEL as AppConfig['debug']['logLevel']) || 'info',
  },
  auth: {
    tokenExpiryTime: Number(import.meta.env.VITE_TOKEN_EXPIRY_TIME) || 86400000, // 24h padrão
    refreshTokenExpiryTime: Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRY_TIME) || 604800000, // 7 dias padrão
  },
};

/**
 * Helper para verificar se está em modo de desenvolvimento
 */
export const isDevelopment = () => config.app.mode === 'development' || import.meta.env.DEV;

/**
 * Helper para verificar se está em modo de produção
 */
export const isProduction = () => config.app.mode === 'production' || import.meta.env.PROD;

/**
 * Helper para logging condicional baseado no ambiente
 */
export const logger = {
  debug: (...args: unknown[]) => {
    if (config.debug.enabled && ['debug'].includes(config.debug.logLevel)) {
      console.debug('[DEBUG]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (config.debug.enabled && ['debug', 'info'].includes(config.debug.logLevel)) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (config.debug.enabled && ['debug', 'info', 'warn'].includes(config.debug.logLevel)) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
};

// Log da configuração atual em desenvolvimento
if (isDevelopment()) {
  logger.info('Configuração da aplicação:', {
    mode: config.app.mode,
    apiBaseUrl: config.api.baseUrl,
    debugEnabled: config.debug.enabled,
    logLevel: config.debug.logLevel,
  });
}