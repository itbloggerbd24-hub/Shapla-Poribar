import React, { useState } from 'react';
import { Bet, DepositRequest, WithdrawalRequest, RankedPlayer } from '../types/game';
import { Trophy, User, CreditCard, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { CoinEmblem } from './CoinEmblem';
import { Leaderboard } from './Leaderboard';

interface HistoryTabsProps {
  rankings: RankedPlayer[];
  userBets: Bet[];
  userDeposits: DepositRequest[];
  userWithdrawals: WithdrawalRequest[];
}

export const HistoryTabs: React.FC<HistoryTabsProps> = ({
  rankings,
  userBets,
  userDeposits,
  userWithdrawals,
}) => {
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'MY_BETS' | 'WALLET'>('LEADERBOARD');

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl">
      
      {/* Navigation Tabs: 3-column grid perfectly fitted on mobile with no scrollbar */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 pb-2 mb-4 sm:mb-6 border-b border-slate-800">
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`py-2 px-1 sm:py-2.5 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'LEADERBOARD'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('MY_BETS')}
          className={`py-2 px-1 sm:py-2.5 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'MY_BETS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">My Bets ({userBets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('WALLET')}
          className={`py-2 px-1 sm:py-2.5 sm:px-4 rounded-xl text-[11px] sm:text-sm font-bold flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'WALLET'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Wallet History</span>
        </button>
      </div>

      {/* Tab 1: Leaderboard with Daily, Weekly, Monthly, and Total Earnings in USD */}
      {activeTab === 'LEADERBOARD' && (
        <Leaderboard rankings={rankings} />
      )}

      {/* Tab 2: My Bets History in USD */}
      {activeTab === 'MY_BETS' && (
        <div className="space-y-3">
          {userBets.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              You haven't placed any bets yet. Select Shapla or Poribar above (min $0.20) to start playing!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Choice</th>
                    <th className="py-2.5 px-3">Bet Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Result & Payout</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {userBets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <CoinEmblem side={b.option} size="sm" />
                          <span
                            className={`font-black uppercase tracking-wider text-xs ${
                              b.option === 'SHAPLA' ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {b.option}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        ${b.amount.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3">
                        {b.status === 'WON' && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Won (+85% Profit)
                          </span>
                        )}
                        {b.status === 'LOST' && (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Lost
                          </span>
                        )}
                        {b.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Active...
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black">
                        {b.status === 'WON' && (
                          <span className="text-emerald-400">
                            +${b.payout?.toFixed(2)}
                          </span>
                        )}
                        {b.status === 'LOST' && (
                          <span className="text-rose-400">-${b.amount.toFixed(2)}</span>
                        )}
                        {b.status === 'PENDING' && (
                          <span className="text-slate-400">Pending</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Wallet Deposits & Withdrawals in USD */}
      {activeTab === 'WALLET' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Deposits list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Binance Deposits (USD / USDT)
            </h4>
            {userDeposits.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl">
                No deposit records found.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userDeposits.map((dep) => (
                  <div
                    key={dep.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-mono">
                          ${dep.amountUSD.toFixed(2)} USD
                        </span>
                        {dep.screenshotUrl && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                            Slip attached
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dep.network} • Tx: {dep.binanceTxId.slice(0, 14)}...
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        dep.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : dep.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {dep.status === 'APPROVED' ? 'Approved' : dep.status === 'REJECTED' ? 'Rejected' : 'Pending Verification'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Withdrawals list */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Binance Withdrawals (Min $10.00 USD)
            </h4>
            {userWithdrawals.length === 0 ? (
              <div className="p-4 text-center text-slate-500 text-xs bg-slate-950/40 rounded-xl">
                No withdrawal records found.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {userWithdrawals.map((wth) => (
                  <div
                    key={wth.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-amber-300 font-mono">
                        ${wth.amountUSD.toFixed(2)} USD
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        To: {wth.binanceTarget.slice(0, 14)}...
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        wth.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : wth.status === 'REJECTED'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {wth.status === 'APPROVED' ? 'Paid' : wth.status === 'REJECTED' ? 'Refunded' : 'Processing'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
