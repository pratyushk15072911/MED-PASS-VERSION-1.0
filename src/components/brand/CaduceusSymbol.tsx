import React from 'react';

interface CaduceusSymbolProps {
  className?: string;
  size?: number;
  color?: string;
}

export const CaduceusSymbol: React.FC<CaduceusSymbolProps> = ({
  className = '',
  size = 64,
  color = '#54707f',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 500 550"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill={color}>
        {/* Top Sphere / Knob */}
        <circle cx="250" cy="50" r="22" />

        {/* Central Rod / Staff */}
        <path d="M244 50 L244 515 C244 522 256 522 256 515 L256 50 Z" />
        <path d="M250 515 L240 535 L250 545 L260 535 Z" />

        {/* Left Wing */}
        <path d="M242 75 C190 75 120 40 40 115 C100 130 150 145 200 140 C170 150 130 160 80 145 C120 170 170 175 225 158 C205 175 165 195 105 178 C150 205 200 200 240 170 C242 135 242 100 242 75 Z" />

        {/* Right Wing */}
        <path d="M258 75 C310 75 380 40 460 115 C400 130 350 145 300 140 C330 150 370 160 420 145 C380 170 330 175 275 158 C295 175 335 195 395 178 C350 205 300 200 260 170 C258 135 258 100 258 75 Z" />

        {/* Snake 1 (Left Head & Loops) */}
        {/* Left Head */}
        <path d="M225 175 C210 160 175 160 165 180 C155 198 180 215 205 205 C215 200 225 188 225 175 Z" />
        {/* Eye */}
        <circle cx="185" cy="180" r="3" fill="#ffffff" />

        {/* Snake 2 (Right Head & Loops) */}
        {/* Right Head */}
        <path d="M275 175 C290 160 325 160 335 180 C345 198 320 215 295 205 C285 200 275 188 275 175 Z" />
        {/* Eye */}
        <circle cx="315" cy="180" r="3" fill="#ffffff" />

        {/* Snake Upper Loop 1 (Left to Right) */}
        <path
          d="M175 195 C145 230 150 280 210 290 C250 295 275 270 300 255 C330 240 350 265 340 300 C330 330 290 350 250 345 C210 340 185 365 175 395 C165 430 190 470 235 480 C245 482 250 495 240 500 C230 505 210 490 200 470 C185 435 200 395 230 380 C260 365 295 355 305 320 C315 285 290 265 260 265 C230 265 190 275 170 245 C155 220 160 200 175 195 Z"
        />

        {/* Snake Upper Loop 2 (Right to Left) */}
        <path
          d="M325 195 C355 230 350 280 290 290 C250 295 225 270 200 255 C170 240 150 265 160 300 C170 330 210 350 250 345 C290 340 315 365 325 395 C335 430 310 470 265 480 C255 482 250 495 260 500 C270 505 290 490 300 470 C315 435 300 395 270 380 C240 365 205 355 195 320 C185 285 210 265 240 265 C270 265 310 275 330 245 C345 220 340 200 325 195 Z"
        />

        {/* Tail Ends entwined near base */}
        <path d="M238 490 C230 510 240 525 250 515 C246 505 245 498 238 490 Z" />
        <path d="M262 490 C270 510 260 525 250 515 C254 505 255 498 262 490 Z" />
      </g>
    </svg>
  );
};
