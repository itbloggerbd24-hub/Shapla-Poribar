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
  ChevronDown
} from 'lucide-react';
import { checkWithdrawalHours } from '../utils/withdrawalHours';
import { loadFromStorage, saveToStorage } from '../utils/storage';

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: number;
}

const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_welcome',
    sender: 'agent',
    text: 'Hello! Welcome to Shapla Poribar Help Desk. I am Agent Maya. How can I assist you today? You can ask about Binance deposits, payment screenshots, withdrawal hours, or game rules.',
    timestamp: Date.now() - 60000,
  },
];

const QUICK_TOPICS = [
  { label: '💳 How to Deposit?', query: 'How do I deposit money and submit screenshot?' },
  { label: '⏰ Withdrawal Hours', query: 'What are the withdrawal operating hours?' },
  { label: '📸 Screenshot Verification', query: 'Where do I submit my Binance payment screenshot?' },
  { label: '🎲 Minimum Bet & Limits', query: 'What is the minimum bet and withdrawal limit?' },
];

export const HelpDeskModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    loadFromStorage('support_chat_history', DEFAULT_MESSAGES)
  );
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    saveToStorage('support_chat_history', messages);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const generateAgentReply = (userQuery: string): string => {
    const query = userQuery.toLowerCase();
    const withdrawStatus = checkWithdrawalHours();

    if (query.includes('withdraw') || query.includes('cashout') || query.includes('tula') || query.includes('সময়') || query.includes('time') || query.includes('hours') || query.includes('rat 10') || query.includes('night')) {
      return `⏰ Withdrawal Operating Policy:
• Daily Service Hours: 10:00 AM – 10:00 PM.
• Night Closing Hours: Off from 10:00 PM to 10:00 AM.
• Current Status: ${withdrawStatus.isOpen ? '✅ Currently OPEN' : '🔴 Currently CLOSED (reopens at 10:00 AM)'}.
• Minimum withdrawal is $10.00 USD via Binance Pay ID or USDT.`;
    }

    if (query.includes('deposit') || query.includes('screenshot') || query.includes('photo') || query.includes('slip') || query.includes('ছবি') || query.includes('screen shot') || query.includes('approve') || query.includes('taka')) {
      return `💳 Deposit & Screenshot Submission Guide:
1. Open the "Deposit" modal and select Binance Pay ID or USDT (BEP-20 / TRC-20).
2. Copy the official Admin Binance ID/Address and send the exact amount from your Binance app.
3. Take a screenshot of the successful transaction slip.
4. Upload the screenshot image in the Deposit form, enter your TxID/Order ID, and click "Submit Deposit".
5. Admin directly checks the screenshot and approves your balance!`;
    }

    if (query.includes('rule') || query.includes('how to play') || query.includes('bet') || query.includes('shapla') || query.includes('poribar') || query.includes('kivabe')) {
      return `🎲 How to Play Shapla Poribar:
• Minimum bet is only $0.20 USD with unlimited maximum.
• Each round runs for exactly 30 seconds.
• Select your amount and click SHAPLA or PORIBAR before the countdown timer hits 0.
• Winning side pays 1.85x (100% stake returned + 85% net profit directly added to wallet)!`;
    }

    if (query.includes('txid') || query.includes('pending') || query.includes('add hoy nai') || query.includes('somossa') || query.includes('problem') || query.includes('help')) {
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      return `👨‍💼 Support Ticket Created: #TKT-${ticketNum}
Our finance officer has received your notice. If you deposited, please confirm that you uploaded your payment screenshot and correct Binance TxID. All verified screenshots are credited within 2-5 minutes!`;
    }

    return `Thank you for reaching out! Agent Maya here. Our support desk is ready to help you with:
• Binance USD deposits & screenshot verification
• Withdrawal status (Open 10:00 AM – 10:00 PM)
• Fast wallet updates and game rules
Please let me know if you would like assistance with anything specific!`;
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const replyText = generateAgentReply(text);
      const agentMsg: ChatMessage = {
        id: `agent_${Date.now()}`,
        sender: 'agent',
        text: replyText,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
      if (!isOpen) {
        setUnreadCount((c) => c + 1);
      }
    }, 900);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
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
              Help Desk
            </span>
            <span className="text-[9px] text-emerald-200/90 font-medium block mt-0.5">
              Live Agent Online
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
        <div className="fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 z-50 sm:w-96 sm:h-[540px] flex flex-col bg-slate-900 border border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                  <h3 className="text-sm font-black text-white">Agent Maya</h3>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
                    Support
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online • Typically replies instantly
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

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-950/70">
            
            {/* Quick Action Chips */}
            <div className="pb-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                Quick Assistance:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(topic.query)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-slate-200 transition text-left cursor-pointer"
                  >
                    {topic.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat List */}
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-line shadow ${
                    m.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-xs'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-xs'
                  }`}
                >
                  {m.text}
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
                <span className="text-[11px] text-slate-500 ml-1">Agent Maya is typing...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about deposits, screenshots, hours..."
                className="flex-1 bg-slate-950 border border-slate-700/90 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-400"
              />
              <button
                onClick={() => handleSendMessage()}
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
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
              <span>Verified Agent Support Desk</span>
              <span className="text-emerald-400 font-semibold">24/7 Live Response</span>
            </div>
          </div>

        </div>
      )}
    </>
  );
};
