import React, { useState, useRef } from 'react';
import { PatientProfile } from '../../types';
import {
  X,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  Check,
  ShieldCheck,
  RotateCw,
  Sparkles,
} from 'lucide-react';
import pratyushPhoto from '../../assets/images/patient_pratyush_1790192188507.jpg';
import eleanorPhoto from '../../assets/images/patient_eleanor_1790192216749.jpg';
import emmaPhoto from '../../assets/images/patient_emma_1790192232744.jpg';

interface UploadPatientPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onSavePhoto: (photoUrl: string | undefined) => void;
}

export const UploadPatientPhotoModal: React.FC<UploadPatientPhotoModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSavePhoto,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(patient.photoUrl);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('Image file size must be less than 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreviewUrl(result);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const handleSave = () => {
    onSavePhoto(previewUrl);
    onClose();
  };

  const handleRemove = () => {
    setPreviewUrl(undefined);
  };

  const samplePresets = [
    { label: 'Shardul Kush (Default)', url: pratyushPhoto },
    { label: 'Kush Sharma (Kush)', url: emmaPhoto },
    { label: 'Eleanor Kush (Mom)', url: eleanorPhoto },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#004f45] text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Patient Photo</h2>
              <p className="text-xs text-slate-500">
                Medical identity verification for <span className="font-semibold text-[#004f45]">{patient.name}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Main Preview & Drop Zone */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            {/* Live Avatar Preview */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#004f45] bg-[#004f45] text-white shadow-md flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={patient.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold font-serif">{patient.name.charAt(0)}</span>
                )}
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform hover:scale-110"
                  title="Remove photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Actions Beside Preview */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Live Identity Thumbnail</h3>
                <p className="text-[11px] text-slate-500">
                  {previewUrl
                    ? 'Photo will appear on clinical reader, emergency card, and patient wallet.'
                    : 'Currently using initial fallback avatar.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#004f45] hover:bg-[#003831] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image File</span>
                </button>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="px-2.5 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
              isDragging
                ? 'border-[#00A87D] bg-emerald-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-[#004f45] hover:bg-slate-50/60'
            }`}
          >
            <div className="mx-auto w-10 h-10 rounded-full bg-[#e6f6ff] text-[#004f45] flex items-center justify-center mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Drag & drop patient portrait here, or <span className="text-[#004f45] underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports JPG, PNG, WEBP, or GIF (max 8MB)
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {/* Preset Clinical Portraits */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Or Pick a Sample Portrait
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Instant One-Click</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {samplePresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPreviewUrl(preset.url)}
                  className={`p-2 rounded-xl border text-left transition-all flex flex-col items-center gap-1.5 ${
                    previewUrl === preset.url
                      ? 'bg-[#e6f6ff] border-[#004f45] ring-2 ring-[#004f45]'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.label}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
                  />
                  <span className="text-[10px] font-semibold text-slate-700 text-center line-clamp-1">
                    {preset.label.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Privacy & Security Note */}
          <div className="p-2.5 bg-[#f0f7f5] rounded-xl border border-[#bec9c5]/60 flex items-center gap-2 text-xs text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#00A87D] shrink-0" />
            <span className="text-[11px] leading-tight">
              Patient photos are stored locally in the encrypted health vault session and cleared upon RAM timeout.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#004f45] hover:bg-[#003831] text-white transition-all shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Patient Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
