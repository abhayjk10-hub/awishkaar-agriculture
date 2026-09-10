'use client';

import Link from 'next/link';
import { Sprout, Phone, Mail } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

export default function Footer() {
  const { language } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary-900 text-primary-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" aria-hidden="true" />
              </div>
              <p className="font-bold text-white text-lg">{t('appName', language)}</p>
            </div>
            <p className="text-sm text-primary-300 leading-relaxed">{t('appTagline', language)}</p>
            <p className="text-xs text-primary-400 mt-2">{t('footer.scheme', language)}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">{t('footer.quickLinks', language)}</h3>
            <nav className="space-y-2" aria-label={t('footer.quickLinks', language)}>
              {[
                { href: '/', label: t('nav.home', language) },
                { href: '/login', label: t('nav.login', language) },
                { href: '/slot-booking', label: t('nav.slotBooking', language) },
                { href: '/contact', label: t('nav.contact', language) },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm text-primary-300 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Helpline */}
          <div>
            <h3 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">{t('footer.helpline', language)}</h3>
            <div className="space-y-2">
              <a href="tel:1800-180-1551" className="flex items-center gap-2 text-sm text-primary-300 hover:text-white transition-colors">
                <Phone className="w-4 h-4" aria-hidden="true" />
                1800-180-1551
              </a>
              <a href="mailto:support@kisanmitra.gov.in" className="flex items-center gap-2 text-sm text-primary-300 hover:text-white transition-colors">
                <Mail className="w-4 h-4" aria-hidden="true" />
                support@kisanmitra.gov.in
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-700 mt-8 pt-6 text-center">
          <p className="text-xs text-primary-400">
            &copy; {year} {t('appName', language)}. {t('footer.rights', language)}
          </p>
        </div>
      </div>
    </footer>
  );
}
