'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { LANGUAGES } from '@/lib/translations';
import { Language } from '@/types';
import { t } from '@/lib/translations';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1.5">
      <Globe className="w-4 h-4 text-primary-600" aria-hidden="true" />
      <select
        id="language-selector"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="text-sm font-medium text-primary-700 bg-transparent border border-primary-300 rounded-lg px-2 py-1 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
        aria-label={t('common.selectLanguage', language)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
