import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Headphones, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  ShieldCheck,
  CreditCard,
  Copy,
  Check,
  Upload,
  Image as ImageIcon,
  Smartphone,
  Wallet,
  AlertCircle,
  ChevronRight,
  ExternalLink,
  Edit3
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../utils/audio';
import { checkWithdrawalHours } from '../utils/withdrawalHours';
import { loadFromStorage, saveToStorage } from '../utils/storage';
import { AdminSettings, UserProfile } from '../types/game';
import { authApi } from '../utils/authApi';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'admin';
  text: string;
  timestamp: number;
  numberRequestCard?: {
    method: 'bKash' | 'Nagad' | 'Rocket';
    amountUSD: number;
    amountBDT: number;
    assignedNumber?: string;
    isFulfilled: boolean;
  };
  depositProofCard?: {
    depositId: string;
    amountUSD: number;
    method: string;
    senderNumber: string;
    trxId: string;
    screenshotUrl?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
  };
}

interface HelpDeskModalProps {
  user?: UserProfile;
  adminSettings?: AdminSettings;
  onSubmitDeposit?: (data: {
    amountUSD: number;
    binanceTxId: string;
    senderBinanceId: string;
    network?: string;
    depositType?: 'AI_BINANCE' | 'SUPPORT_AGENT';
    supportMethodName?: string;
    screenshotUrl?: string;
    userNote?: string;
  }) => void;
  onApproveDeposit?: (depositId: string) => void;
  isOpenControlled?: boolean;
  onCloseControlled?: () => void;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'agent',
    text: `Welcome! I am Support Agent Maya. 👋
    
We support secure direct deposits via Binance Pay ID and USDT (TRC-20 & BEP-20).
Click on '💳 Deposit' tab above to view official Pay ID and deposit addresses. After transferring funds, submit your TxID and payment screenshot for prompt verification and approval.`,
    timestamp: Date.now() - 60000,
  },
];

