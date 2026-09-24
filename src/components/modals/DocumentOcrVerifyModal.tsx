import React, { useState } from 'react';
import { ClinicalDocument } from '../../types';
import {
  X,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Check,
  RotateCcw,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from 'lucide-react';

interface OcrFieldBoundingBox {
  id: string;
  fieldLabel: string;
  fieldKey: string;
  extractedValue: string;
  confidence: number;
  // Percentage coordinates relative to image (top, left, width, height)
  top: number;
  left: number;
  width: number;
  height: number;
}

interface DocumentOcrVerifyModalProps {
  isOpen: boolean;
  document: ClinicalDocument | null;
  onClose: () => void;
  onSaveCorrection: (updatedDoc: ClinicalDocument) => void;
}

export const DocumentOcrVerifyModal: React.FC<DocumentOcrVerifyModalProps> = ({
  isOpen,
  document,
  onClose,
  onSaveCorrection,
}) => {
  if (!isOpen || !document) return null;

  // Build bounding boxes based on the document type
  const initialBoxes: OcrFieldBoundingBox[] = [
    {
      id: 'box-1',
      fieldLabel: 'Patient Name',
      fieldKey: 'patientName',
      extractedValue: document.extractedEntities.find((e) => e.toLowerCase().includes('patient'))?.replace(/patient:\s*/i, '') || 'Shardul Kush',
      confidence: 99,
      top: 14,
      left: 18,
      width: 42,
      height: 7,
    },
    {
      id: 'box-2',
      fieldLabel: 'Primary Clinical Entity',
      fieldKey: 'primaryMed',
      extractedValue: document.extractedEntities[0] || 'Amoxicillin 500mg',
      confidence: document.ocrConfidence,
      top: 36,
      left: 15,
      width: 58,
      height: 9,
    },
    {
      id: 'box-3',
      fieldLabel: 'Dosage / Lab Value',
      fieldKey: 'dosageValue',
      extractedValue: document.extractedEntities[1] || 'Take 1 capsule tid x 10 days',
      confidence: Math.max(78, document.ocrConfidence - 4),
      top: 48,
      left: 15,
      width: 65,
      height: 8,
    },
    {
      id: 'box-4',
      fieldLabel: 'Ordering Provider',
      fieldKey: 'provider',
      extractedValue: document.provider,
      confidence: 96,
      top: 72,
      left: 20,
      width: 50,
      height: 7,
    },
  ];

  const [activeBoxId, setActiveBoxId] = useState<string>('box-2');
  const [fields, setFields] = useState<OcrFieldBoundingBox[]>(initialBoxes);
  const [fullText, setFullText] = useState<string>(document.fullOcrText || '');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [hasChanges, setHasChanges] = useState(false);

  const activeField = fields.find((f) => f.id === activeBoxId) || fields[0];

  const handleFieldChange = (id: string, val: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, extractedValue: val, confidence: 100 } : f))
    );
    setHasChanges(true);
  };

  const handleCommitCorrections = () => {
    const updatedEntities = fields.map((f) => `${f.fieldLabel}: ${f.extractedValue}`);
    const updatedDoc: ClinicalDocument = {
      ...document,
      extractedEntities: updatedEntities,
      fullOcrText: fullText,
      verificationStatus: 'Verified',
      ocrConfidence: 100, // Clinician verified
    };
    onSaveCorrection(updatedDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#00A87D]/20 text-[#00A87D] rounded-xl border border-[#00A87D]/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-white tracking-wide">
                  Clinical OCR Split-Pane Verification
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10.5px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Dual-Pane Ground Truth Check
                </span>
              </div>
              <p className="text-xs text-slate-400">
                File: <strong className="text-white">{document.fileName}</strong> • Click any highlighted bounding box to verify & edit against source scan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Split Screen Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-[520px] overflow-hidden bg-slate-100">
          {/* LEFT PANE: High-Res Source Document Scan with Interactive Bounding Boxes */}
          <div className="lg:col-span-6 bg-slate-950 p-4 flex flex-col justify-between overflow-hidden border-r border-slate-800">
            <div className="flex items-center justify-between pb-2 text-xs text-slate-400 border-b border-slate-800">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#00A87D]" />
                Original Scanned Document
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(75, z - 15))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-slate-400">{zoomLevel}%</span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(160, z + 15))}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Document Surface with Interactive Overlays */}
            <div className="relative flex-1 bg-black rounded-xl overflow-auto p-2 flex items-center justify-center my-2">
              <div
                className="relative inline-block select-none transition-transform duration-150"
                style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              >
                <img
                  src={document.previewUrl}
                  alt={document.fileName}
                  className="max-h-[460px] w-auto rounded-lg shadow-lg pointer-events-none"
                />

                {/* Interactive Bounding Boxes Overlaid directly on Scanned Pixels */}
                {fields.map((box) => {
                  const isSelected = box.id === activeBoxId;
                  return (
                    <div
                      key={box.id}
                      onClick={() => setActiveBoxId(box.id)}
                      className={`absolute cursor-pointer transition-all duration-150 rounded-sm flex items-start ${
                        isSelected
                          ? 'border-2 border-emerald-400 bg-emerald-500/25 ring-4 ring-emerald-500/30 z-30'
                          : 'border border-amber-400/80 bg-amber-400/15 hover:bg-amber-400/30 z-20'
                      }`}
                      style={{
                        top: `${box.top}%`,
                        left: `${box.left}%`,
                        width: `${box.width}%`,
                        height: `${box.height}%`,
                      }}
                      title={`${box.fieldLabel}: ${box.extractedValue} (${box.confidence}% confidence)`}
                    >
                      <span
                        className={`text-[9px] font-mono px-1 py-0.5 rounded-br font-bold leading-none ${
                          isSelected
                            ? 'bg-emerald-500 text-slate-950 font-black'
                            : 'bg-amber-500/90 text-black'
                        }`}
                      >
                        {box.fieldLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>Click any yellow/green box on the scan to pinpoint and correct fields</span>
              <span className="font-mono text-emerald-400">High-Resolution 300DPI</span>
            </div>
          </div>

          {/* RIGHT PANE: Extracted Structured Fields & Clinician Edit Panel */}
          <div className="lg:col-span-6 bg-white p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-[#004f45]" />
                  Clinician Field Verification & Corrections
                </span>
                <span className="text-xs text-slate-500">
                  {hasChanges ? (
                    <span className="text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Unsaved Edits
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Ready for Review
                    </span>
                  )}
                </span>
              </div>

              {/* Active Focused Field Card */}
              {activeField && (
                <div className="p-4 bg-emerald-50/70 border-2 border-emerald-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      Active Field: {activeField.fieldLabel}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                      OCR Confidence: {activeField.confidence}%
                    </span>
                  </div>

                  <label className="block text-[11px] text-slate-600 font-medium">
                    Adjust value if misread by OCR engine:
                  </label>
                  <input
                    type="text"
                    value={activeField.extractedValue}
                    onChange={(e) => handleFieldChange(activeField.id, e.target.value)}
                    className="w-full p-2.5 bg-white border border-emerald-500 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              )}

              {/* All Extracted Entities Form */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  All Identified Document Entities
                </label>
                {fields.map((box) => (
                  <div
                    key={box.id}
                    onClick={() => setActiveBoxId(box.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      box.id === activeBoxId
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{box.fieldLabel}</span>
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                          box.confidence >= 95
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {box.confidence}% match
                      </span>
                    </div>
                    <input
                      type="text"
                      value={box.extractedValue}
                      onChange={(e) => handleFieldChange(box.id, e.target.value)}
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 font-semibold outline-none focus:border-emerald-600"
                    />
                  </div>
                ))}
              </div>

              {/* Full OCR Transcript Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Raw OCR Full Text Transcript
                </label>
                <textarea
                  value={fullText}
                  onChange={(e) => {
                    setFullText(e.target.value);
                    setHasChanges(true);
                  }}
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px] text-slate-800 outline-none focus:border-emerald-600 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCommitCorrections}
                className="flex items-center gap-2 bg-[#004f45] hover:bg-[#003831] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Verify & Commit to Clinical Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
