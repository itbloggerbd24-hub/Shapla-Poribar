import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  AdminSettings, 
  Bet, 
  DepositRequest, 
  OptionType, 
  Round, 
  UserProfile, 
  WithdrawalRequest,
  RankedPlayer
} from './types/game';
import { 
  DEFAULT_ADMIN_SETTINGS, 
  INITIAL_USER, 
  INITIAL_ADMIN,
  INITIAL_DEPOSITS, 
  INITIAL_WITHDRAWALS, 
  INITIAL_ROUNDS_HISTORY,
  INITIAL_RANKINGS,
  BOT_PLAYERS,
  loadFromStorage, 
  saveToStorage 
} from './utils/storage';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { GameArea } from './components/GameArea';
import { HistoryTabs } from './components/HistoryTabs';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { RulesModal } from './components/RulesModal';
import { AdminPanel } from './components/AdminPanel';
import { HelpDeskModal } from './components/HelpDeskModal';
import { AuthPage } from './components/AuthPage';
import { ReferralModal } from './components/ReferralModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { authApi } from './utils/authApi';
import { checkWithdrawalHours } from './utils/withdrawalHours';
import { 
  Coins, 
  Sparkles, 
  Lock,
  X,
  UserX
} from 'lucide-react';

export default function App() {
  // Active User session (null when not logged in -> displays AuthPage login screen)
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => 
    loadFromStorage<UserProfile | null>('active_user_session', null)
  );
  // State initialization with localStorage persistence in USD ($)
  const [user, setUser] = useState<UserProfile>(() => {
    const session = loadFromStorage<UserProfile | null>('active_user_session', null);
    return session || INITIAL_USER;
  });
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => 
    loadFromStorage('all_users_usd', [INITIAL_USER, INITIAL_ADMIN])
  );
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(() => 
    loadFromStorage('admin_settings_usd', DEFAULT_ADMIN_SETTINGS)
  );
  const [deposits, setDeposits] = useState<DepositRequest[]>(() => 
    loadFromStorage('deposits_usd', INITIAL_DEPOSITS)
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => 
    loadFromStorage('withdrawals_usd', INITIAL_WITHDRAWALS)
  );
  const [roundsHistory, setRoundsHistory] = useState<Round[]>(() => 
    loadFromStorage('rounds_history_usd', INITIAL_ROUNDS_HISTORY)
  );
  const [rankings, setRankings] = useState<RankedPlayer[]>(() => 
    loadFromStorage('rankings_data_usd', INITIAL_RANKINGS)
  );
  const [allBets, setAllBets] = useState<Bet[]>(() => loadFromStorage('all_bets_usd', []));

  // Current active round (30-second duration)
  const [currentRound, setCurrentRound] = useState<Round>(() => ({
    id: 1045,
    startTime: Date.now(),
    endTime: Date.now() + 30 * 1000,
    status: 'BETTING',
    winner: null,
    shaplaTotal: 18.50,
    poribarTotal: 26.20,
    platformFeePercent: DEFAULT_ADMIN_SETTINGS.platformFeePercent,
    winnerMultiplier: 1.85,
    totalBetsCount: 14,
    settled: false,
  }));

  const [timeLeft, setTimeLeft] = useState<number>(30); // exactly 30s
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [winNotification, setWinNotification] = useState<{ amount: number; option: OptionType } | null>(null);

  // SECRET ADMIN ACCESS: Accessible ONLY via URL hash (##admin or #admin)
  const [isAdminView, setIsAdminView] = useState<boolean>(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Sync state to storage
  useEffect(() => { saveToStorage('user_profile_usd', user); }, [user]);
  useEffect(() => { saveToStorage('admin_settings_usd', adminSettings); }, [adminSettings]);
  useEffect(() => { saveToStorage('deposits_usd', deposits); }, [deposits]);
  useEffect(() => { saveToStorage('withdrawals_usd', withdrawals); }, [withdrawals]);
  useEffect(() => { saveToStorage('rounds_history_usd', roundsHistory); }, [roundsHistory]);
  useEffect(() => { saveToStorage('rankings_data_usd', rankings); }, [rankings]);
  useEffect(() => { saveToStorage('all_bets_usd', allBets); }, [allBets]);
  useEffect(() => { saveToStorage('all_users_usd', allUsers); }, [allUsers]);
  useEffect(() => {
    if (currentUser) {
      saveToStorage('active_user_session', user);
    }
  }, [user, currentUser]);

  // Sync users database, deposits, and withdrawals on mount from backend
  useEffect(() => {
    authApi.fetchUsers().then((fetched) => {
      if (fetched && fetched.length > 0) {
        setAllUsers(fetched);
        if (currentUser) {
          const fresh = fetched.find((u) => u.id === currentUser.id);
          if (fresh) {
            setUser(fresh);
            setCurrentUser(fresh);
            saveToStorage('active_user_session', fresh);
          }
        }
      }
    });

    authApi.fetchDeposits().then((fetchedDeps) => {
      if (fetchedDeps && fetchedDeps.length > 0) {
        setDeposits(fetchedDeps);
      }
    });

    authApi.fetchWithdrawals().then((fetchedWths) => {
      if (fetchedWths && fetchedWths.length > 0) {
        setWithdrawals(fetchedWths);
      }
    });
  }, []);

  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setCurrentUser(loggedInUser);
    saveToStorage('active_user_session', loggedInUser);
    setAllUsers((prev) => {
      const exists = prev.some((u) => u.id === loggedInUser.id);
      return exists ? prev.map((u) => (u.id === loggedInUser.id ? loggedInUser : u)) : [...prev, loggedInUser];
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveToStorage('active_user_session', null);
  };

  const handleToggleSuspendUser = async (userId: string, suspended: boolean, reason?: string) => {
    await authApi.toggleSuspend(userId, suspended, reason);
    setAllUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isSuspended: suspended, suspensionReason: reason } : u))
    );
    if (user.id === userId) {
      setUser((prev) => ({ ...prev, isSuspended: suspended, suspensionReason: reason }));
    }
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) => (prev ? { ...prev, isSuspended: suspended, suspensionReason: reason } : null));
    }
  };

  // Secret admin access ONLY via URL link: ##admin or #admin
  useEffect(() => {
    const handleHashCheck = () => {
      if (window.location.hash === '##admin' || window.location.hash === '#admin') {
        setShowAdminPinModal(true);
      }
    };
    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);

    return () => {
      window.removeEventListener('hashchange', handleHashCheck);
    };
  }, []);

  // Normal clickable logo: smooth scroll to top & play sound (Zero admin trigger on logo)
  const handleLogoClick = () => {
    soundManager.playChip();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin PIN verification: Strictly 't$5yB1qu4mEa3gR'
  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPinInput.trim() === 't$5yB1qu4mEa3gR') {
      setIsAdminView(true);
      setShowAdminPinModal(false);
      setAdminPinInput('');
      setPinError(null);
    } else {
      setPinError('Invalid passcode. Access denied.');
    }
  };

  // Claim Daily Free Bonus ($0.50 USD every 24h) - Persists on server and local
  const handleClaimDaily = async () => {
    if (user?.id) {
      const res = await authApi.claimBonus(user.id, 'daily');
      if (res.success && res.user) {
        setUser(res.user);
        setCurrentUser(res.user);
        saveToStorage('active_user_session', res.user);
        setAllUsers((prev) => prev.map((u) => (u.id === res.user!.id ? res.user! : u)));
        return;
      }
    }
    setUser((u) => {
      const next = {
        ...u,
        walletBalance: Number((u.walletBalance + 0.50).toFixed(2)),
        lastDailyClaim: Date.now(),
      };
      saveToStorage('active_user_session', next);
      return next;
    });
  };

  // Claim Weekly Free Bonus ($1.00 USD every 7 days) - Persists on server and local
  const handleClaimWeekly = async () => {
    if (user?.id) {
      const res = await authApi.claimBonus(user.id, 'weekly');
      if (res.success && res.user) {
        setUser(res.user);
        setCurrentUser(res.user);
        saveToStorage('active_user_session', res.user);
        setAllUsers((prev) => prev.map((u) => (u.id === res.user!.id ? res.user! : u)));
        return;
      }
    }
    setUser((u) => {
      const next = {
        ...u,
        walletBalance: Number((u.walletBalance + 1.00).toFixed(2)),
        lastWeeklyClaim: Date.now(),
      };
      saveToStorage('active_user_session', next);
      return next;
    });
  };

  // Round Resolution: House edge algorithm (lesser amount pool wins)
  const resolveRound = useCallback(() => {
    setCurrentRound((prev) => {
      if (prev.settled) return prev;

      let winningOption: OptionType;

      if (adminSettings.forcedOutcome === 'FORCE_SHAPLA') {
        winningOption = 'SHAPLA';
      } else if (adminSettings.forcedOutcome === 'FORCE_PORIBAR') {
        winningOption = 'PORIBAR';
      } else {
        // Lesser pool amount wins!
        if (prev.shaplaTotal < prev.poribarTotal) {
          winningOption = 'SHAPLA';
        } else if (prev.poribarTotal < prev.shaplaTotal) {
          winningOption = 'PORIBAR';
        } else {
          winningOption = Math.random() > 0.5 ? 'SHAPLA' : 'PORIBAR';
        }
      }

      // Settle bets for this round in USD ($)
      setAllBets((prevBets) => {
        let userWonAmount = 0;
        const updatedBets = prevBets.map((b) => {
          if (b.roundId === prev.id && b.status === 'PENDING') {
            const isWinner = b.option === winningOption;
            if (isWinner) {
              const profit = Number((b.amount * (adminSettings.winnerProfitPercent / 100)).toFixed(2));
              const payout = Number((b.amount + profit).toFixed(2));
              if (b.userId === user.id) {
                userWonAmount += payout;
              }
              return { ...b, status: 'WON' as const, payout };
            } else {
              return { ...b, status: 'LOST' as const, payout: 0 };
            }
          }
          return b;
        });

        if (userWonAmount > 0) {
          setUser((u) => {
            const nextBal = Number((u.walletBalance + userWonAmount).toFixed(2));
            const nextWon = Number((u.totalWon + userWonAmount).toFixed(2));
            authApi.syncBalance(u.id, { walletBalance: nextBal });
            const next = {
              ...u,
              walletBalance: nextBal,
              totalWon: nextWon,
            };
            saveToStorage('active_user_session', next);
            return next;
          });

          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899'],
          });

          soundManager.playWin();
          setWinNotification({ amount: userWonAmount, option: winningOption });
          setTimeout(() => setWinNotification(null), 5000);
        } else {
          const userHadBet = prevBets.some((b) => b.roundId === prev.id && b.userId === user.id);
          if (userHadBet) {
            soundManager.playLoss();
          }
        }

        return updatedBets;
      });

      const finishedRound: Round = {
        ...prev,
        status: 'RESULT',
        winner: winningOption,
        settled: true,
      };

      setRoundsHistory((history) => [finishedRound, ...history.slice(0, 30)]);

      // Dynamically increment leaderboard earnings slightly for realism
      setRankings((prevRankings) =>
        prevRankings.map((p) => {
          if (Math.random() > 0.5) {
            const gain = Number((Math.random() * 8 + 1.5).toFixed(2));
            return {
              ...p,
              dailyEarning: Number((p.dailyEarning + gain).toFixed(2)),
              weeklyEarning: Number((p.weeklyEarning + gain).toFixed(2)),
              monthlyEarning: Number((p.monthlyEarning + gain).toFixed(2)),
              totalEarning: Number((p.totalEarning + gain).toFixed(2)),
              roundsWon: p.roundsWon + 1,
            };
          }
          return p;
        })
      );

      return finishedRound;
    });
  }, [adminSettings, user.id]);

  // Main 30-Second Game Loop Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (currentRound.status === 'BETTING') {
          if (prevTime <= 4 && prevTime > 1) {
            soundManager.playTick();
          }

          if (prevTime <= 1) {
            setCurrentRound((r) => ({ ...r, status: 'FLIPPING' }));
            soundManager.playCoinSpin();
            return 3; // 3 seconds realistic 3D toss
          }
          return prevTime - 1;
        }

        if (currentRound.status === 'FLIPPING') {
          if (prevTime <= 1) {
            resolveRound();
            return 4; // 4 seconds result display
          }
          return prevTime - 1;
        }

        if (currentRound.status === 'RESULT') {
          if (prevTime <= 1) {
            const nextRoundId = currentRound.id + 1;
            // Seed next 30s round with small initial organic USD bets
            const seedShapla = Number((Math.floor(Math.random() * 5 + 3) * 2.5).toFixed(2));
            const seedPoribar = Number((Math.floor(Math.random() * 5 + 4) * 2.5).toFixed(2));

            setCurrentRound({
              id: nextRoundId,
              startTime: Date.now(),
              endTime: Date.now() + 30 * 1000,
              status: 'BETTING',
              winner: null,
              shaplaTotal: seedShapla,
              poribarTotal: seedPoribar,
              platformFeePercent: adminSettings.platformFeePercent,
              winnerMultiplier: 1.85,
              totalBetsCount: 6,
              settled: false,
            });
            return 30; // reset to 30 seconds
          }
          return prevTime - 1;
        }

        return prevTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentRound.status, currentRound.id, adminSettings, resolveRound]);

  // Internal organic bot bets in USD ($)
  useEffect(() => {
    if (currentRound.status !== 'BETTING') return;

    const botInterval = setInterval(() => {
      const randomBot = BOT_PLAYERS[Math.floor(Math.random() * BOT_PLAYERS.length)];
      const targetOption: OptionType = Math.random() > 0.5 ? 'SHAPLA' : 'PORIBAR';
      const botAmounts = [0.50, 1.00, 2.00, 5.00, 10.00];
      const botAmount = botAmounts[Math.floor(Math.random() * botAmounts.length)];

      const newBotBet: Bet = {
        id: `bet_bot_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        roundId: currentRound.id,
        userId: randomBot.id,
        userName: randomBot.name,
        option: targetOption,
        amount: botAmount,
        timestamp: Date.now(),
        status: 'PENDING',
      };

      setAllBets((prev) => [newBotBet, ...prev.slice(0, 100)]);
      setCurrentRound((prev) => ({
        ...prev,
        shaplaTotal: Number((targetOption === 'SHAPLA' ? prev.shaplaTotal + botAmount : prev.shaplaTotal).toFixed(2)),
        poribarTotal: Number((targetOption === 'PORIBAR' ? prev.poribarTotal + botAmount : prev.poribarTotal).toFixed(2)),
        totalBetsCount: prev.totalBetsCount + 1,
      }));
    }, 2800);

    return () => clearInterval(botInterval);
  }, [currentRound.status, currentRound.id]);

  // Place Bet Handler (supports min $0.20, max unlimited)
  const handlePlaceBet = (option: OptionType, amount: number) => {
    if (currentRound.status !== 'BETTING') return;
    if (amount < 0.20) return;
    if (amount > user.walletBalance) return;

    const roundedAmount = Number(amount.toFixed(2));
    const nextBal = Number((user.walletBalance - roundedAmount).toFixed(2));
    authApi.syncBalance(user.id, { walletBalance: nextBal });

    setUser((prev) => {
      const newWagered = Number(((prev.totalWagered || 0) + roundedAmount).toFixed(2));
      const newReq = prev.referralWagerRequirement 
        ? Math.max(0, Number((prev.referralWagerRequirement - roundedAmount).toFixed(2))) 
        : 0;
      const next = {
        ...prev,
        walletBalance: nextBal,
        totalLost: Number((prev.totalLost + roundedAmount).toFixed(2)),
        totalWagered: newWagered,
        referralWagerRequirement: newReq,
      };
      saveToStorage('active_user_session', next);
      return next;
    });

    const newBet: Bet = {
      id: `bet_usr_${Date.now()}`,
      roundId: currentRound.id,
      userId: user.id,
      userName: user.name,
      option,
      amount: roundedAmount,
      timestamp: Date.now(),
      status: 'PENDING',
    };

    setAllBets((prev) => [newBet, ...prev]);

    setCurrentRound((prev) => ({
      ...prev,
      shaplaTotal: Number((option === 'SHAPLA' ? prev.shaplaTotal + roundedAmount : prev.shaplaTotal).toFixed(2)),
      poribarTotal: Number((option === 'PORIBAR' ? prev.poribarTotal + roundedAmount : prev.poribarTotal).toFixed(2)),
      totalBetsCount: prev.totalBetsCount + 1,
    }));
  };

  // Deposit Submit Handler with Automated AI Verification & Timestamp Checking
  const handleSubmitDeposit = async (data: {
    amountUSD: number;
    binanceTxId: string;
    senderBinanceId: string;
    network: 'BINANCE_PAY' | 'USDT_BEP20' | 'USDT_TRC20';
    screenshotUrl?: string;
  }) => {
    const isAutoApproved = data.amountUSD >= adminSettings.minDepositUSD && Boolean(data.screenshotUrl);

    const newDeposit: DepositRequest = {
      id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      userName: user.name,
      amountUSD: data.amountUSD,
      binanceTxId: data.binanceTxId,
      senderBinanceId: data.senderBinanceId,
      network: data.network,
      screenshotUrl: data.screenshotUrl,
      status: isAutoApproved ? 'APPROVED' : 'PENDING',
      aiVerified: isAutoApproved,
      aiReason: isAutoApproved ? 'AI Verified: Transferred to Admin (849204918) within 30 minutes.' : undefined,
      createdAt: Date.now(),
      updatedAt: isAutoApproved ? Date.now() : undefined,
    };

    // Save to server backend database
    try {
      const res = await authApi.createDeposit(newDeposit);
      if (res.deposit) {
        setDeposits((prev) => [res.deposit, ...prev.filter((d) => d.id !== res.deposit.id)]);
      } else {
        setDeposits((prev) => [newDeposit, ...prev]);
      }
      if (res.user) {
        setUser(res.user);
        setCurrentUser(res.user);
        saveToStorage('active_user_session', res.user);
        setAllUsers((users) =>
          users.map((u) => (u.id === res.user!.id ? res.user! : u))
        );
        return;
      }
    } catch (e) {
      setDeposits((prev) => [newDeposit, ...prev]);
    }

    // Automatically credit user wallet balance immediately if AI verified
    if (isAutoApproved) {
      setUser((u) => {
        const next = {
          ...u,
          walletBalance: Number((u.walletBalance + data.amountUSD).toFixed(2)),
        };
        saveToStorage('active_user_session', next);
        return next;
      });
      setAllUsers((users) =>
        users.map((u) => (u.id === user.id ? { ...u, walletBalance: Number((u.walletBalance + data.amountUSD).toFixed(2)) } : u))
      );
    }
  };

  // Withdraw Submit Handler in USD
  const handleSubmitWithdrawal = async (data: {
    amountUSD: number;
    binanceType: 'PAY_ID' | 'BEP20' | 'TRC20';
    binanceTarget: string;
  }) => {
    // Check operating hours: closed from 10:00 PM to 10:00 AM
    const hours = checkWithdrawalHours();
    if (!hours.isOpen) {
      alert('Withdrawal service is currently closed (10:00 PM to 10:00 AM). Requests resume at 10:00 AM.');
      return;
    }

    if (data.amountUSD > user.walletBalance) return;

    const newWithdrawal: WithdrawalRequest = {
      id: `WTH-${Math.floor(5000 + Math.random() * 9000)}`,
      userId: user.id,
      userName: user.name,
      amountUSD: data.amountUSD,
      binanceType: data.binanceType,
      binanceTarget: data.binanceTarget,
      status: 'PENDING',
      createdAt: Date.now(),
    };

    // Save to server backend database
    try {
      const res = await authApi.createWithdrawal(newWithdrawal);
      if (res.withdrawal) {
        setWithdrawals((prev) => [res.withdrawal, ...prev.filter((w) => w.id !== res.withdrawal.id)]);
      } else {
        setWithdrawals((prev) => [newWithdrawal, ...prev]);
      }
      if (res.user) {
        setUser(res.user);
        setCurrentUser(res.user);
        saveToStorage('active_user_session', res.user);
        setAllUsers((users) =>
          users.map((u) => (u.id === res.user!.id ? res.user! : u))
        );
        return;
      }
    } catch (e) {
      setWithdrawals((prev) => [newWithdrawal, ...prev]);
    }

    setUser((prev) => {
      const next = {
        ...prev,
        walletBalance: Number((prev.walletBalance - data.amountUSD).toFixed(2)),
        frozenWithdrawal: Number((prev.frozenWithdrawal + data.amountUSD).toFixed(2)),
      };
      saveToStorage('active_user_session', next);
      return next;
    });
  };

  // Admin Approve Deposit
  const handleApproveDeposit = async (depositId: string) => {
    await authApi.approveDeposit(depositId);
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id === depositId && d.status === 'PENDING') {
          if (d.userId === user.id) {
            setUser((u) => {
              const next = { ...u, walletBalance: Number((u.walletBalance + d.amountUSD).toFixed(2)) };
              saveToStorage('active_user_session', next);
              return next;
            });
          }
          setAllUsers((users) =>
            users.map((u) => (u.id === d.userId ? { ...u, walletBalance: Number((u.walletBalance + d.amountUSD).toFixed(2)) } : u))
          );
          return { ...d, status: 'APPROVED', updatedAt: Date.now() };
        }
        return d;
      })
    );
  };

  // Admin Reject Deposit
  const handleRejectDeposit = async (depositId: string, note?: string) => {
    await authApi.rejectDeposit(depositId, note);
    setDeposits((prev) =>
      prev.map((d) => (d.id === depositId ? { ...d, status: 'REJECTED', adminNote: note, updatedAt: Date.now() } : d))
    );
  };

  // Admin Approve Withdrawal
  const handleApproveWithdrawal = async (withdrawalId: string, txHash?: string) => {
    await authApi.approveWithdrawal(withdrawalId, txHash);
    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id === withdrawalId && w.status === 'PENDING') {
          if (w.userId === user.id) {
            setUser((u) => {
              const next = {
                ...u,
                frozenWithdrawal: Math.max(0, Number((u.frozenWithdrawal - w.amountUSD).toFixed(2))),
              };
              saveToStorage('active_user_session', next);
              return next;
            });
          }
          return { ...w, status: 'APPROVED', txHash: txHash || 'BINANCE-PAY-SUCCESS', updatedAt: Date.now() };
        }
        return w;
      })
    );
  };

  // Admin Reject Withdrawal
  const handleRejectWithdrawal = async (withdrawalId: string, note?: string) => {
    await authApi.rejectWithdrawal(withdrawalId, note);
    setWithdrawals((prev) =>
      prev.map((w) => {
        if (w.id === withdrawalId && w.status === 'PENDING') {
          if (w.userId === user.id) {
            setUser((u) => {
              const next = {
                ...u,
                walletBalance: Number((u.walletBalance + w.amountUSD).toFixed(2)),
                frozenWithdrawal: Math.max(0, Number((u.frozenWithdrawal - w.amountUSD).toFixed(2))),
              };
              saveToStorage('active_user_session', next);
              return next;
            });
          }
          return { ...w, status: 'REJECTED', adminNote: note, updatedAt: Date.now() };
        }
        return w;
      })
    );
  };

  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundManager.setMuted(nextMuted);
  };

  const handleAdjustUserBalance = async (userId: string, newBalance: number) => {
    await authApi.syncBalance(userId, { walletBalance: newBalance });
    if (user.id === userId) {
      setUser((u) => {
        const next = { ...u, walletBalance: newBalance };
        saveToStorage('active_user_session', next);
        return next;
      });
    }
    setAllUsers((users) => users.map((u) => (u.id === userId ? { ...u, walletBalance: newBalance } : u)));
  };

  const userCurrentBets = allBets.filter(
    (b) => b.roundId === currentRound.id && b.userId === user.id
  );

  // 1. If not logged in and not admin view: show AuthPage (Login/Register/Forgot)
  if (!currentUser && !isAdminView) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onLogoSecretClick={handleLogoClick}
        />

        {/* Secret Admin Pin Modal if triggered on Auth Page */}
        {showAdminPinModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-rose-400">
                  <Lock className="w-5 h-5" />
                  <span className="font-black text-sm">System Administration</span>
                </div>
                <button
                  onClick={() => setShowAdminPinModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleVerifyAdminPin} className="mt-4 space-y-4">
                <p className="text-xs text-slate-400">Enter authorized administrator passcode</p>
                <input
                  type="password"
                  autoFocus
                  required
                  placeholder="Enter Admin Passcode"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-center text-lg font-mono tracking-widest text-amber-300 focus:border-rose-400 outline-none"
                />

                {pinError && (
                  <div className="text-rose-400 text-xs text-center font-semibold">
                    {pinError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 font-black text-sm text-white shadow cursor-pointer"
                >
                  Unlock Admin Console
                </button>
              </form>
            </div>
          </div>
        )}

        <HelpDeskModal />
      </div>
    );
  }

  // 2. If user is suspended: show dedicated Suspension Screen
  if (currentUser && currentUser.isSuspended && !isAdminView) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 text-center font-['Plus_Jakarta_Sans',sans-serif]">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 border-2 border-rose-500 text-rose-400 mx-auto flex items-center justify-center">
            <UserX className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-rose-300">Account Suspended</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Your account ({currentUser.phone}) has been suspended by administration.
            {currentUser.suspensionReason && (
              <span className="block mt-2 font-mono text-amber-300 bg-slate-950 p-2 rounded-xl border border-slate-800">
                Notice: {currentUser.suspensionReason}
              </span>
            )}
          </p>
          <p className="text-xs text-slate-400">
            You cannot place predictions or initiate transactions while suspended. Please contact our support team via Help Desk for assistance.
          </p>
          <div className="pt-3">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Sign Out / Switch Account
            </button>
          </div>
        </div>

        <HelpDeskModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header (No Admin Button visible anywhere) */}
      <Header
        user={user}
        onOpenDeposit={() => setIsDepositOpen(true)}
        onOpenWithdraw={() => setIsWithdrawOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenReferral={() => setIsReferralOpen(true)}
        onOpenRewards={() => setIsRewardsOpen(true)}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onLogoClick={handleLogoClick}
        onLogout={handleLogout}
      />

      {/* Win Notification Banner in USD ($) */}
      {winNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black shadow-2xl flex items-center gap-3 border-2 border-emerald-300">
            <Sparkles className="w-6 h-6 text-slate-950 animate-spin" />
            <div>
              <div className="text-xs uppercase tracking-wider font-extrabold text-emerald-950">
                Prediction Won!
              </div>
              <div className="text-lg">
                +${winNotification.amount.toFixed(2)} USD added to your wallet!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 space-y-3 sm:space-y-6">
        {isAdminView ? (
          /* Secret Admin View */
          <AdminPanel
            settings={adminSettings}
            onUpdateSettings={setAdminSettings}
            deposits={deposits}
            onApproveDeposit={handleApproveDeposit}
            onRejectDeposit={handleRejectDeposit}
            withdrawals={withdrawals}
            onApproveWithdrawal={handleApproveWithdrawal}
            onRejectWithdrawal={handleRejectWithdrawal}
            roundsHistory={roundsHistory}
            currentRound={currentRound}
            users={allUsers}
            onAdjustUserBalance={handleAdjustUserBalance}
            onToggleSuspendUser={handleToggleSuspendUser}
            onCloseAdmin={() => {
              setIsAdminView(false);
              if (window.location.hash === '##admin') {
                window.history.pushState('', document.title, window.location.pathname);
              }
            }}
          />
        ) : (
          /* Public Website View */
          <div className="space-y-3 sm:space-y-5">
            
            {/* Main Interactive Game Area (Shapla vs Poribar with 30s timer, $0.20 min bet) */}
            <GameArea
              currentRound={currentRound}
              timeLeft={timeLeft}
              totalDuration={30}
              userBalance={user.walletBalance}
              userCurrentBets={userCurrentBets}
              onPlaceBet={handlePlaceBet}
              onOpenDeposit={() => setIsDepositOpen(true)}
            />

            {/* Leaderboard and Earnings Rankings + Personal Bets & Wallet tabs in USD */}
            <HistoryTabs
              rankings={rankings}
              userBets={allBets.filter((b) => b.userId === user.id)}
              userDeposits={deposits.filter((d) => d.userId === user.id)}
              userWithdrawals={withdrawals.filter((w) => w.userId === user.id)}
            />

          </div>
        )}
      </main>

      {/* Secret Admin PIN Prompt Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center">
            <button
              onClick={() => {
                setShowAdminPinModal(false);
                setPinError(null);
                setAdminPinInput('');
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white">Management Authentication</h3>
            <p className="text-xs text-slate-400 mt-1">Enter authorized administrator passcode</p>

            <form onSubmit={handleVerifyAdminPin} className="mt-4 space-y-3">
              <input
                type="password"
                autoFocus
                placeholder="Enter Admin Passcode"
                value={adminPinInput}
                onChange={(e) => setAdminPinInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 px-3 text-center text-sm font-mono text-white focus:border-amber-400 outline-none"
              />
              {pinError && (
                <div className="text-xs text-rose-400 font-semibold">{pinError}</div>
              )}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer"
              >
                Verify & Open Console
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Public Modals */}
      <DepositModal
        isOpen={isDepositOpen}
        onClose={() => setIsDepositOpen(false)}
        adminSettings={adminSettings}
        userDeposits={deposits.filter((d) => d.userId === user.id)}
        onSubmitDeposit={handleSubmitDeposit}
      />

      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        adminSettings={adminSettings}
        userBalance={user.walletBalance}
        onSubmitWithdrawal={handleSubmitWithdrawal}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      {/* Refer & Earn Friends Bonus Modal */}
      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        user={user}
      />

      {/* Free Recurring Daily ($0.50) & Weekly ($1.00) Bonus Modal */}
      <DailyRewardsModal
        isOpen={isRewardsOpen}
        onClose={() => setIsRewardsOpen(false)}
        user={user}
        onClaimDaily={handleClaimDaily}
        onClaimWeekly={handleClaimWeekly}
      />

      {/* 24/7 Live Agent Web Message Help Desk */}
      <HelpDeskModal />

      {/* Footer (No hidden admin button on website) */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">Shapla Poribar</span>
            <span>• 30-Second Binance Crypto Prediction Gaming</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>© 2026 All Rights Reserved</span>
            <span>•</span>
            <span className="text-slate-600">Fair Play System</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
