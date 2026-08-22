import api from './api';
import type { PlacementEvent, EventCreate, EventUpdate, Assessment, AssessmentCreate, AssessmentUpdate, Interview, InterviewCreate, InterviewUpdate, Offer, OfferCreate, OfferUpdate, PreparationNote, NoteCreate, NoteUpdate } from '@/types';

// Events
export const eventService = {
  async list(params?: { event_type?: string; date_from?: string; date_to?: string }): Promise<PlacementEvent[]> {
    const { data } = await api.get<PlacementEvent[]>('/events', { params });
    return data;
  },

  async upcoming(): Promise<PlacementEvent[]> {
    const { data } = await api.get<PlacementEvent[]>('/events/upcoming');
    return data;
  },

  async create(event: EventCreate): Promise<PlacementEvent> {
    const { data } = await api.post<PlacementEvent>('/events', event);
    return data;
  },

  async update(id: number, event: EventUpdate): Promise<PlacementEvent> {
    const { data } = await api.put<PlacementEvent>(`/events/${id}`, event);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/events/${id}`);
  },
};

// Assessments
export const assessmentService = {
  async list(params?: { assessment_type?: string; result?: string; shortlisted?: string }): Promise<Assessment[]> {
    const { data } = await api.get<Assessment[]>('/assessments', { params });
    return data;
  },

  async create(assessment: AssessmentCreate): Promise<Assessment> {
    const { data } = await api.post<Assessment>('/assessments', assessment);
    return data;
  },

  async update(id: number, assessment: AssessmentUpdate): Promise<Assessment> {
    const { data } = await api.put<Assessment>(`/assessments/${id}`, assessment);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/assessments/${id}`);
  },
};

// Interviews
export const interviewService = {
  async list(params?: { interview_type?: string; status?: string }): Promise<Interview[]> {
    const { data } = await api.get<Interview[]>('/interviews', { params });
    return data;
  },

  async create(interview: InterviewCreate): Promise<Interview> {
    const { data } = await api.post<Interview>('/interviews', interview);
    return data;
  },

  async update(id: number, interview: InterviewUpdate): Promise<Interview> {
    const { data } = await api.put<Interview>(`/interviews/${id}`, interview);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/interviews/${id}`);
  },
};

// Offers
export const offerService = {
  async list(): Promise<Offer[]> {
    const { data } = await api.get<Offer[]>('/offers');
    return data;
  },

  async create(offer: OfferCreate): Promise<Offer> {
    const { data } = await api.post<Offer>('/offers', offer);
    return data;
  },

  async update(id: number, offer: OfferUpdate): Promise<Offer> {
    const { data } = await api.put<Offer>(`/offers/${id}`, offer);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/offers/${id}`);
  },
};

// Notes
export const noteService = {
  async list(): Promise<PreparationNote[]> {
    const { data } = await api.get<PreparationNote[]>('/notes');
    return data;
  },

  async getByDrive(driveId: number): Promise<PreparationNote | null> {
    try {
      const { data } = await api.get<PreparationNote>(`/notes/drive/${driveId}`);
      return data;
    } catch {
      return null;
    }
  },

  async create(note: NoteCreate): Promise<PreparationNote> {
    const { data } = await api.post<PreparationNote>('/notes', note);
    return data;
  },

  async update(id: number, note: NoteUpdate): Promise<PreparationNote> {
    const { data } = await api.put<PreparationNote>(`/notes/${id}`, note);
    return data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/notes/${id}`);
  },
};
