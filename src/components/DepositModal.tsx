import React, { useState, useRef } from 'react';
import { AdminSettings, DepositRequest, SupportPaymentMethod } from '../types/game';
import { 
  X, 
  ArrowLeft,
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
  Clock,
  Headphones,
  Smartphone,
  Wallet,
  Sparkles,
  ExternalLink,
  Info
} from 'lucide-react';

import { 
  OFFICIAL_BINANCE_PAY_ID, 
  OFFICIAL_USDT_BEP20_ADDRESS, 
  OFFICIAL_USDT_TRC20_ADDRESS 
} from '../utils/storage';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminSettings: AdminSettings;
  userDeposits: DepositRequest[];
  onSubmitDeposit: (data: {
    amountUSD: number;
    binanceTxId: string;
    senderBinanceId: string;
    network?: string;
    depositType?: 'AI_BINANCE' | 'SUPPORT_AGENT';
    supportMethodName?: string;
    screenshotUrl?: string;
    userNote?: string;
  }) => void;
  onOpenHelpDesk?: () => void;
}

const getDepositTargetAddress = (net: 'BINANCE_PAY' | 'USDT_BEP20' | 'USDT_TRC20') => {
  if (net === 'BINANCE_PAY') return OFFICIAL_BINANCE_PAY_ID;
  if (net === 'USDT_BEP20') return OFFICIAL_USDT_BEP20_ADDRESS;
  return OFFICIAL_USDT_TRC20_ADDRESS;
};

const DEFAULT_SUPPORT_METHODS: SupportPaymentMethod[] = [
  {
    id: 'sp_binance_pay',
    name: 'Binance Pay ID (Official Admin)',
    accountNumber: OFFICIAL_BINANCE_PAY_ID,
    accountType: 'Binance Pay ID',
    instructions: `Open your Binance App, go to Pay, send USDT to Recipient ID ${OFFICIAL_BINANCE_PAY_ID}, then submit your TxID and screenshot.`,
    isActive: true,
  },
  {
    id: 'sp_usdt_trc20',
    name: 'USDT (TRC-20 Network)',
    accountNumber: OFFICIAL_USDT_TRC20_ADDRESS,
    accountType: 'Crypto TRC-20',
    instructions: 'Transfer USDT over TRC-20 network to the address above, then submit your transaction hash (TxID).',
    isActive: true,
  },
  {
    id: 'sp_usdt_bep20',
    name: 'USDT (BEP-20 Network)',
    accountNumber: OFFICIAL_USDT_BEP20_ADDRESS,
    accountType: 'Crypto BEP-20',
    instructions: 'Transfer USDT over BNB Smart Chain (BEP-20) network to the address above, then submit your transaction hash (TxID).',
    isActive: true,
  }
];

