import type { PaginatedResponse } from '../types';
import type { Operation, CreateOperationRequest, UpdateOperationRequest } from '../types/permission.types';
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
}

// Interface específica para a resposta da API de Operations
interface OperationsApiResponse {
  succeeded: boolean;
  successResult: any;
  errors: ErrorDTO[];
  headers: Record<string, any>;
  data: Operation[]; // A API retorna um array direto
  requestUrl: string | null;
  requestBody: string | null;
  rawRequestBody: string | null;
  exception: string | null;
}

// Interface para respostas de operação única
interface OperationApiResponse {
  succeeded: boolean;
  successResult: any;
  errors: ErrorDTO[];
  headers: Record<string, any>;
  data: Operation;
  requestUrl: string | null;
  requestBody: string | null;
  rawRequestBody: string | null;
  exception: string | null;
}

/**
 * Serviço para gerenciar operações
 * Centraliza todas as chamadas à API de operações
 */
export class OperationService {
  private static readonly BASE_URL = '/api/operation';

  /**
   * Lista todas as operações (não paginado)
   */
  static async getOperations(params?: QueryParams): Promise<PaginatedResponse<Operation>> {
    const response = await httpClient.get<Operation[] | OperationsApiResponse>(
      this.BASE_URL,
      { params }
    );
        
    let operations: Operation[];
    
    // Verifica se a resposta é um array direto ou um ResponseDTO
    if (Array.isArray(response.data)) {
      operations = response.data;
    } else {
      const apiData = response.data as OperationsApiResponse;
      
      // Verifica se a operação foi bem-sucedida
      if (!apiData.succeeded) {
        throw new Error(`Erro na API: ${getErrorMessage(apiData.errors)}`);
      }
      
      // Verifica se apiData tem a propriedade data
      if (!apiData.data) {
        throw new Error('Resposta da API inválida: propriedade data não encontrada');
      }
      
      operations = Array.isArray(apiData.data) ? apiData.data : [];
    }
        
    // Simula paginação no frontend já que a API não é paginada
    const pageSize = params?.limit || 10;
    const currentPage = params?.page || 1;
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedOperations = operations.slice(startIndex, endIndex);
    
    const totalCount = operations.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    return {
      data: paginatedOperations,
      totalCount: totalCount,
      pageNumber: currentPage,
      pageSize: pageSize,
      totalPages: totalPages,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
    };
  }

  /**
   * Busca uma operação específica por ID
   */
  static async getOperationById(id: string): Promise<Operation> {
    const response = await httpClient.get<OperationApiResponse>(`${this.BASE_URL}/${id}`);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
    
    return response.data.data;
  }

  /**
   * Cria uma nova operação
   */
  static async createOperation(data: CreateOperationRequest): Promise<Operation> {
    const response = await httpClient.post<OperationApiResponse>(this.BASE_URL, data);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
    
    return response.data.data;
  }

  /**
   * Atualiza uma operação existente
   */
  static async updateOperation(id: string, data: UpdateOperationRequest): Promise<Operation> {
    const response = await httpClient.put<OperationApiResponse>(`${this.BASE_URL}/${id}`, data);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
    
    return response.data.data;
  }

  /**
   * Exclui uma operação
   */
  static async deleteOperation(id: string): Promise<void> {
    const response = await httpClient.delete<OperationApiResponse>(`${this.BASE_URL}/${id}`);
    
    if (!response.data.succeeded) {
      throw new Error(`Erro na API: ${getErrorMessage(response.data.errors)}`);
    }
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