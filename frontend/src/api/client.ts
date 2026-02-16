import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import type { Component, ComponentFormData, Record, RecordFormData, PulseCheck, PulseCheckFormData, InsightsData, Stage, StageFormData, StageStatus } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.accessToken?.toString();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // Not authenticated — let request proceed without token
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const componentApi = {
  getAll: async (): Promise<Component[]> => {
    const { data } = await api.get<Component[]>('/components');
    return data;
  },

  getById: async (id: string): Promise<Component> => {
    const { data } = await api.get<Component>(`/components/${id}`);
    return data;
  },

  create: async (component: ComponentFormData): Promise<Component> => {
    const { data } = await api.post<Component>('/components', component);
    return data;
  },

  update: async (id: string, component: Partial<ComponentFormData>): Promise<Component> => {
    const { data } = await api.patch<Component>(`/components/${id}`, component);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/components/${id}`);
  },
};

export const recordApi = {
  getAll: async (params?: { startDate?: string; endDate?: string; componentId?: string }): Promise<Record[]> => {
    const { data } = await api.get<Record[]>('/records', { params });
    return data;
  },

  create: async (record: RecordFormData): Promise<Record> => {
    const { data } = await api.post<Record>('/records', record);
    return data;
  },

  update: async (id: string, record: Partial<Omit<RecordFormData, 'componentId'>>): Promise<Record> => {
    const { data } = await api.patch<Record>(`/records/${id}`, record);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/records/${id}`);
  },
};

export const pulseCheckApi = {
  getAll: async (params?: { startDate?: string; endDate?: string }): Promise<PulseCheck[]> => {
    const { data } = await api.get<PulseCheck[]>('/pulse-checks', { params });
    return data;
  },

  getToday: async (): Promise<PulseCheck | null> => {
    const { data } = await api.get<PulseCheck | null>('/pulse-checks/today');
    return data;
  },

  getById: async (id: string): Promise<PulseCheck> => {
    const { data } = await api.get<PulseCheck>(`/pulse-checks/${id}`);
    return data;
  },

  create: async (pulseCheck: PulseCheckFormData): Promise<PulseCheck> => {
    const { data } = await api.post<PulseCheck>('/pulse-checks', pulseCheck);
    return data;
  },

  update: async (id: string, pulseCheck: Partial<PulseCheckFormData>): Promise<PulseCheck> => {
    const { data } = await api.patch<PulseCheck>(`/pulse-checks/${id}`, pulseCheck);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pulse-checks/${id}`);
  },

  getInsights: async (): Promise<InsightsData> => {
    const { data } = await api.get<InsightsData>('/pulse-checks/insights');
    return data;
  },
};

export const stageApi = {
  getByComponent: async (componentId: string): Promise<Stage[]> => {
    const { data } = await api.get<Stage[]>('/stages', { params: { componentId } });
    return data;
  },

  create: async (stage: StageFormData): Promise<Stage> => {
    const { data } = await api.post<Stage>('/stages', stage);
    return data;
  },

  update: async (id: string, stage: Partial<Omit<StageFormData, 'componentId'> & { status?: StageStatus }>): Promise<Stage> => {
    const { data } = await api.patch<Stage>(`/stages/${id}`, stage);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/stages/${id}`);
  },

  reorder: async (componentId: string, stageIds: string[]): Promise<Stage[]> => {
    const { data } = await api.put<Stage[]>(`/stages/reorder/${componentId}`, { stageIds });
    return data;
  },
};