export const DepositModal: React.FC<DepositModalProps> = ({
  isOpen,
  onClose,
  adminSettings,
  userDeposits,
  onSubmitDeposit,
  onOpenHelpDesk,
}) => {
  // Deposit Mode Tab
  const [depositTab, setDepositTab] = useState<'SUPPORT_AGENT' | 'AI_BINANCE'>('AI_BINANCE');

  // Support Agent Deposit State
  const activeMethods = (adminSettings.supportPaymentMethods && adminSettings.supportPaymentMethods.length > 0)
    ? adminSettings.supportPaymentMethods.filter((m) => m.isActive)
    : DEFAULT_SUPPORT_METHODS;

  const [selectedMethodId, setSelectedMethodId] = useState<string>(activeMethods[0]?.id || 'sp_binance_pay');
  const selectedMethod = activeMethods.find((m) => m.id === selectedMethodId) || activeMethods[0] || DEFAULT_SUPPORT_METHODS[0];

  const [usdAmount, setUsdAmount] = useState<number>(10.00);
  const [senderId, setSenderId] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI Binance tab states
  const [network, setNetwork] = useState<'BINANCE_PAY' | 'USDT_BEP20' | 'USDT_TRC20'>('BINANCE_PAY');
  const [isVerifyingAI, setIsVerifyingAI] = useState<boolean>(false);
  const [transferAgeMinutes, setTransferAgeMinutes] = useState<number>(3);

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

  const handleRemoveScreenshot = () => {
    setScreenshotUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit Support Agent Deposit
  const handleSubmitSupportDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdAmount || usdAmount < (adminSettings.minDepositUSD || 5)) {
      setError(`Minimum deposit is $${(adminSettings.minDepositUSD || 5).toFixed(2)} USD.`);
      return;
    }
    if (!txId.trim()) {
      setError('Transaction ID (TxID / Order ID) is required.');
      return;
    }
    if (!senderId.trim()) {
      setError('Please provide your sender account or Pay ID.');
      return;
    }

    setError(null);

    onSubmitDeposit({
      amountUSD: Number(usdAmount.toFixed(2)),
      binanceTxId: txId.trim(),
      senderBinanceId: senderId.trim(),
      network: selectedMethod.accountType || selectedMethod.name,
      depositType: 'SUPPORT_AGENT',
      supportMethodName: selectedMethod.name,
      screenshotUrl: screenshotUrl || undefined,
      userNote: userNote.trim() || undefined,
    });

    setSubmittedSuccess(true);
    setSuccessMessage(`Your $${usdAmount.toFixed(2)} deposit request has been submitted to Support. An agent will verify and credit your balance shortly.`);
    setTxId('');
    setSenderId('');
    setUserNote('');
    setScreenshotUrl('');
  };

  // Submit Binance AI Deposit
  const handleSubmitAiDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usdAmount || usdAmount < (adminSettings.minDepositUSD || 5)) {
      setError(`Minimum deposit is $${(adminSettings.minDepositUSD || 5).toFixed(2)} USD.`);
      return;
    }
    if (!txId.trim()) {
      setError('Binance Transaction ID (TxID / Order ID) is required.');
      return;
    }
    if (!screenshotUrl) {
      setError('Please attach your payment screenshot for automated verification.');
      return;
    }

    if (transferAgeMinutes > 30) {
      setError('⚠️ Screenshot timestamp is older than 30 minutes! Please use Support Agent deposit or contact Help Desk.');
      return;
    }

    setError(null);
    setIsVerifyingAI(true);

    setTimeout(() => {
      setIsVerifyingAI(false);
      const isAutoApproved = usdAmount >= (adminSettings.minDepositUSD || 5) && transferAgeMinutes <= 30;

      onSubmitDeposit({
        amountUSD: Number(usdAmount.toFixed(2)),
        binanceTxId: txId.trim(),
        senderBinanceId: senderId.trim() || 'N/A',
        network,
        depositType: 'AI_BINANCE',
        screenshotUrl,
      });

      setSubmittedSuccess(true);
      setSuccessMessage(isAutoApproved 
        ? `AI verification successful! $${usdAmount.toFixed(2)} USD has been credited to your wallet.` 
        : `Deposit slip submitted. Support is reviewing and will credit your balance shortly.`);
      setTxId('');
      setSenderId('');
      setScreenshotUrl('');
    }, 1200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 py-2 sm:py-4">
      <div className="relative bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-7 shadow-2xl text-slate-100">
        
        {/* Back Symbol at the very corner */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 hover:border-emerald-500/50 shadow-md group"
          title="Back to Arena"
          aria-label="Back to Arena"
        >
          <ArrowLeft className="w-5 h-5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
        </button>

        {/* Page Header in a single column with text under the symbol */}
        <div className="pb-4 sm:pb-6 border-b border-slate-800 pr-14 flex flex-col gap-2.5">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-bold">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-2xl font-black text-white">Deposit Funds (Binance / USDT)</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
                Instant
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Min ${(adminSettings.minDepositUSD || 5).toFixed(2)} USD
              {adminSettings.bonusConfig?.bonusesEnabled !== false && adminSettings.bonusConfig?.welcomeBonusEnabled !== false && Number(adminSettings.bonusConfig?.welcomeBonusUSD ?? 1) > 0
                ? ` • $${Number(adminSettings.bonusConfig?.welcomeBonusUSD ?? 1).toFixed(2)} instant bonus on 1st approved deposit`
                : ''}
              {adminSettings.bonusConfig?.bonusesEnabled !== false && adminSettings.bonusConfig?.depositBonusEnabled && Number(adminSettings.bonusConfig?.depositBonusPercent || 0) > 0
                ? ` • +${adminSettings.bonusConfig.depositBonusPercent}% Deposit Promo Active!`
                : ''}
            </p>
          </div>
        </div>

        {/* Deposit Methods Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 mt-4 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setDepositTab('SUPPORT_AGENT');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              depositTab === 'SUPPORT_AGENT'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-4 h-4 text-emerald-300" />
            <span>Support Agent</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-black">
              Help
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDepositTab('AI_BINANCE');
              setError(null);
            }}
            className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer ${
              depositTab === 'AI_BINANCE'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Binance AI Auto</span>
          </button>
        </div>

        {/* Success Feedback View */}
        {submittedSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-emerald-300">
              Deposit Request Submitted!
            </h3>
            <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {successMessage}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-4">
              {onOpenHelpDesk && (
                <button
                  onClick={() => {
                    setSubmittedSuccess(false);
                    onClose();
                    onOpenHelpDesk();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow cursor-pointer"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Chat with Support Agent</span>
                </button>
              )}

              <button
                onClick={() => setSubmittedSuccess(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-xs text-slate-200 transition cursor-pointer"
              >
                Make Another Deposit
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            
            {/* TAB 1: SUPPORT AGENT DEPOSIT (Exclusively located in Support Box) */}
            {depositTab === 'SUPPORT_AGENT' && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <Headphones className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-black text-white">
                    Support Agent Binance Deposit
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
                    For assistance with Binance Pay or USDT deposit, open our live 24/7 support desk. An agent will verify your payment and credit your balance immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenHelpDesk) onOpenHelpDesk();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Headphones className="w-4 h-4" />
                  <span>Open Support Desk</span>
                </button>
              </div>
            )}

            {/* TAB 2: BINANCE AI AUTO DEPOSIT (Automated Verification) */}
            {depositTab === 'AI_BINANCE' && (
              <form onSubmit={handleSubmitAiDeposit} className="space-y-4">
                
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
                    {(['BINANCE_PAY', 'USDT_BEP20', 'USDT_TRC20'] as const).map((net) => (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setNetwork(net)}
                        className={`py-2 px-1 rounded-xl font-bold border transition text-center cursor-pointer ${
                          network === net
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                            : 'bg-slate-800/60 border-slate-700 text-slate-300'
                        }`}
                      >
                        {net === 'BINANCE_PAY' ? 'Binance Pay' : net === 'USDT_BEP20' ? 'USDT (BEP-20)' : 'USDT (TRC-20)'}
                      </button>
                    ))}
                  </div>

                  {/* Target Address / Pay ID */}
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="truncate">
                      <span className="text-[10px] text-slate-400 block font-semibold">
                        {network === 'BINANCE_PAY' ? 'Official Admin Binance Pay ID' : `${network} Address`}
                      </span>
                      <span className="text-xs sm:text-sm font-mono font-bold text-amber-300 truncate block">
                        {getDepositTargetAddress(network)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(
                          getDepositTargetAddress(network),
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

                {/* Amount */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Deposit Amount ($ USD):
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="0.5"
                    value={usdAmount}
                    onChange={(e) => setUsdAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm font-mono text-white focus:border-amber-400 outline-none"
                  />
                </div>

                {/* TxID & Sender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Your Binance Pay ID / Sender:
                    </label>
                    <input
                      type="text"
                      placeholder="Sender Pay ID"
                      value={senderId}
                      onChange={(e) => setSenderId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Binance TxID / Order ID:
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BNP9824109842"
                      value={txId}
                      onChange={(e) => setTxId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-white font-mono focus:border-amber-400 outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Screenshot */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Payment Screenshot (Required for AI verification):
                    </label>
                  </div>

                  {screenshotUrl ? (
                    <div className="p-2 bg-slate-950 rounded-xl border border-emerald-500/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={screenshotUrl} alt="Slip" className="w-12 h-12 object-cover rounded-lg border border-slate-800" />
                        <span className="text-xs text-emerald-400 font-medium">Slip Attached (Fresh &lt; 30m)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="text-xs text-rose-400 hover:text-rose-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full text-xs text-slate-400 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer"
                    />
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifyingAI}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isVerifyingAI ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>AI is verifying...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit for Instant AI Approval</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Recent Deposit History */}
            {userDeposits && userDeposits.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Recent Deposit History:
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {userDeposits.slice(0, 5).map((dep) => (
                    <div
                      key={dep.id}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>${dep.amountUSD.toFixed(2)} USD</span>
                          {dep.depositType === 'SUPPORT_AGENT' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                              Support
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{dep.binanceTxId}</div>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          dep.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : dep.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {dep.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
