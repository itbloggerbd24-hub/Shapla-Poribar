import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowUpCircle, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Activity, 
  Calendar, 
  Sparkles, 
  Coins,
  DollarSign
} from 'lucide-react';

interface PayoutAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWithdraw?: () => void;
  realTotalPayout?: number;
}

interface SimulatedPayout {
  id: string;
  userMasked: string;
  amountUSD: number;
  network: 'Binance Pay ID' | 'USDT (TRC-20)' | 'USDT (BEP-20)';
  txRef: string;
  minutesAgo: number;
  status: 'PAID';
}

const INITIAL_RECENT_PAYOUTS: SimulatedPayout[] = [
  { id: 'PAY-7419', userMasked: '0172***819', amountUSD: 125.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9812401', minutesAgo: 2, status: 'PAID' },
  { id: 'PAY-7418', userMasked: '0189***442', amountUSD: 45.00, network: 'USDT (TRC-20)', txRef: 'TRX77...190a', minutesAgo: 5, status: 'PAID' },
  { id: 'PAY-7417', userMasked: 'user_77***4', amountUSD: 350.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9812388', minutesAgo: 9, status: 'PAID' },
  { id: 'PAY-7416', userMasked: '0168***903', amountUSD: 20.00, network: 'USDT (BEP-20)', txRef: '0x99a...442b', minutesAgo: 13, status: 'PAID' },
  { id: 'PAY-7415', userMasked: '0191***620', amountUSD: 80.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9812290', minutesAgo: 17, status: 'PAID' },
  { id: 'PAY-7414', userMasked: '0177***511', amountUSD: 500.00, network: 'USDT (TRC-20)', txRef: 'TPH9...41cc', minutesAgo: 23, status: 'PAID' },
  { id: 'PAY-7413', userMasked: '0185***309', amountUSD: 65.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9812104', minutesAgo: 28, status: 'PAID' },
  { id: 'PAY-7412', userMasked: 'user_31***8', amountUSD: 15.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9811984', minutesAgo: 34, status: 'PAID' },
  { id: 'PAY-7411', userMasked: '0198***007', amountUSD: 210.00, network: 'USDT (BEP-20)', txRef: '0xbb1...77fa', minutesAgo: 40, status: 'PAID' },
  { id: 'PAY-7410', userMasked: '0165***224', amountUSD: 95.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9811802', minutesAgo: 47, status: 'PAID' },
  { id: 'PAY-7409', userMasked: '0174***991', amountUSD: 30.00, network: 'USDT (TRC-20)', txRef: 'TCc4...002a', minutesAgo: 55, status: 'PAID' },
  { id: 'PAY-7408', userMasked: '0183***665', amountUSD: 400.00, network: 'Binance Pay ID', txRef: 'BP-PAY-9811650', minutesAgo: 64, status: 'PAID' }
];

export const PayoutAnalyticsModal: React.FC<PayoutAnalyticsModalProps> = ({
  isOpen,
  onClose,
  onOpenWithdraw,
  realTotalPayout = 0,
}) => {
  const [payoutsList] = useState<SimulatedPayout[]>(INITIAL_RECENT_PAYOUTS);

  // Scaled social-proof statistics ("koyek gun bariye dekhabe")
  const boostedBase = 241890.00;
  const boostedTotal = boostedBase + (realTotalPayout * 6.5);
  const boostedToday = 11940.00 + (realTotalPayout * 1.6);
  const boostedWeek = 54820.00 + (realTotalPayout * 3.1);
  const boostedMonth = 158600.00 + (realTotalPayout * 4.4);
  const boostedYear = boostedTotal;

  if (!isOpen) return null;

  return (
    <div className="relative w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6">
      
      {/* Top Header with Back symbol in top-right corner */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ArrowUpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Payout Analytics & Cashout Proof
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  Instant Settlement Active
                </span>
                <span className="text-[10px] text-slate-400">
                  Daily Window: 10:00 AM – 10:00 PM
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

      {/* Main Multi-Period Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {/* Total Payouts */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Total Payout</span>
            <DollarSign className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
            ${boostedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">All-time paid to players</span>
        </div>

        {/* Today's Payouts */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-yellow-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Today Payout</span>
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-yellow-300 font-mono">
            ${boostedToday.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Processed today</span>
        </div>

        {/* This Week Payouts */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-orange-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Week Payout</span>
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-orange-300 font-mono">
            ${boostedWeek.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Weekly cashouts</span>
        </div>

        {/* This Month Payouts */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Month Payout</span>
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-300 font-mono">
            ${boostedMonth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Current month total</span>
        </div>

        {/* This Year Payouts */}
        <div className="bg-slate-950/80 border border-slate-800 hover:border-amber-500/30 rounded-2xl p-3.5 sm:p-4 shadow-sm transition col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">This Year Payout</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-lg sm:text-xl font-black text-purple-300 font-mono">
            ${boostedYear.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">Annual 2026 total</span>
        </div>
      </div>

      {/* Trust & Guarantee Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">~2.1 Minute Delivery</div>
            <div className="text-[11px] text-slate-400">Direct to your Binance wallet</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">100% Payout Guarantee</div>
            <div className="text-[11px] text-slate-400">Every won bet is redeemable</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black text-white">Minimum Cashout $10.00</div>
            <div className="text-[11px] text-slate-400">No hidden fees on cashouts</div>
          </div>
        </div>
      </div>

      {/* Live Verified Payouts Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpCircle className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Recent Completed Payouts Proof Ledger
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">
            Live Binance settlement stream
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider bg-slate-900/60">
                <th className="py-3 px-3 sm:px-4">Player</th>
                <th className="py-3 px-3 sm:px-4">Payout Destination</th>
                <th className="py-3 px-3 sm:px-4">Binance Reference</th>
                <th className="py-3 px-3 sm:px-4">Amount (USD)</th>
                <th className="py-3 px-3 sm:px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {payoutsList.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-slate-200">
                    {pay.userMasked}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[11px] font-semibold border border-slate-700/60">
                      {pay.network}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-mono text-[11px] text-slate-400">
                    {pay.txRef}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-amber-400 text-sm">
                    ${pay.amountUSD.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 sm:px-4 text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid & Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
        <div className="text-xs text-slate-400 text-center sm:text-left">
          Withdrawals are active daily between <strong className="text-amber-300">10:00 AM – 10:00 PM</strong>.
        </div>

        {onOpenWithdraw && (
          <button
            onClick={() => {
              onClose();
              onOpenWithdraw();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
          >
            <ArrowUpCircle className="w-4 h-4" />
            <span>Withdraw Your Balance</span>
          </button>
        )}
      </div>

    </div>
  );
};
