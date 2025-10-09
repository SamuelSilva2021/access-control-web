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

export class ModuleService {
  private static readonly BASE_URL = '/api/modules';

  static async getModules(params?: QueryParams): Promise<PaginatedResponse<Module>> {
    const response = await httpClient.get<AccessGroupApiResponse<Module>>(
      this.BASE_URL,
      { params }
    );
        
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

  static async getModuleById(id: string): Promise<Module> {
    const response = await httpClient.get<Module>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

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
        module.key?.toLowerCase() === moduleKey.toLowerCase() && // Mudança: moduleKey → key
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
      name: module.name,
      description: module.description || '',
      url: module.url || '',
      key: module.key || '', // Mudança: moduleKey → key
      code: module.code,
      applicationId: module.applicationId,
      moduleTypeId: module.moduleTypeId,
      isActive: !module.isActive
    });
    
    return updatedModule;
  }
}