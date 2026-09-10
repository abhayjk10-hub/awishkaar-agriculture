'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Sprout } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import PageContainer from '@/components/shared/PageContainer';
import FieldMotion from '@/components/shared/FieldMotion';
import FormCard from '@/components/shared/FormCard';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { user, loading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  // If already logged in, redirect to home
  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin" role="status" aria-label={t('common.loading', language)} />
        </div>
      </PageContainer>
    );
  }

  if (user) return null; // Will redirect

  return (
    <PageContainer className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center min-h-[calc(100vh-10rem)]">
        <div className="hidden lg:block rounded-[2rem] overflow-hidden min-h-[620px] relative bg-primary-900 shadow-2xl">
          <FieldMotion className="opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(15,45,34,.32),rgba(8,27,22,.92))]" />
          <div className="relative z-10 h-full p-10 flex flex-col justify-between text-white">
            <div className="flex items-center gap-3"><Sprout className="w-7 h-7 text-primary-300" /><span className="font-semibold tracking-wide">{t('auth.brand', language)}</span></div>
            <div>
              <p className="text-primary-200 text-sm uppercase tracking-[0.2em] mb-4">{t('auth.tagline', language)}</p>
              <h2 className="display-font text-5xl leading-tight">{t('home.introBody', language)}</h2>
              <div className="mt-8 flex items-center gap-3 text-sm text-primary-100"><CheckCircle2 className="w-5 h-5 text-primary-300" /> {t('auth.secureAccess', language)}</div>
            </div>
          </div>
        </div>
        <div className="max-w-md w-full mx-auto">
        {/* Page top branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-800 rounded-2xl shadow-lg mb-4">
            <Sprout className="w-8 h-8 text-white" aria-hidden="true" />
          </div>
          <h1 className="display-font text-3xl sm:text-4xl font-bold text-primary-950">
            {mode === 'login' ? t('login.title', language) : t('register.title', language)}
          </h1>
          <p className="mt-2 text-base text-primary-700">
            {mode === 'login' ? t('login.subtitle', language) : t('register.subtitle', language)}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-primary-200 bg-white/70 p-1 mb-6 shadow-sm" role="tablist">
          <button
            id="tab-login"
            role="tab"
            aria-selected={mode === 'login'}
            aria-controls="panel-login"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-primary-800 text-white shadow-sm'
                : 'text-primary-500 hover:text-primary-700'
            }`}
          >
            {t('nav.login', language).split(' / ')[0]}
          </button>
          <button
            id="tab-register"
            role="tab"
            aria-selected={mode === 'register'}
            aria-controls="panel-register"
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-primary-800 text-white shadow-sm'
                : 'text-primary-500 hover:text-primary-700'
            }`}
          >
            {t('nav.login', language).split(' / ')[1] ?? 'Register'}
          </button>
        </div>

        <FormCard className="bg-white/90 backdrop-blur border-primary-200 shadow-xl">
          {mode === 'login' ? (
            <div id="panel-login" role="tabpanel" aria-labelledby="tab-login">
              <LoginForm onSwitchToRegister={() => setMode('register')} />
            </div>
          ) : (
            <div id="panel-register" role="tabpanel" aria-labelledby="tab-register">
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            </div>
          )}
        </FormCard>
        </div>
      </div>
    </PageContainer>
  );
}
