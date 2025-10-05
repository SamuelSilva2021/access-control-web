import type { 
  UserAccount, 
  CreateUserAccountRequest, 
  UpdateUserAccountRequest
} from '../types';
import type { AccessGroup } from '../types';
import { httpClient } from '../utils';
import { API_ENDPOINTS } from '../constants';

interface GetUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface UsersApiResponse {
  items: UserAccount[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

/**
 * Serviço para gerenciar Usuários (UserAccounts)
 * Centraliza todas as operações CRUD relacionadas aos usuários do sistema
 * 
 * Endpoints da API:
 * - GET /api/users - Lista usuários paginados
 * - GET /api/users/active - Lista usuários ativos
 * - GET /api/users/{id} - Busca usuário por ID
 * - POST /api/users - Cria novo usuário
 * - PUT /api/users/{id} - Atualiza usuário
 * - DELETE /api/users/{id} - Remove usuário
 * - POST /api/users/forgot-password - Esqueci senha
 * - POST /api/users/reset-password - Reset senha
 */
export class UserService {
  // ========== USERS CRUD ==========
  
  /**
   * Busca usuários com paginação
   * API: GET /api/users?page=1&limit=10
   */
  static async getUsers(params: GetUsersParams = {}): Promise<UsersApiResponse> {
    try {
      const { page = 1, limit = 10, search } = params;
      
      console.log('🔄 UserService: Buscando usuários via API paginada...', params);
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const url = `${API_ENDPOINTS.USERS}?${searchParams}`;
      const response = await httpClient.get<UsersApiResponse>(url);
      
      console.log('📡 UserService: Resposta da API:', response);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!response.data) {
        console.log('📭 UserService: Nenhum dado retornado (data=null)');
        return {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      
      console.log('✅ UserService: Usuários encontrados:', response.data.items?.length || 0);
      return response.data;
      
    } catch (error: any) {
      console.error('💥 UserService: Erro na requisição:', error);
      
      // Se for 404, retorna resultado vazio (normal para sistema novo)
      if (error.status === 404) {
        console.log('📝 UserService: 404 - Nenhum usuário encontrado (normal)');
        return {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      
      throw new Error(error.message || 'Erro ao buscar usuários');
    }
  }

  /**
   * Busca usuários ativos
   * API: GET /api/users/active
   */
  static async getActiveUsers(): Promise<UserAccount[]> {
    try {
      console.log('🔄 UserService: Buscando usuários ativos...');
      
      const response = await httpClient.get<UserAccount[]>(`${API_ENDPOINTS.USERS}/active`);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ UserService: Usuários ativos encontrados:', response.data?.length || 0);
      return response.data || [];
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao buscar usuários ativos:', error);
      
      if (error.status === 404) {
        console.log('📝 UserService: 404 - Nenhum usuário ativo encontrado');
        return [];
      }
      
      throw new Error(error.message || 'Erro ao buscar usuários ativos');
    }
  }

  /**
   * Busca usuário por ID
   * API: GET /api/users/{id}
   */
  static async getUserById(id: string): Promise<UserAccount> {
    try {
      console.log('🔄 UserService: Buscando usuário por ID:', id);
      
      const response = await httpClient.get<UserAccount>(`${API_ENDPOINTS.USERS}/${id}`);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!response.data) {
        throw new Error('Usuário não encontrado');
      }
      
      console.log('✅ UserService: Usuário encontrado:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao buscar usuário:', error);
      throw new Error(error.message || 'Erro ao buscar usuário');
    }
  }

  /**
   * Cria novo usuário
   * API: POST /api/users
   */
  static async createUser(userData: CreateUserAccountRequest): Promise<UserAccount> {
    try {
      console.log('🔄 UserService: Criando novo usuário...', { ...userData, password: '[HIDDEN]' });
      
      const response = await httpClient.post<UserAccount>(API_ENDPOINTS.USERS, userData);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!response.data) {
        throw new Error('Erro ao criar usuário - resposta inválida');
      }
      
      console.log('✅ UserService: Usuário criado com sucesso:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao criar usuário:', error);
      throw new Error(error.message || 'Erro ao criar usuário');
    }
  }

  /**
   * Atualiza usuário existente
   * API: PUT /api/users/{id}
   */
  static async updateUser(id: string, userData: UpdateUserAccountRequest): Promise<UserAccount> {
    try {
      console.log('🔄 UserService: Atualizando usuário:', id, userData);
      
      const response = await httpClient.put<UserAccount>(`${API_ENDPOINTS.USERS}/${id}`, userData);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!response.data) {
        throw new Error('Erro ao atualizar usuário - resposta inválida');
      }
      
      console.log('✅ UserService: Usuário atualizado com sucesso:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao atualizar usuário:', error);
      throw new Error(error.message || 'Erro ao atualizar usuário');
    }
  }

  /**
   * Remove usuário
   * API: DELETE /api/users/{id}
   */
  static async deleteUser(id: string): Promise<void> {
    try {
      console.log('🔄 UserService: Removendo usuário:', id);
      
      const response = await httpClient.delete<boolean>(`${API_ENDPOINTS.USERS}/${id}`);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ UserService: Usuário removido com sucesso');
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao remover usuário:', error);
      throw new Error(error.message || 'Erro ao remover usuário');
    }
  }

  // ========== PASSWORD MANAGEMENT ==========

  /**
   * Inicia fluxo de esqueci a senha
   * API: POST /api/users/forgot-password
   */
  static async forgotPassword(email: string): Promise<void> {
    try {
      console.log('🔄 UserService: Iniciando fluxo de esqueci senha para:', email);
      
      const requestData: ForgotPasswordRequest = { email };
      const response = await httpClient.post<boolean>(`${API_ENDPOINTS.USERS}/forgot-password`, requestData);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ UserService: Email de recuperação enviado com sucesso');
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao enviar email de recuperação:', error);
      throw new Error(error.message || 'Erro ao enviar email de recuperação');
    }
  }

  /**
   * Reseta senha usando token
   * API: POST /api/users/reset-password
   */
  static async resetPassword(email: string, token: string, newPassword: string): Promise<void> {
    try {
      console.log('🔄 UserService: Resetando senha para:', email);
      
      const requestData: ResetPasswordRequest = { email, token, newPassword };
      const response = await httpClient.post<boolean>(`${API_ENDPOINTS.USERS}/reset-password`, requestData);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ UserService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      console.log('✅ UserService: Senha resetada com sucesso');
      
    } catch (error: any) {
      console.error('💥 UserService: Erro ao resetar senha:', error);
      throw new Error(error.message || 'Erro ao resetar senha');
    }
  }

  // ========== UTILITY METHODS ==========

  /**
   * Toggle status do usuário (ativo/inativo)
   */
  static async toggleUserStatus(user: UserAccount): Promise<UserAccount> {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active';
    
    return this.updateUser(user.id, {
      status: newStatus
    });
  }

  /**
   * Valida se email já está em uso
   */
  static async validateEmail(email: string, excludeUserId?: string): Promise<boolean> {
    try {
      const users = await this.getUsers({ limit: 100 });
      
      return !users.items.some(user => 
        user.email.toLowerCase() === email.toLowerCase() && 
        user.id !== excludeUserId
      );
    } catch (error) {
      console.warn('UserService: Erro ao validar email, assumindo válido:', error);
      return true;
    }
  }

  // ========== USER ACCESS GROUPS ==========

  /**
   * Lista grupos de acesso de um usuário
   */
  static async getUserAccessGroups(userId: string): Promise<AccessGroup[]> {
    try {
      console.log('🔄 UserService: Buscando grupos do usuário:', userId);
      
      const response = await httpClient.get<AccessGroup[]>(`${API_ENDPOINTS.USERS}/${userId}/access-groups`);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        throw new Error(errorMsg);
      }
      
      console.log('✅ UserService: Grupos encontrados:', response.data?.length || 0);
      return response.data || [];
      
    } catch (error: any) {
      console.error('❌ UserService: Erro ao buscar grupos do usuário:', error);
      
      if (error.status === 404) {
        return [];
      }
      
      throw new Error(error.message || 'Erro ao buscar grupos do usuário');
    }
  }

  /**
   * Atribui grupos de acesso a um usuário
   */
  static async assignUserAccessGroups(userId: string, accessGroupIds: string[]): Promise<boolean> {
    try {
      console.log('🔄 UserService: Atribuindo grupos ao usuário:', userId, accessGroupIds);
      
      const response = await httpClient.post<boolean>(`${API_ENDPOINTS.USERS}/${userId}/access-groups`, {
        accessGroupIds
      });

      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        throw new Error(errorMsg);
      }

      console.log('✅ UserService: Grupos atribuídos com sucesso');
      return response.data || false;
      
    } catch (error: any) {
      console.error('❌ UserService: Erro ao atribuir grupos:', error);
      throw new Error(error.message || 'Erro ao atribuir grupos ao usuário');
    }
  }

  /**
   * Remove um grupo de acesso específico de um usuário
   */
  static async revokeUserAccessGroup(userId: string, groupId: string): Promise<boolean> {
    try {
      console.log('🔄 UserService: Removendo grupo do usuário:', userId, groupId);
      
      const response = await httpClient.delete<boolean>(`${API_ENDPOINTS.USERS}/${userId}/access-groups/${groupId}`);

      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        throw new Error(errorMsg);
      }

      console.log('✅ UserService: Grupo removido com sucesso');
      return response.data || false;
      
    } catch (error: any) {
      console.error('❌ UserService: Erro ao remover grupo:', error);
      throw new Error(error.message || 'Erro ao remover grupo do usuário');
    }
  }
}