import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { playIntroCinematicSound } from '../../utils/audioUtils';
import { MedPassLogo } from '../brand/MedPassLogo';

interface EntryAnimationOverlayProps {
  onComplete: () => void;
}

export const EntryAnimationOverlay: React.FC<EntryAnimationOverlayProps> = ({
  onComplete,
}) => {
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const audioPlayedRef = useRef<boolean>(false);

  const handleEnterWorkspace = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 450);
  };

  useEffect(() => {
    // Gentle entry reveal
    const revealTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 150);

    // Warm, understated crystalline chime
    const soundTimeout = setTimeout(() => {
      if (!isMuted && !audioPlayedRef.current) {
        audioPlayedRef.current = true;
        playIntroCinematicSound('chime');
      }
    }, 350);

    // Keyboard accessibility: Enter or Space triggers entry
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnterWorkspace();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(soundTimeout);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMuted]);

  // High-fidelity clinical Lead II ECG path generator
  // Base cycle width = 400, height = 140, baseline = 70
  const renderEcgSegments = (count: number) => {
    let strokePath = 'M 0 70';
    let areaPath = 'M 0 70';

    for (let i = 0; i < count; i++) {
      const xOffset = i * 400;
      const segment = `
        L ${xOffset + 60} 70
        Q ${xOffset + 80} 54 ${xOffset + 100} 70
        L ${xOffset + 140} 70
        L ${xOffset + 152} 84
        L ${xOffset + 168} 8
        L ${xOffset + 184} 108
        L ${xOffset + 204} 70
        Q ${xOffset + 240} 40 ${xOffset + 276} 70
        L ${xOffset + 400} 70
      `;
      strokePath += segment;
      areaPath += segment;
    }

    const totalWidth = count * 400;
    areaPath += ` L ${totalWidth} 140 L 0 140 Z`;

    return { strokePath, areaPath, totalWidth };
  };

  const { strokePath, areaPath, totalWidth } = renderEcgSegments(8); // 3200px width

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-[1.015] pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 25%, #ffffff 0%, #f6fbf9 35%, #edf5f2 70%, #e2ece9 100%)',
      }}
    >
      {/* ========================================================= */}
      {/* 1. DYNAMIC ECG WAVEFORM & LUMINOUS BACKGROUND LAYERS */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Soft Clinical Ambient Light Pools */}
        <div
          className="absolute -top-32 -left-32 w-[680px] h-[680px] rounded-full blur-3xl opacity-70 animate-ambient-1"
          style={{
            background: 'radial-gradient(circle, rgba(0, 168, 125, 0.16) 0%, rgba(209, 250, 229, 0.25) 45%, transparent 75%)',
          }}
        />

        <div
          className="absolute -bottom-36 -right-36 w-[720px] h-[720px] rounded-full blur-3xl opacity-60 animate-ambient-2"
          style={{
            background: 'radial-gradient(circle, rgba(0, 79, 69, 0.12) 0%, rgba(226, 236, 233, 0.4) 50%, transparent 80%)',
          }}
        />

        {/* Central Luminous Breath Glow */}
        <div
          className="absolute w-[560px] h-[560px] rounded-full blur-2xl opacity-45 animate-subtle-breath"
          style={{
            background: 'radial-gradient(circle, rgba(0, 168, 125, 0.20) 0%, rgba(167, 243, 208, 0.14) 50%, transparent 75%)',
            left: '50%',
            top: '46%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Subtle Oscilloscope Grid Background */}
        <div
          className="absolute inset-0 opacity-12"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0, 168, 125, 0.25) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0, 168, 125, 0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 40%, transparent 80%)',
          }}
        />

        {/* CONTINUOUS FLOWING LIVE ECG WAVEFORM BAND */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-52 overflow-hidden flex items-center pointer-events-none opacity-85">
          
          {/* Real-time Oscilloscope Sweep Blip Dot */}
          <div className="absolute inset-x-0 h-40 pointer-events-none z-10">
            <div className="relative w-full h-full">
              <div className="absolute top-[28px] w-5 h-5 rounded-full bg-emerald-400 blur-xs shadow-[0_0_16px_#10b981] animate-ecg-sweep pointer-events-none opacity-75" />
            </div>
          </div>

          {/* Infinite Seamless ECG Waveform SVG */}
          <div className="relative w-[3200px] h-full flex items-center animate-ecg-flow">
            <svg
              viewBox={`0 0 ${totalWidth} 140`}
              className="w-[3200px] h-48 shrink-0 overflow-visible"
              fill="none"
              preserveAspectRatio="none"
            >
              <defs>
                {/* Luminous Emerald-Teal Linear Gradient */}
                <linearGradient id="ecgWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00A87D" />
                  <stop offset="25%" stopColor="#10B981" />
                  <stop offset="50%" stopColor="#004F45" />
                  <stop offset="75%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#00A87D" />
                </linearGradient>

                {/* Soft Area Gradient Under Waveform Peaks */}
                <linearGradient id="ecgAreaGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#10B981" stopOpacity="0.18" />
                  <stop offset="50%" stopColor="#00A87D" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#004F45" stopOpacity="0.00" />
                </linearGradient>

                {/* Ambient Glow Filter */}
                <filter id="ecgAmbientGlow" x="-10%" y="-40%" width="120%" height="180%">
                  <feGaussianBlur stdDeviation="3" result="blur1" />
                  <feGaussianBlur stdDeviation="7" result="blur2" />
                  <feMerge>
                    <feMergeNode in="blur2" />
                    <feMergeNode in="blur1" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Translucent Oscilloscope Area Fill */}
              <path
                d={areaPath}
                fill="url(#ecgAreaGlow)"
                className="opacity-70"
              />

              {/* Soft Ambient Background Bleed Trace */}
              <path
                d={strokePath}
                stroke="#10B981"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.25"
                filter="url(#ecgAmbientGlow)"
              />

              {/* Primary Crisp Flowing ECG Waveform */}
              <path
                d={strokePath}
                stroke="url(#ecgWaveGrad)"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#ecgAmbientGlow)"
                className="animate-pulse-lead"
              />
            </svg>
          </div>
        </div>

        {/* SWEEPING RIBBON LINE 1 (Left Flank Flowing Arch) */}
        <div className="absolute -left-20 top-0 w-[800px] h-full opacity-35 animate-ribbon-1 pointer-events-none">
          <svg
            viewBox="0 0 800 1000"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ribbonGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00A87D" stopOpacity="0.30" />
                <stop offset="40%" stopColor="#10B981" stopOpacity="0.20" />
                <stop offset="75%" stopColor="#004F45" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M -100,100 C 250,200 450,450 300,750 C 200,950 500,1050 600,1100"
              stroke="url(#ribbonGrad1)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M -80,140 C 270,240 430,470 280,770 C 180,970 480,1070 580,1120"
              stroke="url(#ribbonGrad1)"
              strokeWidth="1.2"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* SWEEPING RIBBON LINE 2 (Right Flank Descending Crest) */}
        <div className="absolute -right-24 bottom-0 w-[850px] h-full opacity-35 animate-ribbon-2 pointer-events-none">
          <svg
            viewBox="0 0 850 1000"
            fill="none"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="ribbonGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00A87D" stopOpacity="0.28" />
                <stop offset="50%" stopColor="#004F45" stopOpacity="0.15" />
                <stop offset="85%" stopColor="#6ee7b7" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 950,-50 C 600,180 420,380 550,650 C 680,920 350,980 200,1050"
              stroke="url(#ribbonGrad2)"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M 970,-10 C 620,220 440,420 570,690 C 700,960 370,1020 220,1090"
              stroke="url(#ribbonGrad2)"
              strokeWidth="1.5"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Top Right Subtle Audio Controls */}
      <div className="absolute top-7 right-8 z-30 flex items-center gap-3">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2.5 rounded-full bg-white/70 hover:bg-white text-slate-500 hover:text-slate-800 border border-white/80 shadow-2xs backdrop-blur-md transition-all active:scale-95"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label="Toggle Audio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-[#004F45]" />}
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. CENTRAL HERO CONTENT: FROSTED GLASSMORPHIC CARD */}
      {/* ========================================================= */}
      <main className="relative z-20 max-w-xl w-full px-6 flex flex-col items-center text-center">
        <div
          className={`w-full p-8 sm:p-12 rounded-[32px] bg-white/75 backdrop-blur-xl border border-white/90 shadow-premium-medical transform transition-all duration-700 ease-out ${
            isLoaded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-5 scale-[0.98]'
          }`}
        >
          {/* Subtle Top Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#004F45]/[0.06] text-[#004F45] border border-[#004F45]/15 text-[11px] font-semibold tracking-wide mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00A87D] animate-pulse" />
            <span>Decentralized Healthcare Intelligence</span>
          </div>

          {/* Prominent MedPass Clinical Reader Logo with Medical Cross */}
          <div className="flex justify-center mb-5">
            <MedPassLogo
              size="xl"
              showSubtitle={true}
              glow={false}
              className="justify-center"
            />
          </div>

          {/* Minimal, Elegant & Value-Driven Typography */}
          <p className="text-slate-600 text-sm sm:text-base font-normal leading-relaxed max-w-md mx-auto mb-9">
            Zero-residual ephemeral health records engineered for instantaneous triage, clinical precision, and patient privacy.
          </p>

          {/* ========================================================= */}
          {/* 3. SINGLE, FRICTIONLESS, BEAUTIFULLY STYLED CTA BUTTON */}
          {/* ========================================================= */}
          <div className="flex justify-center">
            <button
              onClick={handleEnterWorkspace}
              autoFocus
              className="relative group px-8 py-3.5 rounded-full bg-[#004F45] hover:bg-[#003831] text-white text-sm font-semibold tracking-wide shadow-md hover:shadow-[0_12px_28px_-6px_rgba(0,168,125,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 focus:outline-none focus:ring-2 focus:ring-[#00A87D] focus:ring-offset-2"
            >
              <span>Enter Clinical Reader</span>
              <ArrowRight className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>

        {/* Minimal Bottom Security Credential */}
        <div
          className={`mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium tracking-wide transition-opacity duration-700 delay-200 ${
            isLoaded ? 'opacity-70' : 'opacity-0'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#00A87D]" />
          <span>RAM-Only Ephemeral Architecture • Zero Data Stored On-Device</span>
        </div>
      </main>
    </div>
  );
};
