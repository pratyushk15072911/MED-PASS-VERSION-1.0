import React, { useState } from 'react';
import { CLINICAL_ROLES, AREAS_OF_INTEREST, KBA_QUESTIONS } from '../../data/mockData';
import { MedPassLogo, MedPassCrossIcon } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import {
  UserCheck,
  Shield,
  KeyRound,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Lock,
  Sparkles,
  Smartphone,
  Stethoscope,
  Info,
} from 'lucide-react';

interface ClinicalOnboardingViewProps {
  onCompleteOnboarding: () => void;
}

export const ClinicalOnboardingView: React.FC<ClinicalOnboardingViewProps> = ({ onCompleteOnboarding }) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedRole, setSelectedRole] = useState('attending');
  const [selectedArea, setSelectedArea] = useState(AREAS_OF_INTEREST[0]);

  // Step 2 State
  const [kba1, setKba1] = useState(KBA_QUESTIONS[0]);
  const [ans1, setAns1] = useState('Boston');
  const [kba2, setKba2] = useState(KBA_QUESTIONS[1]);
  const [ans2, setAns2] = useState('Montgomery');

  // Step 3 State (6-Digit OTP)
  const [otp, setOtp] = useState(['8', '4', '7', '2', '9', '1']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-advance focus
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsSuccess(true);
      setTimeout(() => {
        onCompleteOnboarding();
      }, 1200);
    }, 900);
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4faff] flex flex-col items-center justify-center p-4 pb-24">
      <div className="max-w-2xl w-full bg-white border border-[#bec9c5] rounded-3xl p-6 md:p-8 shadow-md">
        {/* Top MedPass Branding Banner */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#c9e7f7]">
          <MedPassLogo size="sm" />
          <div className="flex items-center gap-2 bg-[#f4faff] border border-[#c9e7f7] px-2.5 py-1 rounded-lg">
            <CaduceusSymbol size={18} color="#005A4E" />
            <span className="text-[10px] font-mono font-bold uppercase text-[#005A4E]">Accredited Clinician</span>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#c9e7f7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#004f45] text-white flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#546067] font-bold">
                CLINICAL ONBOARDING • STEP {currentStep} OF 3
              </span>
              <h2 className="font-serif text-lg font-bold text-[#001f2a]">
                {currentStep === 1 && 'Select Clinical Role & Specialty'}
                {currentStep === 2 && 'Knowledge-Based Authentication (KBA)'}
                {currentStep === 3 && 'Secure Identity Verification'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`w-7 h-2 rounded-full transition-all ${
                  step === currentStep
                    ? 'bg-[#004f45] w-10'
                    : step < currentStep
                    ? 'bg-[#10b981]'
                    : 'bg-[#c9e7f7]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* STEP 1: Clinical Role */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-2">
                Select Your Clinical Role
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CLINICAL_ROLES.map((role) => {
                  const isSelected = selectedRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#004f45] bg-[#e6f6ff]/60 shadow-xs'
                          : 'border-[#bec9c5] bg-white hover:border-[#004f45]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-serif font-bold text-sm text-[#001f2a]">{role.label}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#004f45]" />}
                      </div>
                      <p className="text-[11px] text-[#546067] leading-relaxed">{role.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-2">
                Primary Specialty / Area of Interest
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
              >
                {AREAS_OF_INTEREST.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setCurrentStep(2)}
                className="bg-[#004f45] hover:bg-[#003831] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Continue to Security Setup</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Knowledge-Based Authentication */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-[#e6f6ff] border border-[#c9e7f7] rounded-xl p-3.5 flex items-start gap-3">
              <Info className="w-5 h-5 text-[#004f45] shrink-0 mt-0.5" />
              <p className="text-xs text-[#001f2a]">
                Security questions ensure encrypted emergency recovery if your hardware token or biometric authenticator
                becomes unavailable.
              </p>
            </div>

            {/* Question 1 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a]">
                Security Question 1
              </label>
              <select
                value={kba1}
                onChange={(e) => setKba1(e.target.value)}
                className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none"
              >
                {KBA_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={ans1}
                onChange={(e) => setAns1(e.target.value)}
                placeholder="Enter answer (case-sensitive)"
                className="w-full p-2.5 bg-white border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
              />
            </div>

            {/* Question 2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a]">
                Security Question 2
              </label>
              <select
                value={kba2}
                onChange={(e) => setKba2(e.target.value)}
                className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none"
              >
                {KBA_QUESTIONS.map((q) => (
                  <option key={q} value={q}>
                    {q}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={ans2}
                onChange={(e) => setAns2(e.target.value)}
                placeholder="Enter answer (case-sensitive)"
                className="w-full p-2.5 bg-white border border-[#bec9c5] rounded-xl text-xs outline-none focus:border-[#004f45]"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-[#546067] hover:text-[#001f2a] flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                onClick={() => setCurrentStep(3)}
                className="bg-[#004f45] hover:bg-[#003831] text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors"
              >
                <span>Continue to Verification</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: OTP Verification */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-14 h-14 bg-[#e6f6ff] text-[#004f45] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#001f2a]">Enter 6-Digit Verification Code</h3>
              <p className="text-xs text-[#546067] mt-1">
                We sent a secure one-time passcode to your registered clinician device (•••-•••-8924).
              </p>

              {/* 6 OTP Inputs */}
              <div className="flex items-center justify-center gap-2.5 my-6">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-11 h-13 text-center text-xl font-mono font-bold bg-[#f4faff] border-2 border-[#bec9c5] focus:border-[#004f45] focus:bg-white rounded-xl outline-none transition-all"
                  />
                ))}
              </div>

              {isSuccess ? (
                <div className="p-3 bg-[#10b981]/20 border border-[#10b981]/40 rounded-xl text-xs font-bold text-[#047857] flex items-center justify-center gap-2 animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Identity Verified! Launching Ephemeral Clinical Reader...</span>
                </div>
              ) : (
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-[#004f45] hover:bg-[#003831] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <span>Verifying Cryptographic Enclave...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Verify & Access Clinical Reader</span>
                    </>
                  )}
                </button>
              )}

              <p className="text-[11px] text-[#546067] mt-4">
                Didn't receive the code?{' '}
                <button onClick={() => setOtp(['8', '4', '7', '2', '9', '1'])} className="font-bold text-[#004f45] hover:underline">
                  Resend Code (45s)
                </button>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
