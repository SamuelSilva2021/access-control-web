import type { PaginatedResponse } from '../types';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '../types/permission.types';
import { httpClient } from '../utils/http-client';

// Interface para ErrorDTO da API
interface ErrorDTO {
  code: string;
  property?: string;
  message: string;
  details?: string[];
}

// Helper function para tratar erros da API
const getErrorMessage = (errors: ErrorDTO[] | undefined): string => {
  if (!errors || !Array.isArray(errors) || errors.length === 0) {
    return 'Erro desconhecido na API';
  }
  return errors.map(error => error.message).join(', ');
};

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  moduleId?: string;
  roleId?: string;
}

// Interface específica para a resposta da API de Permissions
interface PermissionsApiResponse {
  succeeded: boolean;
  successResult: any;
  errors: ErrorDTO[];
  headers: Record<string, any>;
  data: Permission[];
  requestUrl: string | null;
  requestBody: string | null;
  rawRequestBody: string | null;
  exception: string | null;
}

// Interface para respostas de permissão única
interface PermissionApiResponse {
  succeeded: boolean;
  successResult: any;
  errors: ErrorDTO[];
  headers: Record<string, any>;
  data: Permission;
  requestUrl: string | null;
  requestBody: string | null;
  rawRequestBody: string | null;
  exception: string | null;
}

/**
 * Serviço para gerenciar permissões
 * Centraliza todas as chamadas à API de permissões
 */
export class PermissionService {
  private static readonly BASE_URL = '/api/permissions';

