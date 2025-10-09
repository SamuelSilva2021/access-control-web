/**
 * Store de Autenticação Zustand - Versão Simplificada
 * 
 * Responsabilidades EXCLUSIVAS do AuthStore:
 * - Gerenciar estado de autenticação (login/logout)
 * - Manter dados do usuário logado
 * - Controlar token JWT e refresh
 * - Persistir sessão no localStorage
 * 
 * NÃO É RESPONSABILIDADE deste store:
 * - Carregar dados de grupos de acesso (use useAccessGroups na página específica)
 * - Gerenciar dados de aplicação (use hooks específicos por feature)
 * - Fazer chamadas de API não relacionadas à autenticação
 * 
 * @example
 * ```tsx
 * // Uso básico do store
 * const { user, isAuthenticated, login, logout } = useAuthStore();
 * 
 * // Para dados de aplicação, use hooks específicos:
 * const { accessGroups } = useAccessGroups(); // Na página específica
 * const { groupTypes } = useGroupTypes(); // Na página específica
 * ```
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { AuthState, AuthUser, LoginRequest, LoginResponseData, UserInfo } from '../types';
import { httpClient } from '../utils';
import { API_ENDPOINTS } from '../constants';
import { setToken, setRefreshToken, setStoredUser, clearAuth, getToken, getStoredUser, isTokenValid } from '../utils/auth-storage';
import { usePermissionStore } from './permission.store';

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,

        initialize: async () => {
          console.log('🔧 Store: initialize() chamado (versão limpa)');
          
          try {
            const storedToken = getToken();
            const storedUser = getStoredUser();
            const tokenValid = storedToken && storedUser && isTokenValid();

            const initialState = {
              isAuthenticated: !!tokenValid,
              user: tokenValid ? storedUser : null,
              token: tokenValid ? storedToken : null,
              isLoading: false,
            };

            if (storedToken && storedUser && !tokenValid) {
              clearAuth();
              usePermissionStore.getState().clearPermissions();
            } else if (tokenValid && storedUser) {
              usePermissionStore.getState().setPermissions(storedUser.permissions);
            }

            set(initialState);
            console.log('✅ Store: Estado inicial definido', {
              isAuthenticated: initialState.isAuthenticated,
              hasUser: !!initialState.user,
              tokenValid: !!tokenValid
            });

            const handleTokenExpired = () => {
              get().logout();
            };

            window.removeEventListener('auth:token-expired', handleTokenExpired);
            window.addEventListener('auth:token-expired', handleTokenExpired);

          } catch (error) {
            console.error('❌ Store: Erro na inicialização:', error);
            set({
              isAuthenticated: false,
              user: null,
              token: null,
              isLoading: false,
            });
          }
        },

        login: async (credentials: LoginRequest) => {
          try {
            set({ isLoading: true });

            const loginResponse = await httpClient.post<LoginResponseData>(API_ENDPOINTS.LOGIN, credentials);
            
            if (loginResponse.succeeded && loginResponse.data) {
              const { accessToken, refreshToken } = loginResponse.data;

              setToken(accessToken);
              setRefreshToken(refreshToken);
              try {
                const userInfoResponse = await httpClient.get<UserInfo>(API_ENDPOINTS.ME);
                
                if (userInfoResponse.succeeded && userInfoResponse.data) {
                  const userData = userInfoResponse.data;
                  
                  setStoredUser(userData);

                  usePermissionStore.getState().setPermissions(userData.permissions);

                  const authUser: AuthUser = {
                    id: userData.id,
                    email: userData.email,
                    username: userData.username,
                    fullName: userData.fullName,
                    tenant: userData.tenant,
                  };

                  set({
                    isAuthenticated: true,
                    user: authUser,
                    token: accessToken,
                    isLoading: false,
                  });

                  console.log('Login successful, user:', authUser);
                } else {
                  throw new Error('Não foi possível obter informações do usuário');
                }
              } catch (userInfoError) {
                console.error('Erro ao buscar informações do usuário:', userInfoError);
                clearAuth();
                throw new Error('Falha ao carregar informações do usuário');
              }

            } else {
              throw new Error('Credenciais inválidas ou resposta inesperada da API');
            }
          } catch (error) {
            console.error('Erro no login:', error);
            set({ isLoading: false });
            clearAuth();
            throw error;
          }
        },

        logout: () => {
          console.log('🚪 Store: Fazendo logout...');
          
          window.removeEventListener('auth:token-expired', () => {});
          
          usePermissionStore.getState().clearPermissions();
          
          clearAuth();
          set({
            isAuthenticated: false,
            user: null,
            token: null,
            isLoading: false,
          });
          
          console.log('✅ Store: Logout concluído');
        },

        setUser: (user: AuthUser | null) => {
          set({ user });
        },

        setToken: (token: string | null) => {
          set({ token, isAuthenticated: !!token });
        },

        setLoading: (isLoading: boolean) => {
          set({ isLoading });
        },

        refreshToken: async () => {
          try {
            // TODO: Implementar refresh token quando a API estiver pronta
            console.log('Refresh token not implemented yet');
          } catch (error) {
            // Se falhar o refresh, faz logout
            get().logout();
            throw error;
          }
        },
      }),
      {
        name: 'auth-storage',
        // Persistência simples - apenas dados essenciais
        partialize: (state: AuthStore) => ({ 
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          token: state.token,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);