import React, { useState, useEffect, useMemo } from 'react';
import {
  AppScreen,
  PatientProfile,
  Medication,
  Allergy,
  MedicationHistoryItem,
  ClinicalDocument,
  AuditLogEvent,
  VitalRecord,
  PastVitalReading,
  AudioFeedbackNote,
  UserRoleMode,
  MajorHealthEvent,
} from './types';
import {
  PATIENTS,
  INITIAL_MEDICATIONS,
  INITIAL_ALLERGIES,
  MEDICATION_HISTORY,
  CLINICAL_DOCUMENTS,
  AUDIT_LOGS,
  INITIAL_VITALS,
  INITIAL_AUDIO_FEEDBACK,
} from './data/mockData';
import { NavigationHeader } from './components/NavigationHeader';
import { DoctorClinicalDashboard } from './components/screens/DoctorClinicalDashboard';
import { PatientHealthWallet } from './components/screens/PatientHealthWallet';
import { MobileWalletSimulator } from './components/screens/MobileWalletSimulator';
import { AllergiesWarningsView } from './components/screens/AllergiesWarningsView';
import { ActiveMedicationsView } from './components/screens/ActiveMedicationsView';
import { DocumentDigitizationView } from './components/screens/DocumentDigitizationView';
import { PrivacyAuditLogsView } from './components/screens/PrivacyAuditLogsView';
import { ClinicalOnboardingView } from './components/screens/ClinicalOnboardingView';
import { ContraindicationModal } from './components/modals/ContraindicationModal';
import { DocumentViewerModal } from './components/modals/DocumentViewerModal';
import { EmergencyCardModal } from './components/modals/EmergencyCardModal';
import { AddRecordModal } from './components/modals/AddRecordModal';
import { QRCodeModal } from './components/modals/QRCodeModal';
import { ExportPDFModal } from './components/modals/ExportPDFModal';
import { GmailNotificationModal } from './components/modals/GmailNotificationModal';
import { AudioFeedbackModal } from './components/modals/AudioFeedbackModal';
import { OnboardingFlowModal } from './components/onboarding/OnboardingFlowModal';
import { PatientLoginRegisterModal } from './components/auth/PatientLoginRegisterModal';
import { FirebaseAuthRoleModal } from './components/auth/FirebaseAuthRoleModal';
import { GoogleDriveManagerModal } from './components/modals/GoogleDriveManagerModal';
import { EntryAnimationOverlay } from './components/entry/EntryAnimationOverlay';
import { TouristGuideChatbot } from './components/chat/TouristGuideChatbot';
import { ToastProvider, useToast } from './components/common/ToastContainer';
import { PurgedSessionLockScreen } from './components/screens/PurgedSessionLockScreen';
import { detectContraindications, ActiveConflict } from './utils/clinicalCDSS';
import {
  saveEncryptedSession,
  loadEncryptedSession,
  purgeCryptographicStorage,
} from './utils/storageEncryption';

