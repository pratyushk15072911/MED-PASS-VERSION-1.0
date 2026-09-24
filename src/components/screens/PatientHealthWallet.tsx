import React, { useState } from 'react';
import { PatientProfile, Medication, Allergy, ClinicalDocument, AuditLogEvent, VitalRecord, PastVitalReading } from '../../types';
import { MedPassLogo, MedPassCrossIcon } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { PastBloodPressureHeartRateCard } from '../clinical/PastBloodPressureHeartRateCard';
import {
  Shield,
  Smartphone,
  FileDown,
  Plus,
  QrCode,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Building2,
  ExternalLink,
  ChevronRight,
  UserPlus,
  Lock,
  Sparkles,
  Heart,
  Eye,
  Volume2,
  Camera,
  HardDrive,
} from 'lucide-react';
import { UploadPatientPhotoModal } from '../modals/UploadPatientPhotoModal';

interface PatientHealthWalletProps {
  patient: PatientProfile;
  allPatients: PatientProfile[];
  onSelectPatient: (patient: PatientProfile) => void;
  onUpdatePatient?: (patient: PatientProfile) => void;
  medications: Medication[];
  allergies: Allergy[];
  documents: ClinicalDocument[];
  auditLogs: AuditLogEvent[];
  vitals?: VitalRecord;
  onAddVitalReading?: (newReading: PastVitalReading) => void;
  onOpenAddModal: () => void;
  onOpenDocument: (doc: ClinicalDocument) => void;
  onOpenQRModal: () => void;
  onOpenEmergencyCard: () => void;
  onViewAllMeds: () => void;
  onViewAllAllergies: () => void;
  onViewAllLogs: () => void;
  onViewAllDocs: () => void;
  sessionCode: string;
  onRegenerateCode: () => void;
  sessionSeconds: number;
  onOpenAudioModal?: () => void;
  onOpenDriveModal?: () => void;
}

