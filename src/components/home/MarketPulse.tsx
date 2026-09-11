'use client';

import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Database, RefreshCw } from 'lucide-react';
import { ScrollReveal } from '@/components/shared/ArchiveMotion';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

type MarketRecord = {
  commodity: string;
  market: string;
  state: string;
  district: string;
  modalPrice: number;
  arrivalQuantity: number;
  date: string;
};

type MarketResponse = {
  success: boolean;
  source?: string;
  state?: string;
  records?: MarketRecord[];
  updatedAt?: string;
  message?: string;
  sourceUrl?: string;
  resource?: string;
};

const colours = ['#c6ff32', '#79d6ba', '#f0b35b', '#d88370', '#8fa6e8', '#d9d9a4'];
const formatPrice = (value: number) => `₹${Math.round(value).toLocaleString('en-IN')}`;

function PieChart({ values }: { values: { label: string; value: number }[] }) {
  const total = values.reduce((sum, item) => sum + item.value, 0) || 1;
  const segments = values.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const offset = values.slice(0, index).reduce((sum, previous) => sum + (previous.value / total) * 100, 0);
    const segment = `${colours[index % colours.length]} ${offset}% ${offset + percentage}%`;
    return segment;
  });

  return (
    <div className="market-pie-wrap">
      <div className="market-pie" style={{ background: `conic-gradient(${segments.join(', ')})` }} aria-label="Commodity arrival share chart" />
      <div className="market-legend">
        {values.map((item, index) => <span key={item.label}><i style={{ background: colours[index % colours.length] }} /> {item.label} <b>{Math.round((item.value / total) * 100)}%</b></span>)}
      </div>
    </div>
  );
}

function MarketChart({ records, sourceUrl, resource, updatedAt }: { records: MarketRecord[]; sourceUrl?: string; resource?: string; updatedAt?: string }) {
  const { language } = useLanguage();
  const commodityPrices = useMemo(() => {
    const grouped = new Map<string, { total: number; count: number }>();
    records.forEach((record) => {
      const current = grouped.get(record.commodity) || { total: 0, count: 0 };
      grouped.set(record.commodity, { total: current.total + record.modalPrice, count: current.count + 1 });
    });
    return [...grouped.entries()]
      .map(([label, value]) => ({ label, value: value.total / value.count }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records]);

  const arrivalShare = useMemo(() => {
    const grouped = new Map<string, number>();
    records.forEach((record) => grouped.set(record.commodity, (grouped.get(record.commodity) || 0) + record.arrivalQuantity));
    return [...grouped.entries()]
      .map(([label, value]) => ({ label, value }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [records]);

  const maxPrice = Math.max(...commodityPrices.map((item) => item.value), 1);
  const averagePrice = records.reduce((sum, item) => sum + item.modalPrice, 0) / records.length;
  const marketCount = new Set(records.map((record) => record.market).filter(Boolean)).size;
  const lastUpdated = records.map((record) => record.date).filter(Boolean)[0];

  return (
    <ScrollReveal className="market-pulse" id="market-pulse">
      <div className="market-pulse-heading">
        <div>
          <div className="archive-index">/ 003 — {t('market.index', language)}</div>
          <h2>{t('market.heading', language)}</h2>
          <p>{t('market.subheading', language)}</p>
        </div>
        <div className="market-source">
          <Database /> <span>DATA.GOV.IN<br /><small>{lastUpdated || t('market.latestFeedResponse', language)}</small></span>
        </div>
      </div>
      <div className="market-kpis">
        <div>
          <span>{t('market.avgPrice', language)}</span>
          <strong>{formatPrice(averagePrice)}</strong>
          <small>{t('market.listings', language).replace('{count}', String(records.length))}</small>
        </div>
        <div>
          <span>{t('market.marketsReporting', language)}</span>
          <strong>{marketCount || '—'}</strong>
          <small>{records[0]?.state || t('market.selectedState', language)}</small>
        </div>
        <div>
          <span>{t('market.topCommodity', language)}</span>
          <strong>{commodityPrices[0]?.label || '—'}</strong>
          <small>{commodityPrices[0] ? formatPrice(commodityPrices[0].value) : t('market.noPriceYet', language)}</small>
        </div>
      </div>
      <div className="market-chart-grid">
        <div className="market-chart-panel">
          <div className="market-panel-heading">
            <span>{t('market.modalPriceHeader', language)}</span>
            <BarChart3 />
          </div>
          <div className="market-bars">
            {commodityPrices.map((item) => (
              <div className="market-bar-row" key={item.label}>
                <span>{item.label}</span>
                <div>
                  <i style={{ width: `${(item.value / maxPrice) * 100}%` }} />
                  <b>{formatPrice(item.value)}</b>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="market-chart-panel">
          <div className="market-panel-heading">
            <span>{t('market.arrivalShareHeader', language)}</span>
            <span className="market-live-dot" />
          </div>
          {arrivalShare.length ? (
            <PieChart values={arrivalShare} />
          ) : (
            <p className="market-empty">{t('market.noArrivalVolumes', language)}</p>
          )}
        </div>
      </div>
      <div className="market-proof">
        <div>
          <strong>{t('market.evidenceTrail', language)}</strong>
          <span>{t('market.officialListings', language).replace('{count}', String(records.length))} · {updatedAt ? new Date(updatedAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-IN') : t('market.latestFeedResponse', language)}</span>
        </div>
        <p>{t('market.disclaimer', language)}</p>
        <a href={sourceUrl || 'https://data.gov.in/'} target="_blank" rel="noreferrer">
          {t('market.verifyAtDataGov', language)}
        </a>
        <small>{t('market.resourceLabel', language).replace('{resource}', resource || t('market.govResource', language))}</small>
      </div>
    </ScrollReveal>
  );
}

export default function MarketPulse() {
  const { language } = useLanguage();
  const [data, setData] = useState<MarketResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    fetch('/api/market-data')
      .then((response) => response.json() as Promise<MarketResponse>)
      .then(setData)
      .catch(() => setData({ success: false, message: t('error.network', language) }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="market-pulse market-loading">
        <RefreshCw className="market-spinner" /> {t('common.loading', language)}
      </section>
    );
  }

  if (!data?.success || !data.records?.length) {
    return (
      <section className="market-pulse market-unavailable" id="market-pulse">
        <div className="archive-index">/ 003 — {t('market.index', language)}</div>
        <h2>{t('market.heading', language)}</h2>
        <p>{data?.message || t('market.disclaimer', language)}</p>
        <button type="button" onClick={loadData}>
          <RefreshCw /> {t('slot.refreshGps', language)}
        </button>
        <small>{t('market.disclaimer', language)}</small>
      </section>
    );
  }

  return (
    <MarketChart
      records={data.records}
      sourceUrl={data.sourceUrl}
      resource={data.resource}
      updatedAt={data.updatedAt}
    />
  );
}
