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
  RankedPlayer,
  AppNotification
} from './types/game';
import { 
  DEFAULT_ADMIN_SETTINGS, 
  DEFAULT_BONUS_CONFIG,
  sanitizeAdminSettings,
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
import { HistoryTabs, HistoryTabType } from './components/HistoryTabs';
import { DepositModal } from './components/DepositModal';
import { WithdrawModal } from './components/WithdrawModal';
import { WalletHistoryModal } from './components/WalletHistoryModal';
import { RulesModal } from './components/RulesModal';
import { AdminPanel } from './components/AdminPanel';
import { HelpDeskModal } from './components/HelpDeskModal';
import { AuthPage } from './components/AuthPage';
import { ReferralModal } from './components/ReferralModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { NotificationModal } from './components/NotificationModal';
import { ProfileModal } from './components/ProfileModal';
import { DepositAnalyticsModal } from './components/DepositAnalyticsModal';
import { PayoutAnalyticsModal } from './components/PayoutAnalyticsModal';
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
    sanitizeAdminSettings(loadFromStorage('admin_settings_usd', DEFAULT_ADMIN_SETTINGS))
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
  const allBetsRef = useRef<Bet[]>(allBets);
  useEffect(() => {
    allBetsRef.current = allBets;
  }, [allBets]);

  // Current active round (30-second duration) with high-volume display pool
  const [currentRound, setCurrentRound] = useState<Round>(() => ({
    id: 1045,
    startTime: Date.now(),
    endTime: Date.now() + 30 * 1000,
    status: 'BETTING',
    winner: null,
    shaplaTotal: 1845.50,
    poribarTotal: 2310.20,
    platformFeePercent: DEFAULT_ADMIN_SETTINGS.platformFeePercent,
    winnerMultiplier: 1.85,
    totalBetsCount: 428,
    settled: false,
  }));

  const [timeLeft, setTimeLeft] = useState<number>(30); // exactly 30s
  const [isDepositOpen, setIsDepositOpen] = useState<boolean>(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isReferralOpen, setIsReferralOpen] = useState<boolean>(false);
  const [isRewardsOpen, setIsRewardsOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isWalletHistoryOpen, setIsWalletHistoryOpen] = useState<boolean>(false);
  const [isDepositAnalyticsOpen, setIsDepositAnalyticsOpen] = useState<boolean>(false);
  const [isPayoutAnalyticsOpen, setIsPayoutAnalyticsOpen] = useState<boolean>(false);
  const [activeHistoryTab, setActiveHistoryTab] = useState<HistoryTabType>('MY_BETS');
  const [notifications, setNotifications] = useState<AppNotification[]>(() => 
    loadFromStorage('notifications_data_usd', [])
  );
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
  useEffect(() => { saveToStorage('notifications_data_usd', notifications); }, [notifications]);
  useEffect(() => {
    if (currentUser) {
      saveToStorage('active_user_session', user);
    }
  }, [user, currentUser]);

  // Sync users database, deposits, withdrawals, settings, and notifications on mount from backend
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

    authApi.fetchSettings().then((fetchedSettings) => {
      if (fetchedSettings) {
        setAdminSettings((prev) => sanitizeAdminSettings({ ...prev, ...fetchedSettings }));
      }
    });

    authApi.fetchNotifications(currentUser?.id).then((fetchedNotifs) => {
      if (fetchedNotifs && fetchedNotifs.length > 0) {
        setNotifications(fetchedNotifs);
      }
    });

    authApi.fetchBets(currentUser?.id).then((fetchedBets) => {
      if (fetchedBets && fetchedBets.length > 0) {
        setAllBets((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const newOnes = fetchedBets.filter((b: any) => !existingIds.has(b.id));
          return [...newOnes, ...prev];
        });
      }
    });
  }, [currentUser?.id]);

  const handleUpdateSettings = async (newSettings: AdminSettings) => {
    const sanitized = sanitizeAdminSettings(newSettings);
    setAdminSettings(sanitized);
    saveToStorage('admin_settings_usd', sanitized);
    await authApi.updateSettings(sanitized);
  };

  const handleGrantUserBonus = async (userId: string, amountUSD: number, note?: string) => {
    const res = await authApi.grantUserBonus(userId, amountUSD, note);
    if (res.success && res.user) {
      setAllUsers((prev) => prev.map((u) => (u.id === res.user!.id ? res.user! : u)));
      if (user.id === res.user.id) {
        setUser(res.user);
        saveToStorage('active_user_session', res.user);
      }
      if (currentUser && currentUser.id === res.user.id) {
        setCurrentUser(res.user);
      }
      authApi.fetchNotifications(user.id).then((notifs) => {
        if (notifs) setNotifications(notifs);
      });
      return true;
    }
    return false;
  };

  const handlePublishNotice = async (title: string, message: string, badge?: string) => {
    const res = await authApi.publishNotification({
      title,
      message,
      badge: badge || 'NOTICE',
      type: 'ADMIN_NOTICE',
      userId: 'all',
    });
    if (res.success && res.notification) {
      setNotifications((prev) => [res.notification, ...prev]);
      if (res.quickNotice) {
        setAdminSettings((prev) => ({ ...prev, quickNotice: res.quickNotice }));
      }
    }
  };

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

  // User has completed at least 1 approved deposit check
  const userHasApprovedDeposit = Boolean(
    user?.firstDepositDone ||
    deposits.some((d) => d.userId === user?.id && d.status === 'APPROVED')
  );

  // Claim Weekly Free Bonus (uses Admin bonusConfig every 7 days) - Persists on server and local
  const handleClaimWeekly = async () => {
    if (!userHasApprovedDeposit) {
      setIsRewardsOpen(false);
      setIsDepositOpen(true);
      return;
    }

    const bonusCfg = { ...DEFAULT_BONUS_CONFIG, ...(adminSettings.bonusConfig || {}) };
    if (!bonusCfg.bonusesEnabled || !bonusCfg.weeklyBonusEnabled || Number(bonusCfg.weeklyBonusUSD) <= 0) {
      return;
    }

    if (user?.id) {
      const res = await authApi.claimBonus(user.id, 'weekly');
      if (res.success && res.user) {
        setUser(res.user);
        setCurrentUser(res.user);
        saveToStorage('active_user_session', res.user);
        setAllUsers((prev) => prev.map((u) => (u.id === res.user!.id ? res.user! : u)));
        return;
      }
      if (res.error && !res.error.includes('Network')) {
        return;
      }
    }
    const weeklyAmt = Number(bonusCfg.weeklyBonusUSD ?? 0.50);
    setUser((u) => {
      const next = {
        ...u,
        walletBalance: Number((u.walletBalance + weeklyAmt).toFixed(2)),
        lockedBonusBalance: Number(((u.lockedBonusBalance || 0) + weeklyAmt).toFixed(2)),
        lastWeeklyClaim: Date.now(),
      };
      saveToStorage('active_user_session', next);
      return next;
    });
  };

  // Claim Monthly Free Loyalty Bonus (uses Admin bonusConfig every 30 days) - Persists on server and local
  const handleClaimMonthly = async () => {
    if (!userHasApprovedDeposit) {
      setIsRewardsOpen(false);
      setIsDepositOpen(true);
      return;
    }

    const bonusCfg = { ...DEFAULT_BONUS_CONFIG, ...(adminSettings.bonusConfig || {}) };
    if (!bonusCfg.bonusesEnabled || !bonusCfg.monthlyBonusEnabled || Number(bonusCfg.monthlyBonusUSD) <= 0) {
      return;
    }

    if (user?.id) {
      const res = await authApi.claimBonus(user.id, 'monthly');
      if (res.success && res.user) {
        setUser(res.user);
        setCurrentUser(res.user);
        saveToStorage('active_user_session', res.user);
        setAllUsers((prev) => prev.map((u) => (u.id === res.user!.id ? res.user! : u)));
        return;
      }
      if (res.error && !res.error.includes('Network')) {
        return;
      }
    }
    const monthlyAmt = Number(bonusCfg.monthlyBonusUSD ?? 1.00);
    setUser((u) => {
      const next = {
        ...u,
        walletBalance: Number((u.walletBalance + monthlyAmt).toFixed(2)),
        lockedBonusBalance: Number(((u.lockedBonusBalance || 0) + monthlyAmt).toFixed(2)),
        lastMonthlyClaim: Date.now(),
      };
      saveToStorage('active_user_session', next);
      return next;
    });
  };

  // Round Resolution: Strictly calculated based on REAL user bets staked in this round
  const resolveRound = useCallback(() => {
    setCurrentRound((prev) => {
      if (prev.settled) return prev;

      let winningOption: OptionType;

      // Extract real user bets placed in this round (excluding simulated bots)
      const currentRoundBets = allBetsRef.current.filter(
        (b) => b.roundId === prev.id && b.status === 'PENDING'
      );
      const realBets = currentRoundBets.filter((b) => !b.userId.startsWith('bot_'));

      const realShaplaTotal = realBets
        .filter((b) => b.option === 'SHAPLA')
        .reduce((sum, b) => sum + b.amount, 0);

      const realPoribarTotal = realBets
        .filter((b) => b.option === 'PORIBAR')
        .reduce((sum, b) => sum + b.amount, 0);

      if (adminSettings.forcedOutcome === 'FORCE_SHAPLA') {
        winningOption = 'SHAPLA';
      } else if (adminSettings.forcedOutcome === 'FORCE_PORIBAR') {
        winningOption = 'PORIBAR';
      } else if (realShaplaTotal > 0 || realPoribarTotal > 0) {
        // STRICT USER RULE: Calculate strictly by real bet amount!
        // Whichever side has LESS real bet money WINS! Whichever side has MORE LOSES!
        if (realShaplaTotal < realPoribarTotal) {
          winningOption = 'SHAPLA';
        } else if (realPoribarTotal < realShaplaTotal) {
          winningOption = 'PORIBAR';
        } else {
          // Exactly tied real bets: side with lesser display pool wins
          winningOption = prev.shaplaTotal <= prev.poribarTotal ? 'SHAPLA' : 'PORIBAR';
        }
      } else {
        // No real bets placed in this round: follow lesser display pool or 50/50
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

      authApi.resolveBets(prev.id, winningOption, 1 + (adminSettings.winnerProfitPercent / 100));

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
            // Seed next 30s round with high volume display pools ($1,400 - $2,600+) and ~320-480 bets for trust & realism
            const seedShapla = Number((1400 + Math.random() * 950).toFixed(2));
            const seedPoribar = Number((1450 + Math.random() * 980).toFixed(2));
            const seedBets = Math.floor(320 + Math.random() * 160);

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
              totalBetsCount: seedBets,
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

  // High-volume active simulation in USD ($) during BETTING (Keeps memory lightweight and performant)
  useEffect(() => {
    if (currentRound.status !== 'BETTING') return;

    const botInterval = setInterval(() => {
      const randomBot = BOT_PLAYERS[Math.floor(Math.random() * BOT_PLAYERS.length)];
      const targetOption: OptionType = Math.random() > 0.5 ? 'SHAPLA' : 'PORIBAR';
      const botAmounts = [15.00, 25.00, 35.00, 50.00, 75.00, 100.00, 125.00];
      const botAmount = botAmounts[Math.floor(Math.random() * botAmounts.length)];
      const extraBets = Math.floor(Math.random() * 3) + 1;

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

      setAllBets((prev) => [newBotBet, ...prev.slice(0, 99)]);
      setCurrentRound((prev) => ({
        ...prev,
        shaplaTotal: Number((targetOption === 'SHAPLA' ? prev.shaplaTotal + botAmount : prev.shaplaTotal).toFixed(2)),
        poribarTotal: Number((targetOption === 'PORIBAR' ? prev.poribarTotal + botAmount : prev.poribarTotal).toFixed(2)),
        totalBetsCount: prev.totalBetsCount + extraBets,
      }));
    }, 1800);

    return () => clearInterval(botInterval);
  }, [currentRound.status, currentRound.id]);

  // Place Bet Handler (supports min $0.20, max unlimited)
  const handlePlaceBet = (option: OptionType, amount: number) => {
    if (currentRound.status !== 'BETTING') return;
    if (amount < 0.20) return;
    if (amount > user.walletBalance) return;

    // Strict rule: cannot bet on both sides in the same round
    const existingOppositeBet = allBets.some(
      (b) => b.roundId === currentRound.id && b.userId === user.id && b.option !== option
    );
    if (existingOppositeBet) return;

    const roundedAmount = Number(amount.toFixed(2));
    const nextBal = Number((user.walletBalance - roundedAmount).toFixed(2));
    authApi.syncBalance(user.id, { walletBalance: nextBal });

    setUser((prev) => {
      const newWagered = Number(((prev.totalWagered || 0) + roundedAmount).toFixed(2));
      const newReq = prev.referralWagerRequirement 
        ? Math.max(0, Number((prev.referralWagerRequirement - roundedAmount).toFixed(2))) 
        : 0;
      const newLockedBonus = Math.max(0, Number(((prev.lockedBonusBalance || 0) - roundedAmount).toFixed(2)));
      const next = {
        ...prev,
        walletBalance: nextBal,
        lockedBonusBalance: newLockedBonus,
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
    authApi.recordBet(newBet);

    setCurrentRound((prev) => ({
      ...prev,
      shaplaTotal: Number((option === 'SHAPLA' ? prev.shaplaTotal + roundedAmount : prev.shaplaTotal).toFixed(2)),
      poribarTotal: Number((option === 'PORIBAR' ? prev.poribarTotal + roundedAmount : prev.poribarTotal).toFixed(2)),
      totalBetsCount: prev.totalBetsCount + 1,
    }));
  };

  // Deposit Submit Handler (Support Agent or Automated AI Verification)
  const handleSubmitDeposit = async (data: {
    amountUSD: number;
    binanceTxId: string;
    senderBinanceId: string;
    network?: string;
    depositType?: 'AI_BINANCE' | 'SUPPORT_AGENT';
    supportMethodName?: string;
    screenshotUrl?: string;
    userNote?: string;
  }) => {
    const isSupportAgent = data.depositType === 'SUPPORT_AGENT';
    const isAutoApproved = !isSupportAgent && data.amountUSD >= adminSettings.minDepositUSD && Boolean(data.screenshotUrl);

    const newDeposit: DepositRequest = {
      id: `DEP-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: user.id,
      userName: user.name,
      amountUSD: data.amountUSD,
      binanceTxId: data.binanceTxId,
      senderBinanceId: data.senderBinanceId,
      network: (data.network as any) || 'BINANCE_PAY',
      depositType: data.depositType || (isSupportAgent ? 'SUPPORT_AGENT' : 'AI_BINANCE'),
      supportMethodName: data.supportMethodName,
      userNote: data.userNote,
      screenshotUrl: data.screenshotUrl,
      status: isAutoApproved ? 'APPROVED' : 'PENDING',
      aiVerified: isAutoApproved,
      aiReason: isAutoApproved ? 'AI Verified: Transferred to Admin (1156528658) within 30 minutes.' : undefined,
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
      }
      // Refresh notifications for any welcome or deposit alerts
      authApi.fetchNotifications(user.id).then((notifs) => {
        if (notifs) setNotifications(notifs);
      });
      return;
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

    const withdrawableBalance = Math.max(0, Number((user.walletBalance - (user.lockedBonusBalance || 0)).toFixed(2)));
    if (data.amountUSD > withdrawableBalance) {
      alert(`Bonus funds cannot be withdrawn directly! Play bets with your bonus to unlock it into withdrawable cash. Available: $${withdrawableBalance.toFixed(2)} USD.`);
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
    const isApproved = await authApi.approveDeposit(depositId);
    if (isApproved) {
      const updatedUsers = await authApi.fetchUsers();
      if (updatedUsers && updatedUsers.length > 0) {
        setAllUsers(updatedUsers);
        const me = updatedUsers.find((u) => u.id === user.id);
        if (me) {
          setUser(me);
          saveToStorage('active_user_session', me);
        }
      }
      authApi.fetchNotifications(user.id).then((notifs) => {
        if (notifs) setNotifications(notifs);
      });
    }

    setDeposits((prev) =>
      prev.map((d) => {
        if (d.id === depositId && d.status === 'PENDING') {
          if (!isApproved) {
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
          }
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

  // 0. If logged into Admin Console: render strictly Admin Panel ONLY (zero main website elements)
  if (isAdminView) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-3 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
        <AdminPanel
          settings={adminSettings}
          onUpdateSettings={handleUpdateSettings}
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
          onGrantUserBonus={handleGrantUserBonus}
          onToggleSuspendUser={handleToggleSuspendUser}
          onPublishNotice={handlePublishNotice}
          allBets={allBets}
          onCloseAdmin={() => {
            setIsAdminView(false);
            if (window.location.hash === '##admin' || window.location.hash === '#admin') {
              window.history.pushState('', document.title, window.location.pathname + window.location.search);
            }
          }}
        />
      </div>
    );
  }

  // 1. If not logged in and not admin view: show AuthPage (Login/Register/Forgot)
  if (!currentUser && !isAdminView) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-['Plus_Jakarta_Sans',sans-serif]">
        <AuthPage
          onLoginSuccess={handleLoginSuccess}
          onLogoSecretClick={handleLogoClick}
          adminSettings={adminSettings}
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

        <HelpDeskModal
          user={currentUser}
          adminSettings={adminSettings}
          onSubmitDeposit={handleSubmitDeposit}
          onApproveDeposit={handleApproveDeposit}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Header (Quick Notification Icon replaces sound on header bar) */}
      <Header
        user={user}
        adminSettings={adminSettings}
        onOpenDeposit={() => {
          setIsNotificationOpen(false);
          setIsWithdrawOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsDepositOpen(true);
        }}
        onOpenWithdraw={() => {
          setIsDepositOpen(false);
          setIsNotificationOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsWithdrawOpen(true);
        }}
        onOpenRules={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsNotificationOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsRulesOpen(true);
        }}
        onOpenReferral={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsNotificationOpen(false);
          setIsRulesOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsReferralOpen(true);
        }}
        onOpenRewards={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsNotificationOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsProfileOpen(false);
          setIsRewardsOpen(true);
        }}
        onOpenNotifications={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsNotificationOpen(true);
          setNotifications((prev) => {
            const updated = prev.map((n) => ({ ...n, isRead: true }));
            saveToStorage('notifications_data_usd', updated);
            return updated;
          });
        }}
        onOpenProfile={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsNotificationOpen(false);
          setIsDepositAnalyticsOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setIsWalletHistoryOpen(false);
          setIsProfileOpen(true);
        }}
        onOpenWalletHistory={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsNotificationOpen(false);
          setIsProfileOpen(false);
          setIsDepositAnalyticsOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setIsWalletHistoryOpen(true);
        }}
        onOpenDepositAnalytics={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsNotificationOpen(false);
          setIsProfileOpen(false);
          setIsWalletHistoryOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setIsDepositAnalyticsOpen(false);
          setActiveHistoryTab('DEPOSIT_ANALYTICS');
          setTimeout(() => {
            const el = document.getElementById('history-tabs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
        onOpenPayoutAnalytics={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsNotificationOpen(false);
          setIsProfileOpen(false);
          setIsWalletHistoryOpen(false);
          setIsDepositAnalyticsOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setActiveHistoryTab('PAYOUT_ANALYTICS');
          setTimeout(() => {
            const el = document.getElementById('history-tabs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
        onOpenLeaderboard={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsNotificationOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsWalletHistoryOpen(false);
          setIsDepositAnalyticsOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setActiveHistoryTab('LEADERBOARD');
          setTimeout(() => {
            const el = document.getElementById('history-tabs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
        onOpenMyBets={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsNotificationOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsWalletHistoryOpen(false);
          setIsDepositAnalyticsOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setActiveHistoryTab('MY_BETS');
          setTimeout(() => {
            const el = document.getElementById('history-tabs-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }}
        unreadNoticeCount={notifications.filter((n) => !n.isRead).length}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        onLogoClick={() => {
          setIsDepositOpen(false);
          setIsWithdrawOpen(false);
          setIsNotificationOpen(false);
          setIsRulesOpen(false);
          setIsReferralOpen(false);
          setIsRewardsOpen(false);
          setIsProfileOpen(false);
          setIsWalletHistoryOpen(false);
          setIsDepositAnalyticsOpen(false);
          setIsPayoutAnalyticsOpen(false);
          setActiveHistoryTab('MY_BETS');
          handleLogoClick();
        }}
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
        {isWalletHistoryOpen ? (
          /* Dedicated Full Page Wallet History View */
          <WalletHistoryModal
            isOpen={true}
            onClose={() => setIsWalletHistoryOpen(false)}
            userDeposits={deposits.filter((d) => d.userId === user.id)}
            userWithdrawals={withdrawals.filter((w) => w.userId === user.id)}
            onOpenDeposit={() => {
              setIsWalletHistoryOpen(false);
              setIsDepositOpen(true);
            }}
            onOpenWithdraw={() => {
              setIsWalletHistoryOpen(false);
              setIsWithdrawOpen(true);
            }}
          />
        ) : isDepositOpen ? (
          /* Dedicated Full Page Deposit View */
          <DepositModal
            isOpen={true}
            onClose={() => setIsDepositOpen(false)}
            adminSettings={adminSettings}
            userDeposits={deposits.filter((d) => d.userId === user.id)}
            onSubmitDeposit={handleSubmitDeposit}
          />
        ) : isWithdrawOpen ? (
          /* Dedicated Full Page Withdraw View */
          <WithdrawModal
            isOpen={true}
            onClose={() => setIsWithdrawOpen(false)}
            adminSettings={adminSettings}
            user={user}
            onSubmitWithdrawal={handleSubmitWithdrawal}
          />
        ) : isNotificationOpen ? (
          /* Dedicated Full Page Notification View */
          <NotificationModal
            isOpen={true}
            onClose={() => setIsNotificationOpen(false)}
            notifications={notifications}
            quickNotice={adminSettings.quickNotice}
            onOpenDeposit={() => {
              setIsNotificationOpen(false);
              setIsDepositOpen(true);
            }}
            onOpenReferral={() => {
              setIsNotificationOpen(false);
              setIsReferralOpen(true);
            }}
          />
        ) : isRulesOpen ? (
          /* Dedicated Full Page Rules & Guide View */
          <RulesModal
            isOpen={true}
            onClose={() => setIsRulesOpen(false)}
          />
        ) : isReferralOpen ? (
          /* Dedicated Full Page Referral View */
          <ReferralModal
            isOpen={true}
            onClose={() => setIsReferralOpen(false)}
            user={user}
            adminSettings={adminSettings}
          />
        ) : isRewardsOpen ? (
          /* Dedicated Full Page Daily Rewards View */
          <DailyRewardsModal
            isOpen={true}
            onClose={() => setIsRewardsOpen(false)}
            user={user}
            adminSettings={adminSettings}
            hasDeposited={userHasApprovedDeposit}
            onOpenDeposit={() => {
              setIsRewardsOpen(false);
              setIsDepositOpen(true);
            }}
            onClaimWeekly={handleClaimWeekly}
            onClaimMonthly={handleClaimMonthly}
          />
        ) : isProfileOpen ? (
          /* Dedicated Full Page Profile Details View */
          <ProfileModal
            isOpen={true}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            onOpenDeposit={() => {
              setIsProfileOpen(false);
              setIsDepositOpen(true);
            }}
            onOpenWithdraw={() => {
              setIsProfileOpen(false);
              setIsWithdrawOpen(true);
            }}
            onOpenReferral={() => {
              setIsProfileOpen(false);
              setIsReferralOpen(true);
            }}
          />
        ) : isDepositAnalyticsOpen ? (
          /* Dedicated Full Page Deposit Analytics View */
          <DepositAnalyticsModal
            isOpen={true}
            onClose={() => setIsDepositAnalyticsOpen(false)}
            onOpenDeposit={() => {
              setIsDepositAnalyticsOpen(false);
              setIsDepositOpen(true);
            }}
            realTotalDeposit={deposits.filter((d) => d.status === 'APPROVED').reduce((sum, d) => sum + d.amountUSD, 0)}
          />
        ) : isPayoutAnalyticsOpen ? (
          /* Dedicated Full Page Payout Analytics View */
          <PayoutAnalyticsModal
            isOpen={true}
            onClose={() => setIsPayoutAnalyticsOpen(false)}
            onOpenWithdraw={() => {
              setIsPayoutAnalyticsOpen(false);
              setIsWithdrawOpen(true);
            }}
            realTotalPayout={withdrawals.filter((w) => w.status === 'APPROVED').reduce((sum, w) => sum + w.amountUSD, 0)}
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
              onOpenDeposit={() => {
                setIsNotificationOpen(false);
                setIsWithdrawOpen(false);
                setIsRulesOpen(false);
                setIsReferralOpen(false);
                setIsRewardsOpen(false);
                setIsProfileOpen(false);
                setIsWalletHistoryOpen(false);
                setIsDepositAnalyticsOpen(false);
                setIsPayoutAnalyticsOpen(false);
                setIsDepositOpen(true);
              }}
            />

            {/* 4 Tabs: 1. My Bets (first & default), 2. Leaderboard, 3. Deposit Analytics, 4. Payout Analytics */}
            <HistoryTabs
              rankings={rankings}
              userBets={allBets.filter((b) => b.userId === user.id)}
              selectedTab={activeHistoryTab}
              onSelectTab={setActiveHistoryTab}
              realTotalDeposit={deposits.filter((d) => d.status === 'APPROVED').reduce((sum, d) => sum + d.amountUSD, 0)}
              realTotalPayout={withdrawals.filter((w) => w.status === 'APPROVED').reduce((sum, w) => sum + w.amountUSD, 0)}
              onOpenDeposit={() => {
                setIsNotificationOpen(false);
                setIsWithdrawOpen(false);
                setIsRulesOpen(false);
                setIsReferralOpen(false);
                setIsRewardsOpen(false);
                setIsProfileOpen(false);
                setIsWalletHistoryOpen(false);
                setIsDepositOpen(true);
              }}
              onOpenWithdraw={() => {
                setIsNotificationOpen(false);
                setIsDepositOpen(false);
                setIsRulesOpen(false);
                setIsReferralOpen(false);
                setIsRewardsOpen(false);
                setIsProfileOpen(false);
                setIsWalletHistoryOpen(false);
                setIsWithdrawOpen(true);
              }}
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

      {/* 24/7 Live Agent Web Message Help Desk with in-chat Deposit & Agent Maya Verification */}
      <HelpDeskModal
        user={user}
        adminSettings={adminSettings}
        onSubmitDeposit={handleSubmitDeposit}
        onApproveDeposit={handleApproveDeposit}
      />

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
