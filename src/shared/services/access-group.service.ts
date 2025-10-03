import type { 
  AccessGroup, 
  CreateAccessGroupRequest, 
  UpdateAccessGroupRequest,
  AccessGroupApiResponse
} from '../types';
import { httpClient } from '../utils';
import { API_ENDPOINTS } from '../constants';

interface GetAccessGroupsParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Serviço para gerenciar Access Groups
 * Centraliza todas as operações CRUD relacionadas aos grupos de acesso
 */
export class AccessGroupService {
  // ========== ACCESS GROUPS ==========
  
  /**
   * Busca grupos de acesso com paginação
   * Nova API: /api/access-group?page=1&limit=10
   */
  static async getAccessGroups(params: GetAccessGroupsParams = {}): Promise<AccessGroupApiResponse<AccessGroup>> {
    try {
      const { page = 1, limit = 10, search } = params;
      
      console.log('🔄 AccessGroupService: Buscando grupos via API paginada...', params);
      
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      
      const url = `${API_ENDPOINTS.ACCESS_GROUPS}?${searchParams}`;
      const response = await httpClient.get<AccessGroupApiResponse<AccessGroup>>(url);
      
      console.log('📡 AccessGroupService: Resposta da API:', response);
      
      if (!response.succeeded) {
        const errorMsg = response.errors?.join(', ') || 'API retornou succeeded=false';
        console.error('❌ AccessGroupService: API failed:', errorMsg);
        throw new Error(errorMsg);
      }
      
      if (!response.data) {
        console.log('📭 AccessGroupService: Nenhum dado retornado (data=null)');
        return {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      
      console.log('✅ AccessGroupService: Grupos encontrados:', response.data.items?.length || 0);
      return response.data;
      
    } catch (error: any) {
      console.error('💥 AccessGroupService: Erro na requisição:', error);
      
      // Se for 404, retorna resultado vazio (normal para sistema novo)
      if (error.status === 404) {
        console.log('📝 AccessGroupService: 404 - Nenhum grupo encontrado (normal)');
        return {
          items: [],
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      
      // Para outros erros, propaga
      throw error;
    }
  }
  
  /**
   * Método de compatibilidade - busca todos os grupos (sem paginação)
   * @deprecated Use getAccessGroups() com paginação
   */
  static async getAllAccessGroups(): Promise<AccessGroup[]> {
    const response = await this.getAccessGroups({ page: 1, limit: 1000 });
    return response.items || [];
  }

  /**
   * Busca um grupo de acesso por ID
   */
  static async getAccessGroupById(id: string): Promise<AccessGroup> {
    const response = await httpClient.get<AccessGroup>(API_ENDPOINTS.ACCESS_GROUP_BY_ID(id));
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Grupo de acesso não encontrado');
    }
    
    return response.data;
  }

  /**
   * Cria um novo grupo de acesso
   */
  static async createAccessGroup(data: CreateAccessGroupRequest): Promise<AccessGroup> {
    const response = await httpClient.post<AccessGroup>(API_ENDPOINTS.ACCESS_GROUPS, data);
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Erro ao criar grupo de acesso');
    }
    
    return response.data;
  }

  /**
   * Atualiza um grupo de acesso existente
   */
  static async updateAccessGroup(id: string, data: UpdateAccessGroupRequest): Promise<AccessGroup> {
    const response = await httpClient.put<AccessGroup>(API_ENDPOINTS.ACCESS_GROUP_BY_ID(id), data);
    
    if (!response.succeeded || !response.data) {
      throw new Error(response.errors?.join(', ') || 'Erro ao atualizar grupo de acesso');
    }
    
    return response.data;
  }

  /**
   * Remove um grupo de acesso
   */
  static async deleteAccessGroup(id: string): Promise<void> {
    const response = await httpClient.delete<boolean>(API_ENDPOINTS.ACCESS_GROUP_BY_ID(id));
    
    if (!response.succeeded) {
      throw new Error(response.errors?.join(', ') || 'Erro ao remover grupo de acesso');
    }
  }
}