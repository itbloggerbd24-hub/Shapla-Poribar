import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { 
  User, 
  ArrowLeft, 
  Phone, 
  ShieldCheck, 
  CreditCard, 
  Wallet, 
  Coins, 
  Sparkles, 
  HelpCircle, 
  Copy, 
  Check, 
  Gift, 
  Clock, 
  ArrowDownCircle, 
  ArrowUpCircle,
  Award,
  CheckCircle2,
  Lock
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
  onOpenReferral?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenReferral,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'CODE' | 'PHONE') => {
    navigator.clipboard.writeText(text);
    if (type === 'CODE') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const netEarnings = Number((user.totalWon - user.totalLost).toFixed(2));
  const memberDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString([], { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }) : 'Active Member';

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-2 sm:py-4 animate-in fade-in duration-200">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 space-y-5">
        
        {/* Back Symbol at the very corner as per platform design */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 hover:border-amber-500/50 shadow-md group z-10"
          title="Back to Arena"
          aria-label="Back to Arena"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Page Header in a single column with text under the symbol */}
        <div className="pb-4 sm:pb-6 border-b border-slate-800 pr-14 flex flex-col gap-2.5">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
            <User className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Verified Account
              </span>
              {user.role === 'ADMIN' && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold">
                  Administrator
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Member since {memberDate} • Secured with 256-Bit Protection & National ID
            </p>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
          
          {/* Main Wallet Balance */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-amber-500/30 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Available</span>
              <Wallet className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-amber-300 font-mono">
              ${user.walletBalance.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">USD Available Balance</div>
          </div>

          {/* Locked Bonus Balance */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Locked Bonus</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-emerald-400 font-mono">
              ${(user.lockedBonusBalance || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Play to unlock into cash</div>
          </div>

          {/* Total Wagered */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Wagered</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-white font-mono">
              ${(user.totalWagered || (user.totalWon + user.totalLost) || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">Predictions Volume</div>
          </div>

          {/* Net Earnings */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-md">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Total Won</span>
              <Award className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-base sm:text-xl font-black text-teal-300 font-mono">
              ${user.totalWon.toFixed(2)}
            </div>
            <div className={`text-[10px] font-bold mt-0.5 ${netEarnings >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Net: {netEarnings >= 0 ? `+$${netEarnings.toFixed(2)}` : `-$${Math.abs(netEarnings).toFixed(2)}`}
            </div>
          </div>

        </div>

        {/* Detailed Account Information Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Identity & Personal Security Details */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Identity & Security Records</span>
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 font-bold">Encrypted</span>
            </div>

            <div className="space-y-2.5 text-xs">
              
              {/* Phone */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Registered Phone:</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-white text-xs">{user.phone}</span>
                  <button
                    onClick={() => handleCopy(user.phone, 'PHONE')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedPhone ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* National ID */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>National ID (NID):</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-slate-200 text-xs">
                    {user.nid ? `${user.nid.slice(0, 4)}••••${user.nid.slice(-4)}` : 'Verified on Signup'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                    Matched
                  </span>
                </div>
              </div>

              {/* Security Question */}
              <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Designated Security Question:</span>
                </div>
                <div className="font-semibold text-white text-xs pl-5 text-amber-200">
                  "{user.securityQuestion || 'What is your childhood nickname?'}"
                </div>
              </div>

              {/* Binance Pay ID */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Binance Pay ID:</span>
                </div>
                <div className="font-mono font-bold text-amber-300 text-xs">
                  {user.binancePayId || '1156528658 (Default)'}
                </div>
              </div>

            </div>
          </div>

          {/* Referral & Rewards Profile */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-400" />
                <span>Affiliate & Bonus Records</span>
              </h3>
              <span className="text-[10px] font-mono text-amber-400 font-bold">+$0.50 / Friend</span>
            </div>

            <div className="space-y-2.5 text-xs">
              
              {/* Referral Code */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <div className="text-slate-400 text-xs">My Referral Code:</div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-amber-300 text-xs px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                    {user.referralCode || 'SP-VIP'}
                  </span>
                  <button
                    onClick={() => handleCopy(user.referralCode || 'SP-VIP', 'CODE')}
                    className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                    title="Copy Code"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Referral Count & Earnings */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Invited Friends</div>
                  <div className="text-sm font-black text-white font-mono mt-0.5">
                    {user.referralCount || 0}
                  </div>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Referral Bonus</div>
                  <div className="text-sm font-black text-emerald-400 font-mono mt-0.5">
                    ${(user.referralBonusEarned || 0).toFixed(2)} USD
                  </div>
                </div>
              </div>

              {/* Referred by */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-xs">Referred By:</span>
                <span className="font-mono text-slate-300 font-bold text-xs">
                  {user.referredBy || 'Direct Registration'}
                </span>
              </div>

              {/* 1st Deposit Status */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-400 text-xs">1st Deposit Status:</span>
                <span className={`font-bold text-[11px] px-2 py-0.5 rounded ${
                  user.firstDepositDone
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                }`}>
                  {user.firstDepositDone ? 'Completed (Bonus Active)' : 'Pending 1st Deposit'}
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          {onOpenDeposit && (
            <button
              onClick={() => {
                onClose();
                onOpenDeposit();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4 text-emerald-200" />
              <span>Deposit Funds</span>
            </button>
          )}

          {onOpenWithdraw && (
            <button
              onClick={() => {
                onClose();
                onOpenWithdraw();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-amber-500/40 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <ArrowUpCircle className="w-4 h-4 text-amber-400" />
              <span>Withdraw Funds</span>
            </button>
          )}

          {onOpenReferral && (
            <button
              onClick={() => {
                onClose();
                onOpenReferral();
              }}
              className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Gift className="w-4 h-4 text-amber-400" />
              <span>Refer & Earn</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
