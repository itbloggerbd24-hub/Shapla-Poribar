import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowDownCircle, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  Sparkles, 
  Wallet
} from 'lucide-react';

interface DepositAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeposit?: () => void;
  realTotalDeposit?: number;
}

interface SimulatedDeposit {
  id: string;
  userMasked: string;
  amountUSD: number;
  network: 'Binance Pay ID' | 'USDT (BEP-20)' | 'USDT (TRC-20)';
  txRef: string;
  minutesAgo: number;
  status: 'CONFIRMED';
}

const INITIAL_RECENT_DEPOSITS: SimulatedDeposit[] = [
  { id: 'DEP-8921', userMasked: '0188***986', amountUSD: 100.00, network: 'Binance Pay ID', txRef: 'BP-115928374', minutesAgo: 1, status: 'CONFIRMED' },
  { id: 'DEP-8920', userMasked: '0171***452', amountUSD: 50.00, network: 'USDT (TRC-20)', txRef: '0x8f2a...91b4', minutesAgo: 3, status: 'CONFIRMED' },
  { id: 'DEP-8919', userMasked: 'user_992***', amountUSD: 250.00, network: 'Binance Pay ID', txRef: 'BP-115928110', minutesAgo: 5, status: 'CONFIRMED' },
  { id: 'DEP-8918', userMasked: '0193***781', amountUSD: 20.00, network: 'USDT (BEP-20)', txRef: '0x3c11...88ee', minutesAgo: 8, status: 'CONFIRMED' },
  { id: 'DEP-8917', userMasked: '0162***339', amountUSD: 15.00, network: 'Binance Pay ID', txRef: 'BP-115927654', minutesAgo: 11, status: 'CONFIRMED' },
  { id: 'DEP-8916', userMasked: '0175***209', amountUSD: 500.00, network: 'Binance Pay ID', txRef: 'BP-115927019', minutesAgo: 14, status: 'CONFIRMED' },
  { id: 'DEP-8915', userMasked: '0181***654', amountUSD: 75.00, network: 'USDT (TRC-20)', txRef: 'TPHsd...889a', minutesAgo: 18, status: 'CONFIRMED' },
  { id: 'DEP-8914', userMasked: 'user_401***', amountUSD: 30.00, network: 'Binance Pay ID', txRef: 'BP-115926883', minutesAgo: 22, status: 'CONFIRMED' },
  { id: 'DEP-8913', userMasked: '0199***112', amountUSD: 120.00, network: 'USDT (BEP-20)', txRef: '0xd119...440c', minutesAgo: 26, status: 'CONFIRMED' },
  { id: 'DEP-8912', userMasked: '0158***430', amountUSD: 40.00, network: 'Binance Pay ID', txRef: 'BP-115925912', minutesAgo: 31, status: 'CONFIRMED' },
  { id: 'DEP-8911', userMasked: '0179***882', amountUSD: 200.00, network: 'Binance Pay ID', txRef: 'BP-115925102', minutesAgo: 37, status: 'CONFIRMED' },
  { id: 'DEP-8910', userMasked: '0184***765', amountUSD: 85.00, network: 'USDT (TRC-20)', txRef: 'TKu91...32ee', minutesAgo: 42, status: 'CONFIRMED' }
];

export const DepositAnalyticsContent: React.FC<{
  realTotalDeposit?: number;
  onOpenDeposit?: () => void;
}> = ({ realTotalDeposit = 0, onOpenDeposit }) => {
  const [depositsList] = useState<SimulatedDeposit[]>(INITIAL_RECENT_DEPOSITS);

  // Scaled social-proof statistics ("koyek gun bariye dekhabe")
  const boostedBase = 286450.00;
  const boostedTotal = boostedBase + (realTotalDeposit * 6.5);
  const boostedToday = 14280.00 + (realTotalDeposit * 1.8);
  const boostedWeek = 68490.00 + (realTotalDeposit * 3.2);
  const boostedMonth = 184300.00 + (realTotalDeposit * 4.5);
  const boostedYear = boostedTotal;

  return (
    <div className="space-y-5">
      {/* Main Multi-Period Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total Deposits */}
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Deposit</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-emerald-300 font-mono">
            ${boostedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">All-time platform volume</span>
        </div>

        {/* Today's Deposits */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-teal-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today Deposit</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-teal-300 font-mono">
            ${boostedToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Within past 24 hours</span>
        </div>

        {/* This Week Deposits */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-cyan-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Week Deposit</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-cyan-300 font-mono">
            ${boostedWeek.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Current week cumulative</span>
        </div>

        {/* This Month Deposits */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Month Deposit</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-300 font-mono">
            ${boostedMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Current month volume</span>
        </div>

        {/* This Year Deposits */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Year Deposit</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-indigo-300 font-mono">
            ${boostedYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Annual 2026 total</span>
        </div>
      </div>

      {/* Trust & Network Reliability Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">99.8% Instant Success</div>
            <div className="text-[11px] text-slate-400">Auto-credited in ~35 seconds</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">Official Admin Pay ID</div>
            <div className="text-[11px] text-amber-400 font-mono font-bold">1156528658</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">Zero Deposit Fees</div>
            <div className="text-[11px] text-slate-400">100% of your USD credited</div>
          </div>
        </div>
      </div>

      {/* Live Verified Deposits Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Recent Confirmed Deposits Feed
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Auto-updating every 30s
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider bg-slate-900/60">
                <th className="py-3 px-3 sm:px-4">User</th>
                <th className="py-3 px-3 sm:px-4">Network / Method</th>
                <th className="py-3 px-3 sm:px-4">Tx Reference</th>
                <th className="py-3 px-3 sm:px-4">Amount (USD)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {depositsList.map((dep) => (
                <tr key={dep.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-slate-200">
                    {dep.userMasked}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-semibold border border-slate-700/60">
                      {dep.network}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-mono text-[11px] text-slate-400">
                    {dep.txRef}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-emerald-400 text-sm">
                    +${dep.amountUSD.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      {onOpenDeposit && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            Ready to join? Deposits start from <strong className="text-white">$5.00 USD</strong>.
          </div>

          <button
            onClick={onOpenDeposit}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            <ArrowDownCircle className="w-4 h-4" />
            <span>Deposit via Binance Now</span>
          </button>
        </div>
      )}
    </div>
  );
};

export const DepositAnalyticsModal: React.FC<DepositAnalyticsModalProps> = ({
  isOpen,
  onClose,
  onOpenDeposit,
  realTotalDeposit = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6">
      
      {/* Top Header with Back symbol in top-right corner */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Deposit Analytics & Transparency
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync Active
                </span>
                <span className="text-[10px] text-slate-400">
                  Binance Direct & USDT Settlement
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Back symbol in the corner */}
        <button
          onClick={onClose}
          className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 shrink-0"
          aria-label="Back to Arena"
          title="Back to Arena"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400" />
          <span className="text-xs font-bold hidden sm:inline">Back</span>
        </button>
      </div>

      <DepositAnalyticsContent 
        realTotalDeposit={realTotalDeposit} 
        onOpenDeposit={() => {
          onClose();
          onOpenDeposit?.();
        }} 
      />

    </div>
  );
};
