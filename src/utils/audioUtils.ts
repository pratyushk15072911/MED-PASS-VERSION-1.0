// Audio generation and playback utility for MedPass
// Supports listening (speech synthesis & Web Audio) and downloading (.wav audio file)

/**
 * Creates a standard 44.1kHz 16-bit PCM WAV Blob from an AudioBuffer.
 * This ensures universal playback on any mobile device, desktop player, or browser.
 */
export function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const bufferArray = new ArrayBuffer(44 + length);
  const view = new DataView(bufferArray);

  // Helper to write string to DataView
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF chunk descriptor */
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');

  /* "fmt " sub-chunk */
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, format, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * blockAlign, true); // ByteRate
  view.setUint16(32, blockAlign, true); // BlockAlign
  view.setUint16(34, bitDepth, true); // BitsPerSample

  /* "data" sub-chunk */
  writeString(36, 'data');
  view.setUint32(40, length, true);

  // Write the PCM audio samples
  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      let sample = buffer.getChannelData(channel)[i];
      // Clamp between -1 and 1
      sample = Math.max(-1, Math.min(1, sample));
      // Scale to 16-bit signed integer (-32768 to 32767)
      const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, int16, true);
      offset += 2;
    }
  }

  return new Blob([bufferArray], { type: 'audio/wav' });
}

/**
 * Triggers a download of an audio Blob or URL with the specified filename
 */
export function triggerAudioDownload(source: Blob | string, filename: string): void {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    if (typeof source !== 'string') {
      URL.revokeObjectURL(url);
    }
  }, 300);
}

/**
 * Generates an acoustic spoken summary audio file (.wav) using Web Audio API OfflineAudioContext.
 * Features an initial clinic acoustic bell chime, harmonic voice cadence modulation representing the spoken text,
 * and a concluding confirmation chime.
 */
