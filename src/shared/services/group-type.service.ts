import type { PaginatedResponse } from '../types';
import type { GroupType, CreateGroupTypeRequest, UpdateGroupTypeRequest } from '../types/access-group.types';
import { httpClient } from '../utils/http-client';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface específica para a resposta da API de Group Types
interface GroupTypesApiResponse {
  items: GroupType[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class GroupTypeService {
  private static readonly BASE_URL = '/api/access-group/group-types';

  /**
   * Lista todos os tipos de grupos com paginação
   */
  static async getGroupTypes(params?: QueryParams): Promise<PaginatedResponse<GroupType>> {
    const response = await httpClient.get<GroupTypesApiResponse>(
      this.BASE_URL,
      { params }
    );
    
    console.log('🔍 Debug - Resposta completa da API:', response.data);
    
    // Os dados já vêm diretamente no formato correto
    const apiData = response.data;
    console.log('🔍 Debug - Dados da API:', apiData);
    
    // Verifica se apiData tem a propriedade items
    if (!apiData.items) {
      throw new Error('Resposta da API inválida: propriedade items não encontrada');
    }
    
    return {
      data: apiData.items || [],
      totalCount: apiData.total || 0,
      pageNumber: apiData.page || 1,
      pageSize: apiData.limit || 10,
      totalPages: apiData.totalPages || 1,
      hasPreviousPage: (apiData.page || 1) > 1,
      hasNextPage: (apiData.page || 1) < (apiData.totalPages || 1),
    };
  }

  /**
   * Busca um tipo de grupo específico por ID
   */
  static async getGroupTypeById(id: string): Promise<GroupType> {
    const response = await httpClient.get<GroupType>(`${this.BASE_URL}/${id}`);
    
    console.log('🔍 Debug - Resposta do get by ID:', response.data);
    
    // A API retorna os dados diretamente
    return response.data;
  }

  /**
   * Cria um novo tipo de grupo
   */
  static async createGroupType(data: CreateGroupTypeRequest): Promise<GroupType> {
    const response = await httpClient.post<GroupType>(
      this.BASE_URL,
      data
    );
    
    console.log('🔍 Debug - Resposta da criação:', response.data);
    
    // A API retorna os dados diretamente para POST
    return response.data;
  }

  /**
   * Atualiza um tipo de grupo existente
   */
  static async updateGroupType(id: string, data: UpdateGroupTypeRequest): Promise<GroupType> {
    const response = await httpClient.put<GroupType>(
      `${this.BASE_URL}/${id}`,
      data
    );
    
    console.log('🔍 Debug - Resposta da atualização:', response.data);
    
    // A API retorna os dados diretamente para PUT
    return response.data;
  }

  /**
   * Exclui um tipo de grupo
   */
  static async deleteGroupType(id: string): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
    
    console.log('🔍 Debug - Exclusão realizada com sucesso');
    
    // DELETE não retorna dados, apenas confirma sucesso
  }

  /**
   * Verifica se um código já existe
   */
  static async checkCodeExists(code: string, excludeId?: string): Promise<boolean> {
    try {
      const params: QueryParams = { search: code };
      const response = await this.getGroupTypes(params);
      
      const existingGroupType = response.data.find(gt => 
        gt.code.toLowerCase() === code.toLowerCase() && 
        (!excludeId || gt.id !== excludeId)
      );
      
      return !!existingGroupType;
    } catch (error) {
      console.error('Erro ao verificar código:', error);
      throw error;
    }
  }

  /**
   * Alterna o status ativo/inativo de um tipo de grupo
   */
  static async toggleGroupTypeStatus(id: string): Promise<GroupType> {
    const response = await httpClient.patch<GroupType>(`${this.BASE_URL}/${id}/toggle-status`);
    
    console.log('🔍 Debug - Resposta do toggle status:', response.data);
    
    // A API retorna os dados diretamente
    return response.data;
  }
}