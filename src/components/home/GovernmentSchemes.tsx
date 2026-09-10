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

const SCHEMES: Scheme[] = [
  {
    id: 'pm-kisan',
    tag: 'INCOME SUPPORT',
    title: 'PM-KISAN',
    description: 'Pradhan Mantri Kisan Samman Nidhi — ₹6,000 per year direct income support for small and marginal farmers in three equal instalments.',
    benefit: '₹6,000 / year',
    href: 'https://pmkisan.gov.in/',
    category: 'income',
  },
  {
    id: 'pmfby',
    tag: 'CROP INSURANCE',
    title: 'PM Fasal Bima Yojana',
    description: 'Comprehensive crop insurance coverage against natural calamities, pests, and diseases. Very low premium — only 1.5–5% for farmers.',
    benefit: 'Up to full sum insured',
    href: 'https://pmfby.gov.in/',
    category: 'insurance',
  },
  {
    id: 'kcc',
    tag: 'CREDIT',
    title: 'Kisan Credit Card',
    description: 'Short-term credit for crop cultivation, post-harvest expenses, and allied activities at concessional interest rates through banks.',
    benefit: '4% interest rate',
    href: 'https://www.nabard.org/content1.aspx?id=593&catid=23&mid=530',
    category: 'credit',
  },
  {
    id: 'enam',
    tag: 'MARKET ACCESS',
    title: 'eNAM — Online Mandi',
    description: 'National Agriculture Market — unified electronic trading platform for agricultural commodities across APMC mandis to get best prices.',
    benefit: 'Best price discovery',
    href: 'https://enam.gov.in/',
    category: 'msp',
  },
  {
    id: 'pm-kusum',
    tag: 'SOLAR ENERGY',
    title: 'PM-KUSUM Scheme',
    description: 'Solar pump scheme — subsidy for solar-powered irrigation pumps and setting up solar power plants on barren land for income generation.',
    benefit: '60% subsidy',
    href: 'https://mnre.gov.in/solar/schemes/',
    category: 'infra',
  },
  {
    id: 'soil-health',
    tag: 'SOIL HEALTH',
    title: 'Soil Health Card',
    description: 'Free soil testing and personalised nutrient recommendations for your farm to improve crop yield and reduce input costs.',
    benefit: 'Free testing',
    href: 'https://soilhealth.dac.gov.in/',
    category: 'infra',
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  income: '#c6ff32',
  insurance: '#79d6ba',
  credit: '#f0b35b',
  infra: '#8fa6e8',
  msp: '#d88370',
};

export default function GovernmentSchemes() {
  const { language } = useLanguage();

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
        {SCHEMES.map((scheme) => (
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
