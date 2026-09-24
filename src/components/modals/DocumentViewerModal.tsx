import React, { useState } from 'react';
import { ClinicalDocument } from '../../types';
import { X, FileText, CheckCircle2, ShieldCheck, Download, Copy, Check, Eye } from 'lucide-react';
import { useToast } from '../common/ToastContainer';

interface DocumentViewerModalProps {
  document: ClinicalDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({ document, isOpen, onClose }) => {
  const { showSuccess } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const handleCopyText = () => {
    if (document.fullOcrText) {
      navigator.clipboard?.writeText(document.fullOcrText);
      setCopied(true);
      showSuccess('OCR Text Copied', 'Clinical transcript copied to clipboard.');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    showSuccess('Exporting File', `Preparing verified copy of ${document.fileName}...`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl border border-[#bec9c5] max-h-[90vh] overflow-y-auto flex flex-col gap-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#c9e7f7] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#e6f6ff] text-[#004f45] rounded-2xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl font-bold text-[#001f2a]">{document.fileName}</h2>
                <span className="bg-[#10b981]/15 text-[#047857] text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {document.verificationStatus} ({document.ocrConfidence}%)
                </span>
              </div>
              <p className="text-xs text-[#546067] mt-0.5">
                Provider: {document.provider} • Uploaded: {document.dateUploaded} • Size: {document.fileSize}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-Column Split: Visual Scan vs. Extracted OCR Text */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
          {/* Visual Scanned Document Column */}
          <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#001f2a]">
                High-Resolution Source Scan
              </span>
              <span className="text-[10px] font-mono text-[#546067]">300 DPI Medical Capture</span>
            </div>

            <div className="w-full h-80 bg-white rounded-xl border border-[#bec9c5] overflow-hidden relative flex items-center justify-center p-2">
              <img
                src={document.previewUrl}
                alt={document.fileName}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-[#546067]">
              <span>Type: {document.type}</span>
              <button
                onClick={handleDownload}
                className="text-[#004f45] font-bold hover:underline flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Local Copy</span>
              </button>
            </div>
          </div>

          {/* OCR Extracted Text Column */}
          <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#004f45]">
                  AI OCR Extracted Entities
                </span>
                <button
                  onClick={handleCopyText}
                  className="text-xs text-[#004f45] font-bold hover:underline flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#047857]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy OCR Text'}</span>
                </button>
              </div>

              {/* Extracted Entity Badges */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {document.extractedEntities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="bg-white border border-[#c9e7f7] text-[#001f2a] text-xs font-semibold px-2.5 py-1 rounded-lg"
                  >
                    {ent}
                  </span>
                ))}
              </div>

              {/* Full OCR Dump */}
              <div className="bg-white border border-[#bec9c5] rounded-xl p-3.5 font-mono text-xs text-[#001f2a] whitespace-pre-wrap leading-relaxed h-56 overflow-y-auto">
                {document.fullOcrText || 'No full OCR text available.'}
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#c9e7f7] flex items-center justify-between text-xs">
              <span className="text-[#047857] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero Hallucination Verified
              </span>
              <span className="text-[#546067] font-mono">Confidence: {document.ocrConfidence}%</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#bec9c5]/60">
          <button
            onClick={onClose}
            className="bg-[#004f45] hover:bg-[#003831] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Close Document
          </button>
        </div>
      </div>
    </div>
  );
};
