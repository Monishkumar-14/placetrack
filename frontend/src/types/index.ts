// ============================================
// Company Types
// ============================================
export type Priority = 'high' | 'medium' | 'low' | 'none';

export interface Company {
  id: number;
  user_id: number;
  name: string;
  logo_url: string | null;
  industry: string | null;
  website: string | null;
  description: string | null;
  priority: Priority;
  archived: boolean;
  created_at: string;
  updated_at: string;
  drives_count?: number;
  active_drives_count?: number;
}

export interface CompanyCreate {
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  website?: string | null;
  description?: string | null;
  priority?: Priority;
}

export interface CompanyUpdate extends Partial<CompanyCreate> {
  archived?: boolean;
}

// ============================================
// Drive Types
// ============================================
export type DriveType = 'campus' | 'off_campus' | 'internship' | 'full_time' | 'internship_ppo' | 'internship_performance_ppo';

export type OverallStatus =
  | 'interested' | 'applied' | 'ppt_scheduled' | 'assessment_scheduled'
  | 'assessment_completed' | 'shortlisted' | 'interview_scheduled'
  | 'interview_completed' | 'offer_received' | 'offer_accepted'
  | 'rejected' | 'withdrawn' | 'completed';

export interface Drive {
  id: number;
  company_id: number;
  job_role: string | null;
  job_location: string | null;
  drive_type: DriveType | null;
  recruitment_type: string | null;
  application_date: string | null;
  eligibility_criteria: string | null;
  cgpa_requirement: number | null;
  backlogs_allowed: boolean | null;
  branch_eligibility: string | null;
  vacancies: number | null;
  current_stage: string | null;
  overall_status: OverallStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  company_name?: string;
  company?: Company;
}

export interface DriveCreate {
  company_id: number;
  job_role?: string | null;
  job_location?: string | null;
  drive_type?: DriveType | null;
  recruitment_type?: string | null;
  application_date?: string | null;
  eligibility_criteria?: string | null;
  cgpa_requirement?: number | null;
  backlogs_allowed?: boolean | null;
  branch_eligibility?: string | null;
  vacancies?: number | null;
  current_stage?: string | null;
  overall_status?: OverallStatus;
  notes?: string | null;
}

export interface DriveUpdate extends Partial<Omit<DriveCreate, 'company_id'>> {}

export interface DriveDetail extends Drive {
  assessments: Assessment[];
  interviews: Interview[];
  offer: Offer | null;
  events: PlacementEvent[];
  preparation_notes: PreparationNote | null;
}

// ============================================
// Event Types
// ============================================
export type EventType = 'ppt' | 'assessment' | 'interview' | 'result' | 'offer' | 'joining' | 'other';
export type VenueMode = 'virtual' | 'cuic' | 'college_campus' | 'another_college' | 'company_office' | 'other';
export type EventStatus = 'upcoming' | 'in_progress' | 'completed' | 'cancelled' | 'rescheduled';

export interface PlacementEvent {
  id: number;
  drive_id: number;
  event_type: EventType;
  title: string;
  date: string;
  start_time: string | null;
  end_time: string | null;
  venue_mode: VenueMode | null;
  venue_name: string | null;
  room: string | null;
  building: string | null;
  location: string | null;
  meeting_link: string | null;
  platform: string | null;
  attendance_required: boolean;
  status: EventStatus;
  notes: string | null;
  created_at: string;
  company_name?: string;
  drive_job_role?: string;
}

export interface EventCreate {
  drive_id: number;
  event_type: EventType;
  title: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  venue_mode?: VenueMode | null;
  venue_name?: string | null;
  room?: string | null;
  building?: string | null;
  location?: string | null;
  meeting_link?: string | null;
  platform?: string | null;
  attendance_required?: boolean;
  status?: EventStatus;
  notes?: string | null;
}

export interface EventUpdate extends Partial<Omit<EventCreate, 'drive_id'>> {}

