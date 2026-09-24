import React, { useState, useEffect } from 'react';
import { PatientProfile, Medication, Allergy, ClinicalDocument, AudioFeedbackNote } from '../../types';
import { MedPassLogo } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { AudioPlayerWidget } from '../audio/AudioPlayerWidget';
import { BiometricUnlockLayer } from '../auth/BiometricUnlockLayer';
import { playBiometricFeedbackSound } from '../../utils/audioUtils';
import {
  Shield,
  QrCode,
  Camera,
  AlertTriangle,
  FileText,
  HeartPulse,
  CheckCircle2,
  Copy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Smartphone,
  Lock,
  Unlock,
  Volume2,
  ScanFace,
  User,
  ShieldCheck,
  X,
  Phone,
  Pill,
  Calendar,
  AlertCircle,
  Eye,
  Search,
  Check,
  Stethoscope,
  Info,
} from 'lucide-react';

export type MobileInternalView =
  | 'home'
  | 'medications'
  | 'allergies'
  | 'documents'
  | 'document-detail'
  | 'emergency'
  | 'audio'
  | 'scan';

interface MobileWalletSimulatorProps {
  patient: PatientProfile;
  allPatients: PatientProfile[];
  medications: Medication[];
  allergies: Allergy[];
  documents: ClinicalDocument[];
  sessionCode?: string;
  onRegenerateCode?: () => void;
  audioNotes?: AudioFeedbackNote[];
  onSelectPatient?: (p: PatientProfile) => void;
  // Legacy optional props retained for backwards interface compatibility
  onOpenQRModal?: () => void;
  onOpenEmergencyCard?: () => void;
  onOpenAddModal?: () => void;
  onOpenDocument?: (doc: ClinicalDocument) => void;
  onViewAllMeds?: () => void;
  onViewAllAllergies?: () => void;
  onViewAllDocs?: () => void;
  onOpenAudioModal?: (tab?: 'summary' | 'doctor-feedback' | 'vault') => void;
  onOpenOnboarding?: () => void;
  onSavePatientProfile?: (p: PatientProfile) => void;
}

