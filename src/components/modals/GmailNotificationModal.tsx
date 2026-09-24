import React, { useState } from 'react';
import {
  Mail,
  Send,
  X,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  KeyRound,
  FileText,
  Lock,
  MessageSquare,
} from 'lucide-react';
import { PatientProfile, Medication, Allergy } from '../../types';
import {
  sendGmailMessage,
  buildDoctorLoginNotificationEmail,
  buildOtpEmail,
  buildSessionTimeoutEmail,
  buildPatientHealthReportEmail,
} from '../../utils/gmailService';
import { getGoogleAccessToken, signInWithGoogle, signOutGoogle } from '../../utils/googleAuth';
import { useToast } from '../common/ToastContainer';

interface GmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  medications: Medication[];
  allergies: Allergy[];
  sessionCode?: string;
  defaultMode?: 'login-alert' | 'otp' | 'report' | 'timeout';
}

export const GmailNotificationModal: React.FC<GmailNotificationModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  allergies,
  sessionCode = '847291',
  defaultMode = 'login-alert',
}) => {
  const { showSuccess, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState<'login-alert' | 'otp' | 'report' | 'timeout'>(defaultMode);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Jenkins');
  const [userFeedback, setUserFeedback] = useState('Patient is adhering well to the morning Lisinopril and Metformin schedule.');
  const [isSending, setIsSending] = useState(false);
  const [isConnected, setIsConnected] = useState(Boolean(getGoogleAccessToken()));
  const [connectedUserEmail, setConnectedUserEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    try {
      const res = await signInWithGoogle();
      setIsConnected(true);
      setConnectedUserEmail(res.user.email);
      if (!recipientEmail && res.user.email) {
        setRecipientEmail(res.user.email);
      }
      showSuccess('Google Account Connected', `Connected as ${res.user.email}. Gmail ready to send notifications.`);
    } catch (err: any) {
      showWarning('Google Sign-In Failed', err.message || 'Could not connect Google account.');
    }
  };

  const handleSendEmail = async () => {
    if (!recipientEmail.trim() || !recipientEmail.includes('@')) {
      showWarning('Invalid Email', 'Please enter a valid recipient email address.');
      return;
    }

    if (!getGoogleAccessToken()) {
      showWarning('Connect Required', 'Please connect your Google account with Gmail permissions first.');
      return;
    }

    setIsSending(true);

    try {
      let payload;
      const nowStr = new Date().toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      if (activeTab === 'login-alert') {
        payload = buildDoctorLoginNotificationEmail(doctorName, 'St. Mary’s General Hospital', nowStr);
      } else if (activeTab === 'otp') {
        payload = buildOtpEmail(patient.name, sessionCode, 10);
      } else if (activeTab === 'timeout') {
        payload = buildSessionTimeoutEmail(doctorName, patient.name, '15 minutes');
      } else {
        payload = buildPatientHealthReportEmail(
          patient.name,
          doctorName,
          patient.bloodType,
          allergies.map((a) => `${a.allergen} (${a.severity} Severity)`),
          medications.map((m) => `${m.name} ${m.dosage} - ${m.frequency}`),
          userFeedback
        );
      }

      payload.to = recipientEmail.trim();

      const result = await sendGmailMessage(payload);
      if (result.success) {
        showSuccess('Email Sent Successfully', `Notification delivered to ${payload.to} via Gmail.`);
        onClose();
      } else {
        showWarning('Failed to Send', result.error || 'Gmail API rejected the message.');
      }
    } catch (err: any) {
      showWarning('Sending Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-900">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Gmail Notifications & Reports
              </h2>
              <p className="text-xs text-slate-500">
                Send verified login notices, OTP codes, session alerts & patient health summaries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Google Authentication Status */}
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Gmail Connected</span>
                  <span className="text-slate-500 block text-[11px]">{connectedUserEmail || 'Ready to dispatch emails'}</span>
                </div>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800">Google Account Required</span>
                  <span className="text-slate-500 block text-[11px]">Connect your Google account to send real Gmail emails</span>
                </div>
              </>
            )}
          </div>

          {!isConnected ? (
            <button
              type="button"
              onClick={handleConnectGoogle}
              className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-xl font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Connect Gmail</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await signOutGoogle();
                setIsConnected(false);
                setConnectedUserEmail(null);
              }}
              className="text-slate-500 hover:text-rose-600 font-medium text-[11px] underline"
            >
              Disconnect
            </button>
          )}
        </div>

        {/* Notification Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('login-alert')}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              activeTab === 'login-alert'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Doctor Login</span>
            </div>
            <span className={`text-[10px] block mt-0.5 ${activeTab === 'login-alert' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Time & Date Alert
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('otp')}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              activeTab === 'otp'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span>Security OTP</span>
            </div>
            <span className={`text-[10px] block mt-0.5 ${activeTab === 'otp' ? 'text-emerald-100' : 'text-slate-500'}`}>
              6-Digit Handshake
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('timeout')}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              activeTab === 'timeout'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Session End</span>
            </div>
            <span className={`text-[10px] block mt-0.5 ${activeTab === 'timeout' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Auto-Lock Summary
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
              activeTab === 'report'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <FileText className="w-3.5 h-3.5 shrink-0" />
              <span>Health Report</span>
            </div>
            <span className={`text-[10px] block mt-0.5 ${activeTab === 'report' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Summary & Notes
            </span>
          </button>
        </div>

        {/* Content Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Recipient Email Address:
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g. doctor@hospital.org or patient@gmail.com"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-[#004f45] transition-colors"
            />
          </div>

          {activeTab === 'login-alert' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1 text-slate-700">
              <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#004f45]" />
                <span>Doctor Name: {doctorName}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Includes login timestamp ({new Date().toLocaleTimeString()}), facility name, and security validation notice.
              </p>
            </div>
          )}

          {activeTab === 'otp' && (
            <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs space-y-1 text-sky-950">
              <div className="font-semibold flex items-center justify-between">
                <span>Verification One-Time Code:</span>
                <span className="font-mono font-bold text-lg text-[#004f45] tracking-widest">{sessionCode}</span>
              </div>
              <p className="text-[11px] text-sky-800">
                Sends an instant security code to the recipient to re-open or authenticate the medical chart.
              </p>
            </div>
          )}

          {activeTab === 'timeout' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1 text-amber-950">
              <div className="font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Session Timed Out & Locked Notice</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Notifies doctor/patient that the ephemeral session expired and all private patient RAM buffers were cleared.
              </p>
            </div>
          )}

          {activeTab === 'report' && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Patient Feedback / Doctor Recommendations:
              </label>
              <textarea
                rows={3}
                value={userFeedback}
                onChange={(e) => setUserFeedback(e.target.value)}
                placeholder="Add visit notes, patient feedback, or recovery guidelines..."
                className="w-full p-2.5 text-xs border border-slate-300 rounded-xl outline-none focus:border-[#004f45] transition-colors"
              />
              <p className="text-[10.5px] text-slate-500">
                The generated email includes {patient.name}’s blood type, verified allergies ({allergies.length}), current active medicines ({medications.length}), and your notes above.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            disabled={isSending || !isConnected}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-xs cursor-pointer ${
              isConnected
                ? 'bg-[#004f45] hover:bg-[#003831]'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <span>Sending via Gmail...</span>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Send {activeTab === 'otp' ? 'OTP Code' : activeTab === 'login-alert' ? 'Login Notice' : activeTab === 'timeout' ? 'Lock Alert' : 'Report'}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
