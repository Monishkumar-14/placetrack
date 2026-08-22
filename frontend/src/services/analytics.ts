import api from './api';
import type { DashboardStats, ConversionFunnel, AssessmentAnalytics, InterviewAnalytics, CompensationAnalytics, PlacementStats, UpcomingEventItem, ScheduleConflict } from '@/types';

export const analyticsService = {
  async dashboard(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/analytics/dashboard');
    return data;
  },

  async funnel(): Promise<ConversionFunnel> {
    const { data } = await api.get<ConversionFunnel>('/analytics/funnel');
    return data;
  },

  async assessments(): Promise<AssessmentAnalytics> {
    const { data } = await api.get<AssessmentAnalytics>('/analytics/assessments');
    return data;
  },

  async interviews(): Promise<InterviewAnalytics> {
    const { data } = await api.get<InterviewAnalytics>('/analytics/interviews');
    return data;
  },

  async compensation(): Promise<CompensationAnalytics> {
    const { data } = await api.get<CompensationAnalytics>('/analytics/compensation');
    return data;
  },

  async stats(): Promise<PlacementStats> {
    const { data } = await api.get<PlacementStats>('/analytics/stats');
    return data;
  },

  async upcomingEvents(): Promise<UpcomingEventItem[]> {
    const { data } = await api.get<UpcomingEventItem[]>('/events/upcoming');
    return data;
  },

  async conflicts(): Promise<ScheduleConflict[]> {
    const { data } = await api.get<ScheduleConflict[]>('/analytics/conflicts');
    return data;
  },
};

export const exportService = {
  async exportCSV(): Promise<Blob> {
    const { data } = await api.get('/export/csv', { responseType: 'blob' });
    return data;
  },

  async exportExcel(): Promise<Blob> {
    const { data } = await api.get('/export/excel', { responseType: 'blob' });
    return data;
  },

  async importCSV(file: File): Promise<{ imported: number }> {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<{ imported: number }>('/export/import/csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};
