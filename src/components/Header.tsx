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
  Bell,
  Sparkles,
  Gift,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Trophy
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenRules: () => void;
  onOpenReferral?: () => void;
  onOpenRewards?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
  onOpenDepositAnalytics?: () => void;
  onOpenPayoutAnalytics?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenMyBets?: () => void;
  unreadNoticeCount?: number;
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
  onOpenNotifications,
  onOpenProfile,
  onOpenDepositAnalytics,
  onOpenPayoutAnalytics,
  onOpenLeaderboard,
  onOpenMyBets,
  unreadNoticeCount = 0,
  isMuted,
  onToggleSound,
  onLogoClick,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBalanceMenuOpen, setIsBalanceMenuOpen] = useState(false);

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
            
            {/* Wallet Balance Display (Clickable to show Deposit & Withdraw options) */}
            <div className="relative">
              <div 
                onClick={() => setIsBalanceMenuOpen(!isBalanceMenuOpen)}
                className="flex items-center bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-2 py-1 sm:px-3 sm:py-2 shadow-sm transition cursor-pointer select-none gap-1 sm:gap-2 group"
                title="Click to Deposit or Withdraw"
              >
                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-amber-400/10 flex items-center justify-center mr-0.5 text-amber-400 shrink-0">
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
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${isBalanceMenuOpen ? 'rotate-180 text-amber-400' : ''}`} />
              </div>

              {/* Balance Click Menu: Deposit & Withdraw Options */}
              {isBalanceMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsBalanceMenuOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-800 mb-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Wallet Operations
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        ${user.walletBalance.toFixed(2)} USD
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsBalanceMenuOpen(false);
                        onOpenDeposit();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-emerald-500/15 text-left flex items-center gap-2.5 transition cursor-pointer group text-xs font-bold text-emerald-400 hover:text-emerald-300"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-white text-xs font-bold leading-tight">Deposit</div>
                        <div className="text-[10px] text-slate-400 font-normal">Add funds via Binance</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsBalanceMenuOpen(false);
                        onOpenWithdraw();
                      }}
                      className="w-full p-2.5 rounded-xl hover:bg-amber-500/15 text-left flex items-center gap-2.5 transition cursor-pointer group text-xs font-bold text-amber-400 hover:text-amber-300 mt-1"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                        <ArrowUpCircle className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="text-white text-xs font-bold leading-tight">Withdraw</div>
                        <div className="text-[10px] text-slate-400 font-normal">Cash out to Binance</div>
                      </div>
                    </button>

                    {onOpenProfile && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsBalanceMenuOpen(false);
                          onOpenProfile();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left flex items-center gap-2.5 transition cursor-pointer group text-xs font-bold text-slate-300 hover:text-white mt-1 border-t border-slate-800/80 pt-2"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-400/20 flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-bold leading-tight">My Profile Details</div>
                          <div className="text-[10px] text-slate-400 font-normal">View identity & records</div>
                        </div>
                      </button>
                    )}

                    {onOpenDepositAnalytics && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsBalanceMenuOpen(false);
                          onOpenDepositAnalytics();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-emerald-500/10 text-left flex items-center gap-2.5 transition cursor-pointer group text-xs font-bold text-emerald-400 hover:text-emerald-300 mt-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-bold leading-tight">Deposit Analytics</div>
                          <div className="text-[10px] text-slate-400 font-normal">View verified platform volume</div>
                        </div>
                      </button>
                    )}

                    {onOpenPayoutAnalytics && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsBalanceMenuOpen(false);
                          onOpenPayoutAnalytics();
                        }}
                        className="w-full p-2.5 rounded-xl hover:bg-amber-500/10 text-left flex items-center gap-2.5 transition cursor-pointer group text-xs font-bold text-amber-400 hover:text-amber-300 mt-1"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                        </div>
                        <div>
                          <div className="text-white text-xs font-bold leading-tight">Payout Analytics</div>
                          <div className="text-[10px] text-slate-400 font-normal">View live cashout proof</div>
                        </div>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

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
                title="Claim Free Weekly ($0.50) & Monthly ($1.00) Bonus"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Weekly/Monthly Bonus</span>
              </button>
            )}

            {/* Desktop version deposit option (ager moto) */}
            <button
              onClick={onOpenDeposit}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md shadow-emerald-950/40 transition cursor-pointer"
            >
              <ArrowDownCircle className="w-3.5 h-3.5 text-white" />
              <span>Deposit</span>
            </button>

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

            {/* Notification Option (In place of sound button on mobile & desktop as requested) */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-amber-300 hover:text-white transition cursor-pointer"
              title="Notifications & Notices"
              aria-label="Notifications and Notices"
            >
              <Bell className="w-4 h-4" />
              {unreadNoticeCount !== undefined && unreadNoticeCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                  {unreadNoticeCount > 9 ? '9+' : unreadNoticeCount}
                </span>
              )}
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

              {/* Player Profile Card in Drawer (Click icon or card to view profile details) */}
              <div 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenProfile?.();
                }}
                className="my-4 p-3 rounded-2xl bg-slate-950 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/40 transition cursor-pointer select-none group shadow-md"
                title="Click profile icon to view details"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Clickable Profile Icon */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsMobileMenuOpen(false);
                        onOpenProfile?.();
                      }}
                      className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500/25 to-yellow-500/20 hover:from-amber-500/40 hover:to-yellow-500/30 border border-amber-400/50 text-amber-300 font-bold text-xs flex items-center justify-center shrink-0 shadow-sm ring-2 ring-amber-400/20 group-hover:ring-amber-400/40 transform active:scale-95 transition cursor-pointer"
                      title="Click profile icon to view details"
                      aria-label="Profile Details"
                    >
                      <User className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    </button>
                    <div className="truncate">
                      <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors flex items-center gap-1">
                        <span>{user.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-emerald-400 font-bold">
                        ${user.walletBalance.toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-400 font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 shrink-0 group-hover:bg-amber-500/20 transition">
                    Details →
                  </span>
                </div>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1.5 text-xs font-semibold">
                {/* Dedicated Profile Details Link */}
                {onOpenProfile && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/60 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">My Profile Details</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">View</span>
                  </button>
                )}

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

                {/* 4 Requested Navigation Options: Deposit Analytics, Payout Analytics, Leaderboard, My Bets */}
                <div className="pt-2 pb-1 space-y-1.5 border-t border-b border-slate-800/80 my-2">
                  <div className="px-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Analytics & Gameplay
                  </div>

                  {/* 1. Deposit Analytics */}
                  {onOpenDepositAnalytics && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenDepositAnalytics();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-white">Deposit Analytics</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        Live
                      </span>
                    </button>
                  )}

                  {/* 2. Payout Analytics */}
                  {onOpenPayoutAnalytics && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenPayoutAnalytics();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">Payout Analytics</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        Proof
                      </span>
                    </button>
                  )}

                  {/* 3. Leaderboard */}
                  {onOpenLeaderboard && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenLeaderboard();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-yellow-300 border border-slate-700/60 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="font-bold text-white">Leaderboard</span>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-yellow-400 font-bold">
                        Top Rank
                      </span>
                    </button>
                  )}

                  {/* 4. My Bets */}
                  {onOpenMyBets && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenMyBets();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 border border-slate-700/60 transition cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-white">My Bets</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        History
                      </span>
                    </button>
                  )}
                </div>

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
                      <span className="font-bold">Weekly & Monthly Rewards</span>
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
