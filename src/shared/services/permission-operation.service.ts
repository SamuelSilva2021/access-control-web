import type { PaginatedResponse } from '../types';
import type { 
  PermissionOperation, 
  CreatePermissionOperationRequest, 
  UpdatePermissionOperationRequest,
  PermissionOperationBulkRequest 
} from '../types/permission.types';
import { httpClient } from '../utils/http-client';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  permissionId?: string;
  operationId?: string;
}

// Interface específica para a resposta da API de Permission Operations
interface PermissionOperationsApiResponse {
  items: PermissionOperation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Serviço para gerenciar relações Permissão-Operação
 * Centraliza todas as chamadas à API de permission operations
 */
export class PermissionOperationService {
  private static readonly BASE_URL = '/api/permission-operations';

  /**
   * Lista todas as relações permissão-operação com paginação
   */
  static async getPermissionOperations(params?: QueryParams): Promise<PaginatedResponse<PermissionOperation>> {
    const response = await httpClient.get<PermissionOperationsApiResponse>(
      this.BASE_URL,
      { params }
    );
    
    console.log('🔍 Debug - Resposta completa da API (Permission Operations):', response.data);
    
    // Os dados já vêm diretamente no formato correto
    const apiData = response.data;
    console.log('🔍 Debug - Dados da API (Permission Operations):', apiData);
    
    // Verifica se apiData tem a propriedade items
    if (!apiData.items) {
      throw new Error('Resposta da API inválida: propriedade items não encontrada');
    }
    
    return {
      data: apiData.items,
      totalCount: apiData.total,
      pageNumber: apiData.page,
      pageSize: apiData.limit,
      totalPages: apiData.totalPages,
      hasPreviousPage: apiData.page > 1,
      hasNextPage: apiData.page < apiData.totalPages
    };
  }

  /**
   * Busca relação por ID
   */
  static async getPermissionOperationById(id: string): Promise<PermissionOperation> {
    const response = await httpClient.get<PermissionOperation>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Busca relações por ID da permissão
   */
  static async getByPermissionId(permissionId: string): Promise<PermissionOperation[]> {
    const response = await httpClient.get<PermissionOperation[]>(`${this.BASE_URL}/permission/${permissionId}`);
    return response.data;
  }

  /**
   * Busca relações por ID da operação
   */
  static async getByOperationId(operationId: string): Promise<PermissionOperation[]> {
    const response = await httpClient.get<PermissionOperation[]>(`${this.BASE_URL}/operation/${operationId}`);
    return response.data;
  }

  /**
   * Busca uma relação específica entre permissão e operação
   */
  static async getByPermissionAndOperation(permissionId: string, operationId: string): Promise<PermissionOperation> {
    const response = await httpClient.get<PermissionOperation>(
      `${this.BASE_URL}/permission/${permissionId}/operation/${operationId}`
    );
    return response.data;
  }

  /**
   * Cria uma nova relação permissão-operação
   */
  static async createPermissionOperation(permissionOperation: CreatePermissionOperationRequest): Promise<PermissionOperation> {
    const response = await httpClient.post<PermissionOperation>(this.BASE_URL, permissionOperation);
    return response.data;
  }

  /**
   * Cria múltiplas relações permissão-operação (bulk)
   */
  static async createPermissionOperationsBulk(bulkRequest: PermissionOperationBulkRequest): Promise<PermissionOperation[]> {
    const response = await httpClient.post<PermissionOperation[]>(`${this.BASE_URL}/bulk`, bulkRequest);
    return response.data;
  }

  /**
   * Atualiza uma relação permissão-operação existente
   */
  static async updatePermissionOperation(id: string, permissionOperation: UpdatePermissionOperationRequest): Promise<PermissionOperation> {
    const response = await httpClient.put<PermissionOperation>(`${this.BASE_URL}/${id}`, permissionOperation);
    return response.data;
  }

  /**
   * Remove uma relação permissão-operação (soft delete)
   */
  static async deletePermissionOperation(id: string): Promise<boolean> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
    return true;
  }

  /**
   * Remove todas as relações de uma permissão (soft delete)
   */
  static async deleteAllByPermissionId(permissionId: string): Promise<boolean> {
    await httpClient.delete(`${this.BASE_URL}/permission/${permissionId}`);
    return true;
  }

  /**
   * Remove relações específicas de uma permissão (soft delete)
   */
  static async deleteByPermissionAndOperations(permissionId: string, operationIds: string[]): Promise<boolean> {
    await httpClient.delete(`${this.BASE_URL}/permission/${permissionId}/operations`, {
      data: { operationIds }
    });
    return true;
  }

  /**
   * Alterna o status de uma relação permissão-operação
   */
  static async togglePermissionOperationStatus(id: string): Promise<PermissionOperation> {
    const response = await httpClient.patch<PermissionOperation>(`${this.BASE_URL}/${id}/toggle-status`);
    return response.data;
  }
}