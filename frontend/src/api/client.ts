import axios from 'axios';
import type { Component, ComponentFormData, Record, RecordFormData } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
