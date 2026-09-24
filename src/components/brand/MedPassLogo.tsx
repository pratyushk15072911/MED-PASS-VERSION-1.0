import React from 'react';

interface MedPassLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  variant?: 'full' | 'icon-only' | 'light' | 'white';
  showSubtitle?: boolean;
  glow?: boolean;
}

export const MedPassCrossIcon: React.FC<{
  size?: number;
  className?: string;
  glow?: boolean;
}> = ({ size = 40, className = '', glow = false }) => {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      {glow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(0,168,125,0.4) 0%, rgba(0,79,69,0.15) 70%, transparent 100%)',
          }}
        />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-xs"
      >
        {/* Vertical Capsule (Deep Pine Teal #004F45) */}
        <rect
          x="36"
          y="8"
          width="28"
          height="84"
          rx="14"
          fill="#004F45"
        />

        {/* Horizontal Capsule (Vibrant Emerald Sea Green #00A87D) */}
        <rect
          x="8"
          y="36"
          width="84"
          height="28"
          rx="14"
          fill="#00A87D"
        />

        {/* Central Diamond Core (Crisp White #FFFFFF) */}
        <polygon
          points="50,30 70,50 50,70 30,50"
          fill="#FFFFFF"
        />
      </svg>
    </div>
  );
};

export const MedPassLogo: React.FC<MedPassLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showSubtitle = true,
  glow = false,
}) => {
  const iconSizes = {
    sm: 28,
    md: 40,
    lg: 52,
    xl: 68,
    '2xl': 96,
    hero: 124,
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
    '2xl': 'text-5xl md:text-6xl',
    hero: 'text-6xl sm:text-7xl md:text-8xl',
  };

  const subSizes = {
    sm: 'text-[8px] tracking-[0.2em]',
    md: 'text-[10px] tracking-[0.25em]',
    lg: 'text-xs tracking-[0.28em]',
    xl: 'text-sm tracking-[0.3em]',
    '2xl': 'text-base md:text-lg tracking-[0.32em]',
    hero: 'text-lg sm:text-xl md:text-2xl tracking-[0.35em]',
  };

  const gapSizes = {
    sm: 'gap-2.5',
    md: 'gap-3.5',
    lg: 'gap-4',
    xl: 'gap-5',
    '2xl': 'gap-6 md:gap-7',
    hero: 'gap-7 md:gap-9',
  };

  if (variant === 'icon-only') {
    return <MedPassCrossIcon size={iconSizes[size]} className={className} glow={glow} />;
  }

  const isWhite = variant === 'white';

  return (
    <div className={`flex items-center ${gapSizes[size]} select-none ${className}`}>
      <MedPassCrossIcon size={iconSizes[size]} glow={glow} />

      <div className="flex flex-col justify-center leading-none">
        <div
          className={`font-playfair font-bold tracking-tight ${titleSizes[size]} ${
            isWhite ? 'text-white' : 'text-[#111827]'
          } flex items-baseline drop-shadow-xs`}
        >
          <span>Med</span>
          <span className={isWhite ? 'text-white' : 'text-[#004F45]'}>Pass</span>
        </div>
        {showSubtitle && (
          <span
            className={`font-sans font-semibold uppercase ${subSizes[size]} ${
              isWhite ? 'text-white/80' : 'text-[#475569]'
            } mt-1.5 md:mt-2`}
          >
            CLINICAL READER
          </span>
        )}
      </div>
    </div>
  );
};
