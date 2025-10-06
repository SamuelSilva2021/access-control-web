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

// Interface específica para a resposta da API de Operations quando lista (diferente estrutura)
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
    const response = await httpClient.get<Operation>(`${this.BASE_URL}/${id}`);
    
    if (!response.succeeded) {
      const errorMessage = Array.isArray(response.errors) && response.errors.length > 0
        ? response.errors.join(', ')
        : 'Erro desconhecido na API';
      throw new Error(`Erro na API: ${errorMessage}`);
    }
    
    return response.data;
  }

  /**
   * Cria uma nova operação
   */
  static async createOperation(data: CreateOperationRequest): Promise<Operation> {
    try {
      console.log('🔄 OperationService: Enviando dados para criação:', data);
      
      const response = await httpClient.post<Operation>(this.BASE_URL, data);
      
      console.log('🔍 OperationService: Resposta da API:', {
        succeeded: response.succeeded,
        errors: response.errors,
        data: response.data
      });
      
      if (!response.succeeded) {
        const errorMessage = Array.isArray(response.errors) && response.errors.length > 0
          ? response.errors.join(', ')
          : 'Erro desconhecido na API';
          
        console.error('❌ OperationService: API retornou erro:', {
          errors: response.errors,
          errorMessage
        });
        throw new Error(`Erro na API: ${errorMessage}`);
      }
      
      if (!response.data) {
        console.error('❌ OperationService: API não retornou dados válidos');
        throw new Error('API não retornou dados válidos para a operação criada');
      }
      
      console.log('✅ OperationService: Operação criada com sucesso:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ OperationService: Erro ao criar operação:', error);
      
      // Se for um erro de rede ou HTTP, vamos capturar mais detalhes
      if (error.response) {
        console.error('❌ OperationService: Detalhes do erro HTTP:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
        
        // Tenta extrair a mensagem de erro mais específica
        if (error.response.data?.errors?.length > 0) {
          const specificError = Array.isArray(error.response.data.errors)
            ? error.response.data.errors.join(', ')
            : 'Erro na resposta da API';
          throw new Error(`Erro na API: ${specificError}`);
        }
        
        throw new Error(`Erro HTTP ${error.response.status}: ${error.response.statusText}`);
      }
      
      // Re-lança o erro original se não for um erro HTTP
      throw error;
    }
  }

  /**
   * Atualiza uma operação existente
   */
  static async updateOperation(id: string, data: UpdateOperationRequest): Promise<Operation> {
    const response = await httpClient.put<Operation>(`${this.BASE_URL}/${id}`, data);
    
    if (!response.succeeded) {
      const errorMessage = Array.isArray(response.errors) && response.errors.length > 0
        ? response.errors.join(', ')
        : 'Erro desconhecido na API';
      throw new Error(`Erro na API: ${errorMessage}`);
    }
    
    return response.data;
  }

  /**
   * Exclui uma operação
   */
  static async deleteOperation(id: string): Promise<void> {
    const response = await httpClient.delete<void>(`${this.BASE_URL}/${id}`);
    
    if (!response.succeeded) {
      const errorMessage = Array.isArray(response.errors) && response.errors.length > 0
        ? response.errors.join(', ')
        : 'Erro desconhecido na API';
      throw new Error(`Erro na API: ${errorMessage}`);
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
      // Como a resposta é um objeto simples, acessamos direto o campo
      return response.data?.exists || false;
    } catch (error) {
      console.warn('Erro ao verificar valor da operação:', error);
      return false;
    }
  }
}