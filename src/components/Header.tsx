import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Volume2, 
  VolumeX, 
  HelpCircle,
  Coins,
  Menu,
  X,
  User,
  Shield,
  ExternalLink,
  LogOut,
  Gift,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenRules: () => void;
  onOpenReferral?: () => void;
  onOpenRewards?: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
  onLogoClick?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenRules,
  onOpenReferral,
  onOpenRewards,
  isMuted,
  onToggleSound,
  onLogoClick,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          
          {/* Top Left: Mobile Menu Button + Logo directly to its right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 hover:text-white transition cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo on the right side of mobile menu */}
            <div 
              className="flex items-center gap-2 cursor-pointer select-none" 
              onClick={onLogoClick}
              title="Shapla Poribar"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                </div>
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
                    Shapla Poribar
                  </h1>
                  <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded hidden xs:inline">
                    30s
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  Binance Instant Coin Toss & Prediction
                </p>
              </div>
            </div>
          </div>

          {/* User Balance & Quick Actions */}
          <div className="flex items-center gap-1 sm:gap-2.5">
            
            {/* Wallet Balance Display (Clickable to open Deposit) */}
            <div 
              onClick={onOpenDeposit}
              className="flex items-center bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 sm:px-3 sm:py-2 shadow-sm transition cursor-pointer select-none"
              title="Click to Deposit / Manage Wallet"
            >
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-400/10 flex items-center justify-center mr-1 sm:mr-1.5 text-amber-400 shrink-0">
                <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-400 font-bold block leading-none">
                  Balance
                </span>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-[11px] sm:text-xs text-amber-400 font-bold">$</span>
                  <span className="text-xs sm:text-base font-black text-amber-300 tracking-tight font-mono">
                    {user.walletBalance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deposit Button: PROMINENT ON ALL DEVICES (Mobile & Desktop) */}
            <button
              onClick={onOpenDeposit}
              type="button"
              className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] sm:text-sm shadow-md shadow-emerald-950/40 transition transform active:scale-95 cursor-pointer shrink-0"
              title="Deposit Funds"
            >
              <ArrowDownCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Deposit</span>
            </button>

            {/* Refer & Earn Button */}
            {onOpenReferral && (
              <button
                onClick={onOpenReferral}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs transition cursor-pointer"
                title="Refer Friends & Earn $0.50 Each"
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                <span>Refer & Earn</span>
              </button>
            )}

            {/* Free Rewards Button */}
            {onOpenRewards && (
              <button
                onClick={onOpenRewards}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-xs transition cursor-pointer"
                title="Claim Free Daily ($0.50) & Weekly ($1.00) Bonus"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Free Bonus</span>
              </button>
            )}

            {/* Desktop-only secondary buttons */}
            <button
              onClick={onOpenWithdraw}
              className="hidden md:flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Withdraw</span>
            </button>

            <button
              onClick={onOpenRules}
              className="hidden md:flex p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-amber-300 transition cursor-pointer"
              title="How to Play"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {onLogout && (
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1 p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 border border-slate-700/80 hover:border-rose-500/40 text-slate-400 hover:text-rose-300 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>
      </header>

      {/* Slide-out Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content on left */}
          <div className="relative w-72 max-w-[80vw] bg-slate-900 border-r border-slate-800 h-full p-5 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-emerald-500 p-0.5">
                    <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                      <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                  </div>
                  <span className="font-black text-sm text-white">Menu & Account</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Player Profile Card in Drawer */}
              <div className="my-4 p-3 rounded-2xl bg-slate-950 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{user.name}</div>
                    <div className="text-[11px] font-mono text-emerald-400 font-bold">
                      ${user.walletBalance.toFixed(2)} USD
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5 text-xs font-semibold">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenDeposit();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-emerald-400 border border-emerald-500/20 transition cursor-pointer"
                >
                  <ArrowDownCircle className="w-4 h-4" />
                  <span className="font-bold">Binance Deposit</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenWithdraw();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-amber-400 border border-amber-500/20 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <ArrowUpCircle className="w-4 h-4" />
                    <span className="font-bold">Binance Withdrawal</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-amber-500/20">
                    10 AM – 10 PM
                  </span>
                </button>

                {onOpenReferral && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenReferral();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-amber-300 border border-amber-500/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">Refer & Earn</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                      +$0.50
                    </span>
                  </button>
                )}

                {onOpenRewards && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenRewards();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-emerald-300 border border-emerald-500/20 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Free Daily/Weekly Bonus</span>
                    </div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-bold">
                      Claim
                    </span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenRules();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>How to Play & Guide</span>
                </button>

                <button
                  onClick={onToggleSound}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800 text-slate-300 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
                    <span>Sound Effects</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-slate-500">
                    {isMuted ? 'Muted' : 'Active'}
                  </span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition cursor-pointer mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-bold">Sign Out</span>
                  </button>
                )}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 space-y-1">
              <div>Shapla Poribar • 30-Second Rounds</div>
              <div>Min Bet: $0.20 | Unlimited Max</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
