'use client';

import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ArchiveMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

type Scheme = {
  id: string;
  tag: string;
  title: string;
  description: string;
  benefit: string;
  href: string;
  category: 'income' | 'insurance' | 'credit' | 'infra' | 'msp';
};

const CATEGORY_COLORS: Record<string, string> = {
  income: '#c6ff32',
  insurance: '#79d6ba',
  credit: '#f0b35b',
  infra: '#8fa6e8',
  msp: '#d88370',
};

export default function GovernmentSchemes() {
  const { language } = useLanguage();

  const schemes: Scheme[] = [
    {
      id: 'pm-kisan',
      tag: t('schemes.pmKisan.tag', language),
      title: t('schemes.pmKisan.title', language),
      description: t('schemes.pmKisan.desc', language),
      benefit: t('schemes.pmKisan.benefit', language),
      href: 'https://pmkisan.gov.in/',
      category: 'income',
    },
    {
      id: 'pmfby',
      tag: t('schemes.pmfby.tag', language),
      title: t('schemes.pmfby.title', language),
      description: t('schemes.pmfby.desc', language),
      benefit: t('schemes.pmfby.benefit', language),
      href: 'https://pmfby.gov.in/',
      category: 'insurance',
    },
    {
      id: 'kcc',
      tag: t('schemes.kcc.tag', language),
      title: t('schemes.kcc.title', language),
      description: t('schemes.kcc.desc', language),
      benefit: t('schemes.kcc.benefit', language),
      href: 'https://www.nabard.org/content1.aspx?id=593&catid=23&mid=530',
      category: 'credit',
    },
    {
      id: 'enam',
      tag: t('schemes.enam.tag', language),
      title: t('schemes.enam.title', language),
      description: t('schemes.enam.desc', language),
      benefit: t('schemes.enam.benefit', language),
      href: 'https://enam.gov.in/',
      category: 'msp',
    },
    {
      id: 'pm-kusum',
      tag: t('schemes.kusum.tag', language),
      title: t('schemes.kusum.title', language),
      description: t('schemes.kusum.desc', language),
      benefit: t('schemes.kusum.benefit', language),
      href: 'https://mnre.gov.in/solar/schemes/',
      category: 'infra',
    },
    {
      id: 'soil-health',
      tag: t('schemes.soil.tag', language),
      title: t('schemes.soil.title', language),
      description: t('schemes.soil.desc', language),
      benefit: t('schemes.soil.benefit', language),
      href: 'https://soilhealth.dac.gov.in/',
      category: 'infra',
    },
  ];

  return (
    <ScrollReveal className="gov-schemes" id="government-schemes">
      <div className="archive-index">/ 004 — {t('schemes.index', language)}</div>
      <div className="gov-schemes-head">
        <div>
          <p className="archive-eyebrow">{t('schemes.eyebrow', language)}</p>
          <h2>{t('schemes.heading', language)}</h2>
          <p className="archive-muted">{t('schemes.sub', language)}</p>
        </div>
        <a
          href="https://agricoop.nic.in/"
          target="_blank"
          rel="noreferrer"
          className="gov-schemes-all"
          aria-label="View all government agriculture schemes"
        >
          {t('schemes.all', language)} <ExternalLink />
        </a>
      </div>

      <div className="gov-schemes-grid">
        {schemes.map((scheme) => (
          <a
            key={scheme.id}
            href={scheme.href}
            target="_blank"
            rel="noreferrer"
            className="gov-scheme-card"
            aria-label={`${scheme.title} — ${scheme.description} Opens official portal in new tab.`}
          >
            <div className="gov-scheme-top">
              <span
                className="gov-scheme-tag"
                style={{ color: CATEGORY_COLORS[scheme.category] }}
              >
                {scheme.tag}
              </span>
              <ArrowUpRight className="gov-scheme-arrow" />
            </div>
            <h3 className="gov-scheme-title">{scheme.title}</h3>
            <p className="gov-scheme-desc">{scheme.description}</p>
            <div className="gov-scheme-benefit">
              <span
                className="gov-scheme-pill"
                style={{ borderColor: CATEGORY_COLORS[scheme.category], color: CATEGORY_COLORS[scheme.category] }}
              >
                {scheme.benefit}
              </span>
              <span className="gov-scheme-ext">{t('schemes.officialPortal', language)}</span>
            </div>
          </a>
        ))}
      </div>

      <p className="gov-schemes-footer">
        {t('schemes.disclaimer', language)}
      </p>
    </ScrollReveal>
  );
}
