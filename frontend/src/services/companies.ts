import api from './api';
import type { Company, CompanyCreate, CompanyUpdate } from '@/types';

export const companyService = {
  async list(params?: { q?: string; status?: string; priority?: string; archived?: boolean; sort?: string; skip?: number; limit?: number }): Promise<Company[]> {
    const { data } = await api.get<Company[]>('/companies', { params });
    return data;
  },

  async get(id: number): Promise<Company> {
    const { data } = await api.get<Company>(`/companies/${id}`);
    return data;
  },

  async create(company: CompanyCreate): Promise<Company> {
    const { data } = await api.post<Company>('/companies', company);
    return data;
  },

  async update(id: number, company: CompanyUpdate): Promise<Company> {
    const { data } = await api.put<Company>(`/companies/${id}`, company);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/companies/${id}`);
  },

  async toggleArchive(id: number): Promise<Company> {
    const { data } = await api.patch<Company>(`/companies/${id}/archive`);
    return data;
  },
};
