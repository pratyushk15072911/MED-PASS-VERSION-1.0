import React, { useState } from 'react';
import {
  PatientProfile,
  Medication,
  MedicationHistoryItem,
  Allergy,
  ClinicalDocument,
  VitalRecord,
  PastVitalReading,
  AudioFeedbackNote,
} from '../../types';
import { MedPassLogo, MedPassCrossIcon } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { SuperCrucialHUD } from '../clinical/SuperCrucialHUD';
import { PastBloodPressureHeartRateCard } from '../clinical/PastBloodPressureHeartRateCard';
import { AudioPlayerWidget } from '../audio/AudioPlayerWidget';
import {
  AlertTriangle,
  Lock,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  User,
  ExternalLink,
  Search,
  Activity,
  Pill,
  History,
  FileText,
  FileSpreadsheet,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  Volume2,
  Mic,
  Download,
  Mail,
  HardDrive,
} from 'lucide-react';

interface DoctorClinicalDashboardProps {
  patient: PatientProfile;
  medications: Medication[];
  allergies: Allergy[];
  history: MedicationHistoryItem[];
  vitals: VitalRecord;
  documents: ClinicalDocument[];
  sessionTimeLeft: number;
  hasContraindication: boolean;
  onAcknowledgeContraindication: () => void;
  onViewAlternatives: () => void;
  onCompleteSession: () => void;
  onOpenDocument: (doc: ClinicalDocument) => void;
  onNavigateSection: (sectionId: string) => void;
  onAddRecord: () => void;
  onAddVitalReading?: (newReading: PastVitalReading) => void;
  audioNotes?: AudioFeedbackNote[];
  onOpenAudioModal?: (tab?: 'summary' | 'doctor-feedback' | 'vault') => void;
  onOpenGmailModal?: (mode?: 'login-alert' | 'otp' | 'report' | 'timeout') => void;
  onOpenDriveModal?: () => void;
}

