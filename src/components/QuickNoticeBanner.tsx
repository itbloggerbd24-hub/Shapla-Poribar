import React, { useState } from 'react';
import { QuickNotice } from '../types/game';
import { Megaphone, X, ChevronRight, Bell } from 'lucide-react';

interface QuickNoticeBannerProps {
  quickNotice?: QuickNotice;
  onOpenNotifications: () => void;
}

export const QuickNoticeBanner: React.FC<QuickNoticeBannerProps> = ({
  quickNotice,
  onOpenNotifications,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (!quickNotice || !quickNotice.enabled || dismissed) return null;

  return (
    <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-emerald-500/20 border-b border-amber-500/30 text-slate-100 py-1.5 px-3 sm:px-6 relative shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 text-xs">
        
        {/* Left Side: Badge + Icon + Notice Content */}
        <div 
          onClick={onOpenNotifications}
          className="flex items-center gap-2 overflow-hidden cursor-pointer group flex-1 select-none"
          title="Click to view full notice details"
        >
          <span className="shrink-0 p-1 rounded-md bg-amber-400 text-slate-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Megaphone className="w-3 h-3 animate-bounce" />
            {quickNotice.badge || 'NOTICE'}
          </span>

          <span className="font-bold text-amber-300 shrink-0 hidden sm:inline">
            {quickNotice.title}:
          </span>

          <span className="text-slate-200 text-xs truncate group-hover:text-white transition">
            {quickNotice.message}
          </span>

          <span className="hidden md:flex items-center text-[10px] text-amber-400 font-semibold shrink-0 group-hover:translate-x-0.5 transition">
            Details <ChevronRight className="w-3 h-3" />
          </span>
        </div>

        {/* Right side: Bell button + Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onOpenNotifications}
            className="p-1 rounded-md hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Notices</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
