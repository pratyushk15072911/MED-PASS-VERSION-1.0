import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  Volume2,
  Download,
  Play,
  Pause,
  AlertTriangle,
  HeartPulse,
  Smartphone,
  Stethoscope,
  ShieldCheck,
  Sparkles,
  QrCode,
  CheckCircle2,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { MedPassLogo } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { speechService, createSummaryWavBlob, triggerAudioDownload } from '../../utils/audioUtils';

interface OnboardingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScreen?: (screen: any) => void;
  initialMode?: 'website' | 'mobile';
}

export const OnboardingFlowModal: React.FC<OnboardingFlowModalProps> = ({
  isOpen,
  onClose,
  onSelectScreen,
  initialMode = 'website',
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [tourMode, setTourMode] = useState<'website' | 'mobile'>(initialMode);
  const [isPlayingDemoAudio, setIsPlayingDemoAudio] = useState(false);
  const [isDownloadingDemo, setIsDownloadingDemo] = useState(false);
  const [demoDownloadDone, setDemoDownloadDone] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 5;

  const demoTranscript =
    'Hello Shardul. Here is your MedPass audio summary. Blood type: O-Negative. Severe Penicillin allergy. Current medicine: Lisinopril 10 milligrams once daily. Emergency contact is Kush Sharma.';

  const handlePlayDemo = () => {
    if (isPlayingDemoAudio) {
      speechService.stop();
      setIsPlayingDemoAudio(false);
    } else {
      setIsPlayingDemoAudio(true);
      speechService.speak(demoTranscript, {
        onEnd: () => setIsPlayingDemoAudio(false),
        onError: () => setIsPlayingDemoAudio(false),
      });
    }
  };

  const handleDownloadDemo = async () => {
    try {
      setIsDownloadingDemo(true);
      const wav = await createSummaryWavBlob('MedPass Voice', demoTranscript, 7);
      triggerAudioDownload(wav, 'MedPass_Sample_Audio_Summary.wav');
      setDemoDownloadDone(true);
      setTimeout(() => setDemoDownloadDone(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsDownloadingDemo(false);
    }
  };

  const handleComplete = () => {
    speechService.stop();
    localStorage.setItem('medpass_onboarding_completed', 'true');
    onClose();
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-2 border-[#004f45] rounded-3xl max-w-2xl w-full overflow-hidden flex flex-col shadow-2xl relative">
        {/* Top Header Bar */}
        <div className="p-5 pb-3 bg-white border-b border-[#c9e7f7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MedPassLogo size="sm" />
            <div className="hidden sm:flex items-center gap-1.5 bg-[#e6f6ff] text-[#004f45] px-2.5 py-0.5 rounded-full text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive App Guide</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <div className="flex bg-[#f4faff] border border-[#bec9c5] rounded-xl p-0.5 text-xs font-bold">
              <button
                onClick={() => setTourMode('website')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  tourMode === 'website' ? 'bg-[#004f45] text-white shadow-2xs' : 'text-[#546067]'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor Web</span>
              </button>
              <button
                onClick={() => setTourMode('mobile')}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  tourMode === 'mobile' ? 'bg-[#004f45] text-white shadow-2xs' : 'text-[#546067]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Patient Mobile</span>
              </button>
            </div>

            <button
              onClick={handleComplete}
              className="p-1.5 text-[#546067] hover:text-[#001f2a] hover:bg-[#f4faff] rounded-full transition-colors ml-1"
              title="Close Tour"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="px-6 pt-3 flex items-center justify-between text-xs text-[#546067] font-semibold">
          <span>
            STEP {currentStep} OF {totalSteps} •{' '}
            <span className="text-[#004f45] font-bold">
              {tourMode === 'website' ? 'Doctor Clinical Portal' : 'Patient Mobile App'}
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

        {/* Step Content Carousel */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-5">
          {/* STEP 1: Welcome to MedPass */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="w-14 h-14 rounded-2xl bg-[#e6f6ff] text-[#004f45] flex items-center justify-center mx-auto shadow-xs">
                <CaduceusSymbol size={32} color="#005A4E" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#001f2a]">
                  Welcome to MedPass Health Pass
                </h3>
                <p className="text-xs text-[#546067] max-w-md mx-auto">
                  {tourMode === 'website'
                    ? 'The instant, zero-delay clinical workspace for doctors to review vital signs, verify allergies, check prescriptions, and record audio feedback.'
                    : 'Your encrypted personal health wallet. Keep your medical history, severe allergies, and prescriptions ready in your pocket.'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <div className="w-7 h-7 rounded-lg bg-[#004f45]/10 text-[#004f45] flex items-center justify-center mx-auto mb-1.5">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#001f2a]">30-Second Summary</h4>
                  <p className="text-[11px] text-[#546067] mt-0.5">Quick vital check without reading hundreds of pages</p>
                </div>

                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <div className="w-7 h-7 rounded-lg bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center mx-auto mb-1.5">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#001f2a]">Safety Warning</h4>
                  <p className="text-[11px] text-[#546067] mt-0.5">Prevents dangerous allergy & medicine clashes</p>
                </div>

                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <div className="w-7 h-7 rounded-lg bg-[#004f45]/10 text-[#004f45] flex items-center justify-center mx-auto mb-1.5">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-[#001f2a]">Audio & Downloads</h4>
                  <p className="text-[11px] text-[#546067] mt-0.5">Doctor voice feedback & spoken summaries</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Doctor HUD & Vitals / Mobile Fast View */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#004f45] text-white flex items-center justify-center shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#001f2a]">
                    {tourMode === 'website' ? 'Super-Crucial 30-Second HUD' : 'Mobile Instant Triage View'}
                  </h3>
                  <p className="text-xs text-[#546067]">
                    Critical medical signals visible immediately at the top of the screen
                  </p>
                </div>
              </div>

              {/* Mock HUD Preview */}
              <div className="p-4 bg-[#f4faff] border-2 border-[#004f45]/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#c9e7f7] pb-2">
                  <span className="text-xs font-bold text-[#001f2a]">Shardul Kush (48y, Male)</span>
                  <span className="font-mono text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                    Blood Group: O-Negative
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-white rounded-lg border border-[#bec9c5]">
                    <span className="text-[10px] text-[#546067] uppercase font-bold block">Recorded BP</span>
                    <span className="font-mono font-bold text-[#004f45]">120/80</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#bec9c5]">
                    <span className="text-[10px] text-[#546067] uppercase font-bold block">Heart Beat</span>
                    <span className="font-mono font-bold text-[#004f45]">72 bpm</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-[#bec9c5]">
                    <span className="text-[10px] text-[#546067] uppercase font-bold block">HbA1c</span>
                    <span className="font-mono font-bold text-[#004f45]">5.8%</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#546067] italic">
                  💡 Use the quick filters (Chest Pain, Diabetes, Infection) to focus only on records that matter for the current visit.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Automatic Safety Warnings */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ba1a1a] text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#001f2a]">Automatic Safety Alert System</h3>
                  <p className="text-xs text-[#546067]">
                    Never accidentally prescribe or take dangerous medicines
                  </p>
                </div>
              </div>

              {/* Alert Mock */}
              <div className="p-4 bg-[#ffdad6] border-2 border-[#ba1a1a] rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-[#93000a] font-bold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>MEDICINE CONFLICT DETECTED</span>
                </div>
                <p className="text-xs text-[#410002] leading-relaxed">
                  Patient has a <strong>Severe Penicillin Allergy</strong>. Prescribing <strong>Amoxicillin 500mg</strong> triggers anaphylactic shock.
                </p>
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#047857] bg-white/80 px-2.5 py-1 rounded-lg">
                    Recommended Safe Alternative: Azithromycin 250mg
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#546067]">
                Doctors can swap to verified gold-tier alternatives with a single click, resolving the warning immediately.
              </p>
            </div>
          )}

          {/* STEP 4: Audio Feedback & Audio Summary (Listen & Download) */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#004f45] text-white flex items-center justify-center shrink-0">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-[#001f2a]">Audio Feedback & Spoken Summary</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#10b981]/20 text-[#047857]">
                      New Feature
                    </span>
                  </div>
                  <p className="text-xs text-[#546067]">
                    Option to <strong>listen</strong> AND <strong>download audio</strong> anytime
                  </p>
                </div>
              </div>

              {/* Interactive Demo Player */}
              <div className="p-4 bg-[#f4faff] border-2 border-[#004f45] rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#001f2a]">Try Spoken Audio Sample:</span>
                  <span className="text-[10px] font-mono text-[#004f45] font-bold">Shardul Kush Medical Pass</span>
                </div>

                <div className="p-2.5 bg-white border border-[#c9e7f7] rounded-xl text-xs text-[#374151] italic">
                  "{demoTranscript}"
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    onClick={handlePlayDemo}
                    className="flex items-center gap-2 bg-[#004f45] hover:bg-[#003831] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all"
                  >
                    {isPlayingDemoAudio ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 ml-0.5" />
                        <span>Listen to Voice Audio</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadDemo}
                    disabled={isDownloadingDemo}
                    className="flex items-center gap-2 bg-white hover:bg-[#e6f6ff] text-[#004f45] border border-[#004f45] px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs transition-all"
                  >
                    {demoDownloadDone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                        <span className="text-[#10b981]">Downloaded .wav!</span>
                      </>
                    ) : (
                      <>
                        <Download className={`w-4 h-4 ${isDownloadingDemo ? 'animate-bounce' : ''}`} />
                        <span>Download Audio (.wav)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="text-xs text-[#546067] space-y-1">
                <p>
                  • <strong>For Doctors:</strong> Record voice notes using microphone or select clinical templates to attach to the patient's visit.
                </p>
                <p>
                  • <strong>For Patients:</strong> Listen to your prescription directions and download the audio file to your phone or computer.
                </p>
              </div>
            </div>
          )}

          {/* STEP 5: Mobile Wallet & Biometric Unlock */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#004f45] text-white flex items-center justify-center shrink-0">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#001f2a]">Biometrics & Patient Wallet</h3>
                  <p className="text-xs text-[#546067]">
                    Face ID / Touch ID unlock layer & personalized patient setup ("What's your name?")
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#546067]">Biometric Lock Screen</span>
                    <div className="font-serif font-bold text-sm text-[#004f45] my-1">Face ID & Touch ID Layer</div>
                    <p className="text-[11px] text-[#546067]">Requires simulated facial recognition or fingerprint scan before revealing health data</p>
                  </div>
                  <span className="text-[10px] text-[#047857] font-bold mt-2">Zero Residual Memory Protection</span>
                </div>

                <div className="p-3.5 bg-[#ffdad6]/40 border border-[#ba1a1a]/40 rounded-xl flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#ba1a1a]">Emergency ICE Bypass</span>
                    <div className="font-serif font-bold text-sm text-[#93000a] my-1">1-Tap Resuscitation & Blood Type</div>
                    <p className="text-[11px] text-[#546067]">First responders can view vital resuscitation data directly from the locked screen</p>
                  </div>
                  <span className="text-[10px] text-[#ba1a1a] font-bold mt-2">Life-Saving Fast View</span>
                </div>
              </div>

              <div className="p-3 bg-[#e6f6ff] border border-[#c9e7f7] rounded-xl flex items-center gap-2 text-xs text-[#004f45] font-semibold">
                <Lock className="w-4 h-4 shrink-0" />
                <span>Tap "Profile / Sign In" to personalize patient info: name, age, blood type, and emergency contacts.</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
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
                onClick={handleComplete}
                className="px-3 py-2 text-xs font-semibold text-[#546067] hover:text-[#001f2a] transition-colors"
              >
                Skip Tour
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="bg-[#004f45] hover:bg-[#003831] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                className="bg-[#10b981] hover:bg-[#059669] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all animate-bounce"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Start Using MedPass</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
