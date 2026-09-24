import React, { useState, useRef, useEffect } from 'react';
import { AppScreen, PatientProfile, UserRoleMode } from '../types';
import { MedPassLogo } from './brand/MedPassLogo';
import {
  Stethoscope,
  Wallet,
  Smartphone,
  Pill,
  AlertTriangle,
  FileSearch,
  ShieldCheck,
  HeartPulse,
  Plus,
  FileDown,
  Timer,
  ChevronDown,
  CheckCircle2,
  Lock,
  RotateCcw,
  Volume2,
  Sparkles,
  User,
  Film,
  MoreVertical,
  ShieldAlert,
  Camera,
  Activity,
  HardDrive,
  Users,
  Mail,
} from 'lucide-react';
import { UploadPatientPhotoModal } from './modals/UploadPatientPhotoModal';

interface NavigationHeaderProps {
  currentScreen: AppScreen;
  onSelectScreen: (screen: AppScreen) => void;
  currentPatient: PatientProfile;
  allPatients: PatientProfile[];
  onSelectPatient: (patient: PatientProfile) => void;
  onUpdatePatient?: (patient: PatientProfile) => void;
  sessionTimeLeft: number;
  onResetSession: () => void;
  onOpenAddModal: () => void;
  onOpenExportModal: () => void;
  onOpenGmailModal?: (mode?: 'login-alert' | 'otp' | 'report' | 'timeout') => void;
  onOpenEmergencyCard: () => void;
  hasContraindication: boolean;
  onOpenContraindication: () => void;
  onOpenAudioModal: () => void;
  onOpenOnboarding: () => void;
  onOpenLoginModal?: () => void;
  onOpenFirebaseAuthModal?: (role?: 'doctor' | 'patient') => void;
  onOpenDriveModal?: (role?: 'doctor' | 'patient') => void;
  onReplayIntro?: () => void;
  userRole: UserRoleMode;
  onToggleUserRole: (role: UserRoleMode) => void;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentScreen,
  onSelectScreen,
  currentPatient,
  allPatients,
  onSelectPatient,
  onUpdatePatient,
  sessionTimeLeft,
  onResetSession,
  onOpenAddModal,
  onOpenExportModal,
  onOpenGmailModal,
  onOpenEmergencyCard,
  hasContraindication,
  onOpenContraindication,
  onOpenAudioModal,
  onOpenOnboarding,
  onOpenLoginModal,
  onOpenFirebaseAuthModal,
  onOpenDriveModal,
  onReplayIntro,
  userRole,
  onToggleUserRole,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Role-tailored workspace tabs
  type NavigationTabItem = {
    id: AppScreen;
    label: string;
    icon: React.ReactNode;
    isUrgent?: boolean;
  };