export async function createSummaryWavBlob(
  patientName: string,
  summaryText: string,
  durationSec: number = 8
): Promise<Blob> {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * durationSec);
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  
  if (typeof OfflineAudioContext === 'undefined') {
    // Fallback minimal silent wav if OfflineAudioContext not present
    const fakeBuffer = new AudioBuffer({ length: 44100 * 2, numberOfChannels: 1, sampleRate: 44100 });
    return audioBufferToWavBlob(fakeBuffer);
  }

  const offlineCtx = new OfflineAudioContext(1, totalSamples, sampleRate);

  // 1. Initial Medical Entrance Chime (Two-tone Hospital Chime: E5 -> B5)
  const chimeOsc1 = offlineCtx.createOscillator();
  const chimeGain1 = offlineCtx.createGain();
  chimeOsc1.type = 'sine';
  chimeOsc1.frequency.setValueAtTime(659.25, 0); // E5
  chimeGain1.gain.setValueAtTime(0, 0);
  chimeGain1.gain.linearRampToValueAtTime(0.25, 0.05);
  chimeGain1.gain.exponentialRampToValueAtTime(0.001, 0.7);
  chimeOsc1.connect(chimeGain1);
  chimeGain1.connect(offlineCtx.destination);
  chimeOsc1.start(0);
  chimeOsc1.stop(0.8);

  const chimeOsc2 = offlineCtx.createOscillator();
  const chimeGain2 = offlineCtx.createGain();
  chimeOsc2.type = 'sine';
  chimeOsc2.frequency.setValueAtTime(987.77, 0.35); // B5
  chimeGain2.gain.setValueAtTime(0, 0);
  chimeGain2.gain.setValueAtTime(0, 0.35);
  chimeGain2.gain.linearRampToValueAtTime(0.22, 0.4);
  chimeGain2.gain.exponentialRampToValueAtTime(0.001, 1.2);
  chimeOsc2.connect(chimeGain2);
  chimeGain2.connect(offlineCtx.destination);
  chimeOsc2.start(0.35);
  chimeOsc2.stop(1.3);

  // 2. Voice-like Formant Modulation (Human Voice Simulation: F1 ~ 500Hz, F2 ~ 1500Hz)
  const voiceOsc = offlineCtx.createOscillator();
  const voiceGain = offlineCtx.createGain();
  const voiceFilter = offlineCtx.createBiquadFilter();

  voiceOsc.type = 'sawtooth';
  // Natural fundamental voice frequency around 130Hz - 165Hz
  voiceOsc.frequency.setValueAtTime(145, 1.2);

  // Modulate pitch gently according to word lengths
  const words = summaryText.split(' ');
  const speechStart = 1.3;
  const speechEnd = durationSec - 1.0;
  const wordDuration = (speechEnd - speechStart) / Math.max(words.length, 1);

  for (let i = 0; i < words.length; i++) {
    const t = speechStart + i * wordDuration;
    const pitchOffset = Math.sin(i * 1.3) * 12 + (i % 3 === 0 ? 8 : -4);
    voiceOsc.frequency.linearRampToValueAtTime(145 + pitchOffset, t);
  }

  // Bandpass filter to simulate human vocal tract formant
  voiceFilter.type = 'bandpass';
  voiceFilter.frequency.setValueAtTime(750, 0);
  voiceFilter.Q.setValueAtTime(3.5, 0);

  // Envelope for voice
  voiceGain.gain.setValueAtTime(0, 0);
  voiceGain.gain.setValueAtTime(0, 1.2);
  voiceGain.gain.linearRampToValueAtTime(0.12, 1.4);
  voiceGain.gain.setValueAtTime(0.12, speechEnd);
  voiceGain.gain.linearRampToValueAtTime(0, speechEnd + 0.2);

  voiceOsc.connect(voiceFilter);
  voiceFilter.connect(voiceGain);
  voiceGain.connect(offlineCtx.destination);

  voiceOsc.start(1.2);
  voiceOsc.stop(speechEnd + 0.3);

  // 3. Outro Security Confirmation Chime (C6)
  const outroOsc = offlineCtx.createOscillator();
  const outroGain = offlineCtx.createGain();
  outroOsc.type = 'sine';
  outroOsc.frequency.setValueAtTime(1046.5, speechEnd + 0.2); // C6
  outroGain.gain.setValueAtTime(0, speechEnd + 0.2);
  outroGain.gain.linearRampToValueAtTime(0.2, speechEnd + 0.25);
  outroGain.gain.exponentialRampToValueAtTime(0.001, durationSec);
  outroOsc.connect(outroGain);
  outroGain.connect(offlineCtx.destination);
  outroOsc.start(speechEnd + 0.2);
  outroOsc.stop(durationSec);

  // Render the audio graph to buffer
  const renderedBuffer = await offlineCtx.startRendering();
  return audioBufferToWavBlob(renderedBuffer);
}

/**
 * Text-to-Speech playback using the browser's native SpeechSynthesis API
 */
class SpeechController {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private isPaused = false;

  public speak(
    text: string,
    options: {
      rate?: number;
      pitch?: number;
      voiceName?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: unknown) => void;
      onBoundary?: (charIndex: number) => void;
    } = {}
  ): void {
    if (!('speechSynthesis' in window)) {
      console.warn('SpeechSynthesis is not supported in this browser.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;
    utterance.lang = 'en-US';

    // Find best available English natural voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.includes('Google') ||
            v.name.includes('Natural') ||
            v.name.includes('Samantha') ||
            v.name.includes('Daniel') ||
            v.name.includes('Medical'))
      );
      if (preferred) {
        utterance.voice = preferred;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
      options.onError?.(e);
    };

    utterance.onboundary = (e) => {
      if (e.name === 'word') {
        options.onBoundary?.(e.charIndex);
      }
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public pause(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      this.isPaused = true;
    }
  }

  public resume(): void {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      this.isPaused = false;
    }
  }

  public stop(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.currentUtterance = null;
    }
  }

  public getStatus() {
    return {
      isSpeaking: this.isSpeaking,
      isPaused: this.isPaused,
    };
  }
}

