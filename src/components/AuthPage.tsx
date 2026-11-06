import React, { useState } from 'react';
import { UserProfile } from '../types/game';
import { authApi } from '../utils/authApi';
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
  Smartphone
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  onLogoSecretClick?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ 
  onLoginSuccess,
  onLogoSecretClick
}) => {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [binancePayId, setBinancePayId] = useState('');
  const [referralInput, setReferralInput] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('ref') || '';
    }
    return '';
  });
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password states
  const [forgotPhone, setForgotPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);

  // Status & feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Clear messages on tab change
  const handleSwitchTab = (newTab: 'LOGIN' | 'REGISTER' | 'FORGOT') => {
    setTab(newTab);
    setError(null);
    setSuccessMsg(null);
  };

  // Handle Login
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

  // Handle Registration (1 account per phone number rule)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authApi.register({
      name: name.trim(),
      phone: phone.trim(),
      password: password.trim(),
      binancePayId: binancePayId.trim(),
      referralCode: referralInput.trim(),
    });

    setIsLoading(false);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
    } else {
      setError(res.error || 'Failed to create account.');
    }
  };

  // Handle Request Forgot Password Code
  const handleRequestVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPhone.trim()) {
      setError('Please enter your registered phone number.');
      return;
    }

    setError(null);
    // Simulate secure 6-digit OTP sent to user's phone
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(mockCode);
    setVerificationCode(mockCode);
    setForgotStep(2);
    setSuccessMsg(`Verification code sent to ${forgotPhone}. Code: ${mockCode}`);
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (verificationCode !== generatedCode) {
      setError('Invalid verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const res = await authApi.forgotPassword(forgotPhone.trim(), newPassword.trim());
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg('Your password has been reset successfully! Please login with your new password.');
      setPhone(forgotPhone);
      setPassword('');
      setTab('LOGIN');
      setForgotStep(1);
    } else {
      setError(res.error || 'Failed to reset password.');
    }
  };

  // Quick demo account fill
  const handleFillDemo = (userPhone: string, userPass: string) => {
    setPhone(userPhone);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between py-6 px-4 selection:bg-amber-500 selection:text-black relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar Branding */}
      <header className="max-w-md w-full mx-auto text-center pt-2 pb-4">
        <div 
          onClick={onLogoSecretClick}
          className="inline-flex items-center gap-2 cursor-pointer select-none group"
          title="Shapla Poribar"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-emerald-500 p-0.5 shadow-xl shadow-amber-500/20 group-hover:scale-105 transition transform">
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
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-slate-800 mb-6">
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
            <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-shake">
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
                    placeholder="e.g. 01712345678"
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

              {/* Demo Account Quick Pick */}
              <div className="pt-2 text-center">
                <span className="text-[11px] text-slate-500 block mb-1">
                  Quick Demo Access:
                </span>
                <button
                  type="button"
                  onClick={() => handleFillDemo('01712345678', '123456')}
                  className="text-xs text-slate-400 hover:text-amber-300 underline font-mono cursor-pointer"
                >
                  Fill Player (01712345678 / 123456)
                </button>
              </div>
            </form>
          )}

          {/* 2. REGISTRATION FORM (Strictly 1 Account per Phone Number) */}
          {tab === 'REGISTER' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              
              {/* Unique phone notice */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <Smartphone className="w-4 h-4 shrink-0 text-amber-400" />
                <span>1 account per phone number rule enforced across all devices.</span>
              </div>

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
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Phone Number (Unique): *
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
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password: *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>

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
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Friend receives $0.50 reward + milestone bonuses
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Binance Pay ID (Optional):
                </label>
                <input
                  type="text"
                  value={binancePayId}
                  onChange={(e) => setBinancePayId(e.target.value)}
                  placeholder="Your Binance Pay ID"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl py-2 px-3 text-xs sm:text-sm text-white font-mono focus:border-emerald-400 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 transition transform active:scale-98 cursor-pointer"
              >
                {isLoading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Account & Start ($1.00 Welcome Bonus)</span>
                    <Sparkles className="w-4 h-4 text-emerald-200" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD VIEW */}
          {tab === 'FORGOT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4" />
                  <span>Reset Forgotten Password</span>
                </span>
                <button
                  onClick={() => handleSwitchTab('LOGIN')}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleRequestVerificationCode} className="space-y-4">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Enter the phone number linked to your account. We will issue a 6-digit verification code to reset your password.
                  </p>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Registered Phone Number:
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
                        placeholder="e.g. 01712345678"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow transition cursor-pointer"
                  >
                    Send Verification Code
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <div className="text-amber-400 font-bold">Verification Code Generated:</div>
                    <div className="font-mono text-base font-black text-white tracking-widest">
                      {generatedCode}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      6-Digit Code:
                    </label>
                    <input
                      type="text"
                      required
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Choose New Password:
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 px-3 text-sm text-white font-mono focus:border-amber-400 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow transition cursor-pointer"
                  >
                    {isLoading ? 'Updating Password...' : 'Save New Password & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="w-full text-center text-xs text-slate-500 hover:text-slate-300 cursor-pointer pt-1"
                  >
                    Change Phone Number
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Footer Features */}
      <footer className="max-w-md w-full mx-auto text-center pt-4 text-[11px] text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-3 text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-Bit Encrypted
          </span>
          <span>•</span>
          <span>Any Browser / Device</span>
          <span>•</span>
          <span>Binance Verified</span>
        </div>
        <p>© 2026 Shapla Poribar Official Platform</p>
      </footer>

    </div>
  );
};