export const HelpDeskModal: React.FC<HelpDeskModalProps> = ({
  user,
  adminSettings,
  onSubmitDeposit,
  onApproveDeposit,
  isOpenControlled,
  onCloseControlled,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : internalOpen;
  const setIsOpen = (open: boolean) => {
    if (onCloseControlled && !open) onCloseControlled();
    setInternalOpen(open);
  };

  const [activeTab, setActiveTab] = useState<'CHAT' | 'DEPOSIT'>('CHAT');
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage('support_chat_history', DEFAULT_MESSAGES)
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // In-Support Binance Deposit Flow States
  const [selectedNetwork, setSelectedNetwork] = useState<'BINANCE_PAY' | 'USDT_TRC20' | 'USDT_BEP20'>('BINANCE_PAY');
  const [usdAmount, setUsdAmount] = useState<number>(10);

  // Proof form states
  const [senderBinanceId, setSenderBinanceId] = useState('');
  const [trxId, setTrxId] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [userNote, setUserNote] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminManualNumberInput, setAdminManualNumberInput] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveToStorage('support_chat_history', messages);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages, activeTab]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNumber(text);
    soundManager.playChip();
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Helper to get active admin account based on network
  const getAdminAccount = (net: 'BINANCE_PAY' | 'USDT_TRC20' | 'USDT_BEP20') => {
    if (net === 'BINANCE_PAY') return adminSettings?.binancePayId || '1156528658';
    if (net === 'USDT_TRC20') return adminSettings?.usdtTrc20Address || 'TPHsdQU9EzZYMkQRuaqYA9UkrD25h86gNU';
    return adminSettings?.usdtBep20Address || '0xd1194126385ab996d60542f54e5d8f1372a4cc3e';
  };

  // Admin manually inputs and sends a custom payment number/id in chat
  const handleAdminSendCustomNumber = (customNum: string) => {
    if (!customNum.trim()) return;
    const num = customNum.trim();

    const adminMsg: ChatMessage = {
      id: `admin_num_${Date.now()}`,
      sender: 'admin',
      text: `📢 Admin Message:
Active Binance Account for your deposit:
👉 ${num}
Please transfer funds to this account, then submit your TxID and payment screenshot below.`,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, adminMsg]);
    setAdminManualNumberInput('');
    soundManager.playTick();
  };

  // STEP 2: User submits payment proof (number, trxid, screenshot)
  // Submit Binance Deposit Details directly in Support
  const handleSubmitBinanceDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (usdAmount < (adminSettings?.minDepositUSD || 5)) {
      alert(`Minimum deposit amount is $${adminSettings?.minDepositUSD || 5}.00 USD`);
      return;
    }
    if (!trxId.trim()) {
      alert('Please enter your Binance Transaction ID (TxID / Order ID).');
      return;
    }
    if (!screenshotUrl) {
      alert('Please upload your payment screenshot.');
      return;
    }

    setIsSubmitting(true);
    const depositId = `DEP-${Math.floor(1000 + Math.random() * 9000)}`;

    const networkName = selectedNetwork === 'BINANCE_PAY' 
      ? 'Binance Pay ID' 
      : selectedNetwork === 'USDT_TRC20' 
      ? 'USDT (TRC-20)' 
      : 'USDT (BEP-20)';

    const depositPayload = {
      amountUSD: Number(usdAmount),
      binanceTxId: trxId.trim(),
      senderBinanceId: senderBinanceId.trim() || 'N/A',
      depositType: 'SUPPORT_AGENT' as const,
      supportMethodName: `Binance Support (${networkName})`,
      screenshotUrl: screenshotUrl || undefined,
      userNote: userNote.trim() || undefined,
      network: selectedNetwork,
    };

    if (onSubmitDeposit) {
      onSubmitDeposit(depositPayload);
    } else {
      authApi.createDeposit({
        id: depositId,
        userId: user?.id || 'demo_user',
        userName: user?.name || 'Tester',
        status: 'PENDING',
        createdAt: Date.now(),
        ...depositPayload,
      });
    }

    soundManager.playChip();

    // User proof message in chat
    const proofMsg: ChatMessage = {
      id: `usr_proof_${Date.now()}`,
      sender: 'user',
      text: `✅ [Binance Deposit Submitted]
• Method: ${networkName}
• Amount: $${usdAmount.toFixed(2)} USD
• Sender ID: ${senderBinanceId || 'N/A'}
• Binance TxID: ${trxId}
${userNote ? `• Note: ${userNote}` : ''}`,
      timestamp: Date.now(),
      depositProofCard: {
        depositId,
        amountUSD: usdAmount,
        method: networkName,
        senderNumber: senderBinanceId.trim() || 'N/A',
        trxId: trxId.trim(),
        screenshotUrl: screenshotUrl || undefined,
        status: 'PENDING',
      },
    };

    setMessages(prev => [...prev, proofMsg]);
    setIsSubmitting(false);
    setActiveTab('CHAT');
    setTrxId('');
    setUserNote('');
    setScreenshotUrl(null);

    // Agent Maya acknowledgement
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const agentReply: ChatMessage = {
        id: `agent_ack_${Date.now()}`,
        sender: 'agent',
        text: `Thank you, ${user?.name || ''}! Your Binance (${networkName}) deposit details and proof have been submitted to support. 👩‍💼

• Deposit ID: ${depositId}
• TxID: ${trxId}
• Status: ⏳ Pending Admin Review

The admin is verifying your transaction details and screenshot. Funds will be credited directly to your balance upon approval. Please allow 1-2 minutes!`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentReply]);
      soundManager.playTick();
    }, 800);
  };

  // STEP 3: Admin Manually Approves Deposit
  const handleAdminApproveDeposit = async (depositId: string, amount: number) => {
    if (onApproveDeposit) {
      onApproveDeposit(depositId);
    } else {
      await authApi.approveDeposit(depositId);
    }

    confetti({
      particleCount: 110,
      spread: 85,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });
    soundManager.playWin();

    // Update message status
    setMessages(prev =>
      prev.map(m =>
        m.depositProofCard && m.depositProofCard.depositId === depositId
          ? { ...m, depositProofCard: { ...m.depositProofCard, status: 'APPROVED' } }
          : m
      )
    );

    // Confirmation message from Admin / Maya
    setTimeout(() => {
      const confMsg: ChatMessage = {
        id: `agent_conf_${Date.now()}`,
        sender: 'agent',
        text: `🎉 Congratulations! Admin has reviewed and approved your Binance payment ($${amount.toFixed(2)} USD)! 
Your wallet balance has been updated, and your $1.00 first deposit welcome bonus has been credited. Happy gaming! 🪙`,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, confMsg]);
    }, 400);
  };

  // General Chat message input handler
  const handleSendMessage = () => {
    const text = inputMessage.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const query = text.toLowerCase();
      let reply = `Thank you for reaching out! I am Support Agent Maya. To make a deposit, please click on the '💳 Deposit USD' tab above.`;

      if (query.includes('deposit') || query.includes('money') || query.includes('number') || query.includes('binance') || query.includes('usdt')) {
        reply = `💳 To deposit via Binance:
1. Click the '💳 Deposit USD' tab above.
2. Select your network (Binance Pay ID / USDT TRC-20 / USDT BEP-20).
3. Transfer funds to the official admin account shown, then submit your TxID and screenshot.
4. Support will verify and credit your wallet balance promptly.`;
      } else if (query.includes('withdraw') || query.includes('time') || query.includes('payout')) {
        const h = checkWithdrawalHours();
        reply = `⏰ Withdrawal Policy:
• Withdrawals are processed daily from 10:00 AM to 10:00 PM.
• Current status: ${h.isOpen ? '✅ Open now' : '🔴 Currently closed (Opens at 10:00 AM)'}.
• Minimum withdrawal: $10.00 USD (Binance Pay ID / USDT).`;
      }

      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, agentMsg]);
      soundManager.playTick();
    }, 700);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div className="fixed bottom-4 right-4 z-40 sm:bottom-6 sm:right-6">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white rounded-full shadow-2xl shadow-emerald-950/60 border border-emerald-400/30 transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          aria-label="Open Help Desk Chat"
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-full bg-slate-900 border border-emerald-300 flex items-center justify-center text-emerald-400">
              <Headphones className="w-4 h-4" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-700 animate-pulse" />
          </div>

          <div className="text-left hidden xs:block">
            <span className="text-xs font-black tracking-wide block leading-none">
              Support & Deposit
            </span>
            <span className="text-[9px] text-emerald-200/90 font-medium block mt-0.5">
              Agent Maya • Online
            </span>
          </div>

          {unreadCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Modal */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 sm:w-[440px] sm:h-[620px] flex flex-col bg-slate-900 border border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-md">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-bold">
                    <Headphones className="w-5 h-5" />
                  </div>
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">Agent Maya (Live Support)</h3>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                    Support
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Binance Pay & USDT Deposit
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Top Bar inside Support: Chat vs In-Support Deposit */}
          <div className="grid grid-cols-2 p-1.5 bg-slate-950 border-b border-slate-800 text-xs font-bold gap-1">
            <button
              onClick={() => setActiveTab('CHAT')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'CHAT'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Support Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('DEPOSIT')}
              className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer relative ${
                activeTab === 'DEPOSIT'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Deposit USD</span>
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-1.5 right-2" />
            </button>
          </div>

          {/* TAB 1: CHAT INTERFACE */}
          {activeTab === 'CHAT' && (
            <>
              {/* Quick Prompt to Deposit */}
              <div 
                onClick={() => setActiveTab('DEPOSIT')}
                className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border-b border-emerald-500/30 px-3.5 py-2 flex items-center justify-between cursor-pointer group hover:bg-emerald-900/40 transition"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-[11px] leading-tight">
                    <span className="font-bold text-emerald-300 block">Binance Pay & USDT Deposit:</span>
                    <span className="text-[10px] text-slate-400">Click to view official Pay ID and addresses</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition" />
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 text-xs bg-slate-950/70">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl p-3 leading-relaxed whitespace-pre-line shadow ${
                        m.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : m.sender === 'admin'
                          ? 'bg-amber-950/80 text-amber-200 border border-amber-500/40 rounded-bl-xs'
                          : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                      }`}
                    >
                      {m.text}

                      {/* Deposit Proof Card */}
                      {m.depositProofCard && (
                        <div className="mt-3 pt-3 border-t border-white/20 space-y-2 text-left bg-black/30 p-2.5 rounded-xl">
                          <div className="flex items-center justify-between text-[11px] font-mono">
                            <span className="text-emerald-300 font-bold">{m.depositProofCard.depositId}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              m.depositProofCard.status === 'APPROVED'
                                ? 'bg-emerald-400 text-slate-950'
                                : 'bg-amber-400 text-slate-950'
                            }`}>
                              {m.depositProofCard.status === 'APPROVED' ? '✓ APPROVED' : '⏳ PENDING'}
                            </span>
                          </div>

                          {m.depositProofCard.screenshotUrl && (
                            <div className="rounded-lg overflow-hidden border border-slate-700 bg-slate-900 max-h-36 flex items-center justify-center">
                              <img 
                                src={m.depositProofCard.screenshotUrl} 
                                alt="Payment Proof" 
                                className="w-full h-auto object-cover max-h-36"
                              />
                            </div>
                          )}

                          {/* Admin Manual Approval Button */}
                          {m.depositProofCard.status === 'PENDING' && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => handleAdminApproveDeposit(m.depositProofCard!.depositId, m.depositProofCard!.amountUSD)}
                                className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[11px] shadow transition cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-slate-950" />
                                <span>Admin Verify & Approve</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 px-1 font-mono">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs py-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                    <span className="text-[11px] text-slate-500 ml-1">Support is typing...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Admin quick custom number sender tool (for realism & testing) */}
              <div className="px-3 py-1.5 bg-slate-950 border-t border-slate-800/80 flex items-center gap-1 text-[11px]">
                <Edit3 className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="text-slate-400 text-[10px] shrink-0">Send Admin Account:</span>
                <input
                  type="text"
                  placeholder="e.g. 1156528658"
                  value={adminManualNumberInput}
                  onChange={(e) => setAdminManualNumberInput(e.target.value)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-amber-300 font-mono flex-1 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAdminSendCustomNumber(adminManualNumberInput)}
                  className="px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[10px] shrink-0 cursor-pointer"
                >
                  Send
                </button>
              </div>

              {/* Footer Input */}
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-slate-950 border border-slate-700/90 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    className={`p-2 rounded-xl transition cursor-pointer ${
                      inputMessage.trim()
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
                        : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: IN-SUPPORT BINANCE DEPOSIT WORKFLOW */}
          {activeTab === 'DEPOSIT' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-950/90">
              
              {/* Policy Header Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-slate-900 border border-amber-500/30 flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4" />
                </div>
                <div className="text-[11px] text-slate-300 leading-relaxed">
                  <span className="font-bold text-amber-300 block text-xs">Binance Deposit Information:</span>
                  1 USDT = $1.00 USD • Min Deposit $5.00 USD • $1.00 FREE bonus on 1st deposit!
                </div>
              </div>

              {/* 1. Network Picker */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  1. Select Binance Network:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['BINANCE_PAY', 'USDT_TRC20', 'USDT_BEP20'] as const).map((net) => {
                    const isSel = selectedNetwork === net;
                    return (
                      <button
                        key={net}
                        type="button"
                        onClick={() => setSelectedNetwork(net)}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                          isSel
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm ring-1 ring-amber-500/30'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="font-black text-xs">
                          {net === 'BINANCE_PAY' ? 'Binance Pay' : net === 'USDT_TRC20' ? 'TRC-20' : 'BEP-20'}
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                          {net === 'BINANCE_PAY' ? '0% Fee • Fast' : net === 'USDT_TRC20' ? 'TRON Network' : 'BNB Smart Chain'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Official Admin Deposit Address / Pay ID Box */}
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between text-slate-300 text-[11px]">
                  <span className="font-bold text-amber-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {selectedNetwork === 'BINANCE_PAY'
                      ? 'Official Admin Binance Pay ID:'
                      : selectedNetwork === 'USDT_TRC20'
                      ? 'Official USDT (TRC-20) Deposit Address:'
                      : 'Official USDT (BEP-20) Deposit Address:'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 gap-2">
                  <span className="font-mono text-xs sm:text-sm font-black text-amber-300 tracking-wider truncate block">
                    {getAdminAccount(selectedNetwork)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(getAdminAccount(selectedNetwork))}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    {copiedNumber === getAdminAccount(selectedNetwork) ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-slate-950" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 leading-relaxed bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                  {selectedNetwork === 'BINANCE_PAY' && (
                    <span>💡 In Binance App &gt; <strong>Pay</strong> &gt; <strong>Send</strong>, enter the Pay ID above as Recipient ID and transfer USD.</span>
                  )}
                  {selectedNetwork === 'USDT_TRC20' && (
                    <span>💡 From your Binance or crypto wallet, select <strong>TRON (TRC20)</strong> network and send USDT to the address above.</span>
                  )}
                  {selectedNetwork === 'USDT_BEP20' && (
                    <span>💡 From your wallet, select <strong>BNB Smart Chain (BEP20)</strong> network and send USDT to the address above.</span>
                  )}
                </div>
              </div>

              {/* 3. Deposit Submission Form */}
              <form onSubmit={handleSubmitBinanceDeposit} className="space-y-3">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Complete payment and submit details below:
                </div>

                {/* Amount */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Deposit Amount ($ USD):
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={adminSettings?.minDepositUSD || 5}
                      step="any"
                      value={usdAmount}
                      onChange={(e) => setUsdAmount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:border-amber-400 outline-none"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-amber-300 font-mono font-bold">
                      USDT
                    </span>
                  </div>

                  {/* Quick Chips */}
                  <div className="flex gap-1.5 mt-2">
                    {[5, 10, 20, 50, 100].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setUsdAmount(amt)}
                        className={`flex-1 py-1 rounded-lg text-[11px] font-mono font-bold border transition cursor-pointer ${
                          usdAmount === amt
                            ? 'bg-amber-500 text-slate-950 border-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sender Pay ID / Account */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Your Binance Pay ID / Sender Account (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 749102381"
                    value={senderBinanceId}
                    onChange={(e) => setSenderBinanceId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none font-mono"
                  />
                </div>

                {/* Binance TxID / Order ID */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Binance Transaction ID (TxID / Order ID): <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BNP9824109842 or 0x7a2b..."
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none font-mono uppercase"
                  />
                </div>

                {/* Real Payment Screenshot Upload (NO DEMO SLIP BUTTON!) */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Payment Screenshot: <span className="text-rose-400">*</span>
                  </label>
                  
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-amber-400" />
                      <span>{screenshotUrl ? 'Select Different Image' : 'Upload Payment Screenshot'}</span>
                    </button>
                  </div>

                  {screenshotUrl && (
                    <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-emerald-500/30 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img 
                          src={screenshotUrl} 
                          alt="Slip Preview" 
                          className="w-12 h-12 object-cover rounded-lg border border-slate-700" 
                        />
                        <span className="text-emerald-400 text-xs font-semibold">Screenshot Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setScreenshotUrl(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="text-slate-400 hover:text-rose-400 text-xs p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* User Note */}
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Note for Admin (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Please approve quickly..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-amber-400 outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-950/50 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer mt-2"
                >
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>Submit Binance Deposit for Verification</span>
                </button>
              </form>

            </div>
          )}

        </div>
      )}
    </>
  );
};