  const doctorTabs: NavigationTabItem[] = [
    { id: 'clinical-reader', label: 'Doctor Visit Overview', icon: <Stethoscope className="w-3.5 h-3.5" /> },
    { id: 'active-medications', label: 'Medicines & Past Rx', icon: <Pill className="w-3.5 h-3.5" /> },
    {
      id: 'allergies-warnings',
      label: 'Allergies & Safety Alerts',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      isUrgent: hasContraindication,
    },
    { id: 'document-digitization', label: 'Medical Documents & Scans', icon: <FileSearch className="w-3.5 h-3.5" /> },
    { id: 'privacy-audit-logs', label: 'Privacy & Security Activity', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  ];

  const patientTabs: NavigationTabItem[] = [
    { id: 'health-passport', label: 'My Health Passport', icon: <Wallet className="w-3.5 h-3.5" /> },
    { id: 'mobile-wallet', label: 'Mobile Card Simulator', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'active-medications', label: 'My Prescriptions', icon: <Pill className="w-3.5 h-3.5" /> },
    { id: 'allergies-warnings', label: 'My Allergies', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'document-digitization', label: 'My Uploaded Records', icon: <FileSearch className="w-3.5 h-3.5" /> },
  ];

  const activeTabSet = userRole === 'doctor' ? doctorTabs : patientTabs;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-2xs">
      {/* ========================================================= */}
      {/* 1. TOP STATUS BAR: PATIENT ID + CRITICAL ALERTS + ACTIONS */}
      {/* ========================================================= */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Side: Brand & Patient Selector */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <div
            onClick={() => onSelectScreen(userRole === 'doctor' ? 'clinical-reader' : 'health-passport')}
            className="cursor-pointer group flex items-center shrink-0"
            title="MedPass Clinical Reader & Health Passport"
          >
            <MedPassLogo size="sm" showSubtitle={false} />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

          {/* Active Patient Identity Badge */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-all text-xs focus:outline-none focus:ring-1 focus:ring-[#004f45]"
              title="Click to Switch Patient Record Vault"
            >
              <div className="w-6 h-6 rounded-full bg-[#004f45] text-white flex items-center justify-center text-[11px] font-bold shrink-0 overflow-hidden">
                {currentPatient.photoUrl ? (
                  <img src={currentPatient.photoUrl} alt={currentPatient.name} className="w-full h-full object-cover" />
                ) : (
                  currentPatient.name.charAt(0)
                )}
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-slate-900 flex items-center gap-1 text-xs">
                  {currentPatient.name}
                  <span className="font-normal text-slate-500 text-[11px]">
                    ({currentPatient.gender.charAt(0)}, {currentPatient.age}y)
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </span>
                <span className="text-[10.5px] font-semibold text-rose-800 flex items-center gap-1 font-mono">
                  <span>{currentPatient.bloodType}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-600 font-sans font-medium text-[10px]">
                    {currentPatient.isOrganDonor ? 'Universal Donor' : 'Standard'}
                  </span>
                </span>
              </div>
            </button>

            {/* Patient Switcher Dropdown */}
            {profileDropdownOpen && (
              <div className="absolute top-full mt-1.5 left-0 w-64 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Switch Patient Vault</span>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsPhotoModalOpen(true);
                    }}
                    className="text-[#004f45] hover:text-[#003831] flex items-center gap-1 font-semibold text-[10.5px] capitalize"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Upload Photo</span>
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto py-1 space-y-0.5">
                  {allPatients.map((patient) => (
                    <button
                      key={patient.id}
                      onClick={() => {
                        onSelectPatient(patient);
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                        patient.id === currentPatient.id
                          ? 'bg-[#e6f6ff] font-bold text-[#004f45]'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[#004f45] text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                          {patient.photoUrl ? (
                            <img src={patient.photoUrl} alt={patient.name} className="w-full h-full object-cover" />
                          ) : (
                            patient.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{patient.name}</div>
                          <div className="text-[10.5px] text-slate-500">
                            {patient.relation} • Blood {patient.bloodType}
                          </div>
                        </div>
                      </div>
                      {patient.id === currentPatient.id && (
                        <CheckCircle2 className="w-4 h-4 text-[#00A87D] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-1 mt-1 border-t border-slate-100 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setIsPhotoModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-xs font-semibold text-[#004f45] hover:bg-[#e6f6ff] transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#00A87D]" />
                    <span>Upload Patient Photo</span>
                  </button>

                  {userRole === 'patient' && onOpenLoginModal && (
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onOpenLoginModal();
                      }}
                      className="w-full flex items-center justify-center gap-1.5 p-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Manage Patient Profile & PIN</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CRITICAL SAFETY INTERCEPT (Life-or-Death Warning for Doctor) */}
          {hasContraindication && (
            <button
              onClick={onOpenContraindication}
              className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-2xs shrink-0"
              title="Click to view fatal drug conflict & safe alternatives"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600 animate-pulse shrink-0" />
              <span className="hidden sm:inline">⚠️ Clinical Conflict Active</span>
              <span className="sm:hidden">⚠️ Conflict</span>
            </button>
          )}
        </div>

        {/* Right Side: Role Toggle, Actions & Session Watch */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Dual Persona Role Toggle: Doctor Triage vs Patient Health Wallet */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => onToggleUserRole('doctor')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                userRole === 'doctor'
                  ? 'bg-[#004f45] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Clinician Ephemeral Triage Workstation"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clinician Mode</span>
              <span className="md:hidden">Doctor</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleUserRole('patient')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                userRole === 'patient'
                  ? 'bg-[#004f45] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Patient Health Passport & Personal Records"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Patient Mode</span>
              <span className="md:hidden">Patient</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block mx-0.5" />

          {/* Quick Emergency Card Button (Instant Bedside Access) */}
          <button
            onClick={onOpenEmergencyCard}
            className="flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            title="View Patient Emergency Resuscitation Card"
          >
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Emergency Card</span>
            <span className="md:hidden">Emergency</span>
          </button>

          {/* Primary Action: + Add Record */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-[#004f45] hover:bg-[#003831] text-white px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs"
            title="Add Clinical Note, Prescription, or Lab"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Record</span>
          </button>

          {/* Automatic Security Timer */}
          {userRole === 'doctor' && (
            <div
              className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs"
              title="Automatic Privacy Timer: The screen will safely lock when time runs out to protect patient privacy"
            >
              <Timer className="w-3.5 h-3.5 text-[#004f45]" />
              <span className="font-mono font-bold text-slate-800 text-xs">{formatTime(sessionTimeLeft)}</span>
              <button
                onClick={onResetSession}
                title="Add More Time to Visit"
                className="p-0.5 hover:bg-slate-200/70 rounded text-slate-500 hover:text-[#004f45] transition-colors ml-0.5"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Utilities Dropdown Menu */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              className={`p-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1 ${
                toolsMenuOpen
                  ? 'bg-slate-100 border-slate-300 text-slate-900'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-600'
              }`}
              title="Utilities & Export Tools"
              aria-label="Doctor Tools"
            >
              <MoreVertical className="w-4 h-4 text-slate-600" />
            </button>

            {toolsMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-lg z-50 p-1.5 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  {userRole === 'doctor' ? 'Clinical Utilities' : 'Passport Utilities'}
                </div>

                <button
                  onClick={() => {
                    setToolsMenuOpen(false);
                    onOpenAudioModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-[#e6f6ff] hover:text-[#004f45] transition-colors font-medium"
                >
                  <Volume2 className="w-4 h-4 text-[#004f45]" />
                  <span>Audio Clinical Summary</span>
                </button>

                <button
                  onClick={() => {
                    setToolsMenuOpen(false);
                    onOpenExportModal();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-[#e6f6ff] hover:text-[#004f45] transition-colors font-medium cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-[#004f45]" />
                  <span>Export PDF Report</span>
                </button>

                {onOpenGmailModal && (
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onOpenGmailModal('report');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors font-medium cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-rose-600" />
                    <span>Send Gmail Report / OTP</span>
                  </button>
                )}

                {onOpenFirebaseAuthModal && (
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onOpenFirebaseAuthModal(userRole === 'doctor' ? 'doctor' : 'patient');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-[#e6f6ff] hover:text-[#004f45] transition-colors font-medium cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#004f45]" />
                    <span>Firebase Auth & Roles</span>
                  </button>
                )}

                {onOpenDriveModal && (
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onOpenDriveModal(userRole === 'doctor' ? 'doctor' : 'patient');
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors font-medium cursor-pointer"
                  >
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <span>Google Drive Storage & Sharing</span>
                  </button>
                )}

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setToolsMenuOpen(false);
                    onOpenOnboarding();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Quick Walkthrough Tour</span>
                </button>

                {onReplayIntro && (
                  <button
                    onClick={() => {
                      setToolsMenuOpen(false);
                      onReplayIntro();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Film className="w-4 h-4 text-slate-500" />
                    <span>Replay Cinematic Intro</span>
                  </button>
                )}

                <div className="mt-1 pt-1.5 border-t border-slate-100 px-3 py-1 text-[10.5px] text-slate-500 flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#00A87D]" />
                  <span>Active Security: Protocol 7 RAM Enclave</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. DEDICATED CLINICAL WORKSPACE NAVIGATION TABS (CLEAN ROW) */}
      {/* ========================================================= */}
      <div className="border-t border-slate-200/80 bg-slate-50/70 overflow-x-auto scrollbar-none">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 flex items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {activeTabSet.map((item) => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectScreen(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-[#004f45] text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white font-medium'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.isUrgent && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              AES-GCM Memory Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* Patient Photo Upload Modal */}
      <UploadPatientPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        patient={currentPatient}
        onSavePhoto={(newPhotoUrl) => {
          if (onUpdatePatient) {
            onUpdatePatient({ ...currentPatient, photoUrl: newPhotoUrl });
          }
        }}
      />
    </header>
  );
};
