import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { componentApi } from '../api/client';
import type { ComponentFormData } from '../types';

export function useComponents() {
  return useQuery({
    queryKey: ['components'],
    queryFn: componentApi.getAll,
  });
}

export function useComponent(id: string) {
  return useQuery({
    queryKey: ['components', id],
    queryFn: () => componentApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ComponentFormData) => componentApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ComponentFormData> }) =>
      componentApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => componentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}
