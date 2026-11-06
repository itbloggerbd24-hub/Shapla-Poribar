import React from 'react';
import { OptionType, RoundStatus } from '../types/game';
import { RealCoin3D } from './RealCoin3D';
import { Sparkles, Trophy } from 'lucide-react';

interface CoinFlipperProps {
  status: RoundStatus;
  winner: OptionType | null;
  displaySide: OptionType;
  timeLeft: number;
  totalDuration: number;
  userShaplaBet?: number;
  userPoribarBet?: number;
}

export const CoinFlipper: React.FC<CoinFlipperProps> = ({
  status,
  winner,
  timeLeft,
  totalDuration,
  userShaplaBet = 0,
  userPoribarBet = 0,
}) => {
  const isFlipping = status === 'FLIPPING';
  const isResult = status === 'RESULT';

  const totalUserBet = Number((userShaplaBet + userPoribarBet).toFixed(2));
  // 1.85x multiplier
  const estimatedReturn = Number((totalUserBet * 1.85).toFixed(2));

  const progressPercent = status === 'BETTING' 
    ? Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100))
    : 0;

  return (
    <div className="flex flex-col items-center justify-center relative py-1 select-none">
      {/* Compact Timer / Progress Halo Ring & 3D Coin */}
      <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
        {status === 'BETTING' && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r="47%"
              className="stroke-slate-800"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="47%"
              className={`transition-all duration-1000 ${
                timeLeft <= 5 ? 'stroke-rose-500 animate-pulse' : 'stroke-amber-400'
              }`}
              strokeWidth="4"
              strokeDasharray="290"
              strokeDashoffset={290 - (290 * progressPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
        )}

        {/* Scaled & Compact Real 3D Coin */}
        <RealCoin3D
          status={status}
          winner={winner}
          size={120}
        />

        {/* Floating result badge */}
        {isResult && winner && (
          <div className="absolute -bottom-1.5 z-20 flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[11px] tracking-wide shadow-xl animate-bounce uppercase border border-amber-200">
            <Trophy className="w-3.5 h-3.5 fill-slate-950" />
            <span>{winner === 'SHAPLA' ? 'Shapla Wins!' : 'Poribar Wins!'}</span>
            <Sparkles className="w-3 h-3 text-emerald-950" />
          </div>
        )}
      </div>

      {/* Ultra-compact Status description & 30s timer */}
      <div className="mt-1 text-center w-full max-w-sm">
        {status === 'BETTING' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-black text-amber-400">
              <span className="text-[10px] text-slate-400 font-sans uppercase font-bold tracking-wider">
                Toss In:
              </span>
              <span className={`text-base sm:text-lg ${timeLeft <= 5 ? 'text-rose-400 animate-ping' : ''}`}>
                00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s
              </span>
            </div>

            {/* User's Total Bet & Potential Return Under Countdown */}
            {totalUserBet > 0 ? (
              <div className="mx-auto px-3 py-1.5 rounded-xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-amber-500/40 shadow-sm flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-slate-300 font-medium text-[11px]">Your Bet:</span>
                  <span className="font-mono font-black text-white text-xs">
                    ${totalUserBet.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">
                    ({userShaplaBet > 0 && userPoribarBet > 0 ? 'Both' : userShaplaBet > 0 ? 'Shapla' : 'Poribar'})
                  </span>
                </div>
                <div className="flex items-center gap-1 font-mono">
                  <span className="text-slate-400 text-[10px]">Return:</span>
                  <span className="font-black text-amber-300 text-xs sm:text-sm">
                    ${estimatedReturn.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold">(1.85x)</span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 font-medium">
                No active bet yet this round. Place your bet below!
              </div>
            )}
          </div>
        )}

        {status === 'FLIPPING' && (
          <div className="animate-pulse space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-bold text-[11px] tracking-wide">
              Coin in Air... Flipping!
            </span>
            {totalUserBet > 0 && (
              <div className="text-[11px] font-mono text-amber-300">
                Active Bet: ${totalUserBet.toFixed(2)} • Potential Return: ${estimatedReturn.toFixed(2)}
              </div>
            )}
          </div>
        )}

        {status === 'RESULT' && (
          <div className="text-center">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-[11px]">
              Round Settled! Payouts credited.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
