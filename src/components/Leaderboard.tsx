import React, { useState } from 'react';
import { RankedPlayer } from '../types/game';
import { Trophy } from 'lucide-react';

interface LeaderboardProps {
  rankings: RankedPlayer[];
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ rankings }) => {
  const [filterPeriod, setFilterPeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'TOTAL'>('DAILY');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const sortedPlayers = [...rankings]
    .sort((a, b) => {
      if (filterPeriod === 'DAILY') return b.dailyEarning - a.dailyEarning;
      if (filterPeriod === 'WEEKLY') return b.weeklyEarning - a.weeklyEarning;
      if (filterPeriod === 'MONTHLY') return b.monthlyEarning - a.monthlyEarning;
      return b.totalEarning - a.totalEarning;
    })
    .slice(0, 50);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(sortedPlayers.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPlayers = sortedPlayers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const top3 = sortedPlayers.slice(0, 3);

  const handlePeriodChange = (period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'TOTAL') => {
    setFilterPeriod(period);
    setCurrentPage(1);
  };

  const getPrimaryAmount = (p: RankedPlayer) => {
    if (filterPeriod === 'DAILY') return p.dailyEarning;
    if (filterPeriod === 'WEEKLY') return p.weeklyEarning;
    if (filterPeriod === 'MONTHLY') return p.monthlyEarning;
    return p.totalEarning;
  };

  return (
    <div className="space-y-6">
      
      {/* Period Selection Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
        <div>
          <h3 className="text-base font-black text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Top 50 Winners Leaderboard (USD)</span>
          </h3>
          <p className="text-xs text-slate-400">
            Real-time player earnings and rankings in US Dollars (Top 50 • 10 per page)
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1 text-xs">
          <button
            onClick={() => handlePeriodChange('DAILY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterPeriod === 'DAILY'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => handlePeriodChange('WEEKLY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterPeriod === 'WEEKLY'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => handlePeriodChange('MONTHLY')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterPeriod === 'MONTHLY'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => handlePeriodChange('TOTAL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterPeriod === 'TOTAL'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All-Time
          </button>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {currentPage === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* #2 Silver */}
          {top3[1] && (
            <div className="order-2 md:order-1 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/60 rounded-2xl p-4 flex flex-col items-center text-center relative shadow-lg">
              <div className="w-8 h-8 rounded-full bg-slate-400 text-slate-950 font-black text-xs flex items-center justify-center absolute -top-3 shadow-md border-2 border-slate-300">
                #2
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-slate-600 to-slate-400 flex items-center justify-center text-white font-black text-base shadow-inner my-2">
                {top3[1].avatarSeed}
              </div>
              <h4 className="font-bold text-white text-sm">{top3[1].name}</h4>
              <div className="text-xl font-black text-slate-300 font-mono mt-1">
                ${getPrimaryAmount(top3[1]).toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {filterPeriod} Profit
              </span>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 w-full grid grid-cols-2 text-[10px] text-slate-400">
                <div>Total: ${top3[1].totalEarning.toFixed(2)}</div>
                <div>Won: {top3[1].roundsWon} Rnds</div>
              </div>
            </div>
          )}

          {/* #1 Gold */}
          {top3[0] && (
            <div className="order-1 md:order-2 bg-gradient-to-b from-amber-950/40 via-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-2xl p-5 flex flex-col items-center text-center relative shadow-xl ring-2 ring-amber-500/20 md:-translate-y-2">
              <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center absolute -top-4 shadow-lg border-2 border-amber-200 animate-pulse">
                👑 #1
              </div>
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 flex items-center justify-center text-slate-950 font-black text-lg shadow-lg my-2 ring-4 ring-amber-400/20">
                {top3[0].avatarSeed}
              </div>
              <h4 className="font-black text-amber-200 text-base">{top3[0].name}</h4>
              <div className="text-2xl font-black text-amber-400 font-mono mt-1">
                ${getPrimaryAmount(top3[0]).toFixed(2)}
              </div>
              <span className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">
                Top {filterPeriod} Winner
              </span>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 w-full grid grid-cols-2 text-xs font-semibold text-slate-300">
                <div>Total: ${top3[0].totalEarning.toFixed(2)}</div>
                <div className="text-amber-400">Won: {top3[0].roundsWon} Rnds</div>
              </div>
            </div>
          )}

          {/* #3 Bronze */}
          {top3[2] && (
            <div className="order-3 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-900/40 rounded-2xl p-4 flex flex-col items-center text-center relative shadow-lg">
              <div className="w-8 h-8 rounded-full bg-amber-700 text-amber-100 font-black text-xs flex items-center justify-center absolute -top-3 shadow-md border-2 border-amber-600">
                #3
              </div>
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-800 to-amber-600 flex items-center justify-center text-amber-100 font-black text-base shadow-inner my-2">
                {top3[2].avatarSeed}
              </div>
              <h4 className="font-bold text-white text-sm">{top3[2].name}</h4>
              <div className="text-xl font-black text-amber-300 font-mono mt-1">
                ${getPrimaryAmount(top3[2]).toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {filterPeriod} Profit
              </span>
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 w-full grid grid-cols-2 text-[10px] text-slate-400">
                <div>Total: ${top3[2].totalEarning.toFixed(2)}</div>
                <div>Won: {top3[2].roundsWon} Rnds</div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Comprehensive Earnings Table in USD ($) */}
      <div className="overflow-x-auto bg-slate-950/70 border border-slate-800 rounded-2xl p-3">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Player</th>
              <th className="py-2.5 px-3">Daily Earning</th>
              <th className="py-2.5 px-3">Weekly Earning</th>
              <th className="py-2.5 px-3">Monthly Earning</th>
              <th className="py-2.5 px-3">Total Earning</th>
              <th className="py-2.5 px-3 text-right">Rounds Won</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-medium">
            {paginatedPlayers.map((player, idx) => {
              const rankNum = startIndex + idx + 1;
              return (
                <tr key={player.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg font-mono font-bold text-xs ${
                      rankNum === 1
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : rankNum === 2
                        ? 'bg-slate-300 text-slate-950 font-black'
                        : rankNum === 3
                        ? 'bg-amber-700 text-amber-100 font-black'
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      #{rankNum}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-200 font-bold text-xs flex items-center justify-center">
                        {player.avatarSeed}
                      </div>
                      <span className="font-bold text-white">{player.name}</span>
                    </div>
                  </td>
                  <td className={`py-3 px-3 font-mono font-bold ${
                    filterPeriod === 'DAILY' ? 'text-amber-400 font-black text-sm' : 'text-slate-300'
                  }`}>
                    ${player.dailyEarning.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 font-mono font-bold ${
                    filterPeriod === 'WEEKLY' ? 'text-amber-400 font-black text-sm' : 'text-slate-300'
                  }`}>
                    ${player.weeklyEarning.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 font-mono font-bold ${
                    filterPeriod === 'MONTHLY' ? 'text-amber-400 font-black text-sm' : 'text-slate-300'
                  }`}>
                    ${player.monthlyEarning.toFixed(2)}
                  </td>
                  <td className={`py-3 px-3 font-mono font-bold ${
                    filterPeriod === 'TOTAL' ? 'text-amber-400 font-black text-sm' : 'text-emerald-400'
                  }`}>
                    ${player.totalEarning.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-bold">
                      {player.roundsWon} Won ({player.winRate}%)
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-400 text-[11px]">
            Showing <strong className="text-white">{startIndex + 1}</strong> to{' '}
            <strong className="text-white">
              {Math.min(startIndex + ITEMS_PER_PAGE, sortedPlayers.length)}
            </strong>{' '}
            of <strong className="text-amber-400">{sortedPlayers.length}</strong> Players (Top 50)
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                currentPage === 1
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-black transition cursor-pointer ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition cursor-pointer ${
                currentPage === totalPages
                  ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                  : 'border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