export const PatientHealthWallet: React.FC<PatientHealthWalletProps> = ({
  patient,
  allPatients,
  onSelectPatient,
  onUpdatePatient,
  medications,
  allergies,
  documents,
  auditLogs,
  vitals,
  onAddVitalReading,
  onOpenAddModal,
  onOpenDocument,
  onOpenQRModal,
  onOpenEmergencyCard,
  onViewAllMeds,
  onViewAllAllergies,
  onViewAllLogs,
  onViewAllDocs,
  sessionCode,
  onRegenerateCode,
  sessionSeconds,
  onOpenAudioModal,
  onOpenDriveModal,
}) => {
  const [syncedPhone, setSyncedPhone] = useState(true);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-100px)] bg-[#f4faff] text-[#001f2a] pb-24">
      {/* Patient Portal Container */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
        {/* Top Header Card */}
        <div className="bg-[#ffffff] border border-[#bec9c5] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Interactive Patient Avatar with Upload Trigger */}
            <div className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="w-14 h-14 rounded-2xl bg-[#004f45] text-white flex items-center justify-center text-xl font-bold font-serif shadow-sm overflow-hidden relative ring-2 ring-transparent group-hover:ring-[#00A87D] transition-all focus:outline-none"
                title="Click to change or upload patient photo"
              >
                {patient.photoUrl ? (
                  <img
                    src={patient.photoUrl}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{patient.name.charAt(0)}</span>
                )}

                {/* Hover overlay with Camera */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                  <Camera className="w-4 h-4" />
                  <span className="text-[9px] font-bold mt-0.5">Edit</span>
                </div>
              </button>

              {/* Little Camera Badge button */}
              <button
                type="button"
                onClick={() => setIsPhotoModalOpen(true)}
                className="absolute -bottom-1 -right-1 bg-white hover:bg-slate-50 text-[#004f45] p-1 rounded-full shadow-md border border-slate-200 transition-transform hover:scale-110"
                title="Upload patient photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-2xl font-bold text-[#001f2a]">{patient.name}</h1>
                <span className="bg-[#10b981]/15 text-[#047857] text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {patient.relation}
                </span>

                <button
                  type="button"
                  onClick={() => setIsPhotoModalOpen(true)}
                  className="text-[11px] font-semibold text-[#004f45] hover:text-[#003831] hover:underline flex items-center gap-1 bg-[#e6f6ff] border border-[#c9e7f7] px-2 py-0.5 rounded-full transition-colors"
                  title="Upload image of the patient"
                >
                  <Camera className="w-3 h-3 text-[#00A87D]" />
                  <span>{patient.photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
              </div>

              <p className="text-xs text-[#546067] flex items-center gap-2 mt-1 flex-wrap">
                <span>Blood Type: <strong className="text-[#ba1a1a]">{patient.bloodType}</strong></span>
                <span>•</span>
                <span>Age: {patient.age}y</span>
                <span>•</span>
                <span>Insurance: {patient.insuranceId}</span>
              </p>
            </div>
          </div>

          {/* Action Button Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {onOpenAudioModal && (
              <button
                onClick={onOpenAudioModal}
                className="flex items-center gap-2 bg-[#e6f6ff] hover:bg-[#c9e7f7] text-[#004f45] border border-[#004f45]/30 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
                title="Listen to or Download Audio Summary & Voice Feedback"
              >
                <Volume2 className="w-4 h-4 text-[#004f45]" />
                <span>Audio Summary (Listen & Download)</span>
              </button>
            )}

            <div
              onClick={() => setSyncedPhone(!syncedPhone)}
              className="cursor-pointer flex items-center gap-2 bg-[#e6f6ff] border border-[#c9e7f7] px-3.5 py-2 rounded-xl text-xs font-semibold text-[#004f45] hover:bg-[#d6efff] transition-colors"
            >
              <Smartphone className="w-4 h-4 text-[#004f45]" />
              <span>{syncedPhone ? 'Connected to Phone (Live Sync)' : 'Pair Phone'}</span>
              <span className={`w-2 h-2 rounded-full ${syncedPhone ? 'bg-[#10b981] animate-pulse' : 'bg-gray-400'}`}></span>
            </div>

            {/* Google Drive Health Passport Storage & Sharing Button */}
            {onOpenDriveModal && (
              <button
                type="button"
                onClick={onOpenDriveModal}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Save Health Pass to Google Drive with Restricted Access & Expiring Permissions"
              >
                <HardDrive className="w-4 h-4 text-blue-600" />
                <span>Google Drive Storage</span>
              </button>
            )}

            <button
              onClick={onOpenEmergencyCard}
              className="flex items-center gap-2 bg-[#ffdad6] hover:bg-[#ffcdcc] text-[#ba1a1a] border border-[#ba1a1a]/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
            >
              <Heart className="w-4 h-4 fill-[#ba1a1a]" />
              <span>Emergency Card</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-2 bg-[#004f45] hover:bg-[#003831] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Prescription</span>
            </button>
          </div>
        </div>

        {/* Patient Profile Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {allPatients.map((p) => {
            const isSelected = p.id === patient.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPatient(p)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#004f45] text-white shadow-sm'
                    : 'bg-white text-[#546067] border border-[#bec9c5] hover:bg-[#e6f6ff] hover:text-[#001f2a]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isSelected ? 'bg-white text-[#004f45]' : 'bg-[#004f45] text-white'
                  }`}
                >
                  {p.name.charAt(0)}
                </div>
                <span>{p.relation}</span>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>}
              </button>
            );
          })}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#004f45] border border-dashed border-[#004f45]/50 bg-white hover:bg-[#e6f6ff] transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Family Member</span>
          </button>
        </div>

        {/* 3-Column Core Health Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Current Medicines */}
          <div className="bg-[#ffffff] border border-[#bec9c5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#c9e7f7] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg">
                    <Shield className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#001f2a]">Current Medicines</h3>
                </div>
                <span className="text-xs font-bold text-[#004f45] bg-[#e6f6ff] px-2 py-0.5 rounded-full">
                  {medications.length} Active
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {medications.slice(0, 3).map((med) => (
                  <div
                    key={med.id}
                    className="p-3 bg-[#f4faff] border border-[#c9e7f7] rounded-xl hover:border-[#004f45] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#001f2a]">{med.name} {med.dosage}</h4>
                        <p className="text-xs text-[#546067]">{med.frequency}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#daa520]/15 text-[#8b6508] border border-[#daa520]/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {med.tierLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#c9e7f7] flex items-center justify-between">
              <button
                onClick={onOpenAddModal}
                className="text-xs font-bold text-[#004f45] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Medicine</span>
              </button>
              <button
                onClick={onViewAllMeds}
                className="text-xs font-bold text-[#546067] hover:text-[#001f2a] flex items-center gap-1"
              >
                <span>View All ({medications.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Allergies & Warnings */}
          <div className="bg-[#ffffff] border border-[#bec9c5] rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-[#c9e7f7] pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#ffdad6] text-[#ba1a1a] rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#001f2a]">Allergies & Warnings</h3>
                </div>
                <span className="text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full">
                  {allergies.length} Logged
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {allergies.slice(0, 2).map((alg) => (
                  <div
                    key={alg.id}
                    className="p-3 bg-[#f4faff] border border-[#c9e7f7] rounded-xl hover:border-[#ba1a1a] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-[#ba1a1a]">{alg.allergen}</h4>
                        <p className="text-xs text-[#546067]">{alg.riskLabel}</p>
                      </div>
                      <span className="text-[10px] font-mono font-bold bg-[#daa520]/15 text-[#8b6508] border border-[#daa520]/40 px-2 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        {alg.tierLabel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#c9e7f7] flex items-center justify-between">
              <button
                onClick={onOpenAddModal}
                className="text-xs font-bold text-[#004f45] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Allergy</span>
              </button>
              <button
                onClick={onViewAllAllergies}
                className="text-xs font-bold text-[#546067] hover:text-[#001f2a] flex items-center gap-1"
              >
                <span>View All ({allergies.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 3: Share with Doctor (Rotating PIN & QR) */}
          <div className="bg-[#ffffff] border-2 border-[#004f45] rounded-2xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#004f45]/5 rounded-bl-full pointer-events-none"></div>

            <div>
              <div className="flex items-center justify-between mb-3 border-b border-[#c9e7f7] pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-[#001f2a]">Share with Doctor</h3>
                </div>
                <span className="text-[10px] uppercase font-bold text-[#047857] bg-[#10b981]/15 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping"></span>
                  Active
                </span>
              </div>

              <p className="text-xs text-[#546067] mb-3">
                Provide this rotating 6-digit access PIN or scan the QR code to allow ephemeral 15-minute clinician read
                access.
              </p>

              {/* 6-Digit Passcode Display */}
              <div className="bg-[#f4faff] border border-[#004f45]/30 rounded-xl p-3 flex flex-col items-center justify-center text-center my-1">
                <span className="text-[10px] uppercase tracking-widest font-mono text-[#546067] font-bold">
                  EPHEMERAL ACCESS CODE
                </span>
                <div className="font-mono text-3xl font-bold tracking-widest text-[#004f45] my-1">
                  {sessionCode.slice(0, 3)} - {sessionCode.slice(3)}
                </div>
                <div className="flex items-center gap-1 text-[11px] text-[#546067]">
                  <Clock className="w-3.5 h-3.5 text-[#004f45]" />
                  <span>Expires in <strong>{formatTimer(sessionSeconds)}</strong></span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-[#c9e7f7] flex items-center justify-between gap-2">
              <button
                onClick={onRegenerateCode}
                className="text-xs font-bold text-[#004f45] hover:bg-[#e6f6ff] px-2.5 py-1.5 rounded-lg border border-[#004f45]/30 flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Get New Code</span>
              </button>

              <button
                onClick={onOpenQRModal}
                className="text-xs font-bold bg-[#004f45] text-white hover:bg-[#003831] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Show QR Code</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recently Added Documents Table */}
        <div className="bg-[#ffffff] border border-[#bec9c5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#c9e7f7] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#001f2a]">Recently Added Documents</h3>
            </div>
            <button
              onClick={onViewAllDocs}
              className="text-xs font-bold text-[#004f45] hover:underline flex items-center gap-1"
            >
              <span>View Full Document Vault ({documents.length})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#bec9c5]/60 text-[#546067] uppercase font-mono tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">Document Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Date Added</th>
                  <th className="py-2.5 px-3">Source Facility</th>
                  <th className="py-2.5 px-3">Scan Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c9e7f7]/60">
                {documents.slice(0, 4).map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#f4faff] transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#001f2a] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#004f45] shrink-0" />
                      <span className="truncate max-w-[220px]">{doc.fileName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-[#e6f6ff] text-[#004f45] px-2 py-0.5 rounded-md font-semibold text-[11px]">
                        {doc.type}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-[#546067]">{doc.dateUploaded}</td>
                    <td className="py-3 px-3 text-[#546067]">{doc.provider}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          doc.verificationStatus === 'Verified'
                            ? 'bg-[#10b981]/15 text-[#047857]'
                            : doc.verificationStatus === 'Pending Review'
                            ? 'bg-[#daa520]/20 text-[#8b6508]'
                            : 'bg-[#ffdad6] text-[#ba1a1a]'
                        }`}
                      >
                        {doc.verificationStatus} ({doc.ocrConfidence}%)
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenDocument(doc)}
                        className="text-xs font-bold text-[#004f45] hover:bg-[#e6f6ff] px-2.5 py-1 rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Past Recorded Blood Pressure & Heart Beat Vitals */}
        {vitals && (
          <PastBloodPressureHeartRateCard
            patient={patient}
            pastReadings={vitals.pastReadings || []}
            onAddReading={onAddVitalReading}
          />
        )}

        {/* Recent Doctor Visits & Privacy Log */}
        <div className="bg-[#ffffff] border border-[#bec9c5] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-[#c9e7f7] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#e6f6ff] text-[#004f45] rounded-lg">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-serif font-bold text-lg text-[#001f2a]">Recent Doctor Visits & Privacy Log</h3>
            </div>
            <button
              onClick={onViewAllLogs}
              className="text-xs font-bold text-[#004f45] hover:underline flex items-center gap-1"
            >
              <span>View Zero-Residual Audit Log</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {auditLogs.slice(0, 3).map((log) => (
              <div
                key={log.id}
                className="p-4 bg-[#f4faff] border border-[#c9e7f7] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-xl mt-0.5 ${
                      log.isEmergency ? 'bg-[#ffdad6] text-[#ba1a1a]' : 'bg-[#e6f6ff] text-[#004f45]'
                    }`}
                  >
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#001f2a]">{log.accessorName}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          log.isEmergency ? 'bg-[#ba1a1a] text-white' : 'bg-[#004f45] text-white'
                        }`}
                      >
                        {log.eventType}
                      </span>
                    </div>
                    <p className="text-xs text-[#546067] mt-0.5">{log.facilityLocation} • {log.timestamp}</p>
                    <p className="text-xs text-[#001f2a] mt-1">
                      Accessed: <span className="font-medium">{log.dataAccessed.join(', ')}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#047857] flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.securityStatus}
                    </span>
                    <span className="text-[10px] text-[#546067]">{log.securityDetail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Photo Upload Modal */}
      <UploadPatientPhotoModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        patient={patient}
        onSavePhoto={(newPhotoUrl) => {
          if (onUpdatePatient) {
            onUpdatePatient({ ...patient, photoUrl: newPhotoUrl });
          }
        }}
      />
    </div>
  );
};
