import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { 
  CreateGroupTypeRequest, 
  UpdateGroupTypeRequest 
} from '../types';
import { AccessGroupService } from '../services';

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
 */
export const useGroupTypes = () => {
  return useQuery({
    queryKey: GROUP_TYPE_QUERY_KEYS.list(),
    queryFn: () => AccessGroupService.getGroupTypes(),
    staleTime: 10 * 60 * 1000, // 10 minutos (mais cache pois muda menos)
  });
};

/**
 * Hook para buscar um group type específico
 */
export const useGroupType = (id: string) => {
  return useQuery({
    queryKey: GROUP_TYPE_QUERY_KEYS.detail(id),
    queryFn: () => AccessGroupService.getGroupTypeById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};

/**
 * Hook para criar group type
 */
export const useCreateGroupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupTypeRequest) => 
      AccessGroupService.createGroupType(data),
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
 */
export const useUpdateGroupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupTypeRequest }) =>
      AccessGroupService.updateGroupType(id, data),
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
 */
export const useDeleteGroupType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => AccessGroupService.deleteGroupType(id),
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