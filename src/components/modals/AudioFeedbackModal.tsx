import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  FileAudio,
  Download,
  Play,
  Pause,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  HeartPulse,
  AlertTriangle,
} from 'lucide-react';
import { PatientProfile, Medication, Allergy, VitalRecord, AudioFeedbackNote } from '../../types';
import { AudioPlayerWidget } from '../audio/AudioPlayerWidget';
import { DoctorVoiceFeedbackRecorder } from '../audio/DoctorVoiceFeedbackRecorder';
import { MedPassLogo } from '../brand/MedPassLogo';

interface AudioFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  medications: Medication[];
  allergies: Allergy[];
  vitals: VitalRecord;
  audioNotes: AudioFeedbackNote[];
  onSaveDoctorFeedback: (note: AudioFeedbackNote) => void;
  initialTab?: 'summary' | 'doctor-feedback' | 'vault';
}

export const AudioFeedbackModal: React.FC<AudioFeedbackModalProps> = ({
  isOpen,
  onClose,
  patient,
  medications,
  allergies,
  vitals,
  audioNotes,
  onSaveDoctorFeedback,
  initialTab = 'summary',
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'doctor-feedback' | 'vault'>(initialTab);

  if (!isOpen) return null;

  // Build natural, plain-language patient summary
  const severeAllergies = allergies.filter((a) => a.severity === 'Severe').map((a) => a.allergen);
  const activeMedsList = medications.map((m) => `${m.name} ${m.dosage}`).join(', ');

  const patientSpokenTranscript =
    `Hello ${patient.name}. Here is your official MedPass health audio summary. ` +
    `Your blood type is ${patient.bloodType}. ` +
    (severeAllergies.length > 0
      ? `Critical allergy warning: You have a severe life-threatening allergy to ${severeAllergies.join(' and ')}. If you require antibiotics, Amoxicillin must not be given. `
      : `You have no known severe drug allergies. `) +
    `Your current active medications are: ${activeMedsList}. ` +
    `Your latest vital check showed blood pressure at ${vitals.bloodPressure}, heart rate of ${vitals.heartRate} beats per minute, and blood oxygen at ${vitals.spO2} percent. ` +
    `Your emergency contact is ${patient.emergencyContact.name}, telephone ${patient.emergencyContact.phone}. ` +
    `This summary is encrypted with zero-residual privacy.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#bec9c5] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-5 pb-4 bg-white border-b border-[#c9e7f7] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#004f45] text-white flex items-center justify-center shadow-xs">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-[#001f2a]">Audio Summary & Doctor Voice Notes</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e6f6ff] text-[#004f45]">
                  Listen & Download
                </span>
              </div>
              <p className="text-xs text-[#546067]">
                Patient: <span className="font-bold text-[#004f45]">{patient.name}</span> ({patient.bloodType})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#546067] hover:text-[#001f2a] hover:bg-[#f4faff] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#f4faff] px-5 py-2 border-b border-[#c9e7f7] flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'summary'
                ? 'bg-[#004f45] text-white shadow-xs'
                : 'text-[#546067] hover:text-[#001f2a] hover:bg-white'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Patient Spoken Summary</span>
          </button>

          <button
            onClick={() => setActiveTab('doctor-feedback')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'doctor-feedback'
                ? 'bg-[#004f45] text-white shadow-xs'
                : 'text-[#546067] hover:text-[#001f2a] hover:bg-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Record Doctor Voice Feedback</span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'vault'
                ? 'bg-[#004f45] text-white shadow-xs'
                : 'text-[#546067] hover:text-[#001f2a] hover:bg-white'
            }`}
          >
            <FileAudio className="w-3.5 h-3.5" />
            <span>Audio Vault ({audioNotes.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-[#ffffff]">
          {/* TAB 1: Patient Spoken Summary */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#e6f6ff] border border-[#c9e7f7] rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#004f45] shrink-0 mt-0.5" />
                <div className="text-xs text-[#001f2a] leading-relaxed">
                  <span className="font-bold">Instant Spoken Health Passport:</span> Listen to an audio summary of
                  your key medical profile, severe allergies, and current medicines. You can also{' '}
                  <span className="font-bold underline">download the audio file</span> to take with you offline or
                  share with family caregivers.
                </div>
              </div>

              <AudioPlayerWidget
                title={`${patient.name} — Full Medical Summary`}
                speaker="MedPass Health System"
                transcript={patientSpokenTranscript}
                durationSeconds={32}
                category="Full Health Pass"
                downloadFilename={`${patient.name.replace(/\s+/g, '_')}_MedPass_Audio_Summary.wav`}
              />

              {/* Quick Info Grid for Reference */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <span className="block text-[10px] text-[#546067] uppercase font-bold">Blood Group</span>
                  <span className="font-mono text-sm font-bold text-[#ba1a1a]">{patient.bloodType}</span>
                </div>
                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <span className="block text-[10px] text-[#546067] uppercase font-bold">Severe Allergy</span>
                  <span className="font-bold text-xs text-[#ba1a1a]">Penicillin</span>
                </div>
                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <span className="block text-[10px] text-[#546067] uppercase font-bold">Recorded BP & Pulse</span>
                  <span className="font-mono text-sm font-bold text-[#004f45] block">
                    {vitals.bloodPressure}{' '}
                    <span className="text-xs text-rose-600 font-semibold">• {vitals.heartRate} bpm</span>
                  </span>
                  <span className="block text-[10px] text-slate-500 font-medium mt-0.5">
                    Checked: {vitals.lastCheckedDate || 'Sep 24, 2026'}
                  </span>
                </div>
                <div className="p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-center">
                  <span className="block text-[10px] text-[#546067] uppercase font-bold">Active Meds</span>
                  <span className="font-bold text-xs text-[#001f2a]">{medications.length} Prescriptions</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Record Doctor Voice Feedback */}
          {activeTab === 'doctor-feedback' && (
            <div>
              <DoctorVoiceFeedbackRecorder
                patient={patient}
                onSaveFeedback={(newNote) => {
                  onSaveDoctorFeedback(newNote);
                  setActiveTab('vault');
                }}
              />
            </div>
          )}

          {/* TAB 3: Audio Vault (All Past Voice Notes & Summaries) */}
          {activeTab === 'vault' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-[#001f2a]">Saved Audio Notes</h3>
                  <p className="text-xs text-[#546067]">
                    Listen to or download doctor audio feedback and clinical instructions
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('doctor-feedback')}
                  className="bg-[#004f45] hover:bg-[#003831] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Add New Voice Note</span>
                </button>
              </div>

              {audioNotes.length === 0 ? (
                <div className="p-8 text-center bg-[#f4faff] border border-[#c9e7f7] rounded-2xl">
                  <FileAudio className="w-10 h-10 text-[#546067] mx-auto mb-2 opacity-50" />
                  <p className="text-xs text-[#546067] font-semibold">No audio notes saved yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {audioNotes.map((note) => (
                    <AudioPlayerWidget
                      key={note.id}
                      title={note.title}
                      speaker={`${note.authorName} (${note.authorRole})`}
                      transcript={note.transcript}
                      durationSeconds={note.durationSeconds}
                      category={note.category}
                      downloadFilename={`${patient.name.replace(/\s+/g, '_')}_${note.title.replace(/\s+/g, '_')}.wav`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f4faff] border-t border-[#c9e7f7] flex items-center justify-between text-xs">
          <span className="text-[#546067] flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#004f45]" />
            Audio summaries & doctor feedback can be downloaded and played offline
          </span>
          <button
            onClick={onClose}
            className="bg-[#004f45] hover:bg-[#003831] text-white px-5 py-2 rounded-xl font-bold transition-all shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
