import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertOctagon,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LogOut,
  Mail,
} from 'lucide-react';

interface PurgedSessionLockScreenProps {
  onUnlockSession: (enteredCode: string) => void;
  requiredCode: string;
  onSendCodeViaEmail?: () => void;
  onSendTimeoutReport?: () => void;
}

export const PurgedSessionLockScreen: React.FC<PurgedSessionLockScreenProps> = ({
  onUnlockSession,
  requiredCode,
  onSendCodeViaEmail,
  onSendTimeoutReport,
}) => {
  const [inputCode, setInputCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleUnlock = (codeToTest: string) => {
    setIsVerifying(true);
    setErrorMsg('');

    setTimeout(() => {
      setIsVerifying(false);
      const cleanInput = (codeToTest || '').replace(/\D/g, '').trim();
      const cleanExpected = (requiredCode || '847291').replace(/\D/g, '').trim();

      if (cleanInput.length === 6 && cleanInput === cleanExpected) {
        onUnlockSession(cleanInput);
      } else {
        setErrorMsg('Invalid 6-digit access PIN. Please verify code or send a new code via email.');
      }
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setErrorMsg('Please enter the 6-digit access code.');
      return;
    }
    handleUnlock(inputCode.trim());
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6 animate-in fade-in zoom-in-95">
        
        {/* Friendly Padlock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>

        {/* Clear, Plain-Language Heading */}
        <div className="space-y-2">
          <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-bold px-3 py-1 bg-emerald-950/80 border border-emerald-500/30 rounded-full inline-block">
            Your Medical Data Is Safe & Private
          </span>
          <h1 className="font-serif text-2xl font-bold text-white">
            Visit Ended & Records Locked
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed">
            The doctor has logged out. For your safety and privacy, all your personal medical details have been wiped from this device’s temporary memory so nobody else can see them.
          </p>
        </div>

        {/* Simple Privacy Confirmation Box in Plain English */}
        <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left text-xs space-y-2 text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Prescriptions & lab tests wiped from screen</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Doctor session safely signed out</span>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Visit recorded in your permanent privacy log</span>
          </div>
        </div>

        {/* Re-opening Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-3 pt-1">
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-semibold text-slate-200">
              Need to reopen? Enter your 6-digit access code:
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={6}
                value={inputCode}
                onChange={(e) => {
                  setInputCode(e.target.value.replace(/\D/g, ''));
                  setErrorMsg('');
                }}
                placeholder="••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-center text-lg font-mono font-bold tracking-widest text-emerald-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            {errorMsg && (
              <p className="text-[11px] text-rose-400 font-medium flex items-center justify-center gap-1 mt-1">
                <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
                {errorMsg}
              </p>
            )}
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            {isVerifying ? (
              <span>Verifying Access PIN...</span>
            ) : (
              <>
                <span>Unlock Patient Chart</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {/* Email OTP and Session Report Options */}
          {(onSendCodeViaEmail || onSendTimeoutReport) && (
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-3">
              {onSendCodeViaEmail && (
                <button
                  type="button"
                  onClick={onSendCodeViaEmail}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send OTP via Gmail</span>
                </button>
              )}
              {onSendCodeViaEmail && onSendTimeoutReport && (
                <span className="text-slate-600">•</span>
              )}
              {onSendTimeoutReport && (
                <button
                  type="button"
                  onClick={onSendTimeoutReport}
                  className="text-xs text-slate-400 hover:text-slate-200 font-medium flex items-center gap-1.5 hover:underline cursor-pointer"
                >
                  <span>Email Lock Report</span>
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
