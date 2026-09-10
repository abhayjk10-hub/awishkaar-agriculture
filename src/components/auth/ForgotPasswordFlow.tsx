'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import InputField from '@/components/shared/InputField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import AlertMessage from '@/components/shared/AlertMessage';

type ForgotStep = 'identify' | 'verify' | 'reset' | 'completed';

interface ForgotPasswordFlowProps {
  initialMobile?: string;
  onSuccess: (updatedMobile: string) => void;
  onCancel: () => void;
}

export default function ForgotPasswordFlow({
  initialMobile = '',
  onSuccess,
  onCancel,
}: ForgotPasswordFlowProps) {
  const { language } = useLanguage();

  const [step, setStep] = useState<ForgotStep>('identify');
  const [mobile, setMobile] = useState(initialMobile.replace(/\D/g, '').slice(0, 10));
  const [otp, setOtp] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('842915');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<{
    mobile?: string;
    otp?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const isValidMobile = (num: string) => /^[6-9]\d{9}$/.test(num.trim());

  // Generate a realistic 6-digit OTP
  const generateSimulatedOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(code);
    return code;
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * STEP 1: IDENTIFY (Submit registered mobile number)
   * ───────────────────────────────────────────────────────────────────────── */
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!mobile.trim()) {
      newErrors.mobile = t('validation.required.mobile', language);
    } else if (!isValidMobile(mobile)) {
      newErrors.mobile = t('validation.invalid.mobile', language);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    // Simulate OTP generation & dispatch
    setTimeout(() => {
      const generated = generateSimulatedOtp();
      setLoading(false);
      setStep('verify');
      setResendCooldown(30);
      setAlert({
        type: 'info',
        message: `OTP sent successfully to +91 ${mobile.trim()}.`,
      });
    }, 600);
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * STEP 2: VERIFY (Enter 6-digit OTP)
   * ───────────────────────────────────────────────────────────────────────── */
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!otp.trim()) {
      newErrors.otp = t('validation.required.otp', language);
    } else if (!/^\d{6}$/.test(otp.trim())) {
      newErrors.otp = t('validation.invalid.otp', language);
    } else if (otp.trim() !== simulatedOtp && otp.trim() !== '123456') {
      newErrors.otp = 'Invalid OTP entered. Please use the simulated OTP or click resend.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    setTimeout(() => {
      setLoading(false);
      setStep('reset');
      setAlert({
        type: 'success',
        message: 'OTP verified successfully! Now create your new password.',
      });
    }, 500);
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) return;
    const newCode = generateSimulatedOtp();
    setOtp('');
    setResendCooldown(30);
    setAlert({
      type: 'info',
      message: `A new OTP has been dispatched to +91 ${mobile.trim()}.`,
    });
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * STEP 3: RESET (New Password & Confirm Password)
   * ───────────────────────────────────────────────────────────────────────── */
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required.';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = t('forgot.passwordTooShort', language);
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirmation password is required.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = t('forgot.passwordMismatch', language);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setAlert(null);

    // Save password simulation in localStorage for client-side demo persistence
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`km_pw_${mobile.trim()}`, newPassword);
      }
    } catch {}

    setTimeout(() => {
      setLoading(false);
      setStep('completed');
      setAlert({
        type: 'success',
        message: t('forgot.passwordSuccess', language),
      });

      // Auto redirect back to Login view after 2.2 seconds
      setTimeout(() => {
        onSuccess(mobile.trim());
      }, 2200);
    }, 700);
  };

  /* ─────────────────────────────────────────────────────────────────────────
   * STEP INDICATOR HEADER
   * ───────────────────────────────────────────────────────────────────────── */
  const stepNumber = step === 'identify' ? 1 : step === 'verify' ? 2 : 3;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Top Header & Back Link */}
      <div className="flex items-center justify-between border-b border-primary-100 pb-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-900 transition-colors py-1 px-2 rounded-lg hover:bg-primary-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          {t('forgot.backToLogin', language)}
        </button>

        {step !== 'completed' && (
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2.5 py-0.5 rounded-full border border-primary-200">
            Step {stepNumber} of 3
          </span>
        )}
      </div>

      {/* Visual Step Progress Bar */}
      {step !== 'completed' && (
        <div className="grid grid-cols-3 gap-2">
          <div className={`h-1.5 rounded-full transition-colors ${stepNumber >= 1 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-1.5 rounded-full transition-colors ${stepNumber >= 2 ? 'bg-primary-600' : 'bg-gray-200'}`} />
          <div className={`h-1.5 rounded-full transition-colors ${stepNumber >= 3 ? 'bg-primary-600' : 'bg-gray-200'}`} />
        </div>
      )}

      {/* Notification Alert Banner */}
      {alert && (
        <AlertMessage type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />
      )}

      {/* ───────────────────────────────────────────────────────────────────
       * STEP 1: IDENTIFY VIEW
       * ─────────────────────────────────────────────────────────────────── */}
      {step === 'identify' && (
        <form onSubmit={handleIdentify} noValidate className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-primary-950">
              {t('forgot.step1Title', language)}
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
              {t('forgot.step1Desc', language)}
            </p>
          </div>

          <InputField
            id="forgot-mobile"
            label={t('login.mobileNumber', language)}
            type="tel"
            inputMode="numeric"
            placeholder={t('login.mobilePlaceholder', language)}
            value={mobile}
            onChange={(e) => {
              setMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
              setErrors((prev) => ({ ...prev, mobile: undefined }));
            }}
            error={errors.mobile}
            icon={<Smartphone className="w-4 h-4" />}
            required
            autoComplete="tel"
            maxLength={10}
          />

          <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
            {t('forgot.sendOtp', language)}
          </PrimaryButton>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────────────
       * STEP 2: VERIFY VIEW
       * ─────────────────────────────────────────────────────────────────── */}
      {step === 'verify' && (
        <form onSubmit={handleVerifyOtp} noValidate className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-primary-950">
              {t('forgot.step2Title', language)}
            </h2>
            <p className="text-xs text-gray-600">
              {t('auth.otpSentTo', language)}{' '}
              <strong className="text-primary-950">+91 {mobile}</strong>
            </p>
          </div>

          {/* Simulated OTP helper badge */}
          <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-left space-y-2">
            <div className="flex items-center justify-between text-xs text-emerald-900 font-semibold">
              <span className="inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t('forgot.demoOtpNotice', language)}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtp(simulatedOtp);
                  setErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                className="text-[11px] bg-emerald-600 text-white font-medium px-2 py-0.5 rounded hover:bg-emerald-700 transition-colors"
              >
                Auto-Fill
              </button>
            </div>
            <div className="flex items-center justify-between bg-white px-3 py-1.5 rounded-lg border border-emerald-100">
              <span className="font-mono text-base font-bold text-emerald-800 tracking-widest">
                {simulatedOtp}
              </span>
              <span className="text-[11px] text-gray-500">Valid for 5 mins</span>
            </div>
          </div>

          <InputField
            id="forgot-otp"
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
            {t('forgot.verifyOtp', language)}
          </PrimaryButton>

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => {
                setStep('identify');
                setOtp('');
                setErrors({});
                setAlert(null);
              }}
              className="text-primary-700 hover:text-primary-900 underline"
            >
              Change number
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0}
              className={`inline-flex items-center gap-1 font-medium transition-colors ${
                resendCooldown > 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-primary-700 hover:text-primary-900 underline'
              }`}
            >
              <RefreshCw className={`w-3 h-3 ${resendCooldown > 0 ? 'animate-spin' : ''}`} />
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : t('forgot.resendOtp', language)}
            </button>
          </div>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────────────
       * STEP 3: RESET PASSWORD VIEW
       * ─────────────────────────────────────────────────────────────────── */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} noValidate className="space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-primary-950">
              {t('forgot.step3Title', language)}
            </h2>
            <p className="text-xs text-gray-600 max-w-sm mx-auto">
              {t('forgot.step3Desc', language)}
            </p>
          </div>

          <InputField
            id="forgot-new-password"
            label={t('forgot.newPassword', language)}
            type={showNewPassword ? 'text' : 'password'}
            placeholder={t('forgot.newPasswordPlaceholder', language)}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              setErrors((prev) => ({ ...prev, newPassword: undefined }));
            }}
            error={errors.newPassword}
            icon={<Lock className="w-4 h-4" />}
            required
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowNewPassword((p) => !p)}
                className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <InputField
            id="forgot-confirm-password"
            label={t('forgot.confirmPassword', language)}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder={t('forgot.confirmPasswordPlaceholder', language)}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
            error={errors.confirmPassword}
            icon={<ShieldCheck className="w-4 h-4" />}
            required
            autoComplete="new-password"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="text-gray-400 hover:text-primary-700 p-1 focus:outline-none"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
            {t('forgot.setPassword', language)}
          </PrimaryButton>
        </form>
      )}

      {/* ───────────────────────────────────────────────────────────────────
       * STEP 4: COMPLETED SCREEN
       * ─────────────────────────────────────────────────────────────────── */}
      {step === 'completed' && (
        <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-primary-950">Password Set Successfully</h3>
            <p className="text-xs text-gray-600 max-w-xs mx-auto">
              Your password has been updated. Returning you to the login screen...
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => onSuccess(mobile.trim())}
              className="inline-flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-800 text-white text-xs font-semibold py-2 px-5 rounded-lg transition-colors"
            >
              Sign In Now with New Password
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
