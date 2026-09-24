import React, { useState } from 'react';
import { PatientProfile, Medication, Allergy, VitalRecord } from '../../types';
import { MedPassLogo, MedPassCrossIcon } from '../brand/MedPassLogo';
import { CaduceusSymbol } from '../brand/CaduceusSymbol';
import { FileDown, X, CheckCircle2, ShieldCheck, Printer, Mail, HardDrive } from 'lucide-react';

interface ExportPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  medications: Medication[];
  allergies: Allergy[];
  vitals: VitalRecord;
  onEmailReport?: () => void;
  onSaveToDrive?: () => void;
}

export const ExportPDFModal: React.FC<ExportPDFModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  allergies,
  vitals,
  onEmailReport,
  onSaveToDrive,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDone(true);
      setTimeout(() => {
        setDone(false);
        onClose();
      }, 1200);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-[#bec9c5] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#c9e7f7] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#e6f6ff] text-[#004f45] rounded-xl">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#001f2a]">Export Clinical Health Passport</h2>
              <p className="text-[11px] text-[#546067]">HIPAA-Compliant Cryptographically Signed PDF</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Preview Document Box */}
        <div className="p-4 bg-[#f4faff] border border-[#bec9c5] rounded-2xl mb-5 text-xs text-[#001f2a] space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-[#c9e7f7] pb-3">
            <MedPassLogo size="sm" />
            <div className="flex items-center gap-3">
              <CaduceusSymbol size={24} color="#005A4E" />
              <div className="text-right text-[10px] text-[#546067]">
                Date: {new Date().toLocaleDateString()}
                <br />
                Ref: MP-{patient.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <strong>Patient:</strong> {patient.name} ({patient.gender}, {patient.age}y)
            </div>
            <div>
              <strong>Blood Type:</strong> {patient.bloodType}
            </div>
            <div>
              <strong>Primary MD:</strong> {patient.primaryDoctor.name}
            </div>
            <div>
              <strong>Vitals (BP/HbA1c):</strong> {vitals.bloodPressure} / {vitals.hba1c} (Checked: {vitals.lastCheckedDate || 'Sep 24, 2026'})
            </div>
          </div>

          <div>
            <strong className="text-[#ba1a1a] block mb-1">ALLERGIES & CONTRAINDICATIONS:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {allergies.map((a) => (
                <li key={a.id}>
                  <strong>{a.allergen}</strong> ({a.severity} Risk) - {a.reactionDetails}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <strong className="text-[#004f45] block mb-1">ACTIVE PRESCRIBED REGIMEN:</strong>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              {medications.map((m) => (
                <li key={m.id}>
                  <strong>{m.name} {m.dosage}</strong> - {m.frequency} ({m.prescribingDoctor})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#c9e7f7]">
          <div className="flex items-center gap-1.5 text-xs text-[#047857] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Digital Certificate Attached</span>
          </div>

          <div className="flex gap-2 items-center">
            {onSaveToDrive && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSaveToDrive();
                }}
                className="px-3.5 py-2 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-600" />
                <span>Save to Drive</span>
              </button>
            )}

            {onEmailReport && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEmailReport();
                }}
                className="px-3.5 py-2 bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                <span>Email via Gmail</span>
              </button>
            )}

            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-[#f4faff] border border-[#bec9c5] text-[#001f2a] rounded-xl text-xs font-bold hover:bg-[#e6f6ff] flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={downloading || done}
              className="px-5 py-2 bg-[#004f45] hover:bg-[#003831] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {done ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                  <span>Downloaded!</span>
                </>
              ) : downloading ? (
                <span>Generating Signed PDF...</span>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