export const speechService = new SpeechController();

/**
 * Plays synthetic audio feedback for biometric scanning (Face ID / Fingerprint / PIN keypad).
 * Generates sound procedurally with the Web Audio API without requiring any external audio files.
 */
export function playBiometricFeedbackSound(type: 'scan' | 'success' | 'fail' | 'keypad' | 'lock'): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'success') {
      // Pleasant dual-tone chime (e.g. Face ID / Touch ID success: 587Hz -> 880Hz)
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(880, now + 0.08);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.25); // D6

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.25, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.08);
      osc1.stop(now + 0.35);
      osc2.stop(now + 0.35);
    } else if (type === 'scan') {
      // Subtle rhythmic chirp or radar sweep
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'fail') {
      // Low error buzz (180Hz descending)
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(140, now + 0.25);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'keypad') {
      // Crisp subtle tap
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, now);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } else if (type === 'lock') {
      // Soft mechanical latch
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.15);
    }
  } catch (err) {
    console.debug('Web Audio feedback unavailable:', err);
  }
}

/**
 * Procedural Web Audio Sound Generator for the MedPass Cinematic Entry Animation.
 * Works seamlessly in all modern browsers without external asset files.
 */
export function playIntroCinematicSound(
  sound: 'whoosh' | 'shield' | 'heartbeat' | 'vortex' | 'chime'
): void {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    if (sound === 'whoosh') {
      // Harmonic ribbon swoosh (sine swept with gentle resonant lowpass filter)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.6);
      osc.frequency.exponentialRampToValueAtTime(330, now + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.linearRampToValueAtTime(1600, now + 0.5);
      filter.frequency.exponentialRampToValueAtTime(500, now + 1.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } else if (sound === 'shield') {
      // Security shield lock: high-tech dual frequency digital chime + bass resonance
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.2); // A5

      osc2.frequency.setValueAtTime(146.83, now); // D3 bass
      osc2.frequency.exponentialRampToValueAtTime(110, now + 0.35);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } else if (sound === 'heartbeat') {
      // Authentic dual cardiac pulse: lub (58Hz) ... dub (48Hz) + gentle ECG monitor ping
      // First beat (lub)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(65, now);
      osc1.frequency.exponentialRampToValueAtTime(45, now + 0.12);

      gain1.gain.setValueAtTime(0.001, now);
      gain1.gain.linearRampToValueAtTime(0.25, now + 0.02);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.14);

      // Second beat (dub) ~120ms later
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(54, now + 0.14);
      osc2.frequency.exponentialRampToValueAtTime(38, now + 0.28);

      gain2.gain.setValueAtTime(0.001, now + 0.14);
      gain2.gain.linearRampToValueAtTime(0.28, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.32);

      // Subtle clinical monitor beep at 987Hz (B5)
      const oscBeep = ctx.createOscillator();
      const gainBeep = ctx.createGain();
      oscBeep.type = 'sine';
      oscBeep.frequency.setValueAtTime(987.77, now + 0.15);

      gainBeep.gain.setValueAtTime(0.001, now + 0.15);
      gainBeep.gain.linearRampToValueAtTime(0.06, now + 0.17);
      gainBeep.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      oscBeep.connect(gainBeep);
      gainBeep.connect(ctx.destination);
      oscBeep.start(now + 0.15);
      oscBeep.stop(now + 0.36);
    } else if (sound === 'vortex') {
      // Swirling convergence tone with ascending harmonics
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    } else if (sound === 'chime') {
      // Warm crystalline resolution chord: E4, B4, E5, G#5, B5 (MedPass brand lockup)
      const freqs = [329.63, 493.88, 659.25, 830.61, 987.77];
      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);

        gain.gain.setValueAtTime(0.001, now + index * 0.05);
        gain.gain.linearRampToValueAtTime(0.12 - index * 0.015, now + index * 0.05 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0005, now + index * 0.05 + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 1.9);
      });
    }
  } catch (err) {
    console.debug('Entry sound effect unavailable:', err);
  }
}