export const MobileWalletSimulator: React.FC<MobileWalletSimulatorProps> = ({
  patient: initialPatient,
  allPatients,
  medications,
  allergies,
  documents,
  sessionCode: externalSessionCode,
  onRegenerateCode,
  audioNotes = [],
  onSelectPatient: externalSelectPatient,
}) => {
  // Local active patient for isolated simulator manipulation
  const [activePatient, setActivePatient] = useState<PatientProfile>(initialPatient);

  // Sync if initialPatient changes from outer application
  useEffect(() => {
    setActivePatient(initialPatient);
  }, [initialPatient]);

  // Isolated Mobile Internal Navigation State
  const [currentView, setCurrentView] = useState<MobileInternalView>('home');
  const [selectedDocument, setSelectedDocument] = useState<ClinicalDocument | null>(null);

  // In-phone Sheets / Overlays (confined within phone frame)
  const [showQRSheet, setShowQRSheet] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [copiedPIN, setCopiedPIN] = useState(false);

  // Internal rotating session PIN
  const [internalCode, setInternalCode] = useState('847291');
  const [secondsLeft, setSecondsLeft] = useState(45);

  // Scanner simulation state inside the phone
  const [scanStage, setScanStage] = useState<'viewfinder' | 'processing' | 'result'>('viewfinder');

  // Filters within internal views
  const [medFilter, setMedFilter] = useState<'all' | 'tier1' | 'tier2'>('all');
  const [allergyFilter, setAllergyFilter] = useState<'all' | 'Drug' | 'Food' | 'Environmental'>('all');
  const [docFilter, setDocFilter] = useState<string>('all');

  const displayCode = externalSessionCode || internalCode;

  // Countdown timer for rotating PIN (purely local / in-phone)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (onRegenerateCode) {
            onRegenerateCode();
          } else {
            const nextCode = Math.floor(100000 + Math.random() * 900000).toString();
            setInternalCode(nextCode);
          }
          return 45;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onRegenerateCode]);

  const handleCopyPIN = () => {
    try {
      navigator.clipboard?.writeText(displayCode);
    } catch {
      // Ignore clipboard permission errors in strict sandboxes
    }
    setCopiedPIN(true);
    setTimeout(() => setCopiedPIN(false), 2000);
  };

  const handleLockWallet = () => {
    setIsLocked(true);
    playBiometricFeedbackSound('lock');
  };

  const handleUnlockWallet = () => {
    setIsLocked(false);
  };

  const handleSelectPatientLocal = (p: PatientProfile) => {
    setActivePatient(p);
    setShowProfileSheet(false);
    if (externalSelectPatient) {
      externalSelectPatient(p);
    }
  };

  const filteredMeds = medications.filter((m) => {
    if (medFilter === 'all') return true;
    return m.tier === medFilter;
  });

  const filteredAllergies = allergies.filter((a) => {
    if (allergyFilter === 'all') return true;
    return a.category === allergyFilter;
  });

  const filteredDocs = documents.filter((d) => {
    if (docFilter === 'all') return true;
    return d.type === docFilter;
  });

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4faff] flex flex-col items-center justify-center py-6 px-4">
      {/* Simulator Device Shell Information Banner (View-Only & Isolated) */}
      <div className="w-full max-w-[390px] mb-3 flex items-center justify-between px-3 py-1.5 bg-white/90 border border-slate-200 rounded-xl text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#004f45]" />
          <span className="font-semibold text-slate-800">Mobile Simulator</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
            View-Only
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-500 font-mono text-[10px]">Confined Container</span>
        </div>
      </div>

      {/* MOBILE DEVICE MOCKUP (Strict UI Container: All state & views are confined inside this frame) */}
      <div className="w-full max-w-[390px] h-[790px] bg-white rounded-[48px] border-[10px] border-[#1e293b] shadow-2xl relative overflow-hidden flex flex-col ring-1 ring-black/10 select-none">
        
        {/* iOS Dynamic Island & Top System Status Bar */}
        <div className="w-full bg-[#1e293b] pt-3 pb-2 px-6 flex items-center justify-between text-white text-[11px] font-mono shrink-0 select-none z-30">
          <span>9:41</span>
          <div className="w-20 h-4 bg-black rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#10b981] ml-auto mr-2" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <div className="w-4 h-2.5 border border-white rounded-xs p-0.5">
              <div className="w-full h-full bg-white" />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* IN-PHONE SCREEN VIEWPORT (Everything renders within this frame) */}
        {/* ============================================================== */}
        <div className="flex-1 relative overflow-hidden bg-[#f4faff] flex flex-col">

          {/* 1. BIOMETRIC UNLOCK LAYER OVERLAY (Confined strictly inside the phone) */}
          {isLocked && (
            <BiometricUnlockLayer
              patient={activePatient}
              isLocked={isLocked}
              onUnlock={handleUnlockWallet}
              onOpenEmergencyCard={() => {
                setIsLocked(false);
                setCurrentView('emergency');
              }}
              onOpenLoginModal={() => setShowProfileSheet(true)}
              walletPin="8472"
            />
          )}

          {/* 2. IN-PHONE BOTTOM NAVIGATION DOCK (Confined at bottom of viewport) */}
          {/* Rendered below, unless on scanner or locked */}

          {/* 3. SCREEN CONTENT ROUTER (Strictly internal views) */}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: HOME SCREEN */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'home' && (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Mobile Home Header */}
              <div className="p-4 pb-3 bg-white border-b border-[#c9e7f7]/60 shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <MedPassLogo size="sm" showSubtitle={false} />

                  <div className="flex items-center gap-1.5">
                    {/* Device Lock Button */}
                    <button
                      onClick={handleLockWallet}
                      className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6]/60 rounded-lg border border-[#ba1a1a]/30 transition-colors"
                      title="Lock Device with Biometrics"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>

                    {/* Patient Profile Sheet Button */}
                    <button
                      onClick={() => setShowProfileSheet(true)}
                      className="p-1 text-[#004f45] hover:bg-[#e6f6ff] rounded-lg border border-[#004f45]/30 transition-colors"
                      title="View Profile Details"
                    >
                      <User className="w-3.5 h-3.5" />
                    </button>

                    {/* In-Phone Patient Switcher */}
                    <select
                      value={activePatient.id}
                      onChange={(e) => {
                        const found = allPatients.find((p) => p.id === e.target.value);
                        if (found) handleSelectPatientLocal(found);
                      }}
                      className="bg-[#f4faff] border border-[#bec9c5] text-[11px] font-bold rounded-lg px-2 py-1 text-[#004f45] outline-none max-w-[110px] truncate"
                    >
                      {allPatients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name.split(' ')[0]} ({p.relation})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-medium text-[#546067]">
                      Hello, {activePatient.name.split(' ')[0]} 👋
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#001f2a]">Health Wallet</h2>
                  </div>
                  <CaduceusSymbol size={26} color="#005A4E" className="opacity-70" />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="bg-[#e6f6ff] text-[#004f45] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px]">
                    <ShieldCheck className="w-3 h-3 text-[#10b981]" />
                    <span>Face ID Authenticated</span>
                  </span>
                  <span className="font-mono text-[#ba1a1a] font-bold text-[10px]">
                    {activePatient.bloodType} • {activePatient.isOrganDonor ? 'Donor' : 'Standard'}
                  </span>
                </div>
              </div>

              {/* Mobile Home Scrollable Body */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 pb-20">
                {/* Doctor Handshake PIN Card */}
                <div className="bg-white border-2 border-[#004f45] rounded-2xl p-3.5 shadow-xs relative overflow-hidden">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold text-[#546067] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#004f45]" />
                      Doctor Handshake PIN
                    </span>
                    <span className="text-[9px] font-bold text-[#047857] bg-[#10b981]/15 px-2 py-0.5 rounded-full">
                      Active ({secondsLeft}s)
                    </span>
                  </div>

                  <div className="bg-[#f4faff] border border-[#004f45]/20 rounded-xl p-2.5 flex flex-col items-center my-1">
                    <div className="font-mono text-2xl font-bold tracking-widest text-[#004f45]">
                      {displayCode.slice(0, 3)} - {displayCode.slice(3)}
                    </div>
                    <p className="text-[9px] text-[#546067] mt-0.5">Read by clinician via terminal or scanner</p>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-[#c9e7f7]">
                    <button
                      onClick={handleCopyPIN}
                      className="flex-1 py-1.5 bg-[#f4faff] hover:bg-[#e6f6ff] border border-[#bec9c5] rounded-lg text-xs font-semibold text-[#001f2a] flex items-center justify-center gap-1 transition-colors"
                    >
                      {copiedPIN ? <CheckCircle2 className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedPIN ? 'Copied' : 'Copy PIN'}</span>
                    </button>

                    <button
                      onClick={() => setShowQRSheet(true)}
                      className="flex-1 py-1.5 bg-[#004f45] text-white hover:bg-[#003831] rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Show QR</span>
                    </button>
                  </div>
                </div>

                {/* Spoken Audio Summary Card */}
                <div className="bg-white border border-[#bec9c5] rounded-2xl p-3 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between border-b border-[#c9e7f7] pb-1.5">
                    <span className="text-xs font-bold text-[#001f2a] flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-[#004f45]" />
                      Spoken Audio Summary
                    </span>
                    <button
                      onClick={() => setCurrentView('audio')}
                      className="text-[10px] font-bold text-[#004f45] hover:underline flex items-center gap-0.5"
                    >
                      <span>Voice Vault</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <AudioPlayerWidget
                    title={`${activePatient.name.split(' ')[0]}'s Health Pass Audio`}
                    speaker="MedPass Voice"
                    transcript={`Hello ${activePatient.name.split(' ')[0]}. Here is your official MedPass audio summary. Your blood type is ${activePatient.bloodType}. Severe allergy alert: Severe Penicillin allergy. Active prescriptions: Lisinopril 10 milligrams once daily and Metformin 500 milligrams twice daily.`}
                    durationSeconds={28}
                    category="Patient Summary"
                    compact={true}
                  />
                </div>

                {/* Quick Actions Grid (All navigation happens strictly inside the phone) */}
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Prescriptions */}
                  <button
                    onClick={() => setCurrentView('medications')}
                    className="p-3 bg-white border border-[#bec9c5] rounded-xl flex flex-col items-start text-left hover:border-[#004f45] hover:shadow-2xs transition-all active:scale-98"
                  >
                    <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg mb-1.5">
                      <Pill className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#001f2a]">Prescriptions</span>
                    <span className="text-[10px] text-[#546067] mt-0.5">{medications.length} Active Records</span>
                  </button>

                  {/* Allergies & Alerts */}
                  <button
                    onClick={() => setCurrentView('allergies')}
                    className="p-3 bg-white border border-[#bec9c5] rounded-xl flex flex-col items-start text-left hover:border-[#ba1a1a] hover:shadow-2xs transition-all active:scale-98"
                  >
                    <div className="p-1.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg mb-1.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#001f2a]">Allergies & Alerts</span>
                    <span className="text-[10px] text-[#ba1a1a] font-semibold mt-0.5">Penicillin Alert</span>
                  </button>

                  {/* Document Vault */}
                  <button
                    onClick={() => setCurrentView('documents')}
                    className="p-3 bg-white border border-[#bec9c5] rounded-xl flex flex-col items-start text-left hover:border-[#004f45] hover:shadow-2xs transition-all active:scale-98"
                  >
                    <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg mb-1.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#001f2a]">Document Vault</span>
                    <span className="text-[10px] text-[#546067] mt-0.5">{documents.length} Records</span>
                  </button>

                  {/* Audio & Feedback */}
                  <button
                    onClick={() => setCurrentView('audio')}
                    className="p-3 bg-white border border-[#bec9c5] rounded-xl flex flex-col items-start text-left hover:border-[#004f45] hover:shadow-2xs transition-all active:scale-98"
                  >
                    <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg mb-1.5">
                      <Volume2 className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-xs text-[#001f2a]">Audio & Notes</span>
                    <span className="text-[10px] text-[#546067] mt-0.5">Voice Vault</span>
                  </button>

                  {/* Emergency Card (Full width) */}
                  <button
                    onClick={() => setCurrentView('emergency')}
                    className="col-span-2 p-3 bg-[#ffdad6]/40 border border-[#ba1a1a]/40 rounded-xl flex items-center justify-between text-left hover:bg-[#ffdad6]/70 transition-all active:scale-98"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg">
                        <HeartPulse className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-[#ba1a1a] block">Emergency Medical ID</span>
                        <span className="text-[10px] text-[#ba1a1a]/80">Blood Type {activePatient.bloodType} • Resuscitation</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#ba1a1a]" />
                  </button>
                </div>

                {/* Quick Active Prescriptions List */}
                <div className="bg-white border border-[#bec9c5] rounded-2xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between mb-2 border-b border-[#c9e7f7] pb-1.5">
                    <span className="font-bold text-xs text-[#001f2a]">Active Prescriptions</span>
                    <button
                      onClick={() => setCurrentView('medications')}
                      className="text-[10px] font-bold text-[#004f45] hover:underline"
                    >
                      View All ({medications.length})
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {medications.slice(0, 3).map((m) => (
                      <div
                        key={m.id}
                        className="p-2 bg-[#f4faff] border border-[#c9e7f7] rounded-xl flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-bold text-xs text-[#001f2a]">{m.name} {m.dosage}</h4>
                          <p className="text-[10px] text-[#546067]">{m.frequency}</p>
                        </div>
                        <span className="text-[8px] font-bold bg-[#daa520]/20 text-[#8b6508] border border-[#daa520]/40 px-1.5 py-0.5 rounded">
                          {m.tier === 'tier1' ? 'Gold Tier' : 'Silver Tier'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: MEDICATIONS LIST (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'medications' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4faff]">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-white border-b border-[#c9e7f7] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 text-xs font-bold text-[#004f45] hover:text-[#003831]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-[#001f2a]">Active Prescriptions</h3>
                <span className="text-[10px] font-bold bg-[#004f45]/10 text-[#004f45] px-2 py-0.5 rounded-full">
                  {filteredMeds.length} Items
                </span>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-2.5 bg-white border-b border-slate-100 overflow-x-auto">
                {(['all', 'tier1', 'tier2'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setMedFilter(filter)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                      medFilter === filter
                        ? 'bg-[#004f45] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter === 'all' && 'All Prescriptions'}
                    {filter === 'tier1' && 'Gold Tier'}
                    {filter === 'tier2' && 'Silver Tier'}
                  </button>
                ))}
              </div>

              {/* Medications List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 pb-20">
                {filteredMeds.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 bg-white border border-[#bec9c5] rounded-xl shadow-2xs space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#001f2a] flex items-center gap-1.5">
                          <Pill className="w-3.5 h-3.5 text-[#004f45]" />
                          <span>{med.name} {med.dosage}</span>
                        </h4>
                        <p className="text-[10px] text-[#546067] mt-0.5">{med.category}</p>
                      </div>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${
                        med.tier === 'tier1'
                          ? 'bg-[#daa520]/15 text-[#8b6508] border-[#daa520]/40'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {med.tierLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#f4faff] p-2 rounded-lg border border-[#c9e7f7]/60">
                      <div>
                        <span className="text-[#546067] block">Frequency</span>
                        <span className="font-semibold text-[#001f2a]">{med.frequency}</span>
                      </div>
                      <div>
                        <span className="text-[#546067] block">Prescriber</span>
                        <span className="font-semibold text-[#001f2a]">{med.prescribingDoctor}</span>
                      </div>
                      <div>
                        <span className="text-[#546067] block">Start Date</span>
                        <span className="font-semibold text-[#001f2a]">{med.startDate}</span>
                      </div>
                      <div>
                        <span className="text-[#546067] block">Status</span>
                        <span className="font-bold text-[#047857] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </div>

                    {med.instructions && (
                      <p className="text-[10px] text-[#546067] italic bg-slate-50 p-1.5 rounded">
                        Instructions: {med.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: ALLERGIES & ALERTS (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'allergies' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4faff]">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-white border-b border-[#c9e7f7] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 text-xs font-bold text-[#004f45] hover:text-[#003831]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-[#001f2a]">Allergies & Alerts</h3>
                <span className="text-[10px] font-bold bg-[#ba1a1a]/10 text-[#ba1a1a] px-2 py-0.5 rounded-full">
                  {filteredAllergies.length} Items
                </span>
              </div>

              {/* Critical Alert Warning Banner */}
              <div className="p-3 bg-[#ffdad6]/60 border-b border-[#ba1a1a]/30 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#ba1a1a] shrink-0 mt-0.5" />
                <div className="text-[10px] text-[#410002]">
                  <span className="font-bold block">Severe Anaphylaxis Warning</span>
                  <span>Avoid Beta-Lactam antibiotics (Penicillin, Amoxicillin, Ampicillin).</span>
                </div>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 p-2 bg-white border-b border-slate-100 overflow-x-auto">
                {(['all', 'Drug', 'Food', 'Environmental'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAllergyFilter(cat)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-colors ${
                      allergyFilter === cat
                        ? 'bg-[#ba1a1a] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat === 'all' ? 'All Allergies' : cat}
                  </button>
                ))}
              </div>

              {/* Allergies List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 pb-20">
                {filteredAllergies.map((allergy) => (
                  <div
                    key={allergy.id}
                    className={`p-3 bg-white rounded-xl border shadow-2xs space-y-2 ${
                      allergy.severity === 'Severe'
                        ? 'border-[#ba1a1a]/40 bg-[#fffbfa]'
                        : 'border-[#bec9c5]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-xs text-[#001f2a] flex items-center gap-1.5">
                          <AlertCircle className={`w-3.5 h-3.5 ${
                            allergy.severity === 'Severe' ? 'text-[#ba1a1a]' : 'text-amber-600'
                          }`} />
                          <span>{allergy.allergen}</span>
                        </h4>
                        <span className="text-[10px] text-[#546067]">{allergy.category} Allergy</span>
                      </div>

                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                        allergy.severity === 'Severe'
                          ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {allergy.severity} Risk
                      </span>
                    </div>

                    <div className="p-2 bg-[#f4faff] rounded-lg text-[10px] space-y-1">
                      <div className="text-[#001f2a] font-medium">
                        <span className="text-[#546067]">Reaction: </span>
                        {allergy.reactionDetails}
                      </div>
                      <div className="flex items-center justify-between text-[#546067] text-[9px] pt-1 border-t border-[#c9e7f7]">
                        <span>Source: {allergy.source}</span>
                        <span>Reported: {allergy.firstReported}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: DOCUMENT VAULT (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'documents' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4faff]">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-white border-b border-[#c9e7f7] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 text-xs font-bold text-[#004f45] hover:text-[#003831]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-[#001f2a]">Document Vault</h3>
                <span className="text-[10px] font-bold bg-[#004f45]/10 text-[#004f45] px-2 py-0.5 rounded-full">
                  {filteredDocs.length} Records
                </span>
              </div>

              {/* Document Category Filter */}
              <div className="flex items-center gap-1.5 p-2 bg-white border-b border-slate-100 overflow-x-auto">
                {['all', 'Lab Result', 'Prescription', 'Discharge Summary'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDocFilter(type)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors ${
                      docFilter === type
                        ? 'bg-[#004f45] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {type === 'all' ? 'All Files' : type}
                  </button>
                ))}
              </div>

              {/* Documents List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 pb-20">
                {filteredDocs.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => {
                      setSelectedDocument(doc);
                      setCurrentView('document-detail');
                    }}
                    className="w-full p-3 bg-white border border-[#bec9c5] hover:border-[#004f45] rounded-xl shadow-2xs text-left transition-all active:scale-98 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-[#e6f6ff] text-[#004f45] rounded-lg">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-[#001f2a] line-clamp-1">{doc.fileName}</h4>
                          <span className="text-[10px] text-[#546067]">{doc.type} • {doc.dateUploaded}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                    </div>

                    <div className="flex items-center justify-between text-[9px] pt-1.5 border-t border-slate-100">
                      <span className="text-[#004f45] font-semibold">
                        OCR {doc.ocrConfidence}% Confidence
                      </span>
                      <span className="text-slate-500">{doc.extractedEntities.length} clinical entities</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: DOCUMENT DETAIL (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'document-detail' && selectedDocument && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4faff]">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-white border-b border-[#c9e7f7] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setCurrentView('documents')}
                  className="flex items-center gap-1 text-xs font-bold text-[#004f45] hover:text-[#003831]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Vault</span>
                </button>
                <h3 className="font-serif font-bold text-xs text-[#001f2a] truncate max-w-[180px]">
                  {selectedDocument.fileName}
                </h3>
                <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  Verified
                </span>
              </div>

              {/* Document Metadata & OCR Content */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 pb-20">
                {/* Meta Card */}
                <div className="p-3 bg-white rounded-xl border border-[#bec9c5] shadow-2xs space-y-2 text-[11px]">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Document Type</span>
                    <span className="font-bold text-[#001f2a]">{selectedDocument.type}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Provider</span>
                    <span className="font-bold text-[#001f2a]">{selectedDocument.provider}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-[#001f2a]">{selectedDocument.dateUploaded}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">OCR Confidence</span>
                    <span className="font-bold text-emerald-700">{selectedDocument.ocrConfidence}%</span>
                  </div>
                </div>

                {/* Extracted Entities */}
                <div className="p-3 bg-white rounded-xl border border-[#bec9c5] shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-bold text-[#546067] uppercase">Extracted Clinical Entities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDocument.extractedEntities.map((ent, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-[#e6f6ff] text-[#004f45] border border-[#004f45]/20 text-[10px] font-semibold"
                      >
                        {ent}
                      </span>
                    ))}
                  </div>
                </div>

                {/* OCR Text Box */}
                <div className="p-3 bg-white rounded-xl border border-[#bec9c5] shadow-2xs space-y-1.5">
                  <span className="text-[10px] font-bold text-[#546067] uppercase">Extracted OCR Transcription</span>
                  <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg font-mono text-[9px] leading-relaxed max-h-48 overflow-y-auto">
                    {selectedDocument.fullOcrText || (
                      `[MEDPASS OCR PIPELINE]\nDOCUMENT: ${selectedDocument.fileName}\nPROVIDER: ${selectedDocument.provider}\nSTATUS: VERIFIED CLINICAL RECORD\nENTITIES: ${selectedDocument.extractedEntities.join(', ')}\nNO CONTRAINDICATION FLAGGED IN CURRENT PROFILE`
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: EMERGENCY MEDICAL ID (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'emergency' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#fffbfa]">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-white border-b border-[#ffdad6] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 text-xs font-bold text-[#ba1a1a] hover:text-[#93000a]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Wallet</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-[#ba1a1a] flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4" />
                  <span>Emergency Medical ID</span>
                </h3>
                <span className="text-[9px] font-bold bg-[#ffdad6] text-[#ba1a1a] px-2 py-0.5 rounded-full">
                  1-Tap Resuscitation
                </span>
              </div>

              {/* Emergency ID Scrollable Content */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 pb-20">
                {/* Critical Vitals Banner */}
                <div className="bg-[#ba1a1a] text-white p-4 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Blood Type</span>
                      <div className="font-mono text-3xl font-extrabold">{activePatient.bloodType}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-white/80 tracking-wider">Resuscitation</span>
                      <div className="font-bold text-sm">Full Code (CPR)</div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/20 flex items-center justify-between text-xs">
                    <span>Organ Donor: {activePatient.isOrganDonor ? 'Yes (Registered)' : 'No'}</span>
                    <span>Age: {activePatient.age} ({activePatient.gender})</span>
                  </div>
                </div>

                {/* Severe Allergy Red Flag */}
                <div className="p-3 bg-white border-2 border-[#ba1a1a] rounded-xl shadow-xs space-y-1">
                  <span className="text-[10px] font-bold text-[#ba1a1a] uppercase flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Critical Allergy Alert
                  </span>
                  <div className="font-bold text-xs text-[#001f2a]">Severe Penicillin Anaphylaxis</div>
                  <p className="text-[10px] text-[#546067]">
                    Patient experiences respiratory distress and hives with Beta-Lactam antibiotics.
                  </p>
                </div>

                {/* Emergency Contact */}
                <div className="p-3 bg-white border border-[#bec9c5] rounded-xl shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-[#546067] uppercase">Primary Emergency Contact</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#001f2a]">{activePatient.emergencyContact.name}</h4>
                      <p className="text-[10px] text-[#546067]">{activePatient.emergencyContact.relation}</p>
                    </div>

                    <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{activePatient.emergencyContact.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Primary Care Doctor */}
                <div className="p-3 bg-white border border-[#bec9c5] rounded-xl shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold text-[#546067] uppercase">Primary Care Physician</span>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#001f2a]">{activePatient.primaryDoctor.name}</h4>
                      <p className="text-[10px] text-[#546067]">{activePatient.primaryDoctor.clinic}</p>
                    </div>
                    <span className="text-[10px] font-mono text-[#004f45]">{activePatient.primaryDoctor.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: AUDIO VAULT (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'audio' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-[#f4faff]">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-white border-b border-[#c9e7f7] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setCurrentView('home')}
                  className="flex items-center gap-1 text-xs font-bold text-[#004f45] hover:text-[#003831]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Wallet</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-[#001f2a]">Voice Vault & Notes</h3>
                <span className="text-[10px] font-bold bg-[#004f45]/10 text-[#004f45] px-2 py-0.5 rounded-full">
                  Audio
                </span>
              </div>

              {/* Audio Content List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 pb-20">
                {/* Spoken Summary Player */}
                <div className="bg-white border border-[#bec9c5] rounded-xl p-3.5 shadow-2xs space-y-2">
                  <span className="text-xs font-bold text-[#001f2a] block">
                    Official Spoken Health Summary
                  </span>
                  <AudioPlayerWidget
                    title={`${activePatient.name.split(' ')[0]}'s Health Pass Audio`}
                    speaker="MedPass Voice Engine"
                    transcript={`Hello ${activePatient.name.split(' ')[0]}. Here is your official MedPass audio summary. Your blood type is ${activePatient.bloodType}. Severe allergy alert: Severe Penicillin allergy. Active prescriptions: Lisinopril 10 milligrams once daily and Metformin 500 milligrams twice daily. Your emergency contact is ${activePatient.emergencyContact.name}.`}
                    durationSeconds={28}
                    category="Patient Summary"
                    compact={false}
                  />
                </div>

                {/* Additional Clinical Voice Notes */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-[#546067] uppercase">Clinician Voice Notes</span>
                  {audioNotes.length > 0 ? (
                    audioNotes.map((note) => (
                      <div key={note.id} className="p-3 bg-white rounded-xl border border-[#bec9c5] shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#001f2a]">{note.title}</span>
                          <span className="text-[9px] font-bold text-[#004f45] bg-[#e6f6ff] px-1.5 py-0.5 rounded">
                            {note.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#546067] leading-relaxed italic">
                          "{note.transcript}"
                        </p>
                        <div className="flex items-center justify-between text-[9px] text-[#546067] pt-1 border-t border-slate-100">
                          <span>Speaker: {note.authorName}</span>
                          <span>{note.timestamp}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 bg-white rounded-xl border border-[#bec9c5] text-center text-xs text-slate-500">
                      No additional physician voice notes on file.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* VIEW: CAMERA SCANNER SIMULATOR (In-Phone View-Only) */}
          {/* ------------------------------------------------------------ */}
          {currentView === 'scan' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-black text-white relative">
              {/* In-Phone App Bar */}
              <div className="p-3.5 bg-black/80 backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0 z-20">
                <button
                  onClick={() => {
                    setScanStage('viewfinder');
                    setCurrentView('home');
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-white hover:text-slate-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Done</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-white">Scan Prescription / Rx</h3>
                <span className="text-[9px] font-mono text-emerald-400">CAMERA READY</span>
              </div>

              {/* Viewfinder Simulation Container */}
              <div className="flex-1 relative flex flex-col items-center justify-center p-6">
                {/* Camera Viewfinder Target */}
                <div className="relative w-64 h-72 border-2 border-emerald-400/80 rounded-2xl flex flex-col items-center justify-between p-4 bg-emerald-950/20 shadow-2xl overflow-hidden">
                  
                  {/* Corner Targets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />

                  {/* Laser Beam Animation */}
                  <div className="absolute inset-x-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />

                  {/* Viewfinder Content */}
                  <div className="my-auto text-center space-y-1">
                    <Camera className="w-8 h-8 text-emerald-400/80 mx-auto animate-pulse" />
                    <p className="text-[11px] text-white/80 font-medium">Position Rx bottle or document</p>
                    <p className="text-[9px] text-emerald-400 font-mono">OPTICAL CHARACTER RECOGNITION</p>
                  </div>
                </div>

                {/* Simulated OCR Detection Badge */}
                <div className="mt-6 text-center space-y-3">
                  {scanStage === 'viewfinder' && (
                    <button
                      onClick={() => {
                        setScanStage('processing');
                        setTimeout(() => {
                          setScanStage('result');
                        }, 1200);
                      }}
                      className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-transform active:scale-95 flex items-center gap-2 mx-auto"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Simulate Capture</span>
                    </button>
                  )}

                  {scanStage === 'processing' && (
                    <div className="flex items-center justify-center gap-2 text-xs font-mono text-emerald-400">
                      <span className="w-3 h-3 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                      <span>Extracting Rx text & NDC barcode...</span>
                    </div>
                  )}

                  {scanStage === 'result' && (
                    <div className="p-3 bg-slate-900 border border-emerald-500/50 rounded-xl text-left max-w-xs space-y-2 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                        <span>DETECTION: 99.8%</span>
                        <span className="text-white">Gold Tier Verified</span>
                      </div>
                      <div className="font-bold text-xs text-white">Lisinopril 10mg Tablets</div>
                      <p className="text-[10px] text-slate-300">
                        Take 1 tablet daily by mouth for blood pressure control.
                      </p>
                      <button
                        onClick={() => {
                          setScanStage('viewfinder');
                          setCurrentView('medications');
                        }}
                        className="w-full py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs mt-1"
                      >
                        View in Prescriptions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* IN-PHONE MODAL SHEET: DOCTOR HANDSHAKE QR CODE */}
          {/* (Confined entirely inside the phone boundaries) */}
          {/* ------------------------------------------------------------ */}
          {showQRSheet && (
            <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end animate-in fade-in duration-200">
              <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 shadow-2xl flex flex-col items-center animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1 bg-slate-300 rounded-full mb-3" />

                <div className="w-full flex items-center justify-between mb-2">
                  <h3 className="font-serif font-bold text-sm text-[#001f2a]">Doctor Handshake QR</h3>
                  <button
                    onClick={() => setShowQRSheet(false)}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* QR Code Graphic Box */}
                <div className="p-4 bg-white border-2 border-[#004f45] rounded-2xl shadow-sm my-2 flex flex-col items-center">
                  <div className="w-40 h-40 bg-[#f4faff] border border-[#004f45]/20 rounded-xl flex items-center justify-center p-3 relative">
                    <QrCode className="w-32 h-32 text-[#004f45]" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-8 h-8 rounded-full bg-white border-2 border-[#004f45] flex items-center justify-center shadow-xs">
                        <span className="font-serif font-bold text-[9px] text-[#004f45]">MP</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 text-center">
                    <div className="font-mono text-xl font-bold tracking-widest text-[#004f45]">
                      {displayCode.slice(0, 3)} - {displayCode.slice(3)}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Expires in {secondsLeft}s
                    </span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 text-center mb-3">
                  Present this QR code or 6-digit PIN to your clinician. No medical data is retained on the scanner after session close.
                </p>

                <button
                  onClick={() => setShowQRSheet(false)}
                  className="w-full py-2.5 rounded-xl bg-[#004f45] text-white font-bold text-xs hover:bg-[#003831] transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* IN-PHONE MODAL SHEET: PATIENT PROFILE (READ-ONLY) */}
          {/* (Confined entirely inside the phone boundaries) */}
          {/* ------------------------------------------------------------ */}
          {showProfileSheet && (
            <div className="absolute inset-0 z-40 bg-white flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
              {/* App Bar */}
              <div className="p-3.5 bg-white border-b border-[#c9e7f7] flex items-center justify-between shrink-0">
                <button
                  onClick={() => setShowProfileSheet(false)}
                  className="flex items-center gap-1 text-xs font-bold text-[#004f45]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <h3 className="font-serif font-bold text-sm text-[#001f2a]">Patient Profile</h3>
                <button
                  onClick={() => setShowProfileSheet(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Profile Details (View-Only) */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {/* Profile Header Card */}
                <div className="p-4 bg-[#f4faff] border border-[#004f45]/20 rounded-2xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#004f45] text-white flex items-center justify-center font-serif text-lg font-bold overflow-hidden shrink-0">
                    {activePatient.photoUrl ? (
                      <img src={activePatient.photoUrl} alt={activePatient.name} className="w-full h-full object-cover" />
                    ) : (
                      activePatient.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#001f2a]">{activePatient.name}</h4>
                    <p className="text-xs text-slate-500">{activePatient.relation} • {activePatient.age} yrs ({activePatient.gender})</p>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      Verified Health Pass ID
                    </span>
                  </div>
                </div>

                {/* Personal Medical Attributes */}
                <div className="p-3.5 bg-white border border-[#bec9c5] rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Blood Type</span>
                    <span className="font-mono font-bold text-[#ba1a1a]">{activePatient.bloodType}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Organ Donor</span>
                    <span className="font-bold text-slate-800">{activePatient.isOrganDonor ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                    <span className="text-slate-500">Insurance ID</span>
                    <span className="font-mono text-slate-800">{activePatient.insuranceId}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Primary Doctor</span>
                    <span className="font-semibold text-slate-800">{activePatient.primaryDoctor.name}</span>
                  </div>
                </div>

                {/* Family Profiles Switcher (Isolated inside phone) */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase">Switch Family Member</span>
                  <div className="space-y-1.5">
                    {allPatients.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPatientLocal(p)}
                        className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          p.id === activePatient.id
                            ? 'bg-[#e6f6ff] border-[#004f45] shadow-2xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#004f45]/20 text-[#004f45] flex items-center justify-center text-xs font-bold">
                            {p.name.charAt(0)}
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-slate-800 block">{p.name}</span>
                            <span className="text-[10px] text-slate-500">{p.relation} • {p.bloodType}</span>
                          </div>
                        </div>

                        {p.id === activePatient.id && (
                          <Check className="w-4 h-4 text-[#004f45]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------ */}
          {/* BOTTOM MOBILE NAVIGATION DOCK */}
          {/* (Fixed within phone, only rendered when not in scanner) */}
          {/* ------------------------------------------------------------ */}
          {currentView !== 'scan' && (
            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-[#bec9c5] px-4 py-2 flex items-center justify-around select-none z-20">
              <button
                onClick={() => setCurrentView('home')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  currentView === 'home' ? 'text-[#004f45]' : 'text-[#546067]'
                }`}
              >
                <Shield className="w-5 h-5" />
                <span>Home</span>
              </button>

              <button
                onClick={() => setCurrentView('medications')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  currentView === 'medications' || currentView === 'allergies' || currentView === 'documents' || currentView === 'document-detail'
                    ? 'text-[#004f45]'
                    : 'text-[#546067]'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>Records</span>
              </button>

              <button
                onClick={() => setCurrentView('scan')}
                className="flex flex-col items-center gap-0.5 text-[10px] font-semibold text-[#004f45]"
              >
                <div className="w-9 h-9 -mt-4 bg-[#004f45] text-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
                  <Camera className="w-4 h-4" />
                </div>
                <span>Scan</span>
              </button>

              <button
                onClick={() => setCurrentView('emergency')}
                className={`flex flex-col items-center gap-0.5 text-[10px] font-semibold transition-colors ${
                  currentView === 'emergency' ? 'text-[#ba1a1a]' : 'text-[#546067]'
                }`}
              >
                <HeartPulse className="w-5 h-5" />
                <span>Emergency</span>
              </button>
            </div>
          )}

        </div>

        {/* Bottom Home Indicator Bar (iOS style) */}
        <div className="w-full bg-white pb-2 pt-1 flex justify-center shrink-0 z-30">
          <div className="w-32 h-1 bg-slate-300 rounded-full" />
        </div>
      </div>
    </div>
  );
};
