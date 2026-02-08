import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pulseCheckApi } from '../api/client';
import type { PulseCheckFormData } from '../types';

export function usePulseChecks(params?: { startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ['pulseChecks', params],
    queryFn: () => pulseCheckApi.getAll(params),
  });
}

export function useTodayPulseCheck() {
  return useQuery({
    queryKey: ['pulseChecks', 'today'],
    queryFn: pulseCheckApi.getToday,
  });
}

export function usePulseCheck(id: string) {
  return useQuery({
    queryKey: ['pulseChecks', id],
    queryFn: () => pulseCheckApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePulseCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PulseCheckFormData) => pulseCheckApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulseChecks'] });
    },
  });
}

export function useUpdatePulseCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PulseCheckFormData> }) =>
      pulseCheckApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulseChecks'] });
    },
  });
}

export function useDeletePulseCheck() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pulseCheckApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pulseChecks'] });
    },
  });
}

export function useInsights() {
  return useQuery({
    queryKey: ['pulseChecks', 'insights'],
    queryFn: pulseCheckApi.getInsights,
  });
}
