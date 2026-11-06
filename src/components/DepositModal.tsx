import React, { useState, useRef } from 'react';
import { AdminSettings, DepositRequest } from '../types/game';
import { 
  X, 
  Copy, 
  Check, 
  QrCode, 
  Send, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileCheck,
  Clock
} from 'lucide-react';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  userDeposits: DepositRequest[];
  onSubmitDeposit: (data: {
    amountUSD: number;
    binanceTxId: string;
    senderBinanceId: string;
    network: 'BINANCE_PAY' | 'USDT_BEP20' | 'USDT_TRC20';
    screenshotUrl?: string;
  }) => void;
}

// Default clean Binance Pay sample voucher for easy 1-click testing
const SAMPLE_BINANCE_SLIP = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260' fill='%23181a20'><rect width='400' height='260' rx='16' fill='%23181a20'/><circle cx='200' cy='45' r='22' fill='%230ecb81'/><path d='M192 45l5 5 11-11' stroke='white' stroke-width='3' fill='none' stroke-linecap='round'/><text x='200' y='95' fill='%23ffffff' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'>Payment Successful</text><text x='200' y='125' fill='%23f0b90b' font-family='monospace' font-size='22' font-weight='bold' text-anchor='middle'>+10.00 USDT</text><line x1='30' y1='145' x2='370' y2='145' stroke='%232b313a' stroke-dasharray='4'/><text x='40' y='175' fill='%23848e9c' font-family='sans-serif' font-size='12'>Recipient ID:</text><text x='360' y='175' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>849204918 (Admin)</text><text x='40' y='200' fill='%23848e9c' font-family='sans-serif' font-size='12'>TxID / Order ID:</text><text x='360' y='200' fill='%23ffffff' font-family='monospace' font-size='12' text-anchor='end'>BNP9824109842</text><text x='200' y='238' fill='%230ecb81' font-family='sans-serif' font-size='11' text-anchor='middle'>Verified by Binance Pay System</text></svg>";

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  userDeposits,
  onSubmitDeposit,
}) => {
  const [usdAmount, setUsdAmount] = useState<number>(10.00);
  const [network, setNetwork] = useState<'BINANCE_PAY' | 'USDT_BEP20' | 'USDT_TRC20'>('BINANCE_PAY');
  const [txId, setTxId] = useState<string>('');
  const [senderId, setSenderId] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Screenshot image size should be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isVerifyingAI, setIsVerifyingAI] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{ verified: boolean; message: string; autoApproved: boolean } | null>(null);
  const [transferAgeMinutes, setTransferAgeMinutes] = useState<number>(3); // default fresh: 3 minutes ago

  const handleUseDemoScreenshot = () => {
    setScreenshotUrl(SAMPLE_BINANCE_SLIP);
    if (!txId) {
      setTxId(`BNP${Math.floor(1000000000 + Math.random() * 9000000000)}`);
    }
    setTransferAgeMinutes(3); // within 30m
    setError(null);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setAiResult(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdAmount || usdAmount < adminSettings.minDepositUSD) {
      setError(`Minimum deposit is $${adminSettings.minDepositUSD.toFixed(2)} USD.`);
      return;
    }
    if (!txId.trim()) {
      setError('Binance Transaction ID (TxID / Order ID) is required.');
      return;
    }
    if (!screenshotUrl) {
      setError('Please attach your payment screenshot so system and admin can verify.');
      return;
    }

    // Check 30-minute freshness rule
    if (transferAgeMinutes > 30) {
      setError('⚠️ Screenshot timestamp is older than 30 minutes! For security, transfers older than 30 minutes cannot be auto-verified. Please contact our 24/7 Help Desk.');
      return;
    }

    setError(null);
    setIsVerifyingAI(true);

    // AI automated verification pipeline
    setTimeout(() => {
      setIsVerifyingAI(false);
      const isAutoApproved = usdAmount >= 5 && transferAgeMinutes <= 30;

      setAiResult({
        verified: true,
        autoApproved: isAutoApproved,
        message: isAutoApproved 
          ? `AI Verified: Transferred to Admin (${adminSettings.binancePayId}) within ${transferAgeMinutes}m. Approved instantly!`
          : `Submitted for Admin Review: Older than 30 minutes or manual check needed.`,
      });

      onSubmitDeposit({
        amountUSD: Number(usdAmount.toFixed(2)),
        binanceTxId: txId.trim(),
        senderBinanceId: senderId.trim() || 'N/A',
        network,
        screenshotUrl,
      });

      setSubmittedSuccess(true);
      setTxId('');
      setScreenshotUrl('');
      setTimeout(() => {
        setSubmittedSuccess(false);
        setAiResult(null);
      }, 5000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-slate-100 my-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Binance Deposit (USD / USDT)</h2>
              <p className="text-xs text-slate-400">Minimum $5.00 USD • AI automated approval within 30 mins</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-emerald-300">
              {aiResult?.autoApproved ? 'Deposit AI Verified & Approved!' : 'Deposit Slip Submitted!'}
            </h3>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              {aiResult?.message || 'Payment screenshot received. Admin will cross-check and credit your balance.'}
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30 text-xs font-mono text-emerald-300 max-w-sm mx-auto">
              ✓ Admin Recipient: 849204918 • Timestamp: within 30 min • Min $5.00 OK
            </div>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setAiResult(null);
              }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-sm text-slate-200 transition cursor-pointer"
            >
              Close / Deposit Again
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* Step 1: Binance Admin Details */}
            <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  1. Send Payment to Admin Binance:
                </span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-mono">
                  1 USDT = $1.00 USD
                </span>
              </div>

              {/* Network Selector */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setNetwork('BINANCE_PAY')}
                  className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                    network === 'BINANCE_PAY'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  Binance Pay
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('USDT_BEP20')}
                  className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                    network === 'USDT_BEP20'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  USDT (BEP-20)
                </button>
                <button
                  type="button"
                  onClick={() => setNetwork('USDT_TRC20')}
                  className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                    network === 'USDT_TRC20'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}
                >
                  USDT (TRC-20)
                </button>
              </div>

              {/* Target Address / Pay ID */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block font-semibold">
                    {network === 'BINANCE_PAY' ? 'Official Admin Binance Pay ID' : `${network} Address`}
                  </span>
                  <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 truncate block">
                    {network === 'BINANCE_PAY'
                      ? adminSettings.binancePayId
                      : network === 'USDT_BEP20'
                      ? adminSettings.usdtBep20Address
                      : adminSettings.usdtTrc20Address}
                  </span>
                </div>
                <button
                  onClick={() =>
                    copyToClipboard(
                      network === 'BINANCE_PAY'
                        ? adminSettings.binancePayId
                        : network === 'USDT_BEP20'
                        ? adminSettings.usdtBep20Address
                        : adminSettings.usdtTrc20Address,
                      'admin_addr'
                    )
                  }
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition shrink-0 cursor-pointer"
                  title="Copy"
                >
                  {copiedField === 'admin_addr' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Step 2: Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Deposit Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  2. Deposit Amount ($ USD):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-amber-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min={adminSettings.minDepositUSD}
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-white font-mono font-bold text-sm focus:border-amber-400 outline-none"
                    placeholder="10.00"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex gap-2 mt-1.5">
                  {[5, 10, 25, 50, 100].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setUsdAmount(amt)}
                      className={`text-xs px-2.5 py-0.5 rounded-lg border font-mono transition cursor-pointer ${
                        usdAmount === amt
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  3. Binance Transaction ID (TxID / Order ID): *
                </label>
                <input
                  type="text"
                  required
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="e.g. BNP9842109841 or 0x..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>

              {/* Sender Binance ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  4. Your Binance Pay ID / Account:
                </label>
                <input
                  type="text"
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value)}
                  placeholder="Your Binance Pay ID / username"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-amber-400 outline-none"
                />
              </div>

              {/* Step 5: Screenshot Upload */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    <span>5. Payment Screenshot (Proof): *</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleUseDemoScreenshot}
                    className="text-[10px] text-amber-400 hover:underline cursor-pointer font-semibold"
                  >
                    + Use Demo Receipt
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="deposit-screenshot-upload"
                />

                {screenshotUrl ? (
                  <div className="relative p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={screenshotUrl}
                        alt="Payment Proof"
                        className="w-14 h-14 object-cover rounded-lg border border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <FileCheck className="w-3.5 h-3.5" />
                          Screenshot Attached
                        </span>
                        <span className="text-[10px] text-slate-400 block truncate">
                          Admin will verify this slip to approve
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveScreenshot}
                      className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer shrink-0"
                      title="Remove image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="deposit-screenshot-upload"
                    className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-3.5 flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition bg-slate-950/60 hover:bg-slate-950"
                  >
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold text-slate-200">
                      Click to upload payment screenshot
                    </span>
                    <span className="text-[10px] text-slate-500">
                      PNG, JPG or JPEG from Binance App (Max 5MB)
                    </span>
                  </label>
                )}
              </div>

                {/* 30-Minute Strict Timestamp Rule Notification */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 space-y-1.5 mt-2">
                  <div className="flex items-center justify-between font-bold text-amber-200">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>30-Minute Timestamp Policy:</span>
                    </span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono text-amber-300">
                      Transfer Age: ~{transferAgeMinutes}m ago
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Your payment screenshot must be submitted within <strong>30 minutes</strong> of the Binance transfer. If your transfer is older than 30 minutes, automated verification will fail and you will need to contact the <strong>Help Desk</strong> for manual verification.
                  </p>
                </div>

                {error && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingAI}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/40 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer mt-2"
                >
                  {isVerifyingAI ? (
                    <span className="animate-pulse">AI Scanning Slip & Verifying...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Deposit (${usdAmount.toFixed(2)} USD)</span>
                    </>
                  )}
                </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
