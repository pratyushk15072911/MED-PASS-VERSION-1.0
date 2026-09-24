import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  CheckCircle2,
  AlertCircle,
  FileAudio,
  Plus,
  RefreshCw,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { PatientProfile, AudioFeedbackNote } from '../../types';
import { speechService, createSummaryWavBlob, triggerAudioDownload } from '../../utils/audioUtils';

interface DoctorVoiceFeedbackRecorderProps {
  patient: PatientProfile;
  onSaveFeedback: (feedback: AudioFeedbackNote) => void;
  onClose?: () => void;
}

const CLINICAL_PRESETS = [
  {
    title: 'Routine Heart & Blood Pressure Follow-up',
    category: 'Visit Advice' as const,
    text: 'Blood pressure is well-controlled today at 120 over 80. Continue Lisinopril 10mg once daily every morning. Maintain low sodium diet and return in 3 months for follow-up blood work.',
  },
  {
    title: 'Severe Penicillin Allergy Emergency Caution',
    category: 'Allergy Caution' as const,
    text: 'Crucial allergy alert: Patient has a severe, life-threatening allergy to Penicillin and Amoxicillin. If antibiotic treatment is needed, substitute with Azithromycin or Clarithromycin.',
  },
  {
    title: 'Diabetes & Medication Schedule Guidance',
    category: 'Prescription Guidance' as const,
    text: 'Keep taking Metformin 500mg twice daily with breakfast and dinner to avoid stomach upset. HbA1c remains within target at 5.8%. Check blood glucose once weekly.',
  },
];