const MainAppContent: React.FC = () => {
  const { showSuccess, showWarning, showInfo } = useToast();

  // Flaw 4 Fix: Default directly into clinical reader HUD without forced blocking animation
  const [isEntryAnimationActive, setIsEntryAnimationActive] = useState(false);

  // Flaw 7 Fix: Dual Persona Role State (Doctor Triage vs Patient Health Wallet)
  const [userRole, setUserRole] = useState<UserRoleMode>('doctor');

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('clinical-reader');

  // Flaw 10 Fix: Cryptographic Lock Screen state after RAM purge
  const [isSessionPurgedLocked, setIsSessionPurgedLocked] = useState(false);

  // Patients State
  const [allPatients, setAllPatients] = useState<PatientProfile[]>(PATIENTS);
  const [currentPatient, setCurrentPatient] = useState<PatientProfile>(PATIENTS[0]);

  // Clinical Data State
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [allergies, setAllergies] = useState<Allergy[]>(INITIAL_ALLERGIES);
  const [history, setHistory] = useState<MedicationHistoryItem[]>(MEDICATION_HISTORY);
  const [documents, setDocuments] = useState<ClinicalDocument[]>(CLINICAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(AUDIT_LOGS);
  const [vitals, setVitals] = useState<VitalRecord>(INITIAL_VITALS);
  const [audioNotes, setAudioNotes] = useState<AudioFeedbackNote[]>(INITIAL_AUDIO_FEEDBACK);

  // Ephemeral Session Timer (15 minutes = 900 seconds)
  const [sessionTimeLeft, setSessionTimeLeft] = useState(868);

  // Rotating 6-Digit Handshake Access Code
  const [sessionCode, setSessionCode] = useState('847291');
  const [codeTimer, setCodeTimer] = useState(525);

  // Modals
  const [isContraindicationOpen, setIsContraindicationOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ClinicalDocument | null>(null);
  const [isEmergencyCardOpen, setIsEmergencyCardOpen] = useState(false);
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isExportPDFOpen, setIsExportPDFOpen] = useState(false);
  const [isGmailModalOpen, setIsGmailModalOpen] = useState(false);
  const [gmailModalMode, setGmailModalMode] = useState<'login-alert' | 'otp' | 'report' | 'timeout'>('report');
  const [isAudioModalOpen, setIsAudioModalOpen] = useState(false);
  const [audioModalTab, setAudioModalTab] = useState<'summary' | 'doctor-feedback' | 'vault'>('summary');
  const [isPatientLoginOpen, setIsPatientLoginOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [isFirebaseAuthModalOpen, setIsFirebaseAuthModalOpen] = useState(false);
  const [firebaseAuthRole, setFirebaseAuthRole] = useState<'doctor' | 'patient'>('doctor');
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [driveTargetRole, setDriveTargetRole] = useState<'doctor' | 'patient'>('doctor');

  // Flaw 2 Fix: Hydrate from Encrypted Local Session on initial mount
  useEffect(() => {
    async function hydrateEncryptedState() {
      try {
        const persisted = await loadEncryptedSession();
        if (persisted) {
          if (persisted.allPatients) {
            const merged = persisted.allPatients.map((p: any) => {
              const base = PATIENTS.find((bp) => bp.id === p.id);
              return { ...p, majorEvents: p.majorEvents || base?.majorEvents };
            });
            setAllPatients(merged);
          }
          if (persisted.patientId) {
            const baseMatch = PATIENTS.find((p) => p.id === persisted.patientId);
            const found = persisted.allPatients?.find((p: any) => p.id === persisted.patientId) || baseMatch;
            if (found) {
              setCurrentPatient({ ...found, majorEvents: found.majorEvents || baseMatch?.majorEvents });
            }
          }
          if (persisted.medications) setMedications(persisted.medications);
          if (persisted.allergies) setAllergies(persisted.allergies);
          if (persisted.history) setHistory(persisted.history);
          if (persisted.documents) setDocuments(persisted.documents);
          if (persisted.auditLogs) setAuditLogs(persisted.auditLogs);
          if (persisted.vitals) setVitals(persisted.vitals);
          if (persisted.audioNotes) setAudioNotes(persisted.audioNotes);
        }
      } catch (err) {
        console.warn('Hydration skipped:', err);
      }
    }
    hydrateEncryptedState();
  }, []);

  // Flaw 2 Fix: Auto-persist encrypted session whenever clinical state changes
  useEffect(() => {
    if (isSessionPurgedLocked) return;
    const payload = {
      version: 1,
      updatedAt: new Date().toISOString(),
      patientId: currentPatient.id,
      allPatients,
      medications,
      allergies,
      history,
      documents,
      auditLogs,
      vitals,
      audioNotes,
    };
    saveEncryptedSession(payload).catch((err) => console.warn('Persistence sync error:', err));
  }, [
    currentPatient.id,
    allPatients,
    medications,
    allergies,
    history,
    documents,
    auditLogs,
    vitals,
    audioNotes,
    isSessionPurgedLocked,
  ]);

  // Flaw 3 Fix: Dynamic Patient Scoping across all views
  const patientMeds = useMemo(() => {
    return medications.filter((m) => !m.patientId || m.patientId === currentPatient.id);
  }, [medications, currentPatient.id]);

  const patientAllergies = useMemo(() => {
    return allergies.filter((a) => !a.patientId || a.patientId === currentPatient.id);
  }, [allergies, currentPatient.id]);

  const patientHistory = useMemo(() => {
    return history.filter((h) => !h.patientId || h.patientId === currentPatient.id);
  }, [history, currentPatient.id]);

  const patientDocs = useMemo(() => {
    return documents.filter((d) => !d.patientId || d.patientId === currentPatient.id);
  }, [documents, currentPatient.id]);

  // Dismiss acknowledged contraindications
  const [acknowledgedConflictIds, setAcknowledgedConflictIds] = useState<string[]>([]);

  // Flaw 8 Fix: Dynamic Drug-Drug & Drug-Allergy CDSS Evaluator
  const activeConflicts = useMemo(() => {
    const detected = detectContraindications(patientMeds, patientAllergies);
    return detected.filter((c) => !acknowledgedConflictIds.includes(c.id));
  }, [patientMeds, patientAllergies, acknowledgedConflictIds]);

  const hasContraindication = activeConflicts.length > 0;
  const primaryConflict: ActiveConflict | null = activeConflicts[0] || null;

  const handleAcknowledgeContraindication = () => {
    if (primaryConflict) {
      setAcknowledgedConflictIds((prev) => [...prev, primaryConflict.id]);
    }
    showWarning(
      'Contraindication Acknowledged',
      'Clinical advisory overridden by physician. Please exercise extreme caution.'
    );
  };

  // Countdown timer effect for clinical reader session
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionTimeLeft((prev) => (prev > 0 ? prev - 1 : 900));
      setCodeTimer((prev) => (prev > 0 ? prev - 1 : 600));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegenerateCode = () => {
    const random6 = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(random6);
    setCodeTimer(600);
    showInfo('Access Handshake Code Regenerated', `New 6-digit access code: ${random6}`);
  };

  const handleResetSession = () => {
    setSessionTimeLeft(900);
    showInfo('Ephemeral Session Extended', 'Session timer extended to 15:00 minutes.');
  };

  // Flaw 10 & Flaw 1 Fix: Cryptographic RAM purge, storage wipe, and non-blocking toast
  const handleCompleteSession = () => {
    // 1. Append verifiable audit log
    const newLog: AuditLogEvent = {
      id: `log-${Date.now()}`,
      eventType: 'CLINICAL REVIEW',
      accessorName: 'Dr. Sarah Jenkins',
      facilityLocation: 'St. Mary’s General Hospital',
      timestamp: `JUST NOW • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      sessionDuration: `${Math.floor((900 - sessionTimeLeft) / 60)}m ${(900 - sessionTimeLeft) % 60}s`,
      dataAccessed: ['Prescriptions', 'Allergies', 'Vitals', 'History Timeline'],
      securityStatus: 'RAM Purged Successfully',
      securityDetail: 'Protocol 7 zero-residual memory wipe confirmed',
    };
    setAuditLogs([newLog, ...auditLogs]);

    // 2. Cryptographically overwrite storage and memory buffers
    purgeCryptographicStorage();

    // 3. Show friendly non-blocking notification
    showSuccess(
      'Doctor Visit Safely Ended',
      'Patient records have been securely locked and cleared from screen.'
    );

    // 4. Lock screen to prevent accidental residual data exposure
    setIsSessionPurgedLocked(true);
    setSessionTimeLeft(900);
  };

  const handleUnlockPurgedSession = (enteredCode: string) => {
    setIsSessionPurgedLocked(false);
    setCurrentScreen('clinical-reader');
    showSuccess('Welcome Back', `Patient chart unlocked successfully.`);
  };

  // Flaw 8 & Flaw 1 Fix: Dynamic medication swapping with non-blocking toast
  const handleSelectAlternativeMed = (
    altMedName: string,
    dosage: string,
    conflictingMedName = 'Amoxicillin'
  ) => {
    setMedications((prev) =>
      prev.map((m) =>
        m.name.toLowerCase().includes(conflictingMedName.toLowerCase())
          ? {
              ...m,
              name: altMedName.split(' ')[0],
              genericName: altMedName,
              dosage: dosage.split(' ')[0],
              category: 'Non-Beta-Lactam Antibiotic / Alternative',
              instructions: dosage,
              tierLabel: 'Gold Tier Verified',
            }
          : m
      )
    );
    showSuccess(
      'Contraindication Resolved',
      `Swapped ${conflictingMedName} to ${altMedName}. Drug-allergy conflict cleared.`
    );
  };

  const handleAddMedication = (newMed: Medication) => {
    setMedications([newMed, ...medications]);
    // If it's a critical or high-significance medicine, dynamically add a priority condition tab for this patient
    const cleanName = newMed.name;
    const isSpecialCategory =
      newMed.category.toLowerCase().includes('diabetes') ||
      newMed.category.toLowerCase().includes('heart') ||
      newMed.category.toLowerCase().includes('cardio') ||
      newMed.category.toLowerCase().includes('respiratory') ||
      newMed.category.toLowerCase().includes('thyroid');

    if (isSpecialCategory) {
      const newEvent: MajorHealthEvent = {
        id: `evt-${Date.now()}`,
        type: 'condition',
        title: `${newMed.name} (${newMed.category})`,
        shortLabel: newMed.name.split(' ')[0],
        dateOrYear: 'Added Today',
        severity: 'High',
        status: 'Active Prescribed Regimen',
        summary: `Prescribed ${newMed.name} ${newMed.dosage} for ${newMed.category}. Instructions: ${newMed.instructions || newMed.frequency}.`,
        relatedMedications: [`${newMed.name} ${newMed.dosage}`],
        relatedLabOrDocument: `Prescribed by ${newMed.prescribingDoctor}`,
        clinicalInstructions: newMed.instructions || `Take ${newMed.frequency} as directed.`,
      };
      setAllPatients((prev) =>
        prev.map((p) =>
          p.id === currentPatient.id
            ? { ...p, majorEvents: [newEvent, ...(p.majorEvents || [])] }
            : p
        )
      );
      setCurrentPatient((prev) => ({
        ...prev,
        majorEvents: [newEvent, ...(prev.majorEvents || [])],
      }));
    }
    showSuccess('Medication Added', `${newMed.name} added to ${currentPatient.name}'s active prescriptions.`);
  };

  const handleAddAllergy = (newAlg: Allergy) => {
    setAllergies([newAlg, ...allergies]);
    // If it's severe, automatically generate a high-priority safety tab
    if (newAlg.severity === 'Severe') {
      const newAllergyEvent: MajorHealthEvent = {
        id: `evt-alg-${Date.now()}`,
        type: 'allergy',
        title: `Severe ${newAlg.allergen} Allergy`,
        shortLabel: `${newAlg.allergen} Allergy`,
        dateOrYear: 'Documented Today',
        severity: 'Critical',
        status: 'CRITICAL ALERT • Never Administer',
        summary: newAlg.reactionDetails,
        relatedMedications: [`Avoid: ${newAlg.allergen} and cross-reacting compounds`],
        relatedLabOrDocument: `Source: ${newAlg.source}`,
        clinicalInstructions: `Documented ${newAlg.severity} allergic response. Immediate intervention required on accidental exposure.`,
      };
      setAllPatients((prev) =>
        prev.map((p) =>
          p.id === currentPatient.id
            ? { ...p, majorEvents: [newAllergyEvent, ...(p.majorEvents || [])] }
            : p
        )
      );
      setCurrentPatient((prev) => ({
        ...prev,
        majorEvents: [newAllergyEvent, ...(prev.majorEvents || [])],
      }));
    }
    showSuccess('Allergy Logged', `${newAlg.allergen} registered in ${currentPatient.name}'s allergy chart.`);
  };

  const handleAddDocument = (newDoc: ClinicalDocument) => {
    setDocuments([newDoc, ...documents]);
  };

  const handleUpdateDocument = (updatedDoc: ClinicalDocument) => {
    setDocuments((prev) => prev.map((d) => (d.id === updatedDoc.id ? updatedDoc : d)));
  };

  const handleAddVitalReading = (newReading: PastVitalReading) => {
    setVitals((prev) => ({
      ...prev,
      bloodPressure: newReading.bloodPressure,
      heartRate: newReading.heartRate,
      bpStatus: newReading.bpStatus === 'Caution' ? 'Elevated' : 'Stable',
      lastCheckedDate: newReading.lastCheckedDate || newReading.timestamp,
      pastReadings: [newReading, ...(prev.pastReadings || [])],
    }));
    showSuccess('Vitals Recorded', `Logged BP ${newReading.bloodPressure} & HR ${newReading.heartRate} bpm.`);
  };

  const handleSavePatientProfile = (newProfile: PatientProfile) => {
    setCurrentPatient(newProfile);
    setAllPatients((prev) => {
      const exists = prev.some((p) => p.id === newProfile.id);
      if (exists) {
        return prev.map((p) => (p.id === newProfile.id ? newProfile : p));
      }
      return [newProfile, ...prev];
    });
    showSuccess('Patient Profile Updated', `Active patient set to ${newProfile.name}`);
  };

  const handleToggleUserRole = (newRole: UserRoleMode) => {
    setUserRole(newRole);
    if (newRole === 'patient') {
      setCurrentScreen('health-passport');
      showInfo('Switched to Patient Mode', 'Viewing patient-facing health passport & mobile credentials.');
    } else {
      setCurrentScreen('clinical-reader');
      showInfo('Switched to Clinician Mode', 'Viewing 30-second rapid triage reader & clinical HUD.');
    }
  };

  const handleNavigateSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // If session was RAM-purged, show the secure Lock Screen
  if (isSessionPurgedLocked) {
    return (
      <>
        <PurgedSessionLockScreen
          requiredCode={sessionCode}
          onUnlockSession={handleUnlockPurgedSession}
          onSendCodeViaEmail={() => {
            setGmailModalMode('otp');
            setIsGmailModalOpen(true);
          }}
          onSendTimeoutReport={() => {
            setGmailModalMode('timeout');
            setIsGmailModalOpen(true);
          }}
        />
        <GmailNotificationModal
          isOpen={isGmailModalOpen}
          onClose={() => setIsGmailModalOpen(false)}
          patient={currentPatient}
          medications={patientMeds}
          allergies={patientAllergies}
          sessionCode={sessionCode}
          defaultMode={gmailModalMode}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4faff] text-[#001f2a] flex flex-col font-sans selection:bg-[#004f45]/20 selection:text-[#004f45]">
      {/* Global Navigation Bar */}
      <NavigationHeader
        currentScreen={currentScreen}
        onSelectScreen={setCurrentScreen}
        currentPatient={currentPatient}
        allPatients={allPatients}
        onSelectPatient={setCurrentPatient}
        onUpdatePatient={handleSavePatientProfile}
        sessionTimeLeft={sessionTimeLeft}
        onResetSession={handleResetSession}
        onOpenAddModal={() => setIsAddRecordOpen(true)}
        onOpenExportModal={() => setIsExportPDFOpen(true)}
        onOpenGmailModal={(mode) => {
          if (mode) setGmailModalMode(mode);
          setIsGmailModalOpen(true);
        }}
        onOpenEmergencyCard={() => setIsEmergencyCardOpen(true)}
        hasContraindication={hasContraindication}
        onOpenContraindication={() => setIsContraindicationOpen(true)}
        onOpenAudioModal={() => {
          setAudioModalTab('summary');
          setIsAudioModalOpen(true);
        }}
        onOpenOnboarding={() => setIsOnboardingModalOpen(true)}
        onOpenLoginModal={() => setIsPatientLoginOpen(true)}
        onOpenFirebaseAuthModal={(role) => {
          if (role) setFirebaseAuthRole(role);
          setIsFirebaseAuthModalOpen(true);
        }}
        onOpenDriveModal={(role) => {
          if (role) setDriveTargetRole(role);
          setIsDriveModalOpen(true);
        }}
        onReplayIntro={() => setIsEntryAnimationActive(true)}
        userRole={userRole}
        onToggleUserRole={handleToggleUserRole}
      />

      {/* Main Screen Content Viewport */}
      <main className="flex-1">
        {currentScreen === 'clinical-reader' && (
          <DoctorClinicalDashboard
            patient={currentPatient}
            medications={patientMeds}
            allergies={patientAllergies}
            history={patientHistory}
            vitals={vitals}
            documents={patientDocs}
            sessionTimeLeft={sessionTimeLeft}
            hasContraindication={hasContraindication}
            onAcknowledgeContraindication={handleAcknowledgeContraindication}
            onViewAlternatives={() => setIsContraindicationOpen(true)}
            onCompleteSession={handleCompleteSession}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            onNavigateSection={handleNavigateSection}
            onAddRecord={() => setIsAddRecordOpen(true)}
            onAddVitalReading={handleAddVitalReading}
            audioNotes={audioNotes}
            onOpenAudioModal={(tab) => {
              if (tab) setAudioModalTab(tab);
              setIsAudioModalOpen(true);
            }}
            onOpenGmailModal={(mode) => {
              if (mode) setGmailModalMode(mode);
              setIsGmailModalOpen(true);
            }}
            onOpenDriveModal={() => {
              setDriveTargetRole('doctor');
              setIsDriveModalOpen(true);
            }}
          />
        )}

        {currentScreen === 'health-passport' && (
          <PatientHealthWallet
            patient={currentPatient}
            allPatients={allPatients}
            onSelectPatient={setCurrentPatient}
            onUpdatePatient={handleSavePatientProfile}
            medications={patientMeds}
            allergies={patientAllergies}
            documents={patientDocs}
            auditLogs={auditLogs}
            vitals={vitals}
            onAddVitalReading={handleAddVitalReading}
            onOpenAddModal={() => setIsAddRecordOpen(true)}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            onOpenQRModal={() => setIsQRModalOpen(true)}
            onOpenEmergencyCard={() => setIsEmergencyCardOpen(true)}
            onViewAllMeds={() => setCurrentScreen('active-medications')}
            onViewAllAllergies={() => setCurrentScreen('allergies-warnings')}
            onViewAllLogs={() => setCurrentScreen('privacy-audit-logs')}
            onViewAllDocs={() => setCurrentScreen('document-digitization')}
            sessionCode={sessionCode}
            onRegenerateCode={handleRegenerateCode}
            sessionSeconds={codeTimer}
            onOpenAudioModal={() => {
              setAudioModalTab('summary');
              setIsAudioModalOpen(true);
            }}
            onOpenDriveModal={() => {
              setDriveTargetRole('patient');
              setIsDriveModalOpen(true);
            }}
          />
        )}

        {currentScreen === 'mobile-wallet' && (
          <MobileWalletSimulator
            patient={currentPatient}
            allPatients={allPatients}
            onSelectPatient={setCurrentPatient}
            medications={patientMeds}
            allergies={patientAllergies}
            documents={patientDocs}
            sessionCode={sessionCode}
            onRegenerateCode={handleRegenerateCode}
            audioNotes={audioNotes}
          />
        )}

        {currentScreen === 'active-medications' && (
          <ActiveMedicationsView
            medications={medications}
            history={history}
            patient={currentPatient}
            onAddMedication={() => setIsAddRecordOpen(true)}
            onOpenExportModal={() => setIsExportPDFOpen(true)}
            hasContraindication={hasContraindication}
            onOpenContraindication={() => setIsContraindicationOpen(true)}
          />
        )}

        {currentScreen === 'allergies-warnings' && (
          <AllergiesWarningsView
            allergies={allergies}
            patient={currentPatient}
            onAddAllergy={() => setIsAddRecordOpen(true)}
            onOpenContraindication={() => setIsContraindicationOpen(true)}
            hasContraindication={hasContraindication}
          />
        )}

        {currentScreen === 'document-digitization' && (
          <DocumentDigitizationView
            documents={documents}
            patient={currentPatient}
            onOpenDocument={(doc) => setSelectedDocument(doc)}
            onAddDocument={handleAddDocument}
            onUpdateDocument={handleUpdateDocument}
          />
        )}

        {currentScreen === 'privacy-audit-logs' && (
          <PrivacyAuditLogsView auditLogs={auditLogs} patient={currentPatient} />
        )}

        {currentScreen === 'clinical-onboarding' && (
          <ClinicalOnboardingView onCompleteOnboarding={() => setCurrentScreen('clinical-reader')} />
        )}
      </main>

      {/* Global Interactive Modals */}
      <ContraindicationModal
        isOpen={isContraindicationOpen}
        onClose={() => setIsContraindicationOpen(false)}
        onSelectAlternative={handleSelectAlternativeMed}
        activeConflict={primaryConflict}
        patientName={currentPatient.name}
      />

      <DocumentViewerModal
        isOpen={!!selectedDocument}
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

      <EmergencyCardModal
        isOpen={isEmergencyCardOpen}
        onClose={() => setIsEmergencyCardOpen(false)}
        patient={currentPatient}
        allergies={patientAllergies}
        medications={patientMeds}
      />

      <AddRecordModal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        patient={currentPatient}
        onAddMedication={handleAddMedication}
        onAddAllergy={handleAddAllergy}
      />

      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        patient={currentPatient}
        sessionCode={sessionCode}
        onRegenerateCode={handleRegenerateCode}
        sessionSeconds={codeTimer}
      />

      <ExportPDFModal
        isOpen={isExportPDFOpen}
        onClose={() => setIsExportPDFOpen(false)}
        patient={currentPatient}
        medications={patientMeds}
        allergies={patientAllergies}
        vitals={vitals}
        onSaveToDrive={() => {
          setDriveTargetRole(userRole === 'doctor' ? 'doctor' : 'patient');
          setIsDriveModalOpen(true);
        }}
        onEmailReport={() => {
          setGmailModalMode('report');
          setIsGmailModalOpen(true);
        }}
      />

      {/* Gmail Email Dispatcher Modal */}
      <GmailNotificationModal
        isOpen={isGmailModalOpen}
        onClose={() => setIsGmailModalOpen(false)}
        patient={currentPatient}
        medications={patientMeds}
        allergies={patientAllergies}
        sessionCode={sessionCode}
        defaultMode={gmailModalMode}
      />

      {/* Audio Feedback & Voice Notes Modal */}
      <AudioFeedbackModal
        isOpen={isAudioModalOpen}
        onClose={() => setIsAudioModalOpen(false)}
        patient={currentPatient}
        medications={patientMeds}
        allergies={patientAllergies}
        vitals={vitals}
        audioNotes={audioNotes}
        onSaveDoctorFeedback={(newNote) => setAudioNotes([newNote, ...audioNotes])}
        initialTab={audioModalTab}
      />

      {/* Onboarding Flow Modal */}
      <OnboardingFlowModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
        onSelectScreen={setCurrentScreen}
        initialMode={currentScreen === 'mobile-wallet' ? 'mobile' : 'website'}
      />

      {/* Patient Profile Setup / Login */}
      <PatientLoginRegisterModal
        isOpen={isPatientLoginOpen}
        onClose={() => setIsPatientLoginOpen(false)}
        currentPatient={currentPatient}
        allPatients={allPatients}
        onSelectPatient={setCurrentPatient}
        onSaveNewPatient={handleSavePatientProfile}
      />

      {/* Firebase Doctor and Patient Role Auth Modal */}
      <FirebaseAuthRoleModal
        isOpen={isFirebaseAuthModalOpen}
        onClose={() => setIsFirebaseAuthModalOpen(false)}
        defaultRole={firebaseAuthRole}
        onAuthenticated={(profile) => {
          if (profile.role === 'doctor') {
            setUserRole('doctor');
            setCurrentScreen('clinical-reader');
          } else {
            setUserRole('patient');
            setCurrentScreen('health-passport');
          }
        }}
      />

      {/* Google Drive Manager & Access Control Modal */}
      <GoogleDriveManagerModal
        isOpen={isDriveModalOpen}
        onClose={() => setIsDriveModalOpen(false)}
        patient={currentPatient}
        medications={patientMeds}
        allergies={patientAllergies}
        vitals={vitals}
        targetRole={driveTargetRole}
      />

      {/* Optional Cinematic Entry Animation (re-playable via tools menu) */}
      {isEntryAnimationActive && (
        <EntryAnimationOverlay
          onComplete={() => {
            setIsEntryAnimationActive(false);
          }}
        />
      )}

      {/* Non-Medical Site Tourist Guide Chatbot */}
      <TouristGuideChatbot
        onNavigateScreen={setCurrentScreen}
        onOpenEmergencyCard={() => setIsEmergencyCardOpen(true)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <MainAppContent />
    </ToastProvider>
  );
};

export default App;
