'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Sprout,
  Warehouse,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import PageContainer from '@/components/shared/PageContainer';
import FieldMotion from '@/components/shared/FieldMotion';
import FormCard from '@/components/shared/FormCard';
import RegisterForm from '@/components/auth/RegisterForm';
import { UserRole } from '@/types';

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { language } = useLanguage();

  const initialRole: UserRole = searchParams.get('role') === 'mandi' ? 'mandi' : 'farmer';
  const [role, setRole] = useState<UserRole>(initialRole);

  useEffect(() => {
    if (!loading && user) {
      router.push('/slot-booking');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div
            className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin"
            role="status"
            aria-label={t('common.loading', language)}
          />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center min-h-[calc(100vh-10rem)] py-6">
        
        {/* Left Information Card */}
        <div className="hidden lg:block rounded-[2rem] overflow-hidden min-h-[640px] relative bg-primary-950 shadow-2xl">
          <FieldMotion className="opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(15,45,34,.36),rgba(6,20,16,.94))]" />
          <div className="relative z-10 h-full p-10 flex flex-col justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-400 text-primary-950 flex items-center justify-center font-bold shadow-md">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="font-bold tracking-wide text-base">{t('auth.brand', language)}</span>
                <p className="text-[11px] text-primary-300">{t('appTagline', language)}</p>
              </div>
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-primary-200 border border-white/15 mb-4">
                {role === 'farmer' ? t('register.farmerRole', language) : t('register.mandiRole', language)}
              </span>

              <h2 className="display-font text-4xl sm:text-5xl leading-tight font-bold">
                {role === 'farmer'
                  ? t('register.title', language)
                  : t('register.mandiSubtitle', language)}
              </h2>

              <div className="mt-8 space-y-3 text-sm text-primary-100">
                {role === 'farmer' ? (
                  <>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{t('login.farmerPoint1', language)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{t('login.farmerPoint2', language)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span>{t('login.farmerPoint3', language)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>{t('login.mandiPoint1', language)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>{t('login.mandiPoint2', language)}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>{t('login.mandiPoint3', language)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="max-w-md w-full mx-auto">

          {/* ── ROLE SELECTOR TOGGLE ── */}
          <div className="mb-6">
            <div className="bg-primary-950/90 p-1.5 rounded-2xl border border-primary-800/40 flex shadow-md">
              <button
                type="button"
                id="role-reg-farmer"
                onClick={() => setRole('farmer')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === 'farmer'
                    ? 'bg-emerald-500 text-emerald-950 shadow-md ring-2 ring-emerald-300/50'
                    : 'text-primary-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sprout className="w-4 h-4 shrink-0" />
                <span>{t('register.farmerRole', language)}</span>
              </button>

              <button
                type="button"
                id="role-reg-mandi"
                onClick={() => setRole('mandi')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  role === 'mandi'
                    ? 'bg-amber-400 text-amber-950 shadow-md ring-2 ring-amber-200/50'
                    : 'text-primary-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span>{t('register.mandiRole', language)}</span>
              </button>
            </div>
          </div>

          {role === 'farmer' ? (
            <div>
              {/* Top Branding */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-800 text-white rounded-2xl shadow-lg mb-3">
                  <Sprout className="w-7 h-7" aria-hidden="true" />
                </div>
                <h1 className="display-font text-3xl font-bold text-primary-950">
                  {t('register.title', language)}
                </h1>
                <p className="mt-1 text-xs text-primary-700">
                  {t('register.subtitle', language)}
                </p>
              </div>

              {/* Navigation Switch to Sign In */}
              <div className="flex rounded-xl border border-primary-200 bg-white/70 p-1 mb-5 shadow-sm">
                <Link
                  href="/login?role=farmer"
                  className="flex-1 py-2 text-center text-sm font-semibold rounded-lg text-primary-600 hover:text-primary-800 transition-all"
                >
                  {t('nav.signIn', language)}
                </Link>
                <div className="flex-1 py-2 text-center text-sm font-semibold rounded-lg bg-primary-800 text-white shadow-sm">
                  {t('nav.register', language)}
                </div>
              </div>

              {/* Farmer Register Form Card */}
              <FormCard className="bg-white/95 backdrop-blur border-primary-200 shadow-xl">
                <RegisterForm onSwitchToLogin={() => router.push('/login?role=farmer')} />
              </FormCard>
            </div>
          ) : (
            <div>
              {/* Top Branding */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-600 text-white rounded-2xl shadow-lg mb-3">
                  <Building2 className="w-7 h-7" aria-hidden="true" />
                </div>
                <h1 className="display-font text-3xl font-bold text-primary-950">
                  {t('register.mandiRole', language)}
                </h1>
                <p className="mt-1 text-xs text-primary-700">
                  {t('register.mandiSubtitle', language)}
                </p>
              </div>

              {/* Mandi Registration Info & Gateway Card */}
              <FormCard className="bg-white/95 backdrop-blur border-amber-200 shadow-xl text-center p-6 space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mx-auto shadow-inner">
                  <Warehouse className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-gray-900">
                    {t('login.mandiShowcaseTitle', language)}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed max-w-sm mx-auto">
                    {t('register.mandiRegisterNotice', language)}
                  </p>
                </div>

                <Link
                  href="/mandi/register"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-md hover:shadow transition-all"
                >
                  <span>{t('register.goToMandiRegister', language)}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    {t('login.alreadyHaveAccount', language)}{' '}
                    <Link
                      href="/login?role=mandi"
                      className="font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2"
                    >
                      {t('login.loginHere', language)}
                    </Link>
                  </p>
                </div>
              </FormCard>
            </div>
          )}

        </div>
      </div>
    </PageContainer>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
          </div>
        </PageContainer>
      }
    >
      <RegisterContent />
    </Suspense>
  );
}
