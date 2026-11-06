import React from 'react';
import { OptionType, RoundStatus } from '../types/game';

interface RealCoin3DProps {
  status: RoundStatus;
  winner: OptionType | null;
  size?: number; // pixel diameter
}

export const RealCoin3D: React.FC<RealCoin3DProps> = ({
  status,
  winner,
  size = 130,
}) => {
  const isFlipping = status === 'FLIPPING';
  const isResult = status === 'RESULT';

  // Realistic landing rotation:
  // 3600 deg (multiples of 360) lands on SHAPLA (front)
  // 3780 deg (3600 + 180) lands on PORIBAR (back)
  const targetRotationY = winner === 'PORIBAR' ? 3780 : 3600;

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* 3D Perspective Viewport */}
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
          perspective: 1000,
        }}
      >
        {/* Flipping 3D Coin Body with high-speed tumbling */}
        <div
          className={`relative ${
            isFlipping
              ? 'animate-real-coin-flip'
              : isResult
              ? 'transition-transform duration-700 ease-out'
              : 'animate-coin-idle'
          }`}
          style={{
            width: size,
            height: size,
            transformStyle: 'preserve-3d',
            transform: isFlipping
              ? undefined
              : isResult
              ? `rotateY(${targetRotationY}deg)`
              : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE: SHAPLA (0 deg) */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center p-2 shadow-xl overflow-hidden border-3 sm:border-4 border-emerald-300/70 bg-gradient-to-br from-emerald-500 via-teal-700 to-emerald-950"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'translateZ(4px)',
            }}
          >
            {/* Outer Coin Ridges / Grooves */}
            <div className="absolute inset-1 rounded-full border border-dashed border-emerald-200/50 pointer-events-none" />

            {/* Specular Light Reflection */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-45 pointer-events-none" />

            {/* Shapla Water Lily Emblem */}
            <svg
              viewBox="0 0 100 100"
              className="w-7/12 h-7/12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M15 76 Q 30 71 50 76 T 85 76" stroke="#6ee7b7" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M25 84 Q 40 80 50 84 T 75 84" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
              <ellipse cx="32" cy="69" rx="14" ry="4" fill="#059669" />
              <ellipse cx="68" cy="69" rx="14" ry="4" fill="#059669" />
              <path d="M50 20 C 42 35 40 55 50 65 C 60 55 58 35 50 20 Z" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" />
              <path d="M50 65 C 36 58 26 44 32 30 C 40 40 46 54 50 65 Z" fill="#d1fae5" stroke="#059669" strokeWidth="1.2" />
              <path d="M50 65 C 64 58 74 44 68 30 C 60 40 54 54 50 65 Z" fill="#d1fae5" stroke="#059669" strokeWidth="1.2" />
              <path d="M50 65 C 28 62 18 50 22 40 C 30 46 42 56 50 65 Z" fill="#a7f3d0" opacity="0.9" />
              <path d="M50 65 C 72 62 82 50 78 40 C 70 46 58 56 50 65 Z" fill="#a7f3d0" opacity="0.9" />
              <circle cx="50" cy="57" r="4" fill="#f59e0b" />
            </svg>

            <span className="font-black tracking-wider text-emerald-100 uppercase text-[10px] sm:text-xs drop-shadow leading-tight">
              SHAPLA
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-widest text-emerald-300 font-bold uppercase leading-none">
              1.85x
            </span>
          </div>

          {/* BACK FACE: PORIBAR (180 deg) */}
          <div
            className="absolute inset-0 rounded-full flex flex-col items-center justify-center p-2 shadow-xl overflow-hidden border-3 sm:border-4 border-amber-300/70 bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-950"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(4px)',
            }}
          >
            {/* Outer Coin Ridges / Grooves */}
            <div className="absolute inset-1 rounded-full border border-dashed border-amber-200/50 pointer-events-none" />

            {/* Specular Light Reflection */}
            <div className="absolute -top-1/2 -left-1/2 w-full h-[200%] bg-gradient-to-r from-transparent via-white/25 to-transparent rotate-45 pointer-events-none" />

            {/* Poribar Family Emblem */}
            <svg
              viewBox="0 0 100 100"
              className="w-7/12 h-7/12 drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M18 48 Q 50 16 82 48" stroke="#fef3c7" strokeWidth="3.5" strokeLinecap="round" fill="none" />
              <circle cx="34" cy="40" r="7" fill="#fef3c7" />
              <path d="M24 64 C 24 53 44 53 44 64 Z" fill="#fde68a" />
              <circle cx="66" cy="42" r="6.5" fill="#fef3c7" />
              <path d="M56 64 C 56 54 76 54 76 64 Z" fill="#fde68a" />
              <circle cx="50" cy="52" r="5" fill="#fffbeb" />
              <path d="M42 70 C 42 62 58 62 58 70 Z" fill="#fef08a" />
              <rect x="20" y="73" width="60" height="4" rx="2" fill="#d97706" />
              <circle cx="16" cy="62" r="2" fill="#fef08a" />
              <circle cx="84" cy="62" r="2" fill="#fef08a" />
            </svg>

            <span className="font-black tracking-wider text-amber-100 uppercase text-[10px] sm:text-xs drop-shadow leading-tight">
              PORIBAR
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-widest text-amber-300 font-bold uppercase leading-none">
              1.85x
            </span>
          </div>

          {/* 3D Physical Coin Edge (Thickness / Reeded Edge cylinder simulation) */}
          <div
            className="absolute inset-0 rounded-full border-2 sm:border-3 border-amber-600 pointer-events-none"
            style={{ transform: 'translateZ(0px)' }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 sm:border-3 border-yellow-700 pointer-events-none"
            style={{ transform: 'translateZ(2px)' }}
          />
          <div
            className="absolute inset-0 rounded-full border-2 sm:border-3 border-yellow-800 pointer-events-none"
            style={{ transform: 'translateZ(-2px)' }}
          />
        </div>
      </div>

      {/* Dynamic 3D Floor Shadow */}
      <div
        className={`rounded-full bg-black/70 blur-sm transition-all duration-300 -mt-1 ${
          isFlipping
            ? 'scale-40 opacity-20 translate-y-5'
            : isResult
            ? 'scale-110 opacity-70'
            : 'scale-90 opacity-45'
        }`}
        style={{
          width: size * 0.65,
          height: Math.max(6, size * 0.08),
        }}
      />
    </div>
  );
};
