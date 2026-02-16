import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { stageApi } from '../api/client';
import type { StageFormData, StageStatus } from '../types';

export function useStages(componentId: string) {
  return useQuery({
    queryKey: ['stages', componentId],
    queryFn: () => stageApi.getByComponent(componentId),
    enabled: !!componentId,
  });
}

export function useCreateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StageFormData) => stageApi.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages', variables.componentId] });
    },
  });
}

export function useUpdateStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; componentId: string; data: Partial<Omit<StageFormData, 'componentId'> & { status?: StageStatus }> }) =>
      stageApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages', variables.componentId] });
    },
  });
}

export function useDeleteStage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string; componentId: string }) => stageApi.delete(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages', variables.componentId] });
    },
  });
}

export function useReorderStages() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ componentId, stageIds }: { componentId: string; stageIds: string[] }) =>
      stageApi.reorder(componentId, stageIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stages', variables.componentId] });
    },
  });
}
