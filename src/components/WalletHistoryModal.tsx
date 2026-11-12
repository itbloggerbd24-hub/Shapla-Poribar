import React, { useState } from 'react';
import { DepositRequest, WithdrawalRequest } from '../types/game';
import { 
  ArrowLeft, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard,
  Image as ImageIcon,
  ExternalLink,
  Wallet,
  Filter
} from 'lucide-react';

interface WalletHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userDeposits: DepositRequest[];
  userWithdrawals: WithdrawalRequest[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const WalletHistoryModal: React.FC<WalletHistoryModalProps> = ({
  isOpen,
  onClose,
  userDeposits,
  userWithdrawals,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSITS' | 'WITHDRAWALS'>('ALL');
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);

  if (!isOpen) return null;

  // Combine and sort by date descending
  type HistoryItem = 
    | { kind: 'DEPOSIT'; item: DepositRequest; timestamp: number }
    | { kind: 'WITHDRAWAL'; item: WithdrawalRequest; timestamp: number };

  const combinedItems: HistoryItem[] = [
    ...userDeposits.map((d) => ({ kind: 'DEPOSIT' as const, item: d, timestamp: d.createdAt })),
    ...userWithdrawals.map((w) => ({ kind: 'WITHDRAWAL' as const, item: w, timestamp: w.createdAt }))
  ].sort((a, b) => b.timestamp - a.timestamp);

  const filteredItems = combinedItems.filter((i) => {
    if (filterType === 'DEPOSITS') return i.kind === 'DEPOSIT';
    if (filterType === 'WITHDRAWALS') return i.kind === 'WITHDRAWAL';
    return true;
  });

  const totalApprovedDeposits = userDeposits
    .filter((d) => d.status === 'APPROVED')
    .reduce((sum, d) => sum + d.amountUSD, 0);

  const totalApprovedWithdrawals = userWithdrawals
    .filter((w) => w.status === 'APPROVED')
    .reduce((sum, w) => sum + w.amountUSD, 0);

  const pendingCount = 
    userDeposits.filter((d) => d.status === 'PENDING').length +
    userWithdrawals.filter((w) => w.status === 'PENDING').length;

  return (
    <div className="relative w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl space-y-6">
      
      {/* Top Header with Back symbol in top-right corner */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                Wallet History
              </h2>
              <p className="text-xs text-slate-400">
                Complete record of your Binance Deposits & Cashout Withdrawals
              </p>
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

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Deposited</div>
            <div className="text-lg font-black text-emerald-400 font-mono">
              +${totalApprovedDeposits.toFixed(2)} USD
            </div>
            <div className="text-[10px] text-slate-400">{userDeposits.length} total deposit request(s)</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ArrowDownCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Withdrawn</div>
            <div className="text-lg font-black text-amber-400 font-mono">
              -${totalApprovedWithdrawals.toFixed(2)} USD
            </div>
            <div className="text-[10px] text-slate-400">{userWithdrawals.length} total withdrawal(s)</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <ArrowUpCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400">Pending Actions</div>
            <div className="text-lg font-black text-yellow-300 font-mono">
              {pendingCount} in queue
            </div>
            <div className="text-[10px] text-slate-400">Direct Binance verification</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-none cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({combinedItems.length})
          </button>
          <button
            onClick={() => setFilterType('DEPOSITS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-none cursor-pointer ${
              filterType === 'DEPOSITS'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposits ({userDeposits.length})
          </button>
          <button
            onClick={() => setFilterType('WITHDRAWALS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex-1 sm:flex-none cursor-pointer ${
              filterType === 'WITHDRAWALS'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Withdrawals ({userWithdrawals.length})
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              onClose();
              onOpenDeposit();
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => {
              onClose();
              onOpenWithdraw();
            }}
            className="flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-700"
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Transaction Records List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs bg-slate-950/40 rounded-2xl border border-slate-800/60">
            <CreditCard className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
            <div>No transaction records found in this category.</div>
            <div className="text-[11px] text-slate-600 mt-1">
              Deposit funds via Binance to start playing or request a withdrawal when you win!
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider bg-slate-900/60">
                  <th className="py-3 px-3 sm:px-4">Type</th>
                  <th className="py-3 px-3 sm:px-4">Time</th>
                  <th className="py-3 px-3 sm:px-4">Network / Target</th>
                  <th className="py-3 px-3 sm:px-4">Reference / TxID</th>
                  <th className="py-3 px-3 sm:px-4">Amount</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredItems.map((entry) => {
                  if (entry.kind === 'DEPOSIT') {
                    const dep = entry.item;
                    return (
                      <tr key={`dep-${dep.id}`} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 px-3 sm:px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-[11px]">
                            <ArrowDownCircle className="w-3.5 h-3.5" />
                            Deposit
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono text-[11px] text-slate-400">
                          {new Date(dep.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-slate-300">
                          <div className="font-semibold text-white">
                            {dep.network || 'Binance Pay'}
                          </div>
                          {dep.senderBinanceId && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              From: {dep.senderBinanceId}
                            </div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <span>{dep.binanceTxId ? dep.binanceTxId.slice(0, 16) + (dep.binanceTxId.length > 16 ? '...' : '') : dep.id}</span>
                            {dep.screenshotUrl && (
                              <button
                                onClick={() => setSelectedSlip(dep.screenshotUrl!)}
                                className="text-amber-400 hover:text-amber-300 p-0.5 rounded"
                                title="View slip screenshot"
                              >
                                <ImageIcon className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          {dep.adminNote && (
                            <div className="text-[10px] text-rose-400 mt-0.5">Note: {dep.adminNote}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-emerald-400 text-sm">
                          +${dep.amountUSD.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          {dep.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Approved
                            </span>
                          ) : dep.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                              <Clock className="w-3 h-3 animate-spin" />
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  } else {
                    const wth = entry.item;
                    return (
                      <tr key={`wth-${wth.id}`} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 px-3 sm:px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold text-[11px]">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                            Withdrawal
                          </span>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono text-[11px] text-slate-400">
                          {new Date(wth.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-slate-300">
                          <div className="font-semibold text-white">
                            {wth.binanceType === 'PAY_ID' ? 'Binance Pay ID' : `USDT (${wth.binanceType})`}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                            To: {wth.binanceTarget}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono text-[11px] text-slate-300">
                          <div>{wth.txHash ? wth.txHash.slice(0, 16) + '...' : wth.id}</div>
                          {wth.adminNote && (
                            <div className="text-[10px] text-slate-400 mt-0.5">{wth.adminNote}</div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 font-mono font-black text-amber-300 text-sm">
                          -${wth.amountUSD.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 sm:px-4 text-right">
                          {wth.status === 'APPROVED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Paid
                            </span>
                          ) : wth.status === 'REJECTED' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold text-[10px]">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                              <Clock className="w-3 h-3 animate-spin" />
                              Processing
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slip Modal View */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center">
            <button
              onClick={() => setSelectedSlip(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              ✕
            </button>
            <h4 className="text-sm font-bold text-white mb-3">Deposit Slip Screenshot</h4>
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-slate-800">
              <img src={selectedSlip} alt="Deposit slip" className="w-full object-contain" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
