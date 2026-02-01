import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recordApi } from '../api/client';
import type { RecordFormData } from '../types';

interface RecordFilters {
  startDate?: string;
  endDate?: string;
  componentId?: string;
}

export function useRecords(filters?: RecordFilters) {
  return useQuery({
    queryKey: ['records', filters],
    queryFn: () => recordApi.getAll(filters),
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RecordFormData) => recordApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useUpdateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<RecordFormData, 'componentId'>> }) =>
      recordApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recordApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['components'] });
    },
  });
}
