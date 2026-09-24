import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  ScanFace,
  Fingerprint,
  KeyRound,
  HeartPulse,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  User,
  ArrowRight,
  Delete,
} from 'lucide-react';
import { PatientProfile } from '../../types';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { playBiometricFeedbackSound } from '../../utils/audioUtils';

interface BiometricUnlockLayerProps {
  patient: PatientProfile;
  isLocked: boolean;
  onUnlock: () => void;
  onOpenEmergencyCard: () => void;
  onOpenLoginModal: () => void;
  walletPin?: string;
}

export const BiometricUnlockLayer: React.FC<BiometricUnlockLayerProps> = ({
  patient,
  isLocked,
  onUnlock,
  onOpenEmergencyCard,
  onOpenLoginModal,
  walletPin = '8472',
}) => {
  const [authMode, setAuthMode] = useState<'faceid' | 'fingerprint' | 'passcode'>('faceid');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [currentTime, setCurrentTime] = useState('9:41');
  const [currentDate, setCurrentDate] = useState('Wednesday, September 23');

  // Real-time or standard lockscreen clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Reset states when locked
  useEffect(() => {
    if (isLocked) {
      setIsSuccess(false);
      setIsScanning(false);
      setPinInput('');
      setPinError(false);
    }
  }, [isLocked]);

  if (!isLocked) return null;

  // Trigger Face ID Scan
  const handleTriggerFaceID = () => {
    if (isScanning || isSuccess) return;

    setIsScanning(true);
    setScanProgress(0);
    playBiometricFeedbackSound('scan');

    // Simulate progressive facial geometry scan
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setScanProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsScanning(false);
        setIsSuccess(true);
        playBiometricFeedbackSound('success');
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        setTimeout(() => {
          onUnlock();
        }, 650);
      }
    }, 180);
  };

  // Trigger Fingerprint / Touch ID Scan
  const handleTriggerFingerprint = () => {
    if (isScanning || isSuccess) return;

    setIsScanning(true);
    playBiometricFeedbackSound('scan');
    if (navigator.vibrate) navigator.vibrate(80);

    setTimeout(() => {
      setIsScanning(false);
      setIsSuccess(true);
      playBiometricFeedbackSound('success');
      if (navigator.vibrate) navigator.vibrate([60, 40, 60]);

      setTimeout(() => {
        onUnlock();
      }, 600);
    }, 900);
  };

  // Keypad number press
  const handleKeyPress = (num: string) => {
    if (pinInput.length >= 4) return;
    playBiometricFeedbackSound('keypad');
    const newPin = pinInput + num;
    setPinInput(newPin);

    if (newPin.length === 4) {
      // Validate PIN: matches custom PIN or standard default '8472' / '1234'
      if (newPin === walletPin || newPin === '8472' || newPin === '1234') {
        setIsSuccess(true);
        playBiometricFeedbackSound('success');
        setTimeout(() => {
          onUnlock();
        }, 500);
      } else {
        setPinError(true);
        playBiometricFeedbackSound('fail');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setTimeout(() => {
          setPinInput('');
          setPinError(false);
        }, 800);
      }
    }
  };

  const handleDeleteKey = () => {
    playBiometricFeedbackSound('keypad');
    setPinInput((prev) => prev.slice(0, -1));
  };

  return (
    <div className="absolute inset-0 z-30 bg-[#001f2a]/95 backdrop-blur-md text-white flex flex-col justify-between p-6 select-none animate-in fade-in duration-300">
      {/* Top Lock Status & Clock */}
      <div className="flex flex-col items-center pt-2 space-y-1">
        {/* Animated Lock Icon */}
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-1">
          {isSuccess ? (
            <Unlock className="w-5 h-5 text-[#10b981] animate-bounce" />
          ) : (
            <Lock className="w-5 h-5 text-white/80" />
          )}
        </div>

        <span className="text-4xl font-serif font-bold tracking-tight">{currentTime}</span>
        <span className="text-xs text-white/70 font-medium">{currentDate}</span>

        {/* Patient Profile Pill */}
        <div className="mt-3 flex items-center gap-2 bg-white/10 border border-white/20 px-3.5 py-1.5 rounded-full text-xs">
          <div className="w-5 h-5 rounded-full bg-[#004f45] text-white flex items-center justify-center text-[10px] font-bold">
            {patient.name.charAt(0)}
          </div>
          <span className="font-semibold text-white/90">{patient.name}</span>
          <span className="font-mono text-[10px] font-bold text-[#ffdad6] bg-[#ba1a1a]/80 px-1.5 py-0.5 rounded">
            {patient.bloodType}
          </span>
        </div>
      </div>

      {/* Middle Biometric Interactive Authentication Viewport */}
      <div className="my-auto py-2 flex flex-col items-center justify-center">
        {/* Success Feedback Banner */}
        {isSuccess ? (
          <div className="flex flex-col items-center gap-3 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-[#10b981]/20 border-2 border-[#10b981] text-[#10b981] flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-10 h-10 animate-pulse" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-sm text-white">Biometrics Verified</h4>
              <p className="text-xs text-white/70">Unlocking Health Passport...</p>
            </div>
          </div>
        ) : (
          <>
            {/* FACE ID INTERACTIVE SCANNER */}
            {authMode === 'faceid' && (
              <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-200">
                {/* Face Viewfinder Box */}
                <div className="relative w-36 h-36 rounded-3xl border-2 border-white/30 flex items-center justify-center bg-white/5 overflow-hidden shadow-inner">
                  {/* Corner Target Brackets */}
                  <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#10b981]" />
                  <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#10b981]" />
                  <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#10b981]" />
                  <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#10b981]" />

                  {/* Face Silhouette Icon */}
                  <ScanFace
                    className={`w-16 h-16 transition-all duration-300 ${
                      isScanning ? 'text-[#10b981] scale-110' : 'text-white/60'
                    }`}
                  />

                  {/* Laser Scan Line Animation */}
                  {isScanning && (
                    <div
                      className="absolute left-0 right-0 h-1 bg-[#10b981] shadow-[0_0_12px_#10b981] animate-bounce"
                      style={{ top: `${scanProgress}%` }}
                    />
                  )}
                </div>

                <div className="text-center space-y-1">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#10b981]" />
                    {isScanning ? 'Scanning Face Geometry...' : 'Face ID Recognition'}
                  </h4>
                  <p className="text-[11px] text-white/60">
                    {isScanning ? `${scanProgress}% verified` : 'Hold device still facing forward'}
                  </p>
                </div>

                <button
                  onClick={handleTriggerFaceID}
                  disabled={isScanning}
                  className="bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
                >
                  <ScanFace className="w-4 h-4" />
                  <span>{isScanning ? 'Verifying...' : 'Scan Face (Face ID)'}</span>
                </button>
              </div>
            )}

            {/* FINGERPRINT / TOUCH ID INTERACTIVE SCANNER */}
            {authMode === 'fingerprint' && (
              <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-200">
                {/* Fingerprint Sensor Ring */}
                <div
                  onClick={handleTriggerFingerprint}
                  className={`relative w-28 h-28 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all active:scale-95 ${
                    isScanning
                      ? 'border-[#10b981] bg-[#10b981]/20 shadow-[0_0_24px_rgba(16,185,129,0.4)]'
                      : 'border-white/30 bg-white/5 hover:border-white/60'
                  }`}
                >
                  {/* Concentric Pulse Ripples */}
                  {isScanning && (
                    <div className="absolute inset-0 rounded-full border border-[#10b981] animate-ping" />
                  )}

                  <Fingerprint
                    className={`w-14 h-14 transition-colors ${
                      isScanning ? 'text-[#10b981] animate-pulse' : 'text-white/80'
                    }`}
                  />
                </div>

                <div className="text-center space-y-1">
                  <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                    {isScanning ? 'Reading Fingerprint...' : 'Touch ID Sensor'}
                  </h4>
                  <p className="text-[11px] text-white/60">Tap or hold sensor ring to unlock</p>
                </div>

                <button
                  onClick={handleTriggerFingerprint}
                  disabled={isScanning}
                  className="bg-[#004f45] hover:bg-[#003831] text-white font-bold text-xs px-5 py-2 rounded-xl flex items-center gap-2 border border-white/20 transition-all active:scale-95"
                >
                  <Fingerprint className="w-4 h-4" />
                  <span>Scan Fingerprint</span>
                </button>
              </div>
            )}

            {/* PASSCODE KEYPAD INTERACTIVE */}
            {authMode === 'passcode' && (
              <div className="flex flex-col items-center space-y-3 animate-in fade-in duration-200 max-w-[240px]">
                <span className="text-xs font-bold text-white/80">Enter Master PIN</span>

                {/* PIN Dots (4 digits) */}
                <div className={`flex items-center gap-3 py-1 ${pinError ? 'animate-shake' : ''}`}>
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full transition-all border ${
                        pinError
                          ? 'border-[#ba1a1a] bg-[#ba1a1a]'
                          : pinInput.length > i
                          ? 'border-[#10b981] bg-[#10b981] scale-110'
                          : 'border-white/40 bg-transparent'
                      }`}
                    />
                  ))}
                </div>

                {pinError && (
                  <span className="text-[10px] text-[#ffdad6] font-bold">Incorrect PIN. Try 8472</span>
                )}

                {/* 3x4 Number Keypad */}
                <div className="grid grid-cols-3 gap-2.5 pt-1 w-full text-center">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((n) => (
                    <button
                      key={n}
                      onClick={() => handleKeyPress(n)}
                      className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-base font-bold flex items-center justify-center mx-auto transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                  <div className="w-12 h-12" />
                  <button
                    onClick={() => handleKeyPress('0')}
                    className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 text-base font-bold flex items-center justify-center mx-auto transition-colors"
                  >
                    0
                  </button>
                  <button
                    onClick={handleDeleteKey}
                    className="w-12 h-12 rounded-full hover:bg-white/10 active:bg-white/20 text-xs font-bold flex items-center justify-center mx-auto text-white/70 transition-colors"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                </div>

                <span className="text-[10px] text-white/50">Default PIN: {walletPin}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Mode Switchers & Emergency Override Bar */}
      <div className="space-y-3 pt-2 border-t border-white/15">
        {/* Biometric / Passcode Switcher Tabs */}
        <div className="flex items-center justify-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 text-xs font-semibold">
          <button
            onClick={() => {
              playBiometricFeedbackSound('keypad');
              setAuthMode('faceid');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              authMode === 'faceid' ? 'bg-[#004f45] text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            <ScanFace className="w-3.5 h-3.5" />
            <span>Face ID</span>
          </button>

          <button
            onClick={() => {
              playBiometricFeedbackSound('keypad');
              setAuthMode('fingerprint');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              authMode === 'fingerprint' ? 'bg-[#004f45] text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            <Fingerprint className="w-3.5 h-3.5" />
            <span>Touch ID</span>
          </button>

          <button
            onClick={() => {
              playBiometricFeedbackSound('keypad');
              setAuthMode('passcode');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              authMode === 'passcode' ? 'bg-[#004f45] text-white shadow-xs' : 'text-white/60 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>PIN Code</span>
          </button>
        </div>

        {/* Action Row: Emergency ICE vs Patient Login/Switch */}
        <div className="flex items-center justify-between text-xs pt-1">
          {/* Emergency 1-Tap Override (Bypasses lock ONLY for life-critical resuscitation info) */}
          <button
            onClick={onOpenEmergencyCard}
            className="flex items-center gap-1.5 text-[#ffdad6] hover:text-white bg-[#ba1a1a]/30 hover:bg-[#ba1a1a]/50 border border-[#ba1a1a]/50 px-3 py-1.5 rounded-xl transition-colors font-bold text-[11px]"
          >
            <HeartPulse className="w-3.5 h-3.5 text-[#ba1a1a]" />
            <span>Emergency ICE</span>
          </button>

          {/* Quick Sign In / Switch Patient */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 text-white/80 hover:text-white hover:underline transition-colors font-semibold text-[11px]"
          >
            <User className="w-3.5 h-3.5 text-[#004f45]" />
            <span>Switch Patient / Log In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
