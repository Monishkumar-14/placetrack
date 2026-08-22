import api from './api';

export interface RoundInfo {
  round_type: 'ppt' | 'test' | 'interview';
  date?: string;
  time?: string;
  venue_mode?: string;
  venue_name?: string;
  platform?: string;
  notes?: string;
}

export interface PlacementCreate {
  company_name: string;
  company_description?: string;
  job_role: string;
  job_location?: string;
  employment_type: string;
  description?: string;
  annual_ctc?: number;
  monthly_stipend?: number;
  ppo_available?: boolean;
  ppo_ctc?: number;
  eligible_branches?: string;
  min_cgpa?: number;
  min_10th_pct?: number;
  min_12th_pct?: number;
  max_backlogs?: number;
  academic_year?: string;
  reg_start_date?: string;
  reg_deadline?: string;
  rounds?: RoundInfo[];
  current_status?: string;
  notes?: string;
  priority?: string;
}

export interface Placement {
  id: number;
  company_id: number;
  company_name: string;
  job_role: string;
  job_location?: string;
  employment_type?: string;
  description?: string;
  annual_ctc?: number;
  monthly_stipend?: number;
  ppo_available?: boolean;
  ppo_ctc?: number;
  eligible_branches?: string;
  min_cgpa?: number;
  min_10th_pct?: number;
  min_12th_pct?: number;
  max_backlogs?: number;
  reg_start_date?: string;
  reg_deadline?: string;
  ppt_date?: string;
  ppt_venue?: string;
  test_date?: string;
  test_venue?: string;
  interview_date?: string;
  interview_mode?: string;
  overall_status?: string;
  priority?: string;
  notes?: string;
  created_at: string;
}

export const placementService = {
  async list(): Promise<Placement[]> {
    const { data } = await api.get<Placement[]>('/placements');
    return data;
  },

  async get(id: number): Promise<Placement> {
    const { data } = await api.get<Placement>(`/placements/${id}`);
    return data;
  },

  async create(placement: PlacementCreate): Promise<Placement> {
    const { data } = await api.post<Placement>('/placements', placement);
    return data;
  },

  async updateStatus(id: number, updates: { status?: string; notes?: string; priority?: string }): Promise<Placement> {
    const { data } = await api.patch<Placement>(`/placements/${id}/status`, updates);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/placements/${id}`);
  },
};