  /**
   * Lista todas as permissões com paginação
   */
  static async getPermissions(params?: QueryParams): Promise<PaginatedResponse<Permission>> {
    console.log('🔍 Buscando permissões com parâmetros:', params);
    
    const response = await httpClient.get<Permission[] | PermissionsApiResponse>(
      this.BASE_URL,
      { params }
    );
    
    console.log('🔍 Debug - Resposta completa da API (Permissions):', response.data);
    
    let permissions: Permission[];
    
    // Verifica se a resposta é um array direto ou um ResponseDTO
    if (Array.isArray(response.data)) {
      console.log('🔍 Debug - API retornou array direto');
      permissions = response.data;
    } else {
      console.log('🔍 Debug - API retornou ResponseDTO');
      const apiData = response.data as PermissionsApiResponse;
      
      // Verifica se a operação foi bem-sucedida
      if (!apiData.succeeded) {
        throw new Error(`Erro na API: ${getErrorMessage(apiData.errors)}`);
      }
      
      // Verifica se apiData tem a propriedade data
      if (!apiData.data || !Array.isArray(apiData.data)) {
        throw new Error('Resposta da API inválida: propriedade data não encontrada ou não é array');
      }
      
      permissions = apiData.data;
    }
    
    console.log('🔍 Debug - Permissions extraídas:', permissions);
    
    // Aplicar filtros no frontend se necessário
    let filteredPermissions = permissions;
    
    // Filtro por busca
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      filteredPermissions = filteredPermissions.filter(permission =>
        permission.name.toLowerCase().includes(searchLower) ||
        (permission.description && permission.description.toLowerCase().includes(searchLower)) ||
        (permission.moduleName && permission.moduleName.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtro por status
    if (params?.isActive !== undefined) {
      filteredPermissions = filteredPermissions.filter(permission => 
        permission.isActive === params.isActive
      );
    }
    
    // Filtro por módulo
    if (params?.moduleId) {
      filteredPermissions = filteredPermissions.filter(permission => 
        permission.moduleId === params.moduleId
      );
    }
    
    // Filtro por role
    if (params?.roleId) {
      filteredPermissions = filteredPermissions.filter(permission => 
        permission.roleId === params.roleId
      );
    }
    
    // Ordenação
    const sortBy = params?.sortBy || 'name';
    const sortOrder = params?.sortOrder || 'asc';
    
    filteredPermissions.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Permission];
      let bValue: any = b[sortBy as keyof Permission];
      
      // Tratamento especial para datas
      if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      // Tratamento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      let comparison = 0;
      if (aValue > bValue) comparison = 1;
      if (aValue < bValue) comparison = -1;
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Aplicar paginação no frontend
    const pageSize = params?.limit || 10;
    const currentPage = params?.page || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedPermissions = filteredPermissions.slice(startIndex, endIndex);
    
    const totalCount = filteredPermissions.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    console.log('📊 Paginação calculada:', {
      totalCount,
      pageSize,
      currentPage,
      totalPages,
      startIndex,
      endIndex,
      itemsInPage: paginatedPermissions.length
    });
    
    return {
      data: paginatedPermissions,
      totalCount: totalCount,
      pageNumber: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  }

  /**
   * Busca permissão por ID
   */
  static async getPermissionById(id: string): Promise<Permission> {
    const response = await httpClient.get<PermissionApiResponse>(`${this.BASE_URL}/${id}`);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
    
    return response.data.data;
  }

  /**
   * Busca permissões por módulo
   */
  static async getPermissionsByModule(moduleId: string): Promise<Permission[]> {
    const response = await httpClient.get<PermissionsApiResponse>(`${this.BASE_URL}/module/${moduleId}`);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
    
    return response.data.data;
  }

  /**
   * Busca permissões por role
   */
  static async getPermissionsByRole(roleId: string): Promise<Permission[]> {
    const response = await httpClient.get<PermissionsApiResponse>(`${this.BASE_URL}/role/${roleId}`);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
    
    return response.data.data;
  }

  /**
   * Cria uma nova permissão
   */
  static async createPermission(permission: CreatePermissionRequest): Promise<Permission> {
    const response = await httpClient.post<PermissionApiResponse>(this.BASE_URL, permission);
    
    console.log('🔍 Debug - Resposta completa da API (Create Permission):', response);
    console.log('🔍 Debug - Dados da resposta:', response.data);
    
    // Verifica se temos dados na resposta
    if (!response.data) {
      throw new Error('Resposta da API inválida: sem dados');
    }
    
    // Se a resposta tem a propriedade succeeded, usa a lógica ResponseDTO
    if ('succeeded' in response.data) {
      const apiData = response.data as PermissionApiResponse;
      console.log('🔍 Debug - ResponseDTO detectado, succeeded:', apiData.succeeded);
      
      if (!apiData.succeeded) {
        throw new Error(`Erro na API: ${getErrorMessage(apiData.errors)}`);
      }
      
      return apiData.data;
    }
    
    // Se não tem succeeded, assume que é a permissão direta
    return response.data as Permission;
  }

  /**
   * Atualiza uma permissão existente
   */
  static async updatePermission(id: string, permission: UpdatePermissionRequest): Promise<Permission> {
    const response = await httpClient.put<PermissionApiResponse>(`${this.BASE_URL}/${id}`, permission);
    
    console.log('🔍 Debug - Resposta completa da API (Update Permission):', response);
    console.log('🔍 Debug - Dados da resposta:', response.data);
    
    // Verifica se temos dados na resposta
    if (!response.data) {
      throw new Error('Resposta da API inválida: sem dados');
    }
    
    // Se a resposta tem a propriedade succeeded, usa a lógica ResponseDTO
    if ('succeeded' in response.data) {
      const apiData = response.data as PermissionApiResponse;
      console.log('🔍 Debug - ResponseDTO detectado, succeeded:', apiData.succeeded);
      
      if (!apiData.succeeded) {
        throw new Error(`Erro na API: ${getErrorMessage(apiData.errors)}`);
      }
      
      return apiData.data;
    }
    
    // Se não tem succeeded, assume que é a permissão direta
    return response.data as Permission;
  }

  /**
   * Remove uma permissão (soft delete)
   */
  static async deletePermission(id: string): Promise<boolean> {
    const response = await httpClient.delete<PermissionApiResponse>(`${this.BASE_URL}/${id}`);
    
    console.log('🔍 Debug - Resposta da API (Delete Permission):', response.data);
    
    // Verifica se temos dados na resposta
    if (!response.data) {
      throw new Error('Resposta da API inválida: sem dados');
    }
    
    // Se a resposta tem a propriedade succeeded, usa a lógica ResponseDTO
    if ('succeeded' in response.data) {
      const apiData = response.data as PermissionApiResponse;
      
      if (!apiData.succeeded) {
        throw new Error(`Erro na API: ${getErrorMessage(apiData.errors)}`);
      }
    }
    
    return true;
  }

  /**
   * Alterna o status de uma permissão
   */
  static async togglePermissionStatus(id: string): Promise<Permission> {
    const response = await httpClient.patch<PermissionApiResponse>(`${this.BASE_URL}/${id}/toggle-status`);
    
    console.log('🔍 Debug - Resposta da API (Toggle Permission):', response.data);
    
    // Verifica se temos dados na resposta
    if (!response.data) {
      throw new Error('Resposta da API inválida: sem dados');
    }
    
    // Se a resposta tem a propriedade succeeded, usa a lógica ResponseDTO
    if ('succeeded' in response.data) {
      const apiData = response.data as PermissionApiResponse;
      
      if (!apiData.succeeded) {
        throw new Error(`Erro na API: ${getErrorMessage(apiData.errors)}`);
      }
      
      return apiData.data;
    }
    
    // Se não tem succeeded, assume que é a permissão direta
    return response.data as Permission;
  }
}