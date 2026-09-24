import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  FileAudio,
  CheckCircle2,
  AlertTriangle,
  RotateCcw as Replay5,
} from 'lucide-react';
import { speechService, createSummaryWavBlob, triggerAudioDownload } from '../../utils/audioUtils';

interface AudioPlayerWidgetProps {
  title: string;
  speaker: string;
  transcript: string;
  durationSeconds?: number;
  category?: string;
  downloadFilename?: string;
  autoPlay?: boolean;
  onEnded?: () => void;
  className?: string;
  compact?: boolean;
}

export const AudioPlayerWidget: React.FC<AudioPlayerWidgetProps> = ({
  title,
  speaker,
  transcript,
  durationSeconds = 30,
  category = 'Spoken Summary',
  downloadFilename = 'MedPass_Audio_Summary.wav',
  className = '',
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isGeneratingWav, setIsGeneratingWav] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);
  const [audioError, setAudioError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const totalDuration = durationSeconds;
  const words = transcript.split(' ');

  useEffect(() => {
    return () => {
      speechService.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handlePlay = () => {
    setAudioError(null);
    if (!window.speechSynthesis) {
      setAudioError('Speech synthesis not supported in this browser. You can still download the .wav file.');
      return;
    }

    if (isPaused) {
      speechService.resume();
      setIsPaused(false);
      setIsPlaying(true);
      startTimer();
      return;
    }

    setIsPlaying(true);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
    setActiveWordIndex(0);

    speechService.speak(transcript, {
      rate: playbackSpeed,
      onStart: () => {
        setIsPlaying(true);
        startTimer();
      },
      onEnd: () => {
        handleStop();
      },
      onError: (err) => {
        console.warn('Speech error, fallback:', err);
        setAudioError('Browser speech synthesis was interrupted or unavailable.');
        handleStop();
      },
    });
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const intervalMs = 250;
    const stepSeconds = (intervalMs / 1000) * playbackSpeed;

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const next = prev + stepSeconds;
        if (next >= totalDuration) {
          handleStop();
          return totalDuration;
        }
        const currentProgress = Math.min(100, (next / totalDuration) * 100);
        setProgress(currentProgress);
        // Calculate synchronized highlighted word index
        const wordIdx = Math.min(words.length - 1, Math.floor((currentProgress / 100) * words.length));
        setActiveWordIndex(wordIdx);
        return next;
      });
    }, intervalMs);
  };

  const handlePause = () => {
    speechService.pause();
    setIsPaused(true);
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleStop = () => {
    speechService.stop();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
    setActiveWordIndex(-1);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Scrub backwards 5 seconds
  const handleSkipBackward5 = () => {
    const newTime = Math.max(0, currentTime - 5);
    setCurrentTime(newTime);
    const newProgress = (newTime / totalDuration) * 100;
    setProgress(newProgress);
    setActiveWordIndex(Math.floor((newProgress / 100) * words.length));
    if (isPlaying) {
      // Re-trigger speech starting roughly from proportional segment
      speechService.stop();
      const remainingWords = words.slice(Math.floor((newProgress / 100) * words.length)).join(' ');
      speechService.speak(remainingWords || transcript, {
        rate: playbackSpeed,
        onEnd: handleStop,
      });
    }
  };

  // Clickable scrubber track
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = ratio * totalDuration;
    setCurrentTime(newTime);
    setProgress(ratio * 100);
    const wordIdx = Math.floor(ratio * words.length);
    setActiveWordIndex(wordIdx);

    if (isPlaying) {
      speechService.stop();
      const remainingWords = words.slice(wordIdx).join(' ');
      speechService.speak(remainingWords || transcript, {
        rate: playbackSpeed,
        onEnd: handleStop,
      });
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      speechService.stop();
      const wordIdx = Math.max(0, activeWordIndex);
      const remainingWords = words.slice(wordIdx).join(' ');
      setTimeout(() => {
        speechService.speak(remainingWords || transcript, {
          rate: speed,
          onEnd: handleStop,
        });
      }, 50);
    }
  };

  const handleDownloadAudio = async () => {
    try {
      setIsGeneratingWav(true);
      const wavBlob = await createSummaryWavBlob(speaker, transcript, Math.max(6, Math.min(totalDuration, 15)));
      triggerAudioDownload(wavBlob, downloadFilename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Error generating audio wav:', err);
    } finally {
      setIsGeneratingWav(false);
    }
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (compact) {
    return (
      <div className={`p-3 bg-white border border-[#bec9c5] rounded-xl flex items-center justify-between gap-3 shadow-2xs ${className}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="w-8 h-8 rounded-full bg-[#004f45] text-white flex items-center justify-center shrink-0 hover:bg-[#003831] transition-all"
            title={isPlaying ? 'Pause Audio' : 'Listen to Audio'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-[#001f2a] truncate">{title}</h4>
            <p className="text-[10px] text-[#546067] flex items-center gap-1.5 truncate">
              <span>{speaker}</span>
              <span>•</span>
              <span className="font-mono">{formatSeconds(currentTime)} / {formatSeconds(totalDuration)}</span>
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadAudio}
          disabled={isGeneratingWav}
          className="p-2 text-[#004f45] hover:bg-[#e6f6ff] rounded-lg border border-[#004f45]/30 shrink-0 transition-colors"
          title="Download Audio File (.wav)"
        >
          {downloadSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
          ) : (
            <Download className={`w-4 h-4 ${isGeneratingWav ? 'animate-bounce' : ''}`} />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`p-4 bg-white border-2 border-[#004f45]/20 rounded-2xl shadow-sm space-y-3.5 ${className}`}>
      {/* Header with Title and Category Tag */}
      <div className="flex items-center justify-between gap-2 border-b border-[#c9e7f7]/70 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#e6f6ff] text-[#004f45] flex items-center justify-center">
            <FileAudio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-[#001f2a]">{title}</h4>
            <p className="text-[11px] text-[#546067]">
              Speaker: <span className="font-semibold text-[#004f45]">{speaker}</span>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#e6f6ff] text-[#004f45] border border-[#c9e7f7]">
          {category}
        </span>
      </div>

      {audioError && (
        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{audioError}</span>
        </div>
      )}

      {/* Spoken Text Transcript with Closed-Caption Active Word Highlight */}
      <div className="bg-[#f4faff] border border-[#c9e7f7] rounded-xl p-3 text-xs leading-relaxed max-h-32 overflow-y-auto">
        <p className="font-sans">
          {words.map((word, idx) => {
            const isCurrent = idx === activeWordIndex;
            return (
              <span
                key={idx}
                className={`transition-colors duration-150 inline-block mr-1 ${
                  isCurrent
                    ? 'bg-[#004f45] text-white font-bold px-1 rounded shadow-2xs'
                    : 'text-[#374151]'
                }`}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>

      {/* Interactive Clickable Scrubber Bar */}
      <div className="space-y-1">
        <div
          onClick={handleSeek}
          className="w-full bg-[#bec9c5]/40 h-2.5 rounded-full overflow-hidden relative cursor-pointer hover:h-3 transition-all"
          title="Click to seek playback position"
        >
          <div
            className="bg-[#004f45] h-full transition-all duration-100 rounded-full relative"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#546067]">
          <span>{formatSeconds(currentTime)}</span>
          <span className="flex items-center gap-1">
            {isPlaying && <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />}
            {formatSeconds(totalDuration)}
          </span>
        </div>
      </div>

      {/* Audio Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#c9e7f7]/70">
        {/* Play / Pause / Replay 5s */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={isPlaying ? handlePause : handlePlay}
            className="flex items-center gap-1.5 bg-[#004f45] hover:bg-[#003831] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>{isPaused ? 'Resume' : 'Listen Now'}</span>
              </>
            )}
          </button>

          {/* Scrub back 5s button */}
          <button
            onClick={handleSkipBackward5}
            className="p-1.5 text-slate-700 hover:text-[#004f45] hover:bg-[#e6f6ff] rounded-lg border border-[#bec9c5] transition-colors flex items-center gap-1 text-[11px] font-bold"
            title="Jump back 5 seconds"
          >
            <Replay5 className="w-3 h-3" />
            <span>-5s</span>
          </button>

          {(isPlaying || isPaused || currentTime > 0) && (
            <button
              onClick={handleStop}
              className="p-1.5 text-[#546067] hover:text-[#001f2a] hover:bg-[#f4faff] rounded-lg border border-[#bec9c5] transition-colors"
              title="Reset Audio"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Speed Controls: 0.75x, 1x, 1.25x */}
        <div className="flex items-center gap-0.5 bg-[#f4faff] border border-[#bec9c5] rounded-xl p-0.5 text-[11px] font-bold">
          {[0.75, 1.0, 1.25, 1.5].map((speed) => (
            <button
              key={speed}
              onClick={() => handleSpeedChange(speed)}
              className={`px-2 py-1 rounded-lg transition-all ${
                playbackSpeed === speed
                  ? 'bg-[#004f45] text-white shadow-2xs'
                  : 'text-[#546067] hover:text-[#001f2a]'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Download Audio Button */}
        <button
          onClick={handleDownloadAudio}
          disabled={isGeneratingWav}
          className="flex items-center gap-1.5 bg-[#e6f6ff] hover:bg-[#c9e7f7] text-[#004f45] border border-[#004f45]/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
          title="Download audio recording (.wav)"
        >
          {downloadSuccess ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span className="text-[#10b981]">Downloaded!</span>
            </>
          ) : (
            <>
              <Download className={`w-3.5 h-3.5 ${isGeneratingWav ? 'animate-spin' : ''}`} />
              <span>{isGeneratingWav ? 'Preparing...' : 'Download WAV'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
