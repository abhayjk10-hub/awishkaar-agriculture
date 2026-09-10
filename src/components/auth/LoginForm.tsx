'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Smartphone, Lock, Eye, EyeOff, KeyRound, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import InputField from '@/components/shared/InputField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import AlertMessage from '@/components/shared/AlertMessage';
import ForgotPasswordFlow from '@/components/auth/ForgotPasswordFlow';

type LoginMethod = 'password' | 'otp';
type ActiveView = 'login' | 'forgot-password';

export default function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const { language } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  // Active view: standard login vs forgot-password flow
  const [activeView, setActiveView] = useState<ActiveView>('login');
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');

  // Form states
  const [identifier, setIdentifier] = useState(''); // Mobile number or Email
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpMobile, setOtpMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string; otpMobile?: string; otp?: string }>({});

  const isValidMobile = (num: string) => /^[6-9]\d{9}$/.test(num.trim().replace(/\D/g, ''));

  // Validation helper: allows either a valid email format OR exactly 10 digits
  const validateIdentifier = (val: string): boolean => {
    const trimmed = val.trim();
    if (trimmed.includes('@')) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    }
    const digitsOnly = trimmed.replace(/\D/g, '');
    return digitsOnly.length === 10;
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 1. PASSWORD-BASED LOGIN SUBMISSION
   * ───────────────────────────────────────────────────────────────────────── */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your mobile number or email.';
    } else if (!validateIdentifier(identifier)) {
      newErrors.identifier = 'Please enter a valid email format or exactly 10 digits.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      // 1. Input Check: check if input contains @ symbol
      const isEmail = identifier.includes('@');
      let authResponse;

      if (isEmail) {
        // 2. Email Logic: pass directly using email key
        authResponse = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password: password,
        });
      } else {
        // 3. Phone Logic: prepend country code +91 and pass using phone key
        const cleanDigits = identifier.trim().replace(/\D/g, '');
        const formattedPhone = '+91' + cleanDigits;
        authResponse = await supabase.auth.signInWithPassword({
          phone: formattedPhone,
          password: password,
        });
      }

      const { data, error } = authResponse;

      if (error) {
        throw error;
      }

      setAlert({ type: 'success', message: 'Login successful! Redirecting to Home page...' });
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('error.generic', language);
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 2. OTP-BASED LOGIN (ALTERNATIVE QUICK SIGN-IN)
   * ───────────────────────────────────────────────────────────────────────── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!otpMobile.trim()) newErrors.otpMobile = t('validation.required.mobile', language);
    else if (!isValidMobile(otpMobile)) newErrors.otpMobile = t('validation.invalid.mobile', language);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setAlert(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: '+91' + otpMobile.trim().replace(/\D/g, ''),
      });
      if (error) throw error;
      setOtpSent(true);
      setAlert({ type: 'info', message: t('login.otpSent', language) });
    } catch (err) {
      const isNetwork = err instanceof TypeError && err.message.includes('fetch');
      const message = isNetwork
        ? t('error.network', language)
        : err instanceof Error && err.message.includes('Supabase Phone Auth')
          ? err.message
          : t('error.generic', language);
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!otp.trim()) newErrors.otp = t('validation.required.otp', language);
    else if (!/^\d{6}$/.test(otp.trim())) newErrors.otp = t('validation.invalid.otp', language);
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setLoading(true);
    setAlert(null);
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: '+91' + otpMobile.trim().replace(/\D/g, ''),
        token: otp.trim(),
        type: 'sms',
      });
      if (error) throw error;
      setAlert({ type: 'success', message: 'Login successful! Redirecting to Home page...' });
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 700);
    } catch (err) {
      const isNetwork = err instanceof TypeError && err.message.includes('fetch');
      const message = isNetwork
        ? t('error.network', language)
        : err instanceof Error && err.message.includes('Supabase Phone Auth')
          ? err.message
          : t('error.generic', language);
      setAlert({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * 3. FORGOT PASSWORD CALLBACKS
   * ───────────────────────────────────────────────────────────────────────── */
  const handleForgotPasswordSuccess = (updatedMobile: string) => {
    setIdentifier(updatedMobile);
    setPassword('');
    setActiveView('login');
    setLoginMethod('password');
    setAlert({
      type: 'success',
      message: 'Password updated successfully! Please log in with your new password.',
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER: FORGOT PASSWORD FLOW
   * ───────────────────────────────────────────────────────────────────────── */
  if (activeView === 'forgot-password') {
    return (
      <ForgotPasswordFlow
        initialMobile={identifier}
        onSuccess={handleForgotPasswordSuccess}
        onCancel={() => {
          setActiveView('login');
          setAlert(null);
        }}
      />
    );
  }

  /* ─────────────────────────────────────────────────────────────────────────
   * RENDER: LOGIN SCREEN
   * ───────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* Login Method Toggle */}
      <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-semibold text-gray-600">
        <button
          type="button"
          onClick={() => {
            setLoginMethod('password');
            setErrors({});
            setAlert(null);
          }}
          className={`flex-1 py-1.5 rounded-md transition-all ${
            loginMethod === 'password'
              ? 'bg-white text-primary-900 shadow-sm'
              : 'hover:text-primary-800'
          }`}
        >
          {t('login.loginWithPassword', language)}
        </button>
        <button
          type="button"
          onClick={() => {
            setLoginMethod('otp');
            if (!otpMobile && isValidMobile(identifier)) {
              setOtpMobile(identifier.replace(/\D/g, '').slice(0, 10));
            }
            setErrors({});
            setAlert(null);
          }}
          className={`flex-1 py-1.5 rounded-md transition-all ${
            loginMethod === 'otp'
              ? 'bg-white text-primary-900 shadow-sm'
              : 'hover:text-primary-800'
          }`}
        >
          {t('login.loginWithOtp', language)}
        </button>
      </div>

      {/* ── MODE A: PASSWORD LOGIN FORM ── */}
      {loginMethod === 'password' ? (
        <form onSubmit={handlePasswordLogin} noValidate className="space-y-4">
          {/* Mobile Number or Email Field */}
          <InputField
            id="login-identifier"
            label="Mobile Number or Email"
            type="text"
            placeholder="10-digit mobile number or email"
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value);
              setErrors((prev) => ({ ...prev, identifier: undefined }));
            }}
            error={errors.identifier}
            icon={<Smartphone className="w-4 h-4" />}
            required
            autoComplete="username"
          />

          {/* Password Field + Forgot Password Link */}
          <div className="space-y-1">
            <InputField
              id="login-password"
              label={t('login.password', language)}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('login.passwordPlaceholder', language)}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={errors.password}
              icon={<Lock className="w-4 h-4" />}
              required
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            {/* Forgot Password Link Button */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveView('forgot-password');
                  setAlert(null);
                }}
                className="text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors focus:outline-none focus:underline"
              >
                {t('login.forgotPassword', language)}
              </button>
            </div>
          </div>

          <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
            {t('login.signInBtn', language)}
          </PrimaryButton>
        </form>
      ) : (
        /* ── MODE B: MOBILE OTP LOGIN FORM ── */
        !otpSent ? (
          <form onSubmit={handleSendOtp} noValidate className="space-y-4">
            <InputField
              id="login-otp-mobile"
              label={t('login.mobileNumber', language)}
              type="tel"
              inputMode="numeric"
              placeholder={t('login.mobilePlaceholder', language)}
              value={otpMobile}
              onChange={(e) => {
                setOtpMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                setErrors((prev) => ({ ...prev, otpMobile: undefined }));
              }}
              error={errors.otpMobile}
              icon={<Smartphone className="w-4 h-4" />}
              required
              autoComplete="tel"
              maxLength={10}
            />
            <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
              {t('login.sendOtp', language)}
            </PrimaryButton>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
            <div className="text-sm text-primary-700 bg-primary-50 rounded-xl p-3 border border-primary-200">
              OTP sent to <strong>+91 {otpMobile}</strong>
            </div>
            <InputField
              id="login-otp"
              label={t('login.otp', language)}
              type="text"
              inputMode="numeric"
              placeholder={t('login.otpPlaceholder', language)}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                setErrors((prev) => ({ ...prev, otp: undefined }));
              }}
              error={errors.otp}
              icon={<KeyRound className="w-4 h-4" />}
              required
              autoComplete="one-time-code"
              maxLength={6}
            />
            <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
              {t('login.verifyOtp', language)}
            </PrimaryButton>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); setErrors({}); setAlert(null); }}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-primary-600 hover:text-primary-800 py-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              {t('login.resendOtp', language)}
            </button>
          </form>
        )
      )}

      {/* Switch to Register link */}
      <div className="pt-3 border-t border-primary-100 text-center">
        <p className="text-sm text-gray-600">
          {t('login.newFarmer', language)}{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-semibold text-primary-600 hover:text-primary-800 underline underline-offset-2 transition-colors"
          >
            {t('login.registerNow', language)}
          </button>
        </p>
      </div>
    </div>
  );
}
