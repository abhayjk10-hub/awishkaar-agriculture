'use client';

import React, { useState, useMemo } from 'react';
import { Truck, Navigation, Clock3, Fuel, Info, LocateFixed } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';
import {
  calculateTransportationCost,
  DEFAULT_TRANSPORT_RATE,
  MIN_TRANSPORT_RATE,
  MAX_TRANSPORT_RATE,
  GeoLocation,
} from '@/lib/transport-calculator';

interface TransportCostCardProps {
  mandi: {
    name: string;
    latitude: number;
    longitude: number;
    distance_km?: number;
  };
  farmerLocation: { lat: number; lng: number } | null;
  onRequestLocation?: () => void;
  className?: string;
  compact?: boolean;
}

export default function TransportCostCard({
  mandi,
  farmerLocation,
  onRequestLocation,
  className = '',
  compact = false,
}: TransportCostCardProps) {
  const { language } = useLanguage();
  const [rate, setRate] = useState<number>(DEFAULT_TRANSPORT_RATE);

  // Derive calculation
  const calculation = useMemo(() => {
    if (!farmerLocation) return null;

    const farmerGeo: GeoLocation = {
      latitude: farmerLocation.lat,
      longitude: farmerLocation.lng,
    };
    const mandiGeo: GeoLocation = {
      latitude: mandi.latitude,
      longitude: mandi.longitude,
    };

    return calculateTransportationCost(farmerGeo, mandiGeo, {
      ratePerKm: rate,
      language,
      roundDecimals: 0,
    });
  }, [farmerLocation, mandi.latitude, mandi.longitude, rate, language]);

  // Fallback if distance_km is pre-calculated but user location isn't exact
  const fallbackDistance = mandi.distance_km ?? 15;
  const fallbackCost = Math.round(fallbackDistance * rate);

  return (
    <div
      className={`rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-900/90 via-primary-950 to-primary-900 text-white shadow-lg overflow-hidden relative ${className}`}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-5 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                {t('transport.title', language)}
              </h4>
              <p className="text-sm font-bold text-white leading-tight mt-0.5">
                {mandi.name}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-primary-300 block uppercase font-medium">
              {t('transport.totalCost', language)}
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-emerald-300">
              {calculation ? calculation.formattedCost : `₹${fallbackCost}`}
            </span>
          </div>
        </div>

        {/* Distance & Transit Time Badges */}
        <div className="grid grid-cols-2 gap-2 mt-3.5">
          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
            <Navigation className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-primary-300 block">
                {t('transport.distance', language)}
              </span>
              <strong className="text-xs font-bold text-white">
                {calculation
                  ? calculation.formattedDistance
                  : `${fallbackDistance.toFixed(1)} km`}
              </strong>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-2.5 border border-white/5 flex items-center gap-2.5">
            <Clock3 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-primary-300 block">
                {t('transport.estTransitTime', language)}
              </span>
              <strong className="text-xs font-bold text-white">
                {calculation
                  ? calculation.formattedTransitTime
                  : `${Math.round((fallbackDistance / 30) * 60)} ${t('transport.minsOnly', language, { mins: '' })}`}
              </strong>
            </div>
          </div>
        </div>

        {/* Rate Selection & Slider */}
        <div className="mt-4 bg-primary-950/60 rounded-xl p-3 border border-white/5">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-primary-300 font-medium flex items-center gap-1">
              <Fuel className="w-3.5 h-3.5 text-amber-400" />
              {t('transport.rateSlider', language)}
            </span>
            <span className="font-extrabold text-white bg-white/10 px-2 py-0.5 rounded-md text-[11px]">
              ₹{rate} {t('transport.perKm', language)}
            </span>
          </div>

          <input
            type="range"
            min={MIN_TRANSPORT_RATE}
            max={MAX_TRANSPORT_RATE}
            step={0.5}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
            aria-label={t('transport.rateSlider', language)}
          />

          <div className="flex justify-between text-[10px] text-primary-400 mt-1">
            <span>₹{MIN_TRANSPORT_RATE}/km</span>
            <span className="text-emerald-300 font-semibold">
              ₹{DEFAULT_TRANSPORT_RATE}/km ({t('common.selectLanguage', language) === 'Select language' ? 'Standard' : 'मानक'})
            </span>
            <span>₹{MAX_TRANSPORT_RATE}/km</span>
          </div>
        </div>

        {/* Live GPS status / prompt */}
        {!farmerLocation && onRequestLocation && (
          <button
            type="button"
            onClick={onRequestLocation}
            className="mt-3 w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{t('transport.useLiveLocation', language)}</span>
          </button>
        )}

        {/* Summary note */}
        {!compact && (
          <p className="text-[11px] text-primary-300/80 mt-3 flex items-center gap-1 leading-normal">
            <Info className="w-3.5 h-3.5 text-primary-400 shrink-0" />
            <span>{calculation ? calculation.summary : t('transport.transitNote', language)}</span>
          </p>
        )}
      </div>
    </div>
  );
}
