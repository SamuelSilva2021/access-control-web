import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { 
  CreateGroupTypeRequest, 
  UpdateGroupTypeRequest 
} from '../types';

// Query keys para cache management
export const GROUP_TYPE_QUERY_KEYS = {
  all: ['group-types'] as const,
  lists: () => [...GROUP_TYPE_QUERY_KEYS.all, 'list'] as const,
  list: () => [...GROUP_TYPE_QUERY_KEYS.lists()] as const,
  details: () => [...GROUP_TYPE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...GROUP_TYPE_QUERY_KEYS.details(), id] as const,
} as const;

/**
 * Hook para buscar todos os group types
 * TODO: Implementar método getGroupTypes no AccessGroupService
 */
export const useGroupTypes = () => {
  return useQuery({
    queryKey: GROUP_TYPE_QUERY_KEYS.list(),
    queryFn: () => {
      // TODO: Implementar AccessGroupService.getGroupTypes()
      console.warn('getGroupTypes não implementado ainda');
      return Promise.resolve([]);
    },
    staleTime: 10 * 60 * 1000, // 10 minutos (mais cache pois muda menos)
  });
};

/**
 * Hook para buscar um group type específico
 * TODO: Implementar método getGroupTypeById no AccessGroupService
 */
export const useGroupType = (id: string) => {
  return useQuery({
    queryKey: GROUP_TYPE_QUERY_KEYS.detail(id),
    queryFn: () => {
      console.warn('getGroupTypeById não implementado ainda');
      return Promise.resolve(null);
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para criar group type
 * TODO: Implementar método createGroupType no AccessGroupService
 */
export const useCreateGroupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupTypeRequest) => {
      console.warn('createGroupType não implementado ainda');
      return Promise.resolve(data as any);
    },
    onSuccess: () => {
      // Invalida cache das listagens
      queryClient.invalidateQueries({
        queryKey: GROUP_TYPE_QUERY_KEYS.lists(),
      });
    },
  });
};

/**
 * Hook para atualizar group type
 * TODO: Implementar método updateGroupType no AccessGroupService
 */
export const useUpdateGroupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupTypeRequest }) => {
      console.warn('updateGroupType não implementado ainda');
      return Promise.resolve({ id, ...data } as any);
    },
    onSuccess: (_, { id }) => {
      // Invalida cache das listagens e do item específico
      queryClient.invalidateQueries({
        queryKey: GROUP_TYPE_QUERY_KEYS.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: GROUP_TYPE_QUERY_KEYS.detail(id),
      });
    },
  });
};

/**
 * Hook para deletar group type
 * TODO: Implementar método deleteGroupType no AccessGroupService
 */
export const useDeleteGroupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (_id: string) => {
      console.warn('deleteGroupType não implementado ainda');
      return Promise.resolve();
    },
    onSuccess: (_, id) => {
      // Remove do cache e invalida listas
      queryClient.removeQueries({
        queryKey: GROUP_TYPE_QUERY_KEYS.detail(id),
      });
      queryClient.invalidateQueries({
        queryKey: GROUP_TYPE_QUERY_KEYS.lists(),
      });
    },
  });
};