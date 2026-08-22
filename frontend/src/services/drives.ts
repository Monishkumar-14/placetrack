import api from './api';
import type { Drive, DriveCreate, DriveUpdate, DriveDetail } from '@/types';

export const driveService = {
  async list(params?: { company_id?: number; status?: string; drive_type?: string; skip?: number; limit?: number }): Promise<Drive[]> {
    const { data } = await api.get<Drive[]>('/drives', { params });
    return data;
  },

  async get(id: number): Promise<DriveDetail> {
    const { data } = await api.get<DriveDetail>(`/drives/${id}`);
    return data;
  },

  async create(drive: DriveCreate): Promise<Drive> {
    const { data } = await api.post<Drive>('/drives', drive);
    return data;
  },

  async update(id: number, drive: DriveUpdate): Promise<Drive> {
    const { data } = await api.put<Drive>(`/drives/${id}`, drive);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/drives/${id}`);
  },
};
