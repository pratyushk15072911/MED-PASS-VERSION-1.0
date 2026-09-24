import React, { useState, useEffect } from 'react';
import { PatientProfile } from '../../types';
import { MedPassLogo, MedPassCrossIcon } from '../brand/MedPassLogo';
import { QrCode, X, Copy, Check, Clock, Lock, Sparkles, Smartphone, ShieldCheck } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  sessionCode: string;
  onRegenerateCode: () => void;
  sessionSeconds: number;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  patient,
  sessionCode,
  onRegenerateCode,
  sessionSeconds,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#bec9c5] text-center animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#c9e7f7]">
          <MedPassLogo size="sm" showSubtitle={false} />
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-[#546067] mb-4">
          Scan with the MedPass Clinical Reader terminal or mobile camera to establish an encrypted 15-minute read session for <strong>{patient.name}</strong>.
        </p>

        {/* QR Code Frame */}
        <div className="bg-[#f4faff] border-2 border-[#004f45] rounded-2xl p-4 inline-block mb-4 shadow-xs relative">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9GcOjs3ABB-a_ru_-mRMR_5CIJl3rPkir3Ldeb_wKxH413VMTr11qTh0Dr3BA_SBPHk1y-UKY2SD7dDLp7cODYuRHEsGfhBKZUkpqD56dOj4JWC8e94E4fZpNVpLPfDclUp0FdLGoYtVxouOJNl7_J0b6K5AM0uX1bd4Caj9tHfUxykJZpegqSi7KIGSow55EnEG2iNb8CADDyOJbC1kK2AIEt1Cy_zgQ9Hs7sN9eAjPhwqMt4y4"
            alt="MedPass QR Handshake"
            className="w-48 h-48 object-contain mx-auto rounded-lg"
          />
          <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#004f45] font-bold">
            <Lock className="w-3 h-3" />
            <span>ECDH P-256 ENCRYPTED</span>
          </div>
        </div>

        {/* 6-Digit Passcode */}
        <div className="bg-[#e6f6ff] border border-[#c9e7f7] rounded-xl p-3 mb-4">
          <span className="text-[10px] font-mono uppercase text-[#546067] font-bold block">
            MANUAL 6-DIGIT PASSCODE
          </span>
          <div className="font-mono text-2xl font-bold tracking-widest text-[#004f45] my-0.5">
            {sessionCode.slice(0, 3)} - {sessionCode.slice(3)}
          </div>
          <span className="text-[10px] text-[#546067]">
            Expires in <strong className="text-[#004f45]">{formatTimer(sessionSeconds)}</strong>
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2.5 bg-[#f4faff] hover:bg-[#e6f6ff] border border-[#bec9c5] rounded-xl text-xs font-bold text-[#001f2a] flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-[#047857]" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied PIN' : 'Copy PIN'}</span>
          </button>

          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#004f45] text-white rounded-xl text-xs font-bold hover:bg-[#003831] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
