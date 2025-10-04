import type { PaginatedResponse, AccessGroupApiResponse } from '../types';
import type { Module, CreateModuleRequest, UpdateModuleRequest } from '../types/permission.types';
import { httpClient } from '../utils/http-client';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Serviço para operações CRUD de Módulos
 * Integração com saas-authentication-api
 */
export class ModuleService {
  private static readonly BASE_URL = '/api/modules';

  /**
   * Lista todos os módulos com paginação
   */
  static async getModules(params?: QueryParams): Promise<PaginatedResponse<Module>> {
    const response = await httpClient.get<AccessGroupApiResponse<Module>>(
      this.BASE_URL,
      { params }
    );
        
    // A API retorna dados paginados no formato { items: [], page, limit, total, totalPages }
    const responseData = response.data;
    const modules = Array.isArray(responseData?.items) ? responseData.items : [];
    
    return {
      data: modules,
      totalCount: responseData?.total || 0,
      pageNumber: responseData?.page || 1,
      pageSize: responseData?.limit || 10,
      totalPages: responseData?.totalPages || 1,
      hasPreviousPage: (responseData?.page || 1) > 1,
      hasNextPage: (responseData?.page || 1) < (responseData?.totalPages || 1),
    };
  }

  /**
   * Busca um módulo específico por ID
   */
  static async getModuleById(id: string): Promise<Module> {
    const response = await httpClient.get<Module>(`${this.BASE_URL}/${id}`);
    // A API retorna o módulo direto no data quando busca por ID
    return response.data;
  }

  /**
   * Cria um novo módulo
   */
  static async createModule(data: CreateModuleRequest): Promise<Module> {
    const response = await httpClient.post<Module>(
      this.BASE_URL,
      data
    );
    return response.data;
  }

  /**
   * Atualiza um módulo existente
   */
  static async updateModule(id: string, data: UpdateModuleRequest): Promise<Module> {
    const response = await httpClient.put<Module>(
      `${this.BASE_URL}/${id}`,
      data
    );
    return response.data;
  }

  /**
   * Exclui um módulo
   */
  static async deleteModule(id: string): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Verifica se uma chave de módulo já existe
   */
  static async checkModuleKeyExists(moduleKey: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await this.getModules();
      
      const existingModule = response.data.find(module => 
        module.moduleKey?.toLowerCase() === moduleKey.toLowerCase() && 
        (!excludeId || module.id !== excludeId)
      );
      
      return !!existingModule;
    } catch (error) {
      console.error('Erro ao verificar chave do módulo:', error);
      throw error;
    }
  }

  /**
   * Alterna o status ativo/inativo de um módulo
   */
  static async toggleModuleStatus(id: string): Promise<Module> {
    // Como a API não tem endpoint específico, faremos um patch manual
    const module = await this.getModuleById(id);
    const updatedModule = await this.updateModule(id, {
      isActive: !module.isActive
    });
    
    return updatedModule;
  }
}