// ============================================
// Assessment Types
// ============================================
export type AssessmentType = 'aptitude' | 'technical' | 'coding' | 'technical_aptitude' | 'mcq' | 'coding_mcq' | 'group_discussion' | 'other';
export type AssessmentResult = 'attempted' | 'completed' | 'shortlisted' | 'not_shortlisted' | 'result_pending' | 'absent';
export type ShortlistedStatus = 'yes' | 'no' | 'pending';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Assessment {
  id: number;
  drive_id: number;
  assessment_name: string;
  assessment_type: AssessmentType | null;
  round_number: number;
  date: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  venue_mode: VenueMode | null;
  venue_name: string | null;
  platform: string | null;
  total_questions: number | null;
  total_marks: number | null;
  negative_marking: boolean;
  programming_languages: string | null;
  difficulty: Difficulty | null;
  result_date: string | null;
  result: AssessmentResult | null;
  shortlisted: ShortlistedStatus | null;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
  rank: number | null;
  percentile: number | null;
  questions_attempted: number | null;
  questions_correct: number | null;
  notes: string | null;
  created_at: string;
  company_name?: string;
  drive_job_role?: string;
}

export interface AssessmentCreate {
  drive_id: number;
  assessment_name: string;
  assessment_type?: AssessmentType | null;
  round_number?: number;
  date?: string | null;
  start_time?: string | null;
  duration_minutes?: number | null;
  venue_mode?: VenueMode | null;
  venue_name?: string | null;
  platform?: string | null;
  total_questions?: number | null;
  total_marks?: number | null;
  negative_marking?: boolean;
  programming_languages?: string | null;
  difficulty?: Difficulty | null;
  result_date?: string | null;
  result?: AssessmentResult | null;
  shortlisted?: ShortlistedStatus | null;
  score?: number | null;
  max_score?: number | null;
  questions_attempted?: number | null;
  questions_correct?: number | null;
  notes?: string | null;
}

export interface AssessmentUpdate extends Partial<Omit<AssessmentCreate, 'drive_id'>> {}

// ============================================
// Interview Types
// ============================================
export type InterviewType = 'technical' | 'managerial' | 'hr' | 'technical_managerial' | 'final' | 'other';
export type InterviewStatus = 'scheduled' | 'completed' | 'shortlisted' | 'rejected' | 'result_pending' | 'rescheduled' | 'cancelled';

export interface Interview {
  id: number;
  drive_id: number;
  round_number: number;
  interview_type: InterviewType | null;
  date: string | null;
  start_time: string | null;
  duration_minutes: number | null;
  venue_mode: VenueMode | null;
  venue_name: string | null;
  meeting_link: string | null;
  interviewer: string | null;
  status: InterviewStatus;
  result: string | null;
  shortlisted: ShortlistedStatus | null;
  questions_asked: string | null;
  topics_discussed: string | null;
  performance: string | null;
  difficulty: Difficulty | null;
  went_well: string | null;
  went_wrong: string | null;
  improvements: string | null;
  notes: string | null;
  created_at: string;
  company_name?: string;
  drive_job_role?: string;
}

export interface InterviewCreate {
  drive_id: number;
  round_number?: number;
  interview_type?: InterviewType | null;
  date?: string | null;
  start_time?: string | null;
  duration_minutes?: number | null;
  venue_mode?: VenueMode | null;
  venue_name?: string | null;
  meeting_link?: string | null;
  interviewer?: string | null;
  status?: InterviewStatus;
  result?: string | null;
  shortlisted?: ShortlistedStatus | null;
  questions_asked?: string | null;
  topics_discussed?: string | null;
  performance?: string | null;
  difficulty?: Difficulty | null;
  went_well?: string | null;
  went_wrong?: string | null;
  improvements?: string | null;
  notes?: string | null;
}

export interface InterviewUpdate extends Partial<Omit<InterviewCreate, 'drive_id'>> {}

// ============================================
// Offer Types
// ============================================
export type OfferType = 'internship_ppo' | 'internship_performance_ppo' | 'full_time' | 'internship_only';
export type PpoType = 'guaranteed' | 'performance_based';
export type OfferStatus =
  | 'offer_received' | 'offer_accepted' | 'offer_rejected' | 'offer_declined'
  | 'ppo_expected' | 'ppo_confirmed' | 'ppo_not_offered'
  | 'joining_pending' | 'joined';

