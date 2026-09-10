'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function NotFound() {
  const { language } = useLanguage();
  return (
    <PageContainer>
      <div className="text-center py-16">
        <p className="text-6xl font-extrabold text-primary-300 mb-4">404</p>
        <h1 className="text-2xl font-bold text-primary-900 mb-2">{t('notFound.title', language)}</h1>
        <p className="text-gray-600 mb-6">{t('notFound.body', language)}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          {t('notFound.backHome', language)}
        </Link>
      </div>
    </PageContainer>
  );
}
