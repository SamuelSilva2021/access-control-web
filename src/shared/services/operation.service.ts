import type { PaginatedResponse } from '../types';
import type { Operation, CreateOperationRequest, UpdateOperationRequest } from '../types/permission.types';
import { httpClient } from '../utils/http-client';

interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface específica para a resposta da API de Operations
interface OperationsApiResponse {
  items: Operation[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Serviço para gerenciar operações
 * Centraliza todas as chamadas à API de operações
 */
export class OperationService {
  private static readonly BASE_URL = '/api/operation';

  /**
   * Lista todas as operações com paginação
   */
  static async getOperations(params?: QueryParams): Promise<PaginatedResponse<Operation>> {
    const response = await httpClient.get<OperationsApiResponse>(
      this.BASE_URL,
      { params }
    );
    
    console.log('🔍 Debug - Resposta completa da API (Operations):', response.data);
    
    // Os dados já vêm diretamente no formato correto
    const apiData = response.data;
    console.log('🔍 Debug - Dados da API (Operations):', apiData);
    
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
   * Busca uma operação específica por ID
   */
  static async getOperationById(id: string): Promise<Operation> {
    const response = await httpClient.get<Operation>(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  /**
   * Cria uma nova operação
   */
  static async createOperation(data: CreateOperationRequest): Promise<Operation> {
    const response = await httpClient.post<Operation>(this.BASE_URL, data);
    return response.data;
  }

  /**
   * Atualiza uma operação existente
   */
  static async updateOperation(id: string, data: UpdateOperationRequest): Promise<Operation> {
    const response = await httpClient.put<Operation>(`${this.BASE_URL}/${id}`, data);
    return response.data;
  }

  /**
   * Exclui uma operação
   */
  static async deleteOperation(id: string): Promise<void> {
    await httpClient.delete(`${this.BASE_URL}/${id}`);
  }

  /**
   * Verifica se um valor já existe
   */
  static async checkValueExists(value: string, excludeId?: string): Promise<boolean> {
    try {
      const response = await httpClient.get<{ exists: boolean }>(
        `${this.BASE_URL}/check-value`,
        { 
          params: { 
            value,
            excludeId 
          } 
        }
      );
      return response.data.exists;
    } catch (error) {
      console.warn('Erro ao verificar valor da operação:', error);
      return false;
    }
  }
}