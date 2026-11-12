import React, { useState } from 'react';
import { Bet, RankedPlayer } from '../types/game';
import { Trophy, User, CheckCircle2, XCircle, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { Leaderboard } from './Leaderboard';
import { DepositAnalyticsContent } from './DepositAnalyticsModal';
import { PayoutAnalyticsContent } from './PayoutAnalyticsModal';

export type HistoryTabType = 'MY_BETS' | 'LEADERBOARD' | 'DEPOSIT_ANALYTICS' | 'PAYOUT_ANALYTICS';

interface HistoryTabsProps {
  rankings: RankedPlayer[];
  userBets: Bet[];
  selectedTab?: HistoryTabType;
  onSelectTab?: (tab: HistoryTabType) => void;
  realTotalDeposit?: number;
  realTotalPayout?: number;
  onOpenDeposit?: () => void;
  onOpenWithdraw?: () => void;
}

export const HistoryTabs: React.FC<HistoryTabsProps> = ({
  rankings,
  userBets,
  selectedTab,
  onSelectTab,
  realTotalDeposit = 0,
  realTotalPayout = 0,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  // "my bets thakbe prothome jeta sob somoy select thakbe normally"
  const [internalTab, setInternalTab] = useState<HistoryTabType>('MY_BETS');
  const activeTab = selectedTab !== undefined ? selectedTab : internalTab;

  const handleTabClick = (tab: HistoryTabType) => {
    if (onSelectTab) {
      onSelectTab(tab);
    } else {
      setInternalTab(tab);
    }
  };

  return (
    <div id="history-tabs-section" className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-xl scroll-mt-20">
      
      {/* 4 Navigation Tabs: 1. My Bets (first & default), 2. Leaderboard, 3. Deposit Analytics, 4. Payout Analytics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 pb-2 mb-4 sm:mb-6 border-b border-slate-800">
        
        {/* Tab 1: My Bets (first by default) */}
        <button
          onClick={() => handleTabClick('MY_BETS')}
          className={`py-2 px-2 sm:py-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'MY_BETS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">My Bets ({userBets.length})</span>
        </button>

        {/* Tab 2: Leaderboard */}
        <button
          onClick={() => handleTabClick('LEADERBOARD')}
          className={`py-2 px-2 sm:py-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'LEADERBOARD'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Leaderboard</span>
        </button>

        {/* Tab 3: Deposit Analytics */}
        <button
          onClick={() => handleTabClick('DEPOSIT_ANALYTICS')}
          className={`py-2 px-2 sm:py-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'DEPOSIT_ANALYTICS'
              ? 'bg-emerald-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-emerald-300 hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Deposit Analytics</span>
        </button>

        {/* Tab 4: Payout Analytics */}
        <button
          onClick={() => handleTabClick('PAYOUT_ANALYTICS')}
          className={`py-2 px-2 sm:py-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition cursor-pointer text-center ${
            activeTab === 'PAYOUT_ANALYTICS'
              ? 'bg-amber-500 text-slate-950 font-black shadow-md'
              : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Payout Analytics</span>
        </button>

      </div>

      {/* Tab 1: My Bets History in USD (Normally selected by default) */}
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-medium">
                  {userBets.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {new Date(b.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`font-black uppercase tracking-wider text-xs ${
                            b.option === 'SHAPLA' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {b.option === 'SHAPLA' ? 'Shapla' : 'Poribar'}
                        </span>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Leaderboard with Daily, Weekly, Monthly, and Total Earnings in USD */}
      {activeTab === 'LEADERBOARD' && (
        <Leaderboard rankings={rankings} />
      )}

      {/* Tab 3: Deposit Analytics */}
      {activeTab === 'DEPOSIT_ANALYTICS' && (
        <DepositAnalyticsContent
          realTotalDeposit={realTotalDeposit}
          onOpenDeposit={onOpenDeposit}
        />
      )}

      {/* Tab 4: Payout Analytics */}
      {activeTab === 'PAYOUT_ANALYTICS' && (
        <PayoutAnalyticsContent
          realTotalPayout={realTotalPayout}
          onOpenWithdraw={onOpenWithdraw}
        />
      )}

    </div>
  );
};