export const DoctorClinicalDashboard: React.FC<DoctorClinicalDashboardProps> = ({
  patient,
  medications,
  allergies,
  history,
  vitals,
  documents,
  sessionTimeLeft,
  hasContraindication,
  onAcknowledgeContraindication,
  onViewAlternatives,
  onCompleteSession,
  onOpenDocument,
  onNavigateSection,
  onAddRecord,
  onAddVitalReading,
  audioNotes = [],
  onOpenAudioModal,
  onOpenGmailModal,
  onOpenDriveModal,
}) => {
  // Collapse state for each section - default to true so doctor portal starts completely collapsed
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    allergies: true,
    medications: true,
    history: true,
    chronic: true,
    care: true,
    vitals: true,
    vault: true,
  });

  const areAllCollapsed = Object.values(collapsedSections).every(Boolean);

  const toggleAllSections = () => {
    const nextState = !areAllCollapsed;
    setCollapsedSections({
      allergies: nextState,
      medications: nextState,
      history: nextState,
      chronic: nextState,
      care: nextState,
      vitals: nextState,
      vault: nextState,
    });
  };

  const [activeQuickTab, setActiveQuickTab] = useState<'dashboard' | 'vitals' | 'medications' | 'timeline' | 'search'>(
    'dashboard'
  );
  const [triageScope, setTriageScope] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Find active major event from patient profile if tab is selected
  const selectedEvent = patient.majorEvents?.find((e) => e.id === triageScope);

  // Scoped Filtered Medications: when a condition tab is picked, highlight medications related to that condition
  const scopedMedications = medications.filter((m) => {
    if (!selectedEvent) return true;
    if (selectedEvent.relatedMedications && selectedEvent.relatedMedications.length > 0) {
      return selectedEvent.relatedMedications.some((rel) =>
        m.name.toLowerCase().includes(rel.toLowerCase().split(' ')[0]) ||
        (m.category && selectedEvent.title.toLowerCase().includes(m.category.toLowerCase()))
      );
    }
    return true;
  });

  // Scoped Filtered Allergies: when an allergy tab is picked, show matching allergy
  const scopedAllergies = allergies.filter((a) => {
    if (!selectedEvent) return true;
    if (selectedEvent.type === 'allergy') {
      return (
        selectedEvent.title.toLowerCase().includes(a.allergen.toLowerCase()) ||
        a.allergen.toLowerCase().includes(selectedEvent.shortLabel.toLowerCase())
      );
    }
    return a.severity === 'Severe';
  });

  const suppressedCount = medications.length - scopedMedications.length + (triageScope !== 'all' ? 3 : 0);

  const filteredHistory = searchQuery
    ? history.filter((h) => h.medication.toLowerCase().includes(searchQuery.toLowerCase()))
    : history;

  return (
    <div className="relative min-h-[calc(100vh-100px)] bg-[#f4faff] text-[#001f2a] pb-28">
      {/* Background Medical Watermark (Caduceus) */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-6 z-0 overflow-hidden">
        <CaduceusSymbol size={540} color="#004f45" />
      </div>

      {/* Main Workspace Container */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6 relative z-10">
        {/* Clinician Fast Triage Header */}
        <div className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#004f45] shadow-xs">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-oGEWp4-8S1OL6wG3xP1fF5fvWfknWbs-dJnWyNj-hMaAl1_sefF30bC1weQsbmHeHnF6_tsdmq6kzRlNyaW01LARcv43rewQGnSbHL3uM6X0oTdYTgoPJhg0vzQUoVNf-ZnnuffnCRn8wyYvfvfL9lAevZ_gRts9RC7npjvIePEO8llfrlmg-1HfqdGNi2DKFEFw2XjfY56Cpox7b2AnkeQKrxXgDmBqoRT1k-gZ1hz66HW-fJPa"
                alt="Dr. Sarah Jenkins"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl font-bold text-[#001f2a]">Doctor Visit Summary</h1>
                <span className="bg-[#004f45]/10 text-[#004f45] border border-[#004f45]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Active Patient View
                </span>
              </div>
              <p className="text-xs text-[#546067] flex items-center gap-2 mt-0.5">
                <span>Doctor: Dr. Sarah Jenkins (Heart Specialist)</span>
                <span>•</span>
                <span>Hospital: St. Mary’s General Hospital</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Master Expand / Collapse All Sections Toggle */}
            <button
              type="button"
              onClick={toggleAllSections}
              className="h-9 inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-[#004f45] border border-[#bec9c5] px-3.5 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title={areAllCollapsed ? 'Expand all clinical sections' : 'Collapse all clinical sections'}
            >
              {areAllCollapsed ? (
                <>
                  <Maximize2 className="w-3.5 h-3.5 shrink-0 -translate-y-px" />
                  <span>Expand All</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3.5 h-3.5 shrink-0 -translate-y-px" />
                  <span>Collapse All</span>
                </>
              )}
            </button>

            {/* Audio Feedback Button */}
            <button
              type="button"
              onClick={() => onOpenAudioModal?.('doctor-feedback')}
              className="h-9 inline-flex items-center gap-2 bg-[#e6f6ff] hover:bg-[#c9e7f7] text-[#004f45] border border-[#004f45]/30 px-3.5 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
              title="Record Doctor Voice Feedback or Listen to Audio Summary"
            >
              <Mic className="w-3.5 h-3.5 text-[#004f45] shrink-0 -translate-y-px" />
              <span className="hidden sm:inline">Doctor Audio Feedback</span>
            </button>

            {/* Send Gmail Alert & Reports Button */}
            {onOpenGmailModal && (
              <button
                type="button"
                onClick={() => onOpenGmailModal('login-alert')}
                className="h-9 inline-flex items-center gap-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3.5 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Send Doctor Login Notification, OTP, or Patient Report via Gmail"
              >
                <Mail className="w-3.5 h-3.5 text-rose-600 shrink-0 -translate-y-px" />
                <span className="hidden sm:inline">Gmail Alerts</span>
              </button>
            )}

            {/* Google Drive Health Passport File Button */}
            {onOpenDriveModal && (
              <button
                type="button"
                onClick={onOpenDriveModal}
                className="h-9 inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 rounded-lg text-xs font-bold shadow-2xs transition-all cursor-pointer"
                title="Create Google Drive File & Restrict Sharing / Access Permissions"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-600 shrink-0 -translate-y-px" />
                <span className="hidden sm:inline">Google Drive</span>
              </button>
            )}

            {/* Session Timer Badge with clean aligned Clock icon */}
            <div className="h-9 inline-flex items-center gap-2 bg-[#e6f6ff] border border-[#c9e7f7] px-3.5 rounded-lg text-xs text-[#004f45]">
              <Clock className="w-3.5 h-3.5 text-[#004f45] shrink-0 -translate-y-px" />
              <span className="font-bold">Time Left: {formatTimer(sessionTimeLeft)}</span>
            </div>

            {/* Finish Visit & Log Out Button with optically centered Lock logo */}
            <button
              type="button"
              onClick={onCompleteSession}
              className="h-9 inline-flex items-center gap-2 bg-[#ba1a1a] hover:bg-[#93000a] text-white px-4 rounded-lg text-xs font-bold uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 shrink-0 -translate-y-0.5" />
              <span>Finish Visit & Log Out</span>
            </button>
          </div>
        </div>

        {/* Super Crucial Diagnostic Flight Deck & Bio-Telemetry HUD */}
        <SuperCrucialHUD
          patient={patient}
          medications={medications}
          allergies={allergies}
          vitals={vitals}
          triageScope={triageScope}
          onSelectScope={setTriageScope}
          hasContraindication={hasContraindication}
          onViewAlternatives={onViewAlternatives}
        />

        {/* Alert Banner */}
        {hasContraindication && (
          <div
            id="contraindication-alert"
            className="w-full bg-[#ffdad6] border-2 border-[#ba1a1a] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl shadow-xs relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#ba1a1a]"></div>
            <div className="flex items-start gap-3 pl-3">
              <div className="p-1.5 bg-[#ba1a1a] text-white rounded-lg mt-0.5">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-sm text-[#93000a] tracking-wide uppercase">
                  Medicine Safety Warning
                </h2>
                <p className="text-xs text-[#410002] font-medium mt-0.5">
                  Patient is allergic to Penicillin. Do not give Amoxicillin 500mg.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-end md:self-auto pl-3 md:pl-0">
              <button
                onClick={onViewAlternatives}
                className="text-xs font-bold text-[#ba1a1a] hover:underline uppercase tracking-wider bg-white/70 px-3 py-1.5 rounded-lg border border-[#ba1a1a]/30"
              >
                See Safe Medicines
              </button>
              <button
                type="button"
                onClick={onAcknowledgeContraindication}
                className="bg-[#ba1a1a] text-white hover:bg-[#93000a] active:scale-95 px-3.5 py-1.5 text-xs font-bold transition-all uppercase tracking-wider rounded-lg shadow-2xs cursor-pointer"
              >
                I Understand & Proceed
              </button>
            </div>
          </div>
        )}

        {/* Layout 2-Column Grid (60% / 40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (7 of 12 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* 1. Allergies & Adverse Reactions */}
            <section
              id="section-allergies"
              className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all"
            >
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <h3 className="font-serif font-bold text-base text-[#001f2a] flex items-center gap-2">
                  <span className="p-1 bg-[#ffdad6] text-[#ba1a1a] rounded-md">
                    <AlertTriangle className="w-4 h-4" />
                  </span>
                  Allergies & Adverse Reactions
                </h3>
                <button
                  onClick={() => toggleSection('allergies')}
                  className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {collapsedSections.allergies ? (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!collapsedSections.allergies && (
                <div className="flex flex-col divide-y divide-[#c9e7f7]/60">
                  {scopedAllergies.map((allergy) => (
                    <div
                      key={allergy.id}
                      className="py-2.5 flex justify-between items-center px-1 hover:bg-[#f4faff] rounded transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-sm ${
                            allergy.severity === 'Severe' ? 'text-[#ba1a1a]' : 'text-[#001f2a]'
                          }`}
                        >
                          {allergy.allergen}
                        </span>
                        {allergy.severity === 'Severe' && (
                          <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] font-bold px-2 py-0.5 rounded-full">
                            Severe Anaphylaxis
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-md flex items-center gap-1 font-mono uppercase tracking-wider font-semibold border ${
                            allergy.tier === 'tier1'
                              ? 'bg-[#daa520]/15 text-[#8b6508] border-[#daa520]/40'
                              : 'bg-[#c0c0c0]/20 text-[#546067] border-[#c0c0c0]'
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          {allergy.tierLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 2. Active Medications */}
            <section
              id="section-medications"
              className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all"
            >
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <h3 className="font-serif font-bold text-base text-[#001f2a] flex items-center gap-2">
                  <span className="p-1 bg-[#e6f6ff] text-[#004f45] rounded-md">
                    <Pill className="w-4 h-4" />
                  </span>
                  Active Medications ({scopedMedications.length})
                </h3>
                <button
                  onClick={() => toggleSection('medications')}
                  className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {collapsedSections.medications ? (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!collapsedSections.medications && (
                <div className="flex flex-col divide-y divide-[#c9e7f7]/60">
                  {scopedMedications.map((med) => (
                    <div
                      key={med.id}
                      className="py-2.5 flex justify-between items-start px-1 hover:bg-[#f4faff] rounded transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm text-[#001f2a] flex items-center gap-2">
                          {med.name} {med.dosage}
                          {med.name.includes('Amoxicillin') && hasContraindication && (
                            <span className="text-[10px] bg-[#ffdad6] text-[#ba1a1a] font-bold px-1.5 py-0.2 rounded">
                              Conflict
                            </span>
                          )}
                        </span>
                        <span className="text-xs text-[#546067]">{med.frequency}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#daa520]/15 text-[#8b6508] border border-[#daa520]/40 px-2.5 py-0.5 rounded-md flex items-center gap-1 text-xs font-mono uppercase tracking-wider font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {med.tierLabel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 3. Medication History Timeline */}
            <section
              id="section-timeline"
              className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all"
            >
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <h3 className="font-serif font-bold text-base text-[#001f2a] flex items-center gap-2">
                  <span className="p-1 bg-[#e6f6ff] text-[#004f45] rounded-md">
                    <History className="w-4 h-4" />
                  </span>
                  Medication History
                </h3>
                <button
                  onClick={() => toggleSection('history')}
                  className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {collapsedSections.history ? (
                    <>
                      <span>Expand History</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Collapse History</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!collapsedSections.history && (
                <div className="flex flex-col gap-6 relative px-2 pt-2">
                  {/* Vertical Timeline Line */}
                  <div className="absolute left-[17px] top-4 bottom-4 w-[1px] bg-[#bec9c5]"></div>

                  {filteredHistory.map((item, idx) => (
                    <div key={item.id} className="relative pl-8">
                      {/* Timeline Dot */}
                      <div className="absolute left-0 top-1.5 w-5 h-5 rounded-full bg-[#e6f6ff] border border-[#004f45] flex items-center justify-center z-10 shadow-xs">
                        <div
                          className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-[#004f45]' : 'bg-[#546067]'}`}
                        ></div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-sm text-[#001f2a]">{item.medication}</span>
                          <span className="text-[11px] font-mono uppercase text-[#546067] font-medium">
                            {item.statusLabel}
                          </span>
                        </div>

                        <span className="text-xs text-[#047857] font-medium mt-0.5">{item.goalStatus}</span>

                        <div className="flex flex-col text-xs text-[#546067] mt-1 gap-0.5">
                          <span>Treatment: {item.period}</span>
                          <span>Prescriber: {item.prescriber}</span>
                          <span>Outcome: {item.outcome}</span>
                        </div>

                        {/* Note card */}
                        <div className="mt-2 bg-[#f4faff] border border-[#c9e7f7] rounded-lg p-2.5 text-xs text-[#001f2a]">
                          {item.notes}
                        </div>

                        {/* Next Steps & Clinical Reasoning */}
                        <div className="mt-2 p-2.5 bg-[#ffffff] border border-[#bec9c5]/60 rounded-lg">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#001f2a]">
                              Next Steps
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                item.nextStepsLevel === 'Medium'
                                  ? 'bg-[#daa520]/20 text-[#8b6508] border border-[#daa520]/40'
                                  : 'bg-[#e6f6ff] text-[#004f45] border border-[#c9e7f7]'
                              }`}
                            >
                              {item.nextStepsLevel} Priority
                            </span>
                          </div>

                          <div className="flex flex-col gap-1 mb-1.5">
                            <span className="text-[10px] font-bold text-[#546067] uppercase tracking-wider">
                              CLINICAL REASONING
                            </span>
                            <p className="text-xs text-[#001f2a] italic">{item.clinicalReasoning}</p>
                          </div>

                          <p className="text-xs text-[#004f45] font-medium">{item.nextStepsAction}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* 4. Chronic Conditions & Past Surgeries */}
            <section className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all">
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <h3 className="font-serif font-bold text-base text-[#001f2a] flex items-center gap-2">
                  <span className="p-1 bg-[#e6f6ff] text-[#004f45] rounded-md">
                    <Activity className="w-4 h-4" />
                  </span>
                  Chronic Conditions & Past Surgeries
                </h3>
                <button
                  onClick={() => toggleSection('chronic')}
                  className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {collapsedSections.chronic ? (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!collapsedSections.chronic && (
                <ul className="flex flex-col gap-2 px-1">
                  <li className="flex items-start gap-3 py-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#004f45] mt-1.5"></span>
                    <div>
                      <span className="font-bold text-sm text-[#001f2a]">Type 2 Diabetes</span>
                      <span className="text-[#546067] ml-2">(Diagnosed 2018 - Stable on Metformin 1000mg)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 py-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#004f45] mt-1.5"></span>
                    <div>
                      <span className="font-bold text-sm text-[#001f2a]">Appendectomy</span>
                      <span className="text-[#546067] ml-2">(2015 - Laparoscopic, uncomplicated)</span>
                    </div>
                  </li>
                  <li className="flex items-start gap-3 py-1 text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#004f45] mt-1.5"></span>
                    <div>
                      <span className="font-bold text-sm text-[#001f2a]">Mild Essential Hypertension</span>
                      <span className="text-[#546067] ml-2">(Diagnosed 2020 - Managed with Lisinopril 10mg)</span>
                    </div>
                  </li>
                </ul>
              )}
            </section>

            {/* 5. Patient Care & Advisory */}
            <section className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all">
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <h3 className="font-serif font-bold text-base text-[#001f2a] flex items-center gap-2">
                  <span className="p-1 bg-[#e6f6ff] text-[#004f45] rounded-md">
                    <FileText className="w-4 h-4" />
                  </span>
                  Patient Care & Advisory
                </h3>
                <button
                  onClick={() => toggleSection('care')}
                  className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {collapsedSections.care ? (
                    <>
                      <span>Expand</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Collapse</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!collapsedSections.care && (
                <div className="flex flex-col gap-4">
                  {/* Doctor Voice Feedback & Audio Player Widget */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#001f2a] flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-[#004f45]" />
                        Doctor Audio Directions & Spoken Summary
                      </span>
                      <button
                        onClick={() => onOpenAudioModal?.('doctor-feedback')}
                        className="bg-[#004f45] hover:bg-[#003831] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Record Voice Note</span>
                      </button>
                    </div>

                    <AudioPlayerWidget
                      title="Dr. Sarah Jenkins — Cardiology Visit Directions"
                      speaker="Dr. Sarah Jenkins"
                      transcript={
                        audioNotes[0]?.transcript ||
                        `Hello ${patient.name.split(' ')[0]}. Blood pressure is holding steady at 120/80 today. Continue Lisinopril 10mg each morning and Metformin twice daily with meals. Crucial: strictly avoid Amoxicillin and Penicillin antibiotics due to your severe anaphylaxis reaction. Next routine checkup in 3 months.`
                      }
                      durationSeconds={audioNotes[0]?.durationSeconds || 38}
                      category="Doctor Audio Note"
                      downloadFilename={`Doctor_Directions_${patient.name.replace(/\s+/g, '_')}.wav`}
                    />
                  </div>

                  {/* Lifetime Advice Card */}
                  <div className="bg-[#e6f6ff] border border-[#c9e7f7] rounded-xl p-4">
                    <h4 className="font-bold text-xs text-[#004f45] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Lifetime Advice & Patient Guidance
                    </h4>
                    <p className="text-xs text-[#001f2a] leading-relaxed">
                      Maintain a low-sodium diet and daily walking regimen (minimum 30 minutes). Ensure consistent
                      fasting blood glucose monitoring and adherence to prescribed ACE-inhibitor timing. Avoid OTC
                      NSAIDs due to renal and GI risk profile.
                    </p>
                  </div>

                  {/* Professional Data Grid Footer */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-[#c9e7f7] pt-3">
                    <div className="flex flex-col gap-0.5 px-2 border-r border-[#bec9c5]/60">
                      <span className="text-[10px] text-[#546067] uppercase font-bold tracking-wider">Date</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#001f2a] font-medium">
                        <Calendar className="w-3.5 h-3.5 text-[#004f45]" />
                        <span>May 24, 2024</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 px-2 border-r border-[#bec9c5]/60">
                      <span className="text-[10px] text-[#546067] uppercase font-bold tracking-wider">Time</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#001f2a] font-medium">
                        <Clock className="w-3.5 h-3.5 text-[#004f45]" />
                        <span>14:28 EST</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 px-2 border-r border-[#bec9c5]/60">
                      <span className="text-[10px] text-[#546067] uppercase font-bold tracking-wider">Facility</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#001f2a] font-medium truncate">
                        <Building2 className="w-3.5 h-3.5 text-[#004f45]" />
                        <span className="truncate">St. Mary’s General</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-0.5 px-2">
                      <span className="text-[10px] text-[#546067] uppercase font-bold tracking-wider">Clinician</span>
                      <div className="flex items-center gap-1.5 text-xs text-[#001f2a] font-medium">
                        <User className="w-3.5 h-3.5 text-[#004f45]" />
                        <span>Dr. Jameson</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column (5 of 12 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 1. Past Recorded Blood Pressure & Heart Beat Vitals */}
            <div id="section-vitals" className="flex flex-col gap-4">
              <PastBloodPressureHeartRateCard
                patient={patient}
                pastReadings={vitals.pastReadings || []}
                onAddReading={onAddVitalReading}
              />

              {/* Patient-Specific Metabolic Lab Marker (shown if patient has diabetes history or HbA1c test) */}
              {(patient.majorEvents?.some((e) => e.title.toLowerCase().includes('diabetes')) || patient.id === 'patient-shardul') && (
                <div className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs">
                  <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1 bg-[#e6f6ff] text-[#004f45] rounded-md">
                        <Activity className="w-4 h-4" />
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#001f2a]">
                        Verified Blood Glucose Lab (HbA1c)
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#10b981]/15 text-[#047857] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase font-mono">
                        HbA1c {vitals.hba1cStatus}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSection('vitals')}
                        className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors ml-1 cursor-pointer"
                        title={collapsedSections.vitals ? 'Expand metabolic marker' : 'Collapse metabolic marker'}
                      >
                        {collapsedSections.vitals ? (
                          <>
                            <span>Expand</span>
                            <ChevronDown className="w-4 h-4" />
                          </>
                        ) : (
                          <>
                            <span>Collapse</span>
                            <ChevronUp className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {!collapsedSections.vitals && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <span className="text-[11px] font-bold text-[#546067] uppercase tracking-wider block">
                          Glycated Hemoglobin (HbA1c)
                        </span>
                        <div className="font-serif text-2xl font-bold text-[#001f2a] mt-0.5">{vitals.hba1c}</div>
                        <div className="text-[10px] text-[#546067] font-mono mt-0.5">
                          Target &lt;6.5% for T2D management • Quest Diagnostics Verified
                        </div>
                      </div>

                      <div className="w-full flex flex-col justify-end bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                        <div className="w-full h-2.5 bg-[#c9e7f7] rounded-full relative overflow-hidden">
                          <div className="h-full bg-[#10b981] rounded-full" style={{ width: '42%' }}></div>
                        </div>
                        <div className="flex justify-between text-[9px] text-[#546067] mt-1.5 font-mono">
                          <span>4.0% Optimal</span>
                          <span className="font-bold text-[#047857]">5.8% (Well Managed)</span>
                          <span>10.0% High Risk</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. Provenance Vault */}
            <section
              id="section-provenance"
              className="bg-[#ffffff] border border-[#bec9c5] rounded-xl p-4 shadow-2xs transition-all flex-1"
            >
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <h3 className="font-serif font-bold text-base text-[#001f2a] flex items-center gap-2">
                  <span className="p-1 bg-[#e6f6ff] text-[#004f45] rounded-md">
                    <FileSpreadsheet className="w-4 h-4" />
                  </span>
                  Provenance Vault
                </h3>
                <button
                  onClick={() => toggleSection('vault')}
                  className="flex items-center gap-1 text-[#004f45] hover:text-[#001f2a] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  {collapsedSections.vault ? (
                    <>
                      <span>View All</span>
                      <ChevronDown className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Close Vault</span>
                      <ChevronUp className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {!collapsedSections.vault && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Doc 1: Handwritten Prescription */}
                  <div
                    onClick={() => onOpenDocument(documents[1])}
                    className="group relative bg-[#f4faff] border border-[#c9e7f7] rounded-xl overflow-hidden aspect-[3/4] flex flex-col hover:border-[#004f45] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="bg-white/90 text-[#001f2a] text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-[#bec9c5] uppercase">
                        AI OCR Parsed
                      </span>
                    </div>

                    <div className="flex-1 bg-[#e6f6ff] flex items-center justify-center p-3 relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-multiply grayscale group-hover:scale-105 transition-transform duration-500"
                        style={{
                          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAL2EE2FMLy-pEYJk-oPult7npbnbbEQmrkDwqLmT6JbZg_uNdRYUZHa_BHqyeWvm7eEDS0OASPoPpH6Uj3EYIWb2f7YzKr0_6-beAAouLqVVMSJRoCYThYr4Dp5vriStpaZ0ovRluzLqPweUWBc_G7D2NGlPyHzimiDQnw1vsScZrs8f-rhOfm7DGOs1uHMVQNC38VzEIoGacPcVBH99fz1Gya8LWvRslmfFVJvfu8xOMJdX9LsSNT")`,
                        }}
                      />
                      <FileText className="w-12 h-12 text-[#004f45] z-10 drop-shadow-sm group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="p-2.5 border-t border-[#c9e7f7] bg-white flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#001f2a] truncate">
                        Handwritten_Prescription_May2024.jpg
                      </p>
                      <ExternalLink className="w-3.5 h-3.5 text-[#546067] group-hover:text-[#004f45] shrink-0" />
                    </div>
                  </div>

                  {/* Doc 2: EHR Verified PDF */}
                  <div
                    onClick={() => onOpenDocument(documents[2])}
                    className="group relative bg-[#f4faff] border border-[#c9e7f7] rounded-xl overflow-hidden aspect-[3/4] flex flex-col hover:border-[#004f45] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="absolute top-2.5 right-2.5 z-20">
                      <span className="bg-[#daa520]/20 text-[#8b6508] border border-[#daa520]/50 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        EHR Verified
                      </span>
                    </div>

                    <div className="flex-1 bg-[#e6f6ff] flex items-center justify-center p-3 relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-top opacity-35 mix-blend-multiply grayscale group-hover:scale-105 transition-transform duration-500"
                        style={{
                          backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBMtj1daW1HUAIIUmY8ICXbA-b2NyC__sH4Jn4Ho79yW0L3Zht1GD4RDtZKFL2LUgXpDmLcsNfwMKKH-XxGGOCfBjly0Z6EyLTovPlNeMk8jAb53rPoe0dGI8ZXoMxtTM3O27tld74cds6PYHBN3tEqrQADcqnP-ct3sYTOoVXXffYC7Ly0bNt3pVl6nucErof5XSTNHyZtux3l-lZbDQ0QzvYAtLgH8GNPT8BbwVnMroubj0kNodJn")`,
                        }}
                      />
                      <FileSpreadsheet className="w-12 h-12 text-[#004f45] z-10 drop-shadow-sm group-hover:scale-110 transition-transform" />
                    </div>

                    <div className="p-2.5 border-t border-[#c9e7f7] bg-white flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#001f2a] truncate">Apollo_Hospital_Discharge.pdf</p>
                      <ExternalLink className="w-3.5 h-3.5 text-[#546067] group-hover:text-[#004f45] shrink-0" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Floating Quick Navigation Dock */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-[#004f45]/20 shadow-xl rounded-full px-3 py-1.5 transition-all">
        <button
          onClick={() => {
            setActiveQuickTab('dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeQuickTab === 'dashboard'
              ? 'text-white bg-[#004f45] shadow-xs'
              : 'text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            setActiveQuickTab('vitals');
            setCollapsedSections((prev) => ({ ...prev, vitals: false }));
            onNavigateSection('section-vitals');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeQuickTab === 'vitals'
              ? 'text-white bg-[#004f45] shadow-xs'
              : 'text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Vitals</span>
        </button>

        <button
          onClick={() => {
            setActiveQuickTab('medications');
            setCollapsedSections((prev) => ({ ...prev, medications: false }));
            onNavigateSection('section-medications');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeQuickTab === 'medications'
              ? 'text-white bg-[#004f45] shadow-xs'
              : 'text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Medications</span>
        </button>

        <button
          onClick={() => {
            setActiveQuickTab('timeline');
            setCollapsedSections((prev) => ({ ...prev, history: false }));
            onNavigateSection('section-timeline');
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
            activeQuickTab === 'timeline'
              ? 'text-white bg-[#004f45] shadow-xs'
              : 'text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Timeline</span>
        </button>

        <button
          onClick={() => setShowSearchModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#546067] hover:bg-[#e6f6ff] hover:text-[#001f2a] transition-all"
        >
          <Search className="w-4 h-4" />
          <span>Search</span>
        </button>
      </div>

      {/* Quick Search Dialog */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#bec9c5]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif font-bold text-lg text-[#001f2a]">Quick Clinical Search</h3>
              <button
                onClick={() => setShowSearchModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter medications, allergies, diagnoses..."
                className="w-full pl-9 pr-4 py-2 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-sm outline-none focus:border-[#004f45]"
                autoFocus
              />
            </div>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs">
              {filteredHistory.map((item) => (
                <div key={item.id} className="p-2.5 bg-[#f4faff] rounded-lg border border-[#c9e7f7]">
                  <span className="font-bold text-[#004f45]">{item.medication}</span>
                  <p className="text-gray-600 mt-0.5">{item.outcome}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowSearchModal(false)}
                className="bg-[#004f45] text-white px-4 py-2 rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
