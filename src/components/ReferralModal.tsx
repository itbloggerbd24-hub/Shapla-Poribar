import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { 
  X, 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Gift, 
  Trophy, 
  Flame, 
  HelpCircle,
  Coins,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onClaimMilestone?: (milestoneLevel: 5 | 10 | 20, rewardAmount: number) => void;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  user,
  onClaimMilestone,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const referralCode = user.referralCode || `SP-${user.phone ? user.phone.slice(-4) : '7788'}`;
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/?ref=${referralCode}` 
    : `https://shaplapro.com/?ref=${referralCode}`;

  const count = user.referralCount || 0;
  const bonusEarned = user.referralBonusEarned || (count * 0.50);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Shapla Poribar Prediction',
        text: `Use my invite code ${referralCode} to get $1.00 welcome bonus on Shapla Poribar!`,
        url: shareUrl,
      }).catch(() => handleCopyLink());
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-2 sm:py-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100 space-y-5">
        
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-amber-400">
              <Gift className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">Refer & Earn Program</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                +$0.50 USD
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Earn $0.50 for every friend + extra milestone bonuses</p>
          </div>
        </div>

        <div className="mt-4 space-y-4">
          
          {/* Top Summary Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                Friends Referred
              </span>
              <div className="text-2xl font-black text-white font-mono flex items-center justify-center gap-1.5">
                <Users className="w-5 h-5 text-amber-400" />
                <span>{count}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border border-amber-500/20 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-300 block mb-0.5">
                Total Bonus Earned
              </span>
              <div className="text-2xl font-black text-amber-400 font-mono flex items-center justify-center gap-1">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>${bonusEarned.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Share Referral Link Box */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Your Exclusive Referral Link:</span>
              </label>
              <span className="text-[10px] text-emerald-400 font-semibold font-mono">
                +$0.50 / Friend
              </span>
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-xl p-1.5 pl-3">
              <span className="text-xs font-mono text-slate-300 truncate flex-1">
                {shareUrl}
              </span>
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Referral Code Quick Copy */}
            <div className="flex items-center justify-between pt-1">
              <div className="text-xs text-slate-400">
                Code:{' '}
                <strong className="text-white font-mono tracking-wider font-bold">
                  {referralCode}
                </strong>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="text-xs text-amber-400 hover:underline cursor-pointer font-bold"
                >
                  {copiedCode ? 'Code Copied!' : 'Copy Code'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition font-bold"
                >
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Referral Milestone Rewards */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Milestone Cash Bonuses:</span>
            </h3>

            <div className="space-y-2 text-xs">
              
              {/* Milestone 1: 5 Referrals -> +$0.50 USD */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                count >= 5 
                  ? 'bg-emerald-950/30 border-emerald-500/40' 
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    count >= 5 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count >= 5 ? '✓' : '5'}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>First 5 Friends Referred</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold">
                        +$0.50 Extra
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Progress: {Math.min(count, 5)} / 5 completed
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  count >= 5 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {count >= 5 ? 'Unlocked (+$0.50)' : `${5 - count} needed`}
                </span>
              </div>

              {/* Milestone 2: 10 Referrals -> +$1.00 USD */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                count >= 10 
                  ? 'bg-emerald-950/30 border-emerald-500/40' 
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    count >= 10 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count >= 10 ? '✓' : '10'}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>10 Friends Referred</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold">
                        +$1.00 Extra
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Progress: {Math.min(count, 10)} / 10 completed
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  count >= 10 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {count >= 10 ? 'Unlocked (+$1.00)' : `${10 - Math.min(count, 10)} needed`}
                </span>
              </div>

              {/* Milestone 3: 20 Referrals -> +$3.00 USD */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                count >= 20 
                  ? 'bg-emerald-950/30 border-emerald-500/40' 
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    count >= 20 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count >= 20 ? '✓' : '20'}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>20 Friends Referred</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold">
                        +$3.00 Extra
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Progress: {Math.min(count, 20)} / 20 completed
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  count >= 20 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {count >= 20 ? 'Unlocked (+$3.00)' : `${20 - Math.min(count, 20)} needed`}
                </span>
              </div>

              {/* Milestone 4: 50 Referrals -> +$5.00 USD */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                count >= 50 
                  ? 'bg-emerald-950/30 border-emerald-500/40' 
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    count >= 50 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count >= 50 ? '✓' : '50'}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>50 Friends Referred</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold">
                        +$5.00 Extra
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Progress: {Math.min(count, 50)} / 50 completed
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  count >= 50 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {count >= 50 ? 'Unlocked (+$5.00)' : `${50 - Math.min(count, 50)} needed`}
                </span>
              </div>

              {/* Milestone 5: 100 Referrals -> +$10.00 USD */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                count >= 100 
                  ? 'bg-emerald-950/30 border-emerald-500/40' 
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    count >= 100 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count >= 100 ? '✓' : '100'}
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>100 Friends Referred</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-bold">
                        +$10.00 Extra
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Progress: {Math.min(count, 100)} / 100 completed
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  count >= 100 
                    ? 'bg-emerald-500/20 text-emerald-400' 
                    : 'bg-slate-800 text-slate-500'
                }`}>
                  {count >= 100 ? 'Unlocked (+$10.00)' : `${100 - Math.min(count, 100)} needed`}
                </span>
              </div>

            </div>
          </div>

          {/* Important Rules / Terms Notice */}
          <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Program Rules & Wagering Terms:</span>
            </div>
            <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
              <li>All bonuses (Weekly, Monthly, Signup, and Referral rewards) activate after the 1st approved deposit.</li>
              <li>Referral bonus is credited as <strong>$0.50 USD</strong> upon your friend's 1st deposit.</li>
              <li>New players receive an instant <strong>$1.00 USD</strong> welcome signup bonus on their 1st deposit.</li>
              <li>Minimum deposit amount is <strong>$5.00 USD</strong> via Binance Pay or USDT.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
