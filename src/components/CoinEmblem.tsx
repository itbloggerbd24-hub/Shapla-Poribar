import React from 'react';
import { OptionType } from '../types/game';

interface CoinEmblemProps {
  side: OptionType;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isFlipping?: boolean;
  glow?: boolean;
}

export const CoinEmblem: React.FC<CoinEmblemProps> = ({
  side,
  size = 'md',
  isFlipping = false,
  glow = false,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 sm:w-9 sm:h-9 text-[8px]',
    sm: 'w-10 h-10 sm:w-12 sm:h-12 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-36 h-36 text-base',
    xl: 'w-48 h-48 md:w-56 md:h-56 text-lg',
  };

  const isShapla = side === 'SHAPLA';

  return (
    <div
      className={`relative rounded-full flex items-center justify-center select-none shadow-2xl transition-all duration-500 ${
        sizeClasses[size]
      } ${
        glow
          ? isShapla
            ? 'ring-4 ring-emerald-400/80 shadow-[0_0_35px_rgba(16,185,129,0.5)]'
            : 'ring-4 ring-amber-400/80 shadow-[0_0_35px_rgba(245,158,11,0.5)]'
          : ''
      } ${isFlipping ? 'animate-[spin_0.6s_linear_infinite]' : ''}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Outer Coin Rim with Metallic Grooves */}
      <div
        className={`absolute inset-0 rounded-full border-4 ${
          isShapla
            ? 'border-emerald-300/40 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950'
            : 'border-amber-300/40 bg-gradient-to-br from-amber-500 via-yellow-600 to-amber-950'
        } shadow-inner flex items-center justify-center`}
      >
        {/* Beveled Inner Ring */}
        <div
          className={`absolute inset-1.5 rounded-full border-2 border-dashed ${
            isShapla ? 'border-emerald-300/30' : 'border-amber-200/40'
          }`}
        />

        {/* Coin Face Content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center p-2">
          {isShapla ? (
            // Shapla (Water Lily) Art
            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 100 100"
                className="w-3/5 h-3/5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 75 Q 30 70 50 75 T 85 75"
                  stroke="#6ee7b7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <path
                  d="M25 83 Q 40 79 50 83 T 75 83"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
                <ellipse cx="32" cy="68" rx="14" ry="4" fill="#059669" />
                <ellipse cx="68" cy="68" rx="14" ry="4" fill="#059669" />
                <path
                  d="M50 20 C 42 35 40 55 50 64 C 60 55 58 35 50 20 Z"
                  fill="#ecfdf5"
                  stroke="#10b981"
                  strokeWidth="1.5"
                />
                <path
                  d="M50 64 C 36 58 26 44 32 30 C 40 40 46 54 50 64 Z"
                  fill="#d1fae5"
                  stroke="#059669"
                  strokeWidth="1.2"
                />
                <path
                  d="M50 64 C 64 58 74 44 68 30 C 60 40 54 54 50 64 Z"
                  fill="#d1fae5"
                  stroke="#059669"
                  strokeWidth="1.2"
                />
                <path
                  d="M50 64 C 28 62 18 50 22 40 C 30 46 42 56 50 64 Z"
                  fill="#a7f3d0"
                  opacity="0.9"
                />
                <path
                  d="M50 64 C 72 62 82 50 78 40 C 70 46 58 56 50 64 Z"
                  fill="#a7f3d0"
                  opacity="0.9"
                />
                <circle cx="50" cy="56" r="4" fill="#f59e0b" />
              </svg>

              <span className="font-black tracking-wider text-emerald-100 uppercase drop-shadow mt-1">
                SHAPLA
              </span>
              <span className="text-[9px] tracking-widest text-emerald-300/80 font-bold uppercase">
                Water Lily
              </span>
            </div>
          ) : (
            // Poribar (Family) Art
            <div className="flex flex-col items-center">
              <svg
                viewBox="0 0 100 100"
                className="w-3/5 h-3/5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 48 Q 50 16 82 48"
                  stroke="#fef3c7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <circle cx="34" cy="40" r="7" fill="#fef3c7" />
                <path
                  d="M24 64 C 24 53 44 53 44 64 Z"
                  fill="#fde68a"
                />
                <circle cx="66" cy="42" r="6.5" fill="#fef3c7" />
                <path
                  d="M56 64 C 56 54 76 54 76 64 Z"
                  fill="#fde68a"
                />
                <circle cx="50" cy="52" r="5" fill="#fffbeb" />
                <path
                  d="M42 70 C 42 62 58 62 58 70 Z"
                  fill="#fef08a"
                />
                <rect x="20" y="73" width="60" height="4" rx="2" fill="#d97706" />
                <circle cx="16" cy="62" r="2" fill="#fef08a" />
                <circle cx="84" cy="62" r="2" fill="#fef08a" />
              </svg>

              <span className="font-black tracking-wider text-amber-100 uppercase drop-shadow mt-1">
                PORIBAR
              </span>
              <span className="text-[9px] tracking-widest text-amber-300/80 font-bold uppercase">
                Family
              </span>
            </div>
          )}
        </div>

        {/* Specular Light Highlight */}
        <div className="absolute top-1 left-2 right-2 h-1/3 bg-gradient-to-b from-white/25 to-transparent rounded-t-full pointer-events-none" />
      </div>
    </div>
  );
};
