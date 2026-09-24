import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  AlertTriangle,
  Phone,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Fingerprint,
  ScanFace,
  Lock,
  Stethoscope,
  Building,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Camera,
} from 'lucide-react';
import { PatientProfile } from '../../types';
import { MedPassLogo } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { playBiometricFeedbackSound } from '../../utils/audioUtils';
import { signInWithGoogleRole } from '../../utils/googleAuth';

interface PatientLoginRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPatient: PatientProfile;
  allPatients: PatientProfile[];
  onSelectPatient: (patient: PatientProfile) => void;
  onSaveNewPatient: (patient: PatientProfile) => void;
  initialMode?: 'register' | 'switch-login';
}

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const COMMON_ALLERGIES = [
  'Penicillin',
  'Amoxicillin',
  'Sulfa Antibiotics',
  'Aspirin / NSAIDs',
  'Codeine',
  'Latex',
  'Peanuts',
  'None Known',
];

const COMMON_CONDITIONS = [
  'Hypertension (High BP)',
  'Type 2 Diabetes',
  'Coronary Artery Disease',
  'Asthma / COPD',
  'Hyperlipidemia',
  'None',
];

export const PatientLoginRegisterModal: React.FC<PatientLoginRegisterModalProps> = ({
  isOpen,
  onClose,
  currentPatient,
  allPatients,
  onSelectPatient,
  onSaveNewPatient,
  initialMode = 'register',
}) => {
  const [viewMode, setViewMode] = useState<'register' | 'switch-login'>(initialMode);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;

  // Form State initialized with thoughtful patient defaults or empty for new user
  const [fullName, setFullName] = useState(currentPatient.name || 'Shardul Kush');
  const [preferredName, setPreferredName] = useState(currentPatient.name.split(' ')[0] || 'Shardul');
  const [age, setAge] = useState<number>(currentPatient.age || 48);
  const [gender, setGender] = useState(currentPatient.gender || 'Male');

  const [bloodType, setBloodType] = useState(currentPatient.bloodType || 'O-');
  const [isOrganDonor, setIsOrganDonor] = useState(currentPatient.isOrganDonor ?? true);
  const [doctorName, setDoctorName] = useState(currentPatient.primaryDoctor?.name || 'Dr. Sarah Jenkins');
  const [clinicName, setClinicName] = useState(currentPatient.primaryDoctor?.clinic || 'St. Jude Heart & Vascular Center');
  const [doctorPhone, setDoctorPhone] = useState(currentPatient.primaryDoctor?.phone || '+1 (555) 019-2834');
  const [insuranceId, setInsuranceId] = useState(currentPatient.insuranceId || 'MED-PASS-994821-X');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(currentPatient.photoUrl);

  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['Penicillin', 'Amoxicillin']);
  const [customAllergy, setCustomAllergy] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>([
    'Hypertension (High BP)',
    'Type 2 Diabetes',
  ]);

  const [iceName, setIceName] = useState(currentPatient.emergencyContact?.name || 'Kush Sharma');
  const [iceRelation, setIceRelation] = useState(currentPatient.emergencyContact?.relation || 'Brother / Family');
  const [icePhone, setIcePhone] = useState(currentPatient.emergencyContact?.phone || '+1 (555) 019-4829');

  const [walletPin, setWalletPin] = useState('8472');
  const [enableFaceID, setEnableFaceID] = useState(true);
  const [enableFingerprint, setEnableFingerprint] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None Known') {
      setSelectedAllergies(['None Known']);
      return;
    }
    const filtered = selectedAllergies.filter((a) => a !== 'None Known');
    if (filtered.includes(allergy)) {
      setSelectedAllergies(filtered.filter((a) => a !== allergy));
    } else {
      setSelectedAllergies([...filtered, allergy]);
    }
  };

  const toggleCondition = (cond: string) => {
    if (cond === 'None') {
      setSelectedConditions(['None']);
      return;
    }
    const filtered = selectedConditions.filter((c) => c !== 'None');
    if (filtered.includes(cond)) {
      setSelectedConditions(filtered.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...filtered, cond]);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      playBiometricFeedbackSound('keypad');
      setCurrentStep((prev) => prev + 1);
    } else {
      handleSubmitProfile();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      playBiometricFeedbackSound('keypad');
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmitProfile = () => {
    setIsSaving(true);
    playBiometricFeedbackSound('success');

    const updatedProfile: PatientProfile = {
      id: `patient-${Date.now()}`,
      name: fullName.trim() || 'Shardul Kush',
      age: Number(age) || 48,
      gender: gender || 'Male',
      bloodType: bloodType || 'O-',
      relation: 'Self (Primary Passholder)',
      isOrganDonor: isOrganDonor,
      emergencyContact: {
        name: iceName.trim() || 'Kush Sharma',
        phone: icePhone.trim() || '+1 (555) 019-4829',
        relation: iceRelation || 'Brother / Family',
      },
      primaryDoctor: {
        name: doctorName.trim() || 'Dr. Sarah Jenkins',
        clinic: clinicName.trim() || 'St. Jude Heart & Vascular Center',
        phone: doctorPhone.trim() || '+1 (555) 019-2834',
      },
      insuranceId: insuranceId.trim() || 'MED-PASS-994821-X',
      photoUrl: photoUrl,
    };

    setTimeout(() => {
      onSaveNewPatient(updatedProfile);
      setSavedSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        setSavedSuccess(false);
        onClose();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#004f45] rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Top Header */}
        <div className="p-5 pb-3 bg-white border-b border-[#c9e7f7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MedPassLogo size="sm" />
            <div className="hidden sm:flex items-center gap-1.5 bg-[#e6f6ff] text-[#004f45] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Patient Medical Wallet Setup</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-[#f4faff] border border-[#bec9c5] rounded-xl p-0.5 text-xs font-bold">
              <button
                onClick={() => setViewMode('register')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'register' ? 'bg-[#004f45] text-white shadow-2xs' : 'text-[#546067]'
                }`}
              >
                Profile Setup
              </button>
              <button
                onClick={() => setViewMode('switch-login')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  viewMode === 'switch-login' ? 'bg-[#004f45] text-white shadow-2xs' : 'text-[#546067]'
                }`}
              >
                Switch Account
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-[#546067] hover:text-[#001f2a] hover:bg-[#f4faff] rounded-full transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode: Switch / Quick Sign-In */}
        {viewMode === 'switch-login' ? (
          <div className="p-6 overflow-y-auto space-y-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#001f2a]">Select Patient Health Wallet</h3>
              <p className="text-xs text-[#546067]">
                Switch between linked patient wallets or register a new family health pass
              </p>
            </div>

            {/* Firebase Google Auth for Patient */}
            <div className="p-3.5 bg-[#e6f6ff]/70 border border-[#c9e7f7] rounded-2xl flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-xs text-[#004f45] block">Firebase Patient Account</span>
                <span className="text-[11px] text-[#546067]">Authenticate with Google to sync your patient profile to Firebase</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await signInWithGoogleRole('patient');
                    playBiometricFeedbackSound('success');
                    if (res.user.displayName) {
                      setFullName(res.user.displayName);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="px-3.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google Sign-In</span>
              </button>
            </div>

            <div className="space-y-3">
              {allPatients.map((p) => {
                const isSelected = p.id === currentPatient.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      playBiometricFeedbackSound('success');
                      onSelectPatient(p);
                      onClose();
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-[#004f45] bg-[#e6f6ff]/60 shadow-xs'
                        : 'border-[#bec9c5] bg-white hover:border-[#004f45]/50 hover:bg-[#f4faff]'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#004f45] text-white flex items-center justify-center font-bold text-base shadow-xs">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif font-bold text-sm text-[#001f2a]">{p.name}</h4>
                          <span className="font-mono text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                            {p.bloodType}
                          </span>
                        </div>
                        <p className="text-xs text-[#546067]">
                          {p.age} years • {p.gender} • {p.relation}
                        </p>
                        <p className="text-[11px] text-[#004f45] font-semibold mt-0.5">
                          Doctor: {p.primaryDoctor.name} ({p.primaryDoctor.clinic})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-[#047857] bg-[#10b981]/15 px-3 py-1 rounded-xl">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-[#004f45] hover:underline flex items-center gap-1">
                          <span>Log In</span>
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setViewMode('register');
                  setCurrentStep(1);
                }}
                className="w-full py-3 bg-[#f4faff] hover:bg-[#e6f6ff] border-2 border-dashed border-[#004f45] rounded-2xl text-xs font-bold text-[#004f45] flex items-center justify-center gap-2 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>+ Create or Personalize Patient Profile</span>
              </button>
            </div>
          </div>
        ) : (
          /* View Mode: Multi-Step Registration / Login Onboarding */
          <>
            {/* Step Progress Bar */}
            <div className="px-6 pt-3 flex items-center justify-between text-xs text-[#546067] font-semibold border-b border-[#c9e7f7]/60 pb-3">
              <span className="flex items-center gap-1.5 font-bold text-[#004f45]">
                <span>STEP {currentStep} OF {totalSteps}:</span>
                <span className="text-[#001f2a]">
                  {currentStep === 1 && 'Patient Identity & Name'}
                  {currentStep === 2 && 'Vitals & Doctor Identity'}
                  {currentStep === 3 && 'Allergies & Medical Alerts'}
                  {currentStep === 4 && 'Emergency Contact (ICE)'}
                  {currentStep === 5 && 'Biometrics & Wallet Security'}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i + 1 === currentStep
                        ? 'w-7 bg-[#004f45]'
                        : i + 1 < currentStep
                        ? 'w-2.5 bg-[#10b981]'
                        : 'w-2.5 bg-[#bec9c5]/50'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-6 overflow-y-auto max-h-[62vh] space-y-5">
              {/* STEP 1: What is your name? & Core Demographics */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#e6f6ff] text-[#004f45] flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#001f2a]">What's your name?</h3>
                      <p className="text-xs text-[#546067]">
                        Let's set up your encrypted, zero-delay patient health passport.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    {/* Patient Photo Upload Field */}
                    <div className="flex items-center gap-3.5 p-3.5 bg-[#f4faff] border border-[#bec9c5] rounded-2xl">
                      <div className="w-16 h-16 rounded-2xl bg-[#004f45] text-white flex items-center justify-center font-bold text-xl overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                        {photoUrl ? (
                          <img src={photoUrl} alt="Patient Preview" className="w-full h-full object-cover" />
                        ) : (
                          fullName.charAt(0) || 'P'
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a]">
                          Patient Photograph
                        </label>
                        <p className="text-[11px] text-[#546067]">
                          Clinical identification photo for emergency paramedic card & wallet.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <label className="cursor-pointer px-3 py-1 bg-[#004f45] hover:bg-[#003831] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs">
                            <Camera className="w-3.5 h-3.5" />
                            <span>Upload Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const r = new FileReader();
                                  r.onload = (ev) => setPhotoUrl(ev.target?.result as string);
                                  r.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                          {photoUrl && (
                            <button
                              type="button"
                              onClick={() => setPhotoUrl(undefined)}
                              className="px-2.5 py-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                        Full Legal Name (as shown on medical records) *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (!preferredName) setPreferredName(e.target.value.split(' ')[0] || '');
                        }}
                        placeholder="e.g. Shardul Kush"
                        className="w-full p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-sm font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                          Preferred Name
                        </label>
                        <input
                          type="text"
                          value={preferredName}
                          onChange={(e) => setPreferredName(e.target.value)}
                          placeholder="e.g. Shardul"
                          className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                          Age (Years) *
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={age}
                          onChange={(e) => setAge(Number(e.target.value))}
                          className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                          Gender *
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Non-Binary">Non-Binary</option>
                          <option value="Other">Other / Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 bg-[#e6f6ff] border border-[#c9e7f7] rounded-xl flex items-center gap-2.5 text-xs text-[#004f45]">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Your health passport is stored locally in client-side RAM with zero server tracking.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Blood Type & Medical Identity */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                      <Heart className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#001f2a]">Blood Group & Clinical Providers</h3>
                      <p className="text-xs text-[#546067]">
                        Critical for emergency resuscitation and instant triage verification.
                      </p>
                    </div>
                  </div>

                  {/* Blood Group Selection Grid */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-2">
                      Blood Group * (Select Your Type)
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {BLOOD_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            playBiometricFeedbackSound('keypad');
                            setBloodType(type);
                          }}
                          className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                            bloodType === type
                              ? 'bg-[#ba1a1a] text-white shadow-xs scale-105 ring-2 ring-[#ba1a1a]/30'
                              : 'bg-[#f4faff] hover:bg-[#ffdad6]/50 text-[#001f2a] border border-[#bec9c5]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    {bloodType === 'O-' && (
                      <span className="text-[11px] text-[#ba1a1a] font-semibold mt-1.5 block">
                        🚨 Universal Red Cell Donor (O-Negative) — requires immediate zero-delay triage matching.
                      </span>
                    )}
                  </div>

                  {/* Organ Donor Toggle */}
                  <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#001f2a] block">Registered Organ Donor</span>
                      <span className="text-[11px] text-[#546067]">Displayed on emergency 1-tap resuscitation card</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsOrganDonor(!isOrganDonor)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                        isOrganDonor ? 'bg-[#004f45] text-white' : 'bg-[#bec9c5]/40 text-[#546067]'
                      }`}
                    >
                      {isOrganDonor ? 'YES (Donor)' : 'NO'}
                    </button>
                  </div>

                  {/* Primary Doctor & Clinic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                        Attending Physician
                      </label>
                      <input
                        type="text"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        placeholder="e.g. Dr. Sarah Jenkins"
                        className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                        Hospital / Clinic Affiliation
                      </label>
                      <input
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="e.g. St. Jude Cardiology Center"
                        className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                      Health Insurance Member ID
                    </label>
                    <input
                      type="text"
                      value={insuranceId}
                      onChange={(e) => setInsuranceId(e.target.value)}
                      placeholder="e.g. MED-PASS-994821-X"
                      className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-mono font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Allergies & Chronic Conditions */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#001f2a]">Allergies & Contraindications</h3>
                      <p className="text-xs text-[#546067]">
                        Powers MedPass's CDSS alert engine to stop dangerous drug interactions.
                      </p>
                    </div>
                  </div>

                  {/* Severe Allergies Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-2">
                      Severe Drug / Substance Allergies (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_ALLERGIES.map((allergy) => {
                        const isSelected = selectedAllergies.includes(allergy);
                        return (
                          <button
                            key={allergy}
                            type="button"
                            onClick={() => {
                              playBiometricFeedbackSound('keypad');
                              toggleAllergy(allergy);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#ba1a1a] text-white shadow-xs'
                                : 'bg-[#f4faff] text-[#001f2a] hover:bg-[#ffdad6]/40 border border-[#bec9c5]'
                            }`}
                          >
                            {isSelected ? '✕ ' : '+ '}
                            {allergy}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={customAllergy}
                        onChange={(e) => setCustomAllergy(e.target.value)}
                        placeholder="Add other custom allergy..."
                        className="flex-1 p-2 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#ba1a1a]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (customAllergy.trim()) {
                            setSelectedAllergies([...selectedAllergies.filter((a) => a !== 'None Known'), customAllergy.trim()]);
                            setCustomAllergy('');
                          }
                        }}
                        className="px-3 py-1.5 bg-[#ba1a1a] text-white rounded-xl text-xs font-bold"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Chronic Conditions */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-2">
                      Active Medical Diagnoses
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COMMON_CONDITIONS.map((cond) => {
                        const isSelected = selectedConditions.includes(cond);
                        return (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => {
                              playBiometricFeedbackSound('keypad');
                              toggleCondition(cond);
                            }}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-[#004f45] text-white shadow-xs'
                                : 'bg-[#f4faff] text-[#001f2a] hover:bg-[#e6f6ff] border border-[#bec9c5]'
                            }`}
                          >
                            {isSelected ? '✓ ' : '+ '}
                            {cond}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {selectedAllergies.includes('Penicillin') && (
                    <div className="p-3 bg-[#ffdad6] border border-[#ba1a1a] rounded-xl flex items-center gap-2.5 text-xs text-[#93000a] font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Penicillin allergy registered. Doctors will receive an automatic blocker if Amoxicillin is ever prescribed.</span>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4: Emergency Contact (ICE) */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#e6f6ff] text-[#004f45] flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#001f2a]">Emergency Contact (In Case of Emergency)</h3>
                      <p className="text-xs text-[#546067]">
                        First responders and ER clinicians will reach this person in critical situations.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                        Emergency Contact Full Name *
                      </label>
                      <input
                        type="text"
                        value={iceName}
                        onChange={(e) => setIceName(e.target.value)}
                        placeholder="e.g. Kush Sharma"
                        className="w-full p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-sm font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                          Relationship *
                        </label>
                        <select
                          value={iceRelation}
                          onChange={(e) => setIceRelation(e.target.value)}
                          className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                        >
                          <option value="Spouse">Spouse / Partner</option>
                          <option value="Parent">Parent</option>
                          <option value="Child">Son / Daughter</option>
                          <option value="Sibling">Sibling</option>
                          <option value="Guardian">Legal Guardian</option>
                          <option value="Friend">Trusted Friend</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
                          Emergency Phone Number *
                        </label>
                        <input
                          type="tel"
                          value={icePhone}
                          onChange={(e) => setIcePhone(e.target.value)}
                          placeholder="e.g. +1 (555) 019-4829"
                          className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-mono font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl flex items-center justify-between text-xs">
                      <span className="text-[#546067]">
                        This contact will be accessible via the <strong>Emergency 1-Tap Card</strong> even when the wallet is locked.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Biometrics & Wallet Security Setup */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#004f45] text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-[#001f2a]">Biometrics & Security PIN</h3>
                      <p className="text-xs text-[#546067]">
                        Require Face ID or Fingerprint authentication before revealing health records.
                      </p>
                    </div>
                  </div>

                  {/* 4-digit PIN setting */}
                  <div className="p-4 bg-[#f4faff] border border-[#bec9c5] rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#001f2a] flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-[#004f45]" />
                        <span>Wallet Master PIN (4 Digits)</span>
                      </label>
                      <span className="text-[11px] text-[#546067]">Fallback when biometrics aren't used</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 py-2">
                      <input
                        type="text"
                        maxLength={4}
                        value={walletPin}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setWalletPin(val);
                        }}
                        className="w-36 text-center font-mono text-2xl tracking-[0.4em] font-bold p-2 bg-white border-2 border-[#004f45] rounded-xl outline-none"
                      />
                    </div>
                    <p className="text-[11px] text-center text-[#546067]">
                      Default test PIN: <span className="font-mono font-bold text-[#004f45]">{walletPin || '8472'}</span>
                    </p>
                  </div>

                  {/* Biometric Toggles */}
                  <div className="space-y-2.5">
                    {/* Face ID Toggle */}
                    <div className="p-3.5 bg-white border border-[#bec9c5] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e6f6ff] text-[#004f45] flex items-center justify-center">
                          <ScanFace className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#001f2a] block">Face ID Authentication</span>
                          <span className="text-[11px] text-[#546067]">Unlock with facial geometry scan</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEnableFaceID(!enableFaceID)}
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                          enableFaceID ? 'bg-[#004f45]' : 'bg-[#bec9c5]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            enableFaceID ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Fingerprint Toggle */}
                    <div className="p-3.5 bg-white border border-[#bec9c5] rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#e6f6ff] text-[#004f45] flex items-center justify-center">
                          <Fingerprint className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-[#001f2a] block">Fingerprint / Touch ID</span>
                          <span className="text-[11px] text-[#546067]">Unlock with simulated haptic touch sensor</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setEnableFingerprint(!enableFingerprint)}
                        className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                          enableFingerprint ? 'bg-[#004f45]' : 'bg-[#bec9c5]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            enableFingerprint ? 'translate-x-6' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-3 bg-[#e6f6ff] border border-[#c9e7f7] rounded-xl flex items-center gap-2.5 text-xs text-[#004f45]">
                    <Lock className="w-4 h-4 shrink-0" />
                    <span>
                      The simulated biometric unlock prompt will activate immediately whenever the mobile wallet is locked.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation Buttons */}
            <div className="p-4 bg-[#f4faff] border-t border-[#c9e7f7] flex items-center justify-between">
              <div>
                {currentStep > 1 ? (
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#546067] hover:text-[#001f2a] transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setViewMode('switch-login')}
                    className="px-3 py-2 text-xs font-semibold text-[#004f45] hover:underline"
                  >
                    Switch Existing Patient
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {currentStep < totalSteps ? (
                  <button
                    onClick={handleNext}
                    className="bg-[#004f45] hover:bg-[#003831] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                  >
                    <span>Continue</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitProfile}
                    disabled={isSaving}
                    className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all animate-bounce"
                  >
                    {savedSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Wallet Ready!</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>{isSaving ? 'Encrypting Profile...' : 'Save & Unlock Wallet'}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
