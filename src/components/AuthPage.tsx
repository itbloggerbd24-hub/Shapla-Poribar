import React, { useState, useEffect } from 'react';
import { AdminSettings, UserProfile } from '../types/game';
import { DEFAULT_BONUS_CONFIG } from '../utils/storage';
import { authApi, normalizePhone } from '../utils/authApi';
import { 
  Coins, 
  Lock, 
  Phone, 
  User, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  KeyRound,
  RotateCcw,
  Smartphone,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Copy,
  Check
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onLogoSecretClick?: () => void;
  adminSettings?: AdminSettings;
}

const SECURITY_QUESTIONS = [
  "What is your childhood nickname?",
  "What is your mother's maiden name?",
  "What was the name of your first school?",
  "What city or town were you born in?",
  "What was your first pet's name?",
  "What is your favorite dish or food?",
];

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onLoginSuccess,
  onLogoSecretClick,
  adminSettings
}) => {
  const bonusCfg = {
    ...DEFAULT_BONUS_CONFIG,
    ...(adminSettings?.bonusConfig || {}),
  };
  const welcomeAmt = Number(bonusCfg.welcomeBonusUSD ?? 1.00);
  const showWelcomeBonusLabel = bonusCfg.bonusesEnabled && bonusCfg.welcomeBonusEnabled && welcomeAmt > 0;
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Login states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regNid, setRegNid] = useState('');
  const [regQuestion, setRegQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [regAnswer, setRegAnswer] = useState('');
  const [regVerificationCode, setRegVerificationCode] = useState('');
  const [regBinancePayId, setRegBinancePayId] = useState('');
  const [referralInput, setReferralInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || '';
    }
    return '';
  });

  // Verification code sending state & countdown
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  // Simulated SMS Toast Notification for Demo / Realistic Experience
  const [simulatedSms, setSimulatedSms] = useState<{
    phone: string;
    code?: string;
    question?: string;
    answer?: string;
    message: string;
    timestamp: number;
  } | null>(null);

  // Forgot password states
  // Forgot password states:
  // 'RESET_FORM' -> Select security question + answer below + new password
  // 'RECOVER_NID' -> Forgot question? Verify NID + Phone to receive SMS with question & answer
  const [forgotStep, setForgotStep] = useState<'RESET_FORM' | 'RECOVER_NID'>('RESET_FORM');
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotSecurityQuestion, setForgotSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [forgotSecurityAnswer, setForgotSecurityAnswer] = useState('');
  const [forgotNid, setForgotNid] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');

  // Status & feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Timer for resend code
  useEffect(() => {
    if (codeCountdown <= 0) return;
    const timer = setInterval(() => {
      setCodeCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [codeCountdown]);

  // Clear messages on tab change
  const handleSwitchTab = (newTab: 'LOGIN' | 'REGISTER' | 'FORGOT') => {
    setTab(newTab);
    setError(null);
    setSuccessMsg(null);
    setForgotStep('RESET_FORM');
  };

  // 1. Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password.trim()) {
      setError('Please provide your phone number and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authApi.login(phone.trim(), password.trim());
    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Failed to login. Please try again.');
    }
  };

  // 2. Handle Send Verification Code (for Registration)
  const handleSendVerificationCode = async () => {
    const clean = normalizePhone(regPhone);
    if (!clean || clean.length < 8) {
      setError('Please enter a valid phone number (at least 8 digits) before requesting code.');
      return;
    }

    setIsSendingCode(true);
    setError(null);

    const res = await authApi.sendVerificationCode(regPhone.trim());
    setIsSendingCode(false);

    if (res.success) {
      setCodeSent(true);
      setCodeCountdown(60);
      const code = res.code || Math.floor(100000 + Math.random() * 900000).toString();
      
      // Trigger realistic SMS notification banner
      setSimulatedSms({
        phone: regPhone.trim(),
        code,
        message: `Your Shapla Poribar account verification code is: ${code}. (Valid for 15 minutes).`,
        timestamp: Date.now(),
      });
      setSuccessMsg(`Verification code sent to ${regPhone.trim()}.`);
    } else {
      setError(res.error || 'Could not send verification code.');
    }
  };

  // 3. Handle Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regPhone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (!regVerificationCode.trim()) {
      setError('Please enter the 6-digit verification code sent to your phone.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }
    if (!regNid.trim() || regNid.trim().length < 8) {
      setError('Please provide a valid National ID (NID) number (min 8 digits).');
      return;
    }
    if (!regAnswer.trim()) {
      setError('Please provide an answer to your security question.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authApi.register({
      name: regName.trim(),
      phone: regPhone.trim(),
      password: regPassword.trim(),
      nid: regNid.trim(),
      securityQuestion: regQuestion,
      securityAnswer: regAnswer.trim(),
      verificationCode: regVerificationCode.trim(),
      binancePayId: regBinancePayId.trim(),
      referralCode: referralInput.trim(),
    });

    setIsLoading(false);

    if (res.success && res.user) {
      setPhone(regPhone.trim());
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  // 4. Handle Reset Password: Phone + Selected Security Question + Security Answer + New Password
  const handleResetWithQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) {
      setError('Please provide your registered phone number.');
      return;
    }
    if (!forgotSecurityQuestion) {
      setError('Please select your security question.');
      return;
    }
    if (!forgotSecurityAnswer.trim()) {
      setError('Please provide your security question answer in the box below.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authApi.resetWithSecurityQuestion(
      forgotPhone.trim(),
      forgotSecurityQuestion,
      forgotSecurityAnswer.trim(),
      forgotNewPassword.trim()
    );
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Your password has been reset successfully! Please sign in with your new password.');
      setPhone(forgotPhone.trim());
      setPassword(forgotNewPassword);
      setTab('LOGIN');
      setForgotStep('RESET_FORM');
    } else {
      setError(res.error || 'Failed to reset password.');
    }
  };

  // 5. Handle Recover Question via NID + Phone Number
  const handleRecoverViaNidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim() || !forgotNid.trim()) {
      setError('Both registered phone number and NID number are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authApi.recoverSecurityQuestion(forgotPhone.trim(), forgotNid.trim());
    setIsLoading(false);

    if (res.success && res.securityQuestion && res.securityAnswer) {
      setForgotSecurityQuestion(res.securityQuestion);
      setForgotSecurityAnswer(res.securityAnswer);

      // Trigger simulated SMS message showing the details
      setSimulatedSms({
        phone: forgotPhone.trim(),
        question: res.securityQuestion,
        answer: res.securityAnswer,
        message: `Security Recovery: Your Security Question is "${res.securityQuestion}" and Answer is "${res.securityAnswer}".`,
        timestamp: Date.now(),
      });

      setSuccessMsg('Security details verified! We sent your question & answer via SMS and filled them in below. Please enter your new password.');
      setForgotStep('RESET_FORM');
    } else {
      setError(res.error || 'Verification failed. Please check your phone number and NID number.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-4 px-3 sm:py-6 sm:px-4 selection:bg-amber-500 selection:text-black relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Simulated SMS Push Notification (Realistic Phone Dispatch Simulation) */}
      {simulatedSms && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-3 animate-bounce">
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border-2 border-emerald-400 shadow-2xl text-slate-100 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-black text-emerald-400 uppercase tracking-wider text-[10px]">
                  Incoming SMS (+880 {simulatedSms.phone})
                </span>
                <button
                  type="button"
                  onClick={() => setSimulatedSms(null)}
                  className="text-slate-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-200 leading-snug">
                {simulatedSms.message}
              </p>
              {simulatedSms.code && tab === 'REGISTER' && (
                <button
                  type="button"
                  onClick={() => {
                    setRegVerificationCode(simulatedSms.code!);
                    setSimulatedSms(null);
                  }}
                  className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] inline-flex items-center gap-1 cursor-pointer hover:bg-emerald-400"
                >
                  <Check className="w-3 h-3" />
                  <span>Tap to Autofill Code: {simulatedSms.code}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Bar Branding */}
      <header className="max-w-md w-full mx-auto text-center pt-1 pb-3">
        <div 
          onClick={onLogoSecretClick}
          className="inline-flex items-center gap-2 cursor-pointer select-none group"
          title="Shapla Poribar"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 p-0.5 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Coins className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 bg-clip-text text-transparent">
              Shapla Poribar
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Binance Instant Prediction
            </p>
          </div>
        </div>
      </header>

      {/* Main Auth Card */}
      <main className="max-w-md w-full mx-auto my-auto z-10">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
          
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-5">
            <button
              type="button"
              onClick={() => handleSwitchTab('LOGIN')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                tab === 'LOGIN'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => handleSwitchTab('REGISTER')}
              className={`py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer ${
                tab === 'REGISTER'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Open Account
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* 1. LOGIN FORM */}
          {tab === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Phone Number:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-mono focus:border-amber-400 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300">
                    Password:
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchTab('FORGOT')}
                    className="text-xs text-amber-400 hover:underline cursor-pointer font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2.5 pl-9 pr-10 text-sm text-white font-mono focus:border-amber-400 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-950/40 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Play</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Phone Verification Code + NID + Security Question) */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              {/* Security Banner */}
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Verified registration: Phone SMS code, NID & Security Question required.</span>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Full Name: *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              {/* Phone Number with Send Code Action */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number: *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="e.g. 017XXXXXXXX"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSendingCode || codeCountdown > 0}
                    onClick={handleSendVerificationCode}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer border ${
                      codeCountdown > 0
                        ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md'
                    }`}
                  >
                    {isSendingCode ? 'Sending...' : codeCountdown > 0 ? `${codeCountdown}s` : 'Send Code'}
                  </button>
                </div>
              </div>

              {/* 6-Digit SMS Verification Code */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-300">
                    6-Digit SMS Verification Code: *
                  </label>
                  {codeSent && (
                    <span className="text-[10px] text-emerald-400 font-medium">
                      Code dispatched
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={regVerificationCode}
                  onChange={(e) => setRegVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-amber-300 font-mono font-bold tracking-widest focus:border-amber-400 outline-none"
                />
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password: *
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Confirm: *
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              {/* National Identity Number (NID) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center justify-between">
                  <span>National ID (NID) Number: *</span>
                  <span className="text-[10px] text-slate-400">10 to 17 digits</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regNid}
                    onChange={(e) => setRegNid(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 1995471829401"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              {/* Security Question Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security Question (For Password Recovery): *</span>
                </label>
                <select
                  value={regQuestion}
                  onChange={(e) => setRegQuestion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-2.5 text-xs text-white focus:border-emerald-400 outline-none"
                >
                  {SECURITY_QUESTIONS.map((q) => (
                    <option key={q} value={q} className="bg-slate-900 text-white">
                      {q}
                    </option>
                  ))}
                </select>
              </div>

              {/* Security Answer */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Security Answer: *
                </label>
                <input
                  type="text"
                  required
                  value={regAnswer}
                  onChange={(e) => setRegAnswer(e.target.value)}
                  placeholder="Your secret answer (case-insensitive)"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-white focus:border-emerald-400 outline-none"
                />
              </div>

              {/* Binance Pay ID */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Binance Pay ID (Optional):
                </label>
                <input
                  type="text"
                  value={regBinancePayId}
                  onChange={(e) => setRegBinancePayId(e.target.value)}
                  placeholder="Your Binance Pay ID"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                />
              </div>

              {/* Referral Code */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Referral Code (Optional):
                </label>
                <input
                  type="text"
                  value={referralInput}
                  onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                  placeholder="e.g. SP-ALEX77"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-amber-300 font-mono font-bold focus:border-amber-400 outline-none uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>
                      {showWelcomeBonusLabel
                        ? `Create Account ($${welcomeAmt.toFixed(2)} Welcome Bonus)`
                        : 'Create Account'}
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD VIEW (Select Security Question + Box for Answer, with Forgot Question option) */}
          {tab === 'FORGOT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>
                    {forgotStep === 'RECOVER_NID' ? 'Recover Security Question via NID' : 'Reset Password with Security Question'}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleSwitchTab('LOGIN')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer font-medium"
                >
                  Back to Sign In
                </button>
              </div>

              {/* View 1: Main Password Reset Form (Phone + Select Security Question + Answer below + New Password) */}
              {forgotStep === 'RESET_FORM' && (
                <form onSubmit={handleResetWithQuestionSubmit} className="space-y-3.5">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Select your security question, provide the answer in the box below, and set your new password.
                  </p>

                  {/* Registered Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registered Phone Number: *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="e.g. 01883239867"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  {/* 1. SELECT SECURITY QUESTION */}
                  <div>
                    <label className="block text-xs font-bold text-amber-400 mb-1">
                      Select Security Question: *
                    </label>
                    <div className="relative">
                      <select
                        value={forgotSecurityQuestion}
                        onChange={(e) => setForgotSecurityQuestion(e.target.value)}
                        className="w-full bg-slate-950 border border-amber-500/50 rounded-xl py-2.5 px-3 text-xs sm:text-sm text-white font-medium focus:border-amber-400 outline-none appearance-none cursor-pointer"
                      >
                        {SECURITY_QUESTIONS.map((q, idx) => (
                          <option key={idx} value={q} className="bg-slate-900 text-white">
                            {q}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-amber-400">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* 2. SECURITY ANSWER (IN THE BOX BELOW) */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-300">
                        Security Answer: *
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setError(null);
                          setSuccessMsg(null);
                          setForgotStep('RECOVER_NID');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline font-bold cursor-pointer"
                      >
                        Forgot Question / Answer?
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={forgotSecurityAnswer}
                      onChange={(e) => setForgotSecurityAnswer(e.target.value)}
                      placeholder="Type your answer here"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      New Password: *
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Confirm New Password: *
                    </label>
                    <input
                      type="password"
                      required
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-950/40 transition transform active:scale-98 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? 'Updating Password...' : 'Reset Password & Sign In'}
                  </button>

                  {/* Forgot Security Question Option Button */}
                  <div className="pt-2 text-center border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setSuccessMsg(null);
                        setForgotStep('RECOVER_NID');
                      }}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold hover:underline cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Forgot Security Question? Recover via NID & Phone</span>
                    </button>
                  </div>
                </form>
              )}

              {/* View 2: Recover Security Question via NID + Phone */}
              {forgotStep === 'RECOVER_NID' && (
                <form onSubmit={handleRecoverViaNidSubmit} className="space-y-3.5">
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 leading-relaxed">
                    Forgot your security question? Enter your registered Phone Number and National ID (NID). If they match our records, an SMS will be dispatched to your phone containing your registered security question and answer.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registered Phone Number: *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        required
                        value={forgotPhone}
                        onChange={(e) => setForgotPhone(e.target.value)}
                        placeholder="e.g. 01883239867"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-9 pr-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Registered National ID (NID) Number: *
                    </label>
                    <input
                      type="text"
                      required
                      value={forgotNid}
                      onChange={(e) => setForgotNid(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Enter registered NID number"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm shadow transition cursor-pointer"
                  >
                    {isLoading ? 'Verifying NID...' : 'Verify NID & Dispatch SMS'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setSuccessMsg(null);
                      setForgotStep('RESET_FORM');
                    }}
                    className="w-full text-center text-xs text-slate-400 hover:text-white cursor-pointer pt-1"
                  >
                    ← Back to Password Reset Form
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      </main>

      {/* Footer Features */}
      <footer className="max-w-md w-full mx-auto text-center pt-3 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit Encrypted
          </span>
          <span>•</span>
          <span>NID Verified</span>
          <span>•</span>
          <span>Binance Instant</span>
        </div>
        <p>© 2026 Shapla Poribar Official Platform</p>
      </footer>

    </div>
  );
};
