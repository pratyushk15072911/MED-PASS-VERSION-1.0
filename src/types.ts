export type AppScreen =
  | 'clinical-reader'
  | 'health-passport'
  | 'mobile-wallet'
  | 'active-medications'
  | 'allergies-warnings'
  | 'document-digitization'
  | 'privacy-audit-logs'
  | 'clinical-onboarding'
  | 'emergency-card';

export interface MajorHealthEvent {
  id: string;
  type: 'condition' | 'surgery' | 'allergy' | 'treatment';
  title: string;
  shortLabel: string;
  dateOrYear: string;
  severity: 'Critical' | 'High' | 'Important' | 'Managed';
  status: string;
  summary: string;
  relatedMedications?: string[];
  relatedLabOrDocument?: string;
  clinicalInstructions: string;
}

export interface PatientProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  relation: string;
  isOrganDonor: boolean;
  emergencyContact: {
    name: string;
    phone: string;
    relation: string;
  };
  primaryDoctor: {
    name: string;
    clinic: string;
    phone: string;
  };
  insuranceId: string;
  photoUrl?: string;
  majorEvents?: MajorHealthEvent[];
}

export type UserRoleMode = 'doctor' | 'patient';

export interface Medication {
  id: string;
  patientId?: string; // Scoped to specific patient
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  category: string;
  prescribingDoctor: string;
  startDate: string;
  status: 'active' | 'completed' | 'paused';
  tier: 'tier1' | 'tier2';
  tierLabel: 'Gold Tier Verified' | 'Silver Tier Verified' | 'Tier 1: Verified Lab/EHR' | 'Tier 1: Verified';
  instructions?: string;
}

export interface MedicationHistoryItem {
  id: string;
  patientId?: string;
  medication: string;
  statusLabel: string;
  goalStatus: string;
  goalStatusColor: string;
  period: string;
  prescriber: string;
  outcome: string;
  notes: string;
  nextStepsLevel: 'High' | 'Medium' | 'Low';
  clinicalReasoning: string;
  nextStepsAction: string;
}

export interface Allergy {
  id: string;
  patientId?: string; // Scoped to specific patient
  allergen: string;
  severity: 'Severe' | 'Moderate' | 'Mild';
  riskLabel: string;
  tier: 'tier1' | 'tier2';
  tierLabel: string;
  reactionDetails: string;
  firstReported: string;
  source: string;
  category: 'Drug' | 'Food' | 'Environmental';
}

export interface ClinicalDocument {
  id: string;
  patientId?: string; // Scoped to specific patient
  fileName: string;
  type: 'Lab Result' | 'Prescription' | 'Discharge Summary' | 'Consultation Note' | 'Imaging';
  dateUploaded: string;
  fileSize: string;
  provider: string;
  extractedEntities: string[];
  ocrConfidence: number;
  verificationStatus: 'Verified' | 'Pending Review' | 'Flagged';
  previewUrl: string;
  fullOcrText?: string;
  scannedImageUrl?: string;
}

export interface AuditLogEvent {
  id: string;
  eventType: 'EMERGENCY OVERRIDE' | 'CLINICAL REVIEW' | 'PHARMACY FULFILLMENT';
  accessorName: string;
  facilityLocation: string;
  timestamp: string;
  sessionDuration: string;
  dataAccessed: string[];
  securityStatus: string;
  securityDetail: string;
  isEmergency?: boolean;
}

export interface PastVitalReading {
  id: string;
  patientId: string;
  timestamp: string;
  date: string;
  time: string;
  lastCheckedDate?: string;
  bloodPressure: string;
  systolic: number;
  diastolic: number;
  heartRate: number; // Heart beat recorded in bpm
  bpStatus: 'Optimal' | 'Normal' | 'Elevated' | 'Caution';
  hrStatus: 'Normal' | 'Resting' | 'Elevated' | 'Athletic';
  source: string;
  context?: string;
}

export interface VitalRecord {
  bloodPressure: string;
  bpStatus: 'Stable' | 'Elevated' | 'Low';
  hba1c: string;
  hba1cStatus: 'Normal' | 'Borderline' | 'High';
  heartRate: number;
  spO2: number;
  weight: string;
  temperature: string;
  lastCheckedDate?: string;
  pastReadings?: PastVitalReading[];
}

export interface AudioFeedbackNote {
  id: string;
  authorRole: 'Doctor' | 'Patient' | 'Clinical AI';
  authorName: string;
  title: string;
  timestamp: string;
  durationSeconds: number;
  transcript: string;
  audioBlobUrl?: string;
  category: 'Visit Advice' | 'Allergy Caution' | 'Prescription Guidance' | 'Emergency Info';
}
