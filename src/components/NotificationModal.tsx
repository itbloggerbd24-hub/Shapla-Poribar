import React from 'react';
import { AdminSettings, AppNotification, QuickNotice } from '../types/game';
import { DEFAULT_BONUS_CONFIG } from '../utils/storage';
import { 
  Bell, 
  ArrowLeft,
  Megaphone, 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  ExternalLink
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  quickNotice?: QuickNotice;
  adminSettings?: AdminSettings;
  onOpenDeposit?: () => void;
  onOpenReferral?: () => void;
  onOpenRewards?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  quickNotice,
  adminSettings,
  onOpenDeposit,
  onOpenReferral,
  onOpenRewards,
}) => {
  if (!isOpen) return null;

  const bonusCfg = {
    ...DEFAULT_BONUS_CONFIG,
    ...(adminSettings?.bonusConfig || {}),
  };
  const isFestivalDepositPct = bonusCfg.festivalBonusMode === 'DEPOSIT_PERCENT';
  const festivalAmt = Number(bonusCfg.festivalBonusAmountUSD ?? 0);
  const festivalPct = Number(bonusCfg.festivalBonusPercent ?? 0);
  const isFestivalActive = Boolean(
    bonusCfg.bonusesEnabled &&
    bonusCfg.festivalBonusEnabled &&
    (isFestivalDepositPct ? festivalPct > 0 : festivalAmt > 0)
  );
  const totalCount = notifications.length + (quickNotice?.enabled ? 1 : 0) + (isFestivalActive ? 1 : 0);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-2 sm:py-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 space-y-4">
        
        {/* Back Symbol at the very corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 hover:border-amber-500/50 shadow-md group"
          title="Back to Arena"
          aria-label="Back to Arena"
        >
          <ArrowLeft className="w-5 h-5 text-amber-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Page Header in a single column with text under the symbol */}
        <div className="pb-4 sm:pb-6 border-b border-slate-800 pr-14 flex flex-col gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-md">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">Notifications & Notice Board</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold">
                {totalCount} Updates
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Official platform announcements, special festival offers, and deposit updates</p>
          </div>
        </div>

        {/* Page Content */}
        <div className="space-y-3.5 pr-1 text-xs">
          
          {/* Special Festival / Occasion Offer Notice Card */}
          {isFestivalActive && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-fuchsia-500/20 via-amber-500/10 to-slate-950 border border-fuchsia-500/50 shadow-lg relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shadow">
                    <Sparkles className="w-3 h-3" />
                    SPECIAL FESTIVAL OFFER
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-xs">
                  {isFestivalDepositPct ? `+${festivalPct}% ON DEPOSIT` : `+$${festivalAmt.toFixed(2)} USD`}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-fuchsia-200 mb-1 leading-snug">
                {bonusCfg.festivalBonusTitle || 'Special Festival Bonus Offer'}
              </h3>
              <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                {bonusCfg.festivalBonusDescription || 'Celebrate this special occasion with an exclusive bonus reward from Shapla Poribar!'}
              </p>
              {isFestivalDepositPct && onOpenDeposit ? (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDeposit();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-fuchsia-500 hover:from-amber-300 hover:to-fuchsia-400 text-slate-950 font-black text-[11px] inline-flex items-center gap-1.5 shadow cursor-pointer transition"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Deposit Now & Get +{festivalPct}% Bonus</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              ) : onOpenRewards && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenRewards();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-fuchsia-500 to-amber-400 hover:from-fuchsia-400 hover:to-amber-300 text-slate-950 font-black text-[11px] inline-flex items-center gap-1.5 shadow cursor-pointer transition"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Open Reward Center & Claim</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin Pinned Official Announcement */}
          {quickNotice && quickNotice.enabled && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-slate-950 border border-amber-500/40 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-2 mb-2">
                <span className="p-1 rounded-lg bg-amber-400 text-slate-950 font-black text-[10px] uppercase flex items-center gap-1 shadow">
                  <Megaphone className="w-3 h-3" />
                  {quickNotice.badge || 'OFFICIAL NOTICE'}
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  {quickNotice.updatedAt ? new Date(quickNotice.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Live Notice'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-amber-200 mb-1 leading-snug">
                {quickNotice.title}
              </h3>
              <p className="text-slate-200 text-xs leading-relaxed whitespace-pre-line">
                {quickNotice.message}
              </p>
            </div>
          )}

          {/* List of user and system notifications */}
          {notifications.length === 0 && (!quickNotice || !quickNotice.enabled) && !isFestivalActive ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-600" />
              <p>No new notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isFestival = notif.type === 'FESTIVAL_BONUS';
              const isBonus = notif.type === 'SIGNUP_BONUS' || notif.type === 'REFERRAL_BONUS';
              const isDeposit = notif.type === 'DEPOSIT_APPROVED';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition shadow-sm ${
                    isFestival
                      ? 'bg-fuchsia-500/10 border-fuchsia-500/40 text-fuchsia-100'
                      : isBonus
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : isDeposit
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-200'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isFestival ? (
                        <Sparkles className="w-4 h-4 text-fuchsia-400 shrink-0" />
                      ) : isBonus ? (
                        <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isDeposit ? (
                        <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      ) : (
                        <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-bold text-xs text-white">{notif.title}</span>
                    </div>

                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed pl-5 whitespace-pre-line">
                    {notif.message}
                  </p>

                  {isFestival && (isFestivalDepositPct && onOpenDeposit ? (
                    <div className="mt-2 pl-5">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDeposit();
                        }}
                        className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
                      >
                        Deposit & Claim +{festivalPct}% Bonus <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : onOpenRewards ? (
                    <div className="mt-2 pl-5">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenRewards();
                        }}
                        className="text-[11px] font-bold text-fuchsia-300 hover:text-fuchsia-200 flex items-center gap-1 cursor-pointer"
                      >
                        View in Reward Center <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null)}

                  {notif.type === 'SIGNUP_BONUS' && onOpenDeposit && (
                    <div className="mt-2 pl-5">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDeposit();
                        }}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        Deposit & Play Now <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {notif.type === 'REFERRAL_BONUS' && onOpenReferral && (
                    <div className="mt-2 pl-5">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenReferral();
                        }}
                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                      >
                        Refer More Friends <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Total {totalCount} updates</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