export const DoctorVoiceFeedbackRecorder: React.FC<DoctorVoiceFeedbackRecorderProps> = ({
  patient,
  onSaveFeedback,
  onClose,
}) => {
  const [feedbackTitle, setFeedbackTitle] = useState('Cardiology Visit Directions');
  const [category, setCategory] = useState<'Visit Advice' | 'Allergy Caution' | 'Prescription Guidance' | 'Emergency Info'>('Visit Advice');
  const [transcript, setTranscript] = useState(
    `Hello ${patient.name.split(' ')[0]}. Dr. Sarah Jenkins here. Your vitals today look very stable. Continue your Lisinopril and Metformin as scheduled, and remember to strictly avoid Penicillin or Amoxicillin antibiotics. Feel free to download this audio note for your records.`
  );

  // Microphone recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      speechService.stop();
    };
  }, []);

  const startMicrophoneRecording = async () => {
    try {
      speechService.stop();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasMicPermission(true);
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const recordedBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(recordedBlob);
        const url = URL.createObjectURL(recordedBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone permission not granted or device not supported:', err);
      setHasMicPermission(false);
      // Fallback: Doctor can still use synthetic speech dictation!
      alert('Microphone access was not available. You can use the Voice Dictation text synthesizer below to generate and download audio!');
    }
  };

  const stopMicrophoneRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleApplyPreset = (preset: typeof CLINICAL_PRESETS[0]) => {
    setFeedbackTitle(preset.title);
    setCategory(preset.category);
    setTranscript(preset.text);
    setAudioBlob(null);
    setAudioUrl(null);
  };

  const handleListenPreview = () => {
    if (audioUrl) {
      // Play recorded audio blob
      if (!audioPlayerRef.current) {
        audioPlayerRef.current = new Audio(audioUrl);
      } else {
        audioPlayerRef.current.src = audioUrl;
      }

      if (isPlayingPreview) {
        audioPlayerRef.current.pause();
        setIsPlayingPreview(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlayingPreview(true);
        audioPlayerRef.current.onended = () => setIsPlayingPreview(false);
      }
    } else {
      // Use speech synthesis for the written transcript
      if (isPlayingPreview) {
        speechService.stop();
        setIsPlayingPreview(false);
      } else {
        setIsPlayingPreview(true);
        speechService.speak(transcript, {
          onEnd: () => setIsPlayingPreview(false),
          onError: () => setIsPlayingPreview(false),
        });
      }
    }
  };

  const handleDownloadDoctorAudio = async () => {
    try {
      setIsDownloading(true);
      if (audioBlob) {
        // Download recorded mic audio
        triggerAudioDownload(audioBlob, `Doctor_Feedback_${patient.name.replace(/\s+/g, '_')}.webm`);
      } else {
        // Synthesize standard 44.1kHz 16-bit PCM WAV audio file
        const wavBlob = await createSummaryWavBlob('Dr. Sarah Jenkins', transcript, 10);
        triggerAudioDownload(wavBlob, `Doctor_Directions_${patient.name.replace(/\s+/g, '_')}.wav`);
      }
    } catch (err) {
      console.error('Download audio error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveAndAttach = () => {
    const newNote: AudioFeedbackNote = {
      id: `audio-${Date.now()}`,
      authorRole: 'Doctor',
      authorName: 'Dr. Sarah Jenkins',
      title: feedbackTitle,
      timestamp: `Today • ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      durationSeconds: recordingSeconds > 0 ? recordingSeconds : 35,
      transcript,
      audioBlobUrl: audioUrl || undefined,
      category,
    };

    onSaveFeedback(newNote);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose?.();
    }, 1500);
  };

  return (
    <div className="bg-white border-2 border-[#004f45] rounded-3xl p-6 shadow-xl max-w-2xl w-full mx-auto space-y-6 animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c9e7f7] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#004f45] text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#001f2a]">Doctor Audio Feedback & Directions</h3>
            <p className="text-xs text-[#546067]">
              Record voice note or create audio summary for <span className="font-bold text-[#004f45]">{patient.name}</span>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#e6f6ff] text-[#004f45] border border-[#c9e7f7]">
          Listen & Download Enabled
        </span>
      </div>

      {/* Mode 1: Quick Microphone Recorder */}
      <div className="p-4 bg-[#f4faff] border border-[#bec9c5] rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className={`w-4 h-4 ${isRecording ? 'text-[#ba1a1a] animate-pulse' : 'text-[#004f45]'}`} />
            <span className="text-xs font-bold text-[#001f2a]">
              {isRecording ? 'Recording Live Doctor Voice...' : 'Option A: Record with Microphone'}
            </span>
          </div>
          {isRecording && (
            <span className="font-mono text-xs font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-ping" />
              00:{recordingSeconds.toString().padStart(2, '0')}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!isRecording ? (
            <button
              onClick={startMicrophoneRecording}
              className="bg-[#004f45] hover:bg-[#003831] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Mic className="w-4 h-4" />
              <span>{audioBlob ? 'Re-record Voice Note' : 'Start Voice Recording'}</span>
            </button>
          ) : (
            <button
              onClick={stopMicrophoneRecording}
              className="bg-[#ba1a1a] hover:bg-[#93000a] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs animate-pulse"
            >
              <Square className="w-4 h-4 fill-white" />
              <span>Stop & Save Recording</span>
            </button>
          )}

          {audioBlob && !isRecording && (
            <span className="text-xs text-[#047857] bg-[#10b981]/15 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Voice recorded ({recordingSeconds}s)</span>
            </span>
          )}
        </div>
      </div>

      {/* Mode 2: Clinical Templates */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a]">
          Or Select Standard Clinic Preset:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {CLINICAL_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className="p-2.5 bg-[#f4faff] hover:bg-[#e6f6ff] border border-[#bec9c5] rounded-xl text-left transition-colors flex flex-col justify-between"
            >
              <span className="text-xs font-bold text-[#001f2a] line-clamp-1">{preset.title}</span>
              <span className="text-[10px] text-[#004f45] font-semibold mt-1">{preset.category}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Title & Transcript Text Area */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
            Note Title
          </label>
          <input
            type="text"
            value={feedbackTitle}
            onChange={(e) => setFeedbackTitle(e.target.value)}
            className="w-full p-2.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs font-semibold text-[#001f2a] outline-none focus:border-[#004f45]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#001f2a] mb-1">
            Audio Spoken Transcript (What the patient will hear)
          </label>
          <textarea
            rows={4}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full p-3 bg-[#f4faff] border border-[#bec9c5] rounded-xl text-xs leading-relaxed text-[#001f2a] outline-none focus:border-[#004f45]"
          />
        </div>
      </div>

      {/* Interactive Action Bar: Listen, Download Audio & Attach */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#c9e7f7]">
        <div className="flex items-center gap-2">
          {/* Listen Preview */}
          <button
            onClick={handleListenPreview}
            className="flex items-center gap-1.5 bg-[#004f45] hover:bg-[#003831] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            {isPlayingPreview ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Preview</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Listen to Audio</span>
              </>
            )}
          </button>

          {/* Download Audio */}
          <button
            onClick={handleDownloadDoctorAudio}
            disabled={isDownloading}
            className="flex items-center gap-1.5 bg-[#e6f6ff] hover:bg-[#c9e7f7] text-[#004f45] border border-[#004f45]/30 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all"
            title="Download Audio File (.wav)"
          >
            <Download className={`w-4 h-4 ${isDownloading ? 'animate-bounce' : ''}`} />
            <span>{isDownloading ? 'Generating...' : 'Download Audio (.wav)'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-[#546067] hover:text-[#001f2a] transition-colors"
            >
              Cancel
            </button>
          )}

          <button
            onClick={handleSaveAndAttach}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Attached to Chart!</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Save to Patient Records</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
