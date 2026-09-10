'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sprout, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import PageContainer from '@/components/shared/PageContainer';
import FieldMotion from '@/components/shared/FieldMotion';
import FormCard from '@/components/shared/FormCard';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
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
          <div
            className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin"
            role="status"
            aria-label={t('common.loading', language)}
          />
        </div>
      </PageContainer>
    );
  }

  if (user) return null;

  return (
    <PageContainer className="relative overflow-hidden">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center min-h-[calc(100vh-10rem)]">
        {/* Left Visual Card */}
        <div className="hidden lg:block rounded-[2rem] overflow-hidden min-h-[620px] relative bg-primary-900 shadow-2xl">
          <FieldMotion className="opacity-55" />
          <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(15,45,34,.32),rgba(8,27,22,.92))]" />
          <div className="relative z-10 h-full p-10 flex flex-col justify-between text-white">
            <div className="flex items-center gap-3">
              <Sprout className="w-7 h-7 text-primary-300" />
              <span className="font-semibold tracking-wide">{t('auth.brand', language)}</span>
            </div>
            <div>
              <p className="text-primary-200 text-sm uppercase tracking-[0.2em] mb-4">
                Farmer Registration
              </p>
              <h2 className="display-font text-5xl leading-tight">
                Create your verified account in minutes.
              </h2>
              <div className="mt-8 flex items-center gap-3 text-sm text-primary-100">
                <CheckCircle2 className="w-5 h-5 text-primary-300" />
                Direct APMC slot booking & queue management
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="max-w-md w-full mx-auto">
          {/* Top Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-800 rounded-2xl shadow-lg mb-3">
              <Sprout className="w-7 h-7 text-white" aria-hidden="true" />
            </div>
            <h1 className="display-font text-3xl font-bold text-primary-950">
              Farmer Registration
            </h1>
            <p className="mt-1.5 text-sm text-primary-700">
              Create your account to access government procurement slots.
            </p>
          </div>

          {/* Quick tab link to Login */}
          <div className="flex rounded-xl border border-primary-200 bg-white/70 p-1 mb-6 shadow-sm">
            <Link
              href="/login"
              className="flex-1 py-2 text-center text-sm font-semibold rounded-lg text-primary-600 hover:text-primary-800 transition-all"
            >
              Sign In
            </Link>
            <div className="flex-1 py-2 text-center text-sm font-semibold rounded-lg bg-primary-800 text-white shadow-sm">
              Register
            </div>
          </div>

          <FormCard className="bg-white/90 backdrop-blur border-primary-200 shadow-xl">
            <RegisterForm onSwitchToLogin={() => router.push('/login')} />
          </FormCard>
        </div>
      </div>
    </PageContainer>
  );
}
