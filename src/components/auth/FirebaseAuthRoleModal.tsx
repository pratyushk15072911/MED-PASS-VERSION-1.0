import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { signInWithGoogleRole, signOutGoogle, auth, FirebaseUserProfile } from '../../utils/googleAuth';
import { useToast } from '../common/ToastContainer';

interface FirebaseAuthRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: 'doctor' | 'patient';
  onAuthenticated?: (userProfile: FirebaseUserProfile) => void;
}

export const FirebaseAuthRoleModal: React.FC<FirebaseAuthRoleModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'doctor',
  onAuthenticated,
}) => {
  const { showSuccess, showWarning } = useToast();
  const [selectedRole, setSelectedRole] = useState<'doctor' | 'patient'>(defaultRole);
  const [licenseNumber, setLicenseNumber] = useState('MD-LIC-992014');
  const [facility, setFacility] = useState('St. Mary’s General Hospital');
  const [patientIdNum, setPatientIdNum] = useState('MED-PASS-994821-X');
  const [isLoading, setIsLoading] = useState(false);
  const [currentAuthUser, setCurrentAuthUser] = useState(auth.currentUser);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const extra =
        selectedRole === 'doctor'
          ? { licenseOrPatientId: licenseNumber, facility }
          : { licenseOrPatientId: patientIdNum, facility: 'Personal Health Passport' };

      const res = await signInWithGoogleRole(selectedRole, extra);
      setCurrentAuthUser(res.user);
      showSuccess(
        'Firebase Authentication Successful',
        `Authenticated as ${selectedRole === 'doctor' ? 'Clinician' : 'Patient'}: ${res.user.displayName || res.user.email}. Profile synced to Firestore.`
      );
      if (onAuthenticated) {
        onAuthenticated(res.profile);
      }
      onClose();
    } catch (err: any) {
      showWarning('Authentication Failed', err.message || 'Firebase login could not be completed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutGoogle();
    setCurrentAuthUser(null);
    showSuccess('Signed Out', 'Signed out from Firebase account.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-900">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#e6f6ff] text-[#004f45] rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Firebase Authentication
              </h2>
              <p className="text-xs text-slate-500">
                Secure sign-in & role authorization for Doctors and Patients
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

        {/* Current Auth Status */}
        {currentAuthUser && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900">Active Firebase Session</span>
                <span className="text-emerald-700 block text-[11px] truncate max-w-[180px]">
                  {currentAuthUser.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setSelectedRole('doctor')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedRole === 'doctor'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>Doctor / MD</span>
            </div>
            <span className={`text-[10px] block mt-1 ${selectedRole === 'doctor' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Prescribing & Triage Authority
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole('patient')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              selectedRole === 'patient'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-xs">
              <User className="w-4 h-4 shrink-0" />
              <span>Patient / Family</span>
            </div>
            <span className={`text-[10px] block mt-1 ${selectedRole === 'patient' ? 'text-emerald-100' : 'text-slate-500'}`}>
              Health Passport & Records
            </span>
          </button>
        </div>

        {/* Role-Specific Authorization Inputs */}
        <div className="space-y-3 mb-5">
          {selectedRole === 'doctor' ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Medical License Number:
                </label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g. MD-LIC-992014"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-[#004f45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hospital Facility Affiliation:
                </label>
                <input
                  type="text"
                  value={facility}
                  onChange={(e) => setFacility(e.target.value)}
                  placeholder="e.g. St. Mary’s General Hospital"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-[#004f45]"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Health Pass ID / Insurance Number:
              </label>
              <input
                type="text"
                value={patientIdNum}
                onChange={(e) => setPatientIdNum(e.target.value)}
                placeholder="e.g. MED-PASS-994821-X"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-[#004f45]"
              />
            </div>
          )}
        </div>

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full py-3 bg-[#004f45] hover:bg-[#003831] text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          {isLoading ? (
            <span>Signing in to Firebase...</span>
          ) : (
            <>
              <svg className="w-4 h-4 bg-white rounded-full p-0.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google as {selectedRole === 'doctor' ? 'Clinician' : 'Patient'}</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-slate-500 text-center mt-3">
          Authenticated using Firebase Auth & Cloud Firestore.
        </p>

      </div>
    </div>
  );
};
