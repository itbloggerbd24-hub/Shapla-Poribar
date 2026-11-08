import React from 'react';
import { AppNotification, QuickNotice } from '../types/game';
import { 
  Bell, 
  X, 
  Megaphone, 
  Sparkles, 
  Gift, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  quickNotice?: QuickNotice;
  onOpenDeposit?: () => void;
  onOpenReferral?: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  notifications,
  quickNotice,
  onOpenDeposit,
  onOpenReferral,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 my-6 max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Notifications & Notice Board</h2>
              <p className="text-xs text-slate-400">Latest official announcements and bonus alerts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3.5 pr-1 text-xs">
          
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
          {notifications.length === 0 && (!quickNotice || !quickNotice.enabled) ? (
            <div className="py-12 text-center text-slate-500 space-y-2">
              <Bell className="w-8 h-8 mx-auto text-slate-600" />
              <p>No new notifications at the moment.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isBonus = notif.type === 'SIGNUP_BONUS' || notif.type === 'REFERRAL_BONUS';
              const isDeposit = notif.type === 'DEPOSIT_APPROVED';

              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition shadow-sm ${
                    isBonus
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                      : isDeposit
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-200'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {isBonus ? (
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
          <span>Total {notifications.length + (quickNotice?.enabled ? 1 : 0)} updates</span>
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
