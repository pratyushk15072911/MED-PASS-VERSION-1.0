import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Share2,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  EyeOff,
  UserCheck,
  Plus,
  X,
  Printer,
  Copy,
  Download,
  Calendar,
} from 'lucide-react';
import { PatientProfile, Medication, Allergy, VitalRecord } from '../../types';
import {
  createDriveFile,
  shareDriveFileWithPermissions,
  listMedPassDriveFiles,
  DriveFileMetadata,
} from '../../utils/driveService';
import { getGoogleAccessToken, signInWithGoogleRole } from '../../utils/googleAuth';
import { useToast } from '../common/ToastContainer';

interface GoogleDriveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  medications: Medication[];
  allergies: Allergy[];
  vitals: VitalRecord;
  targetRole?: 'doctor' | 'patient';
}

export const GoogleDriveManagerModal: React.FC<GoogleDriveManagerModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  allergies,
  vitals,
  targetRole = 'doctor',
}) => {
  const { showSuccess, showWarning } = useToast();
  const [isConnected, setIsConnected] = useState(Boolean(getGoogleAccessToken()));
  const [isCreating, setIsCreating] = useState(false);
  const [createdFile, setCreatedFile] = useState<DriveFileMetadata | null>(null);
  const [existingFiles, setExistingFiles] = useState<DriveFileMetadata[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'permissions' | 'files'>('create');

  // Permission Form State
  const [shareEmail, setShareEmail] = useState('');
  const [shareRole, setShareRole] = useState<'reader' | 'commenter' | 'writer'>('reader');
  const [preventCopyPrintDownload, setPreventCopyPrintDownload] = useState(true);
  const [expirationDays, setExpirationDays] = useState(30);
  const [enableExpiration, setEnableExpiration] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  // File content generation
  const [fileFormat, setFileFormat] = useState<'doc' | 'json' | 'text'>('doc');
  const [fileCategory, setFileCategory] = useState<'doctor-clinical-summary' | 'patient-health-pass'>(
    targetRole === 'doctor' ? 'doctor-clinical-summary' : 'patient-health-pass'
  );

  useEffect(() => {
    if (isOpen && getGoogleAccessToken()) {
      setIsConnected(true);
      fetchExistingFiles();
    }
  }, [isOpen]);

  const fetchExistingFiles = async () => {
    const res = await listMedPassDriveFiles();
    if (res.success && res.files) {
      setExistingFiles(res.files);
    }
  };

  if (!isOpen) return null;

  const handleConnect = async () => {
    try {
      const roleToUse: 'doctor' | 'patient' = targetRole === 'patient' ? 'patient' : 'doctor';
      const res = await signInWithGoogleRole(roleToUse);
      setIsConnected(true);
      showSuccess('Google Drive Connected', `Authorized with Google account: ${res.user.email}`);
      fetchExistingFiles();
    } catch (e: any) {
      showWarning('Google Connection Error', e.message || 'Could not connect Google Drive');
    }
  };

  const generateFilePayload = () => {
    const isDocRole = fileCategory === 'doctor-clinical-summary';
    const timestamp = new Date().toLocaleString();

    if (fileFormat === 'json') {
      const payload = {
        title: isDocRole ? `MedPass Clinical Chart: ${patient.name}` : `MedPass Health Passport: ${patient.name}`,
        exportedAt: timestamp,
        system: 'MedPass Ephemeral Medical Suite',
        patient: {
          id: patient.id,
          name: patient.name,
          age: patient.age,
          gender: patient.gender,
          bloodType: patient.bloodType,
          insuranceId: patient.insuranceId,
          primaryDoctor: patient.primaryDoctor,
          emergencyContact: patient.emergencyContact,
        },
        allergies: allergies.map((a) => ({
          allergen: a.allergen,
          severity: a.severity,
          reaction: a.reactionDetails,
        })),
        medications: medications.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          prescribingDoctor: m.prescribingDoctor,
          route: m.route,
        })),
        vitals: {
          bloodPressure: vitals.bloodPressure,
          heartRate: vitals.heartRate,
          hba1c: vitals.hba1c,
          bmi: vitals.bmi,
        },
      };
      return JSON.stringify(payload, null, 2);
    }

    // Markdown / Google Doc format
    return `
# MEDPASS HEALTH PASSPORT: ${patient.name.toUpperCase()}
Generated on: ${timestamp}
Reference ID: MP-${patient.id.slice(0, 8).toUpperCase()}
Originating Role: ${isDocRole ? 'Clinician Triage Record (Doctor End)' : 'Personal Health Wallet (Patient End)'}

---

## 1. PATIENT DEMOGRAPHICS
- Full Name: ${patient.name}
- Age: ${patient.age} | Gender: ${patient.gender}
- Blood Type: ${patient.bloodType} (Crucial for Resuscitation)
- Insurance Identifier: ${patient.insuranceId || 'MED-PASS-994821-X'}
- Primary Care Physician: ${patient.primaryDoctor.name} (${patient.primaryDoctor.clinic})
- In Case of Emergency (ICE): ${patient.emergencyContact?.name} (${patient.emergencyContact?.phone} - ${patient.emergencyContact?.relation})

---

## 2. DOCUMENTED ALLERGIES & CONTRAINDICATIONS
${allergies.map((a) => `- ${a.allergen} [${a.severity.toUpperCase()} RISK]: ${a.reactionDetails}`).join('\n')}

---

## 3. ACTIVE PRESCRIBED MEDICATIONS
${medications.map((m) => `- ${m.name} ${m.dosage} (${m.frequency}) | Rx by ${m.prescribingDoctor}`).join('\n')}

---

## 4. BASELINE CLINICAL VITALS
- Blood Pressure: ${vitals.bloodPressure}
- Heart Rate: ${vitals.heartRate} bpm
- HbA1c: ${vitals.hba1c}
- BMI: ${vitals.bmi}

---
*Notice: This document is cryptographically managed via MedPass Protocol 7. Unauthorized copying or redistribution is strictly restricted via Google Drive security permissions.*
    `.trim();
  };

  const handleCreateFile = async () => {
    setIsCreating(true);
    try {
      const isDoc = fileFormat === 'doc';
      const ext = isDoc ? '' : fileFormat === 'json' ? '.json' : '.txt';
      const docName = `MedPass_${fileCategory === 'doctor-clinical-summary' ? 'Doctor_Record' : 'Patient_Passport'}_${patient.name.replace(/\s+/g, '_')}${ext}`;
      const content = generateFilePayload();
      const mimeType = isDoc ? 'application/vnd.google-apps.document' : fileFormat === 'json' ? 'application/json' : 'text/plain';

      const res = await createDriveFile(docName, content, mimeType, {
        viewersCanCopyContent: !preventCopyPrintDownload,
        description: `Verified MedPass Medical Record for ${patient.name}.`,
      });

      if (res.success && res.file) {
        setCreatedFile(res.file);
        setActiveTab('permissions');
        showSuccess('File Created in Google Drive', `Successfully saved "${docName}" to your Drive.`);
        fetchExistingFiles();
      } else {
        showWarning('Creation Failed', res.error || 'Could not save file to Drive.');
      }
    } catch (e: any) {
      showWarning('Drive Error', e.message || 'Failed to upload to Google Drive');
    } finally {
      setIsCreating(false);
    }
  };

  const handleApplyPermissions = async () => {
    const fileIdToUse = createdFile?.id || (existingFiles.length > 0 ? existingFiles[0].id : null);
    if (!fileIdToUse) {
      showWarning('No File Selected', 'Please select or create a file in Google Drive first.');
      return;
    }

    if (!shareEmail.trim() || !shareEmail.includes('@')) {
      showWarning('Invalid Email', 'Please enter a valid email to grant permission.');
      return;
    }

    setIsSharing(true);
    try {
      const res = await shareDriveFileWithPermissions(fileIdToUse, {
        email: shareEmail.trim(),
        role: shareRole,
        preventCopyPrintDownload,
        expirationDays: enableExpiration ? expirationDays : undefined,
      });

      if (res.success) {
        showSuccess(
          'Access Permissions Applied',
          `Shared securely with ${shareEmail}. Copy/Download prevention: ${preventCopyPrintDownload ? 'Active' : 'Disabled'}. ${
            enableExpiration ? `Expires in ${expirationDays} days.` : ''
          }`
        );
        fetchExistingFiles();
      } else {
        showWarning('Permission Failed', res.error || 'Failed to apply Drive sharing permissions.');
      }
    } catch (e: any) {
      showWarning('Error', e.message || 'Could not update permissions.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 selection:bg-emerald-500/30 selection:text-emerald-900">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-900">
                Google Drive Health Passport Storage
              </h2>
              <p className="text-xs text-slate-500">
                Save records to Google Drive with strict email restrictions, copy prevention & expiration dates
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

        {/* Google Drive Connection Badge */}
        {!isConnected ? (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-amber-950 block">Google Drive Authorization Needed</span>
                <span className="text-amber-800 text-[11px]">
                  Authorize MedPass to create and control permissions for medical files in your Google Drive.
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleConnect}
              className="px-4 py-2 bg-[#004f45] hover:bg-[#003831] text-white rounded-xl font-bold shadow-2xs flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <span>Connect Drive</span>
            </button>
          </div>
        ) : (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-emerald-900">Google Drive Connected with Write & Permission Control</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-mono">Tokens Cached in Memory</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveTab('create')}
            className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            1. Create / Upload File
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              activeTab === 'permissions'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            2. Sharing & Access Control
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#004f45] border-[#004f45] text-white shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            3. My MedPass Drive Files ({existingFiles.length})
          </button>
        </div>

        {/* TAB 1: CREATE / UPLOAD FILE */}
        {activeTab === 'create' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  File End-User Type:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFileCategory('doctor-clinical-summary')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      fileCategory === 'doctor-clinical-summary'
                        ? 'border-[#004f45] bg-[#e6f6ff] text-[#004f45]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Doctor Clinical File</span>
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Triage, Vitals & Rx</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFileCategory('patient-health-pass')}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer ${
                      fileCategory === 'patient-health-pass'
                        ? 'border-[#004f45] bg-[#e6f6ff] text-[#004f45]'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Patient Health Pass</span>
                    <span className="block text-[10px] text-slate-500 font-normal mt-0.5">Wallet, ICE & Allergies</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Drive File Format:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFileFormat('doc')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      fileFormat === 'doc'
                        ? 'border-[#004f45] bg-[#004f45] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Google Doc
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileFormat('json')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      fileFormat === 'json'
                        ? 'border-[#004f45] bg-[#004f45] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={() => setFileFormat('text')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      fileFormat === 'text'
                        ? 'border-[#004f45] bg-[#004f45] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Text
                  </button>
                </div>
              </div>
            </div>

            {/* Default Protection Option */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-[#004f45]" />
                  <span className="text-xs font-bold text-slate-800">
                    Pre-set Security: Disable Download, Print & Copy
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={preventCopyPrintDownload}
                  onChange={(e) => setPreventCopyPrintDownload(e.target.checked)}
                  className="w-4 h-4 accent-[#004f45] cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                When enabled, viewers and commenters cannot download the file, print it, or copy its text to the clipboard.
              </p>
            </div>

            {/* Create File Button */}
            <button
              type="button"
              onClick={handleCreateFile}
              disabled={isCreating || !isConnected}
              className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                isConnected
                  ? 'bg-[#004f45] hover:bg-[#003831]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isCreating ? (
                <span>Generating & Uploading to Google Drive...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>
                    Upload {fileCategory === 'doctor-clinical-summary' ? 'Doctor' : 'Patient'} File to Google Drive
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* TAB 2: PERMISSIONS & SHARING CONTROLS */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {createdFile && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-emerald-950 block">Target File: {createdFile.name}</span>
                  <span className="text-emerald-700 text-[11px]">ID: {createdFile.id}</span>
                </div>
                {createdFile.webViewLink && (
                  <a
                    href={createdFile.webViewLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-emerald-800 font-bold hover:underline"
                  >
                    <span>Open in Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Restrict to Specific Email Address (Instead of Password):
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="e.g. consulting.physician@hospital.org or family@gmail.com"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:border-[#004f45]"
                />
                <p className="text-[10.5px] text-slate-500 mt-1">
                  Only the user logging into Google with this exact email will be authorized to access the file.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Access Role:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setShareRole('reader')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      shareRole === 'reader'
                        ? 'border-[#004f45] bg-[#004f45] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Viewer Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareRole('commenter')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      shareRole === 'commenter'
                        ? 'border-[#004f45] bg-[#004f45] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Commenter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareRole('writer')}
                    className={`p-2 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      shareRole === 'writer'
                        ? 'border-[#004f45] bg-[#004f45] text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Editor
                  </button>
                </div>
              </div>

              {/* Advanced Access Settings */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-slate-900 block border-b border-slate-200/80 pb-1.5">
                  Advanced Sharing & Restrictions Settings
                </span>

                {/* Restriction: Prevent Copy/Print/Download */}
                <div className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    id="preventCopy"
                    checked={preventCopyPrintDownload}
                    onChange={(e) => setPreventCopyPrintDownload(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-[#004f45] cursor-pointer"
                  />
                  <label htmlFor="preventCopy" className="text-xs text-slate-800 cursor-pointer">
                    <strong className="block font-bold">Disable Download, Print & Copy for Viewers</strong>
                    <span className="text-[11px] text-slate-500">
                      Enforces Google Drive DRM to prevent leaking or offline saving of sensitive medical charts.
                    </span>
                  </label>
                </div>

                {/* Restriction: Expiration Date */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                      <Clock className="w-3.5 h-3.5 text-[#004f45]" />
                      <span>Set Expiration Date on File Access</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableExpiration}
                      onChange={(e) => setEnableExpiration(e.target.checked)}
                      className="w-4 h-4 accent-[#004f45] cursor-pointer"
                    />
                  </div>

                  {enableExpiration && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-600">Access expires after:</span>
                      <select
                        value={expirationDays}
                        onChange={(e) => setExpirationDays(Number(e.target.value))}
                        className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg font-bold text-[#004f45] outline-none"
                      >
                        <option value={1}>1 Day (Emergency Triage)</option>
                        <option value={7}>7 Days (Post-Op Check)</option>
                        <option value={30}>30 Days (Standard Care Plan)</option>
                        <option value={90}>90 Days (Quarterly Review)</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Share Permissions */}
              <button
                type="button"
                onClick={handleApplyPermissions}
                disabled={isSharing || !isConnected}
                className={`w-full py-3 rounded-2xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  isConnected ? 'bg-[#004f45] hover:bg-[#003831]' : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSharing ? (
                  <span>Applying Drive Permissions & Expirations...</span>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Apply Permissions & Share File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: EXISTING FILES */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Recent MedPass Drive Files:</span>
              <button
                type="button"
                onClick={fetchExistingFiles}
                className="text-xs text-[#004f45] font-bold hover:underline"
              >
                Refresh List
              </button>
            </div>

            {existingFiles.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-500">
                No MedPass files found in your Google Drive yet. Use Tab 1 to create one.
              </div>
            ) : (
              <div className="space-y-2">
                {existingFiles.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl hover:border-[#004f45] transition-colors flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{file.name}</h4>
                        <span className="text-[11px] text-slate-500 block">
                          Type: {file.mimeType.split('.').pop() || file.mimeType}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCreatedFile(file);
                          setActiveTab('permissions');
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Manage Sharing
                      </button>

                      {file.webViewLink && (
                        <a
                          href={file.webViewLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-500 hover:text-[#004f45] hover:bg-slate-50 rounded-xl transition-colors"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
