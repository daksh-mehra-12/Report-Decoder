export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'patient' | 'doctor' | 'admin';
  created_at: string;
}

export interface ParameterCorrection {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  corrected_at: string;
}

export interface ReportParameter {
  id: string;
  report_id: string;
  test_name: string;
  canonical_code?: string;
  raw_text: string;
  raw_value?: string;
  numeric_value?: number;
  unit?: string;
  reference_range_raw?: string;
  range_low?: number;
  range_high?: number;
  ocr_confidence: number;
  page_number: number;
  bounding_box?: {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
  };
  verification_status: 'auto_extracted' | 'user_verified' | 'user_corrected' | 'needs_review';
  classification_status: 'In Range' | 'Below Range' | 'Above Range' | 'Needs Verification' | 'Unable to Classify';
  classification_reason?: string;
  rule_engine_version: string;
  corrections?: ParameterCorrection[];
}

export interface RadarFinding {
  check: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  remediation: string;
}

export interface QualityRadarData {
  report_id: string;
  status: 'Readable' | 'Needs Review' | 'Incomplete' | 'Unsupported';
  readability_score: number;
  findings: RadarFinding[];
  summary_message: string;
}

export interface Report {
  id: string;
  owner_id: string;
  file_name: string;
  file_hash_sha256?: string;
  file_size_bytes: number;
  mime_type: string;
  privacy_mode: 'private_history' | 'temporary_session';
  status: string;
  report_date?: string;
  lab_name?: string;
  created_at: string;
  updated_at: string;
  parameters?: ReportParameter[];
  radar?: QualityRadarData;
}

export interface TrustTraceNode {
  step: string;
  title: string;
  description: string;
  data: Record<string, any>;
  verified: boolean;
}

export interface TrustTraceData {
  parameter_id: string;
  test_name: string;
  provenance_chain: TrustTraceNode[];
  official_sources: Array<{
    source_id: string;
    name: string;
    organization: string;
    url: string;
    trust_tier: string;
    description: string;
  }>;
  remaining_uncertainty?: string | null;
}

export interface VisitReadyQuestion {
  category: string;
  question_text: string;
  rationale: string;
  context_trigger: string;
}

export interface VisitReadyData {
  report_id: string;
  language: string;
  patient_context_summary?: string;
  key_discussion_points: string[];
  suggested_questions: VisitReadyQuestion[];
  clinical_disclaimer: string;
}

export interface MedicalKnowledgeEntry {
  canonical_code: string;
  test_name: string;
  verified_aliases: string[];
  definition: string;
  test_purpose: string;
  what_it_measures: string;
  clinical_significance_high: string;
  clinical_significance_low: string;
  doctor_questions_bank: string[];
  sources: Array<{
    source_id: string;
    name: string;
    organization: string;
    url: string;
    trust_tier: string;
    description: string;
  }>;
  review_status: string;
  last_reviewed: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  reply: string;
  suggested_followups: string[];
  sources: Array<{
    source_id: string;
    name: string;
    organization: string;
    url: string;
    trust_tier: string;
    description: string;
  }>;
  disclaimer: string;
}