export interface Offer {
  id: number;
  drive_id: number;
  offer_type: OfferType | null;
  internship_duration_months: number | null;
  monthly_stipend: number | null;
  stipend_frequency: string | null;
  annual_ctc: number | null;
  fixed_ctc: number | null;
  variable_ctc: number | null;
  joining_bonus: number | null;
  performance_bonus: number | null;
  ppo_available: boolean;
  ppo_type: PpoType | null;
  ppo_ctc: number | null;
  performance_criteria: string | null;
  joining_date: string | null;
  offer_status: OfferStatus;
  employment_type: string | null;
  location: string | null;
  notes: string | null;
  created_at: string;
  company_name?: string;
  drive_job_role?: string;
}

export interface OfferCreate {
  drive_id: number;
  offer_type?: OfferType | null;
  internship_duration_months?: number | null;
  monthly_stipend?: number | null;
  stipend_frequency?: string | null;
  annual_ctc?: number | null;
  fixed_ctc?: number | null;
  variable_ctc?: number | null;
  joining_bonus?: number | null;
  performance_bonus?: number | null;
  ppo_available?: boolean;
  ppo_type?: PpoType | null;
  ppo_ctc?: number | null;
  performance_criteria?: string | null;
  joining_date?: string | null;
  offer_status?: OfferStatus;
  employment_type?: string | null;
  location?: string | null;
  notes?: string | null;
}

export interface OfferUpdate extends Partial<Omit<OfferCreate, 'drive_id'>> {}

// ============================================
// Preparation Notes
// ============================================
export interface PreparationNote {
  id: number;
  drive_id: number;
  expected_topics: string | null;
  company_questions: string | null;
  previous_questions: string | null;
  technical_topics: string | null;
  hr_questions: string | null;
  projects_to_discuss: string | null;
  resume_points: string | null;
  preparation_checklist: string | null;
  interview_experience: string | null;
  general_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  drive_id: number;
  expected_topics?: string | null;
  company_questions?: string | null;
  previous_questions?: string | null;
  technical_topics?: string | null;
  hr_questions?: string | null;
  projects_to_discuss?: string | null;
  resume_points?: string | null;
  preparation_checklist?: string | null;
  interview_experience?: string | null;
  general_notes?: string | null;
}

export interface NoteUpdate extends Partial<Omit<NoteCreate, 'drive_id'>> {}

// ============================================
// Analytics Types
// ============================================
export interface DashboardStats {
  total_companies: number;
  active_drives: number;
  upcoming_tests: number;
  upcoming_interviews: number;
  shortlisted: number;
  rejected: number;
  offers_received: number;
  highest_ctc: number | null;
  average_ctc: number | null;
  total_applications: number;
}

export interface ConversionFunnel {
  applications: number;
  ppt: number;
  assessment: number;
  interview: number;
  offer: number;
  ppt_pct: number;
  assessment_pct: number;
  interview_pct: number;
  offer_pct: number;
}

export interface TypeSuccessRate {
  type: string;
  total: number;
  cleared: number;
  rate: number;
}

export interface AssessmentAnalytics {
  total: number;
  cleared: number;
  failed: number;
  pending: number;
  success_rate: number;
  type_breakdown: TypeSuccessRate[];
}

export interface InterviewAnalytics {
  total: number;
  cleared: number;
  failed: number;
  pending: number;
  success_rate: number;
  type_breakdown: TypeSuccessRate[];
}

export interface CompanyCTC {
  company_name: string;
  ctc: number;
  stipend: number | null;
}

export interface CompensationAnalytics {
  highest_ctc: number | null;
  average_ctc: number | null;
  lowest_ctc: number | null;
  average_stipend: number | null;
  highest_stipend: number | null;
  company_ctc_list: CompanyCTC[];
}

export interface PlacementStats {
  companies_applied: number;
  ppt_attended: number;
  oa_attempted: number;
  oa_cleared: number;
  interviews_attended: number;
  final_offers: number;
  overall_success_rate: number;
  interview_conversion: number;
}

export interface UpcomingEventItem {
  id: number;
  company_name: string;
  event_type: string;
  title: string;
  date: string;
  start_time: string | null;
  venue_name: string | null;
  venue_mode: string | null;
  status: string;
  drive_id: number;
}

export interface ScheduleConflict {
  event1: UpcomingEventItem;
  event2: UpcomingEventItem;
  overlap_start: string;
  overlap_end: string;
}

// ============================================
// Auth Types
// ============================================
export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}
