'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock3,
  Compass,
  FileText,
  HelpCircle,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Printer,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sprout,
  Truck,
  Wheat,
  X,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToken } from '@/contexts/TokenContext';
import { t } from '@/lib/translations';
import {
  Mandi,
  SlotBooking,
  FarmerDelay,
} from '@/types';
import {
  getMandis,
  generateSlotTimes,
  createSlotBooking,
  getFarmerDelays,
  subscribeToFarmerBooking,
} from '@/lib/mandi-service';
import TransportCostCard from '@/components/shared/TransportCostCard';
import { DEFAULT_TRANSPORT_RATE } from '@/lib/transport-calculator';

export default function SlotBookingPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const { setToken } = useToken();

  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'prompting' | 'granted' | 'denied' | 'error'>('prompting');
  const [locationError, setLocationError] = useState<string | null>(null);

  // Mandis list
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [loadingMandis, setLoadingMandis] = useState(true);
  const [selectedMandiId, setSelectedMandiId] = useState<string>('');

  // Date selection (next 7 days starting today)
  const availableDates = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = String(d.getDate()).padStart(2, '0');
      const monthName = d.toLocaleDateString('en-US', { month: 'short' });
      list.push({ iso, dayName, dayNum, monthName, isToday: i === 0 });
    }
    return list;
  }, []);

  const [selectedDateIso, setSelectedDateIso] = useState<string>(availableDates[0]?.iso || '');

  // Time slots for selected mandi (30-min windows)
  const selectedMandi = useMemo(() => {
    return mandis.find((m) => m.id === selectedMandiId) || mandis[0] || null;
  }, [mandis, selectedMandiId]);

  const slotTimes = useMemo(() => {
    if (!selectedMandi) return generateSlotTimes('06:00', '18:00');
    return generateSlotTimes(selectedMandi.opening_time, selectedMandi.closing_time);
  }, [selectedMandi]);

  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(0);

  // Farmer input fields
  const [farmerName, setFarmerName] = useState('');
  const [farmerPhone, setFarmerPhone] = useState('');
  const [cropName, setCropName] = useState('Wheat (गहू)');
  const [quantity, setQuantity] = useState('15');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // Delay & penalty check for farmer
  const [farmerDelays, setFarmerDelays] = useState<FarmerDelay[]>([]);
  const [checkingDelays, setCheckingDelays] = useState(false);

  // Submission state & generated token modal
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<SlotBooking | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto pre-fill from user auth
  useEffect(() => {
    if (user) {
      const metaName = user.user_metadata?.full_name || user.user_metadata?.name;
      if (metaName && !farmerName) setFarmerName(metaName);
      if (user.phone && !farmerPhone) setFarmerPhone(user.phone.replace(/\D/g, '').slice(-10));
    }
  }, [user]);

  // Request browser location on mount
  const requestLocation = () => {
    setLocationStatus('prompting');
    setLocationError(null);

    if (!('geolocation' in navigator)) {
      setLocationStatus('denied');
      setLocationError('Geolocation is not supported by your browser.');
      loadMandisList(undefined, undefined);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setLocationStatus('granted');
        loadMandisList(coords.lat, coords.lng);
      },
      (err) => {
        setLocationStatus('denied');
        setLocationError(err.message || 'Location access denied. Displaying default sorted mandis.');
        loadMandisList(undefined, undefined);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const loadMandisList = async (lat?: number, lng?: number) => {
    setLoadingMandis(true);
    try {
      const list = await getMandis(lat, lng);
      setMandis(list);
      if (list.length > 0 && !selectedMandiId) {
        setSelectedMandiId(list[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoadingMandis(false);
    }
  };

  // Check farmer delay history whenever phone changes
  useEffect(() => {
    const cleanPhone = farmerPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      setCheckingDelays(true);
      getFarmerDelays(cleanPhone)
        .then((delays) => {
          setFarmerDelays(delays);
        })
        .catch(() => setFarmerDelays([]))
        .finally(() => setCheckingDelays(false));
    } else {
      setFarmerDelays([]);
    }
  }, [farmerPhone]);

  // Live subscription to confirmed booking so status updates in real-time
  useEffect(() => {
    if (!confirmedBooking) return;
    const unsub = subscribeToFarmerBooking(confirmedBooking.id, (updated) => {
      setConfirmedBooking(updated);
    });
    return () => unsub();
  }, [confirmedBooking?.id]);

  // Handle slot booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!selectedMandi) {
      setSubmitError(t('slot.selectMandi', language));
      return;
    }
    if (!farmerName.trim()) {
      setSubmitError(t('validation.required.name', language));
      return;
    }
    if (!farmerPhone.trim() || farmerPhone.replace(/\D/g, '').length < 10) {
      setSubmitError(t('slot.validation.phone', language));
      return;
    }
    if (!cropName.trim()) {
      setSubmitError(t('slot.validation.crop', language));
      return;
    }
    if (!vehicleNumber.trim()) {
      setSubmitError(t('slot.validation.vehicle', language));
      return;
    }

    const slot = slotTimes[selectedSlotIndex] || slotTimes[0];

    setIsSubmitting(true);
    try {
      const result = await createSlotBooking({
        mandi_id: selectedMandi.id,
        mandi_name: selectedMandi.name,
        farmer_id: user?.id,
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        crop_name: cropName,
        quantity_quintals: Number(quantity) || 10,
        vehicle_number: vehicleNumber.trim().toUpperCase(),
        booking_date: selectedDateIso,
        slot_start_time: slot.start,
        slot_end_time: slot.end,
      });

      if (result.error || !result.booking) {
        setSubmitError(result.error || t('error.generic', language));
        return;
      }

      setConfirmedBooking(result.booking);

      // Register with TokenContext for live Marquee tracking
      setToken({
        tokenNumber: result.booking.token_number,
        mandiName: selectedMandi.name,
        currentToken: 1,
        totalAhead: 2,
        status: 'waiting',
        estimatedWaitMinutes: 15,
        slotTime: `${slot.start} – ${slot.end}`,
        bookingId: result.booking.id,
        farmerPhone: result.booking.farmer_phone,
      });
    } catch (err: any) {
      setSubmitError(err.message || t('error.generic', language));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedSlot = slotTimes[selectedSlotIndex] || slotTimes[0];

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sprout className="w-3.5 h-3.5 text-emerald-700" /> {t('slot.eyebrow', language)}
            </div>
            <h1 className="display-font text-4xl sm:text-5xl text-primary-950 mt-1">
              {t('slot.title', language)}
            </h1>
            <p className="text-primary-700 mt-2 max-w-2xl text-base">
              {t('slot.subtitle', language)}
            </p>
          </div>

          {/* Real-time status pill */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-full px-4 py-2 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              {t('slot.liveSync', language)}
            </div>
            <Link
              href="/mandi"
              className="text-xs font-bold text-primary-900 bg-primary-200 hover:bg-primary-300 border border-primary-300 rounded-full px-3.5 py-2 transition-colors flex items-center gap-1.5"
            >
              <span>{t('slot.mandiPortalBtn', language)}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Geolocation Status Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-white/80 border border-primary-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center shrink-0">
              <Compass className={`w-5 h-5 ${locationStatus === 'prompting' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-primary-600">
                {locationStatus === 'granted'
                  ? t('slot.geoActive', language)
                  : locationStatus === 'prompting'
                  ? t('slot.geoDetecting', language)
                  : t('slot.geoAccess', language)}
              </p>
              <p className="text-sm font-semibold text-primary-950">
                {locationStatus === 'granted'
                  ? t('slot.geoActiveDesc', language)
                  : locationStatus === 'prompting'
                  ? t('slot.geoDetectingDesc', language)
                  : locationError || t('slot.geoDefaultDesc', language)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={requestLocation}
            className="self-start sm:self-center inline-flex items-center gap-2 text-xs font-bold text-primary-800 hover:text-primary-950 bg-primary-100 hover:bg-primary-200 px-3.5 py-2 rounded-xl transition-colors shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {t('slot.refreshGps', language)}
          </button>
        </div>

        {/* Booking Form Layout */}
        <form onSubmit={handleBookingSubmit} className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-6">
            {/* STEP 1: SELECT MANDI (DISTANCE SORTED) */}
            <section className="bg-white/95 border border-primary-200 rounded-[1.75rem] shadow-md p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-primary-100 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary-600 font-bold">{t('slot.step1Title', language)}</span>
                  <h2 className="text-xl font-bold text-primary-950 mt-0.5">{t('slot.step1Heading', language)}</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>

              {loadingMandis ? (
                <div className="py-8 text-center text-primary-700">{t('slot.loadingMandis', language)}</div>
              ) : (
                <div className="mt-5 space-y-2.5">
                  {mandis.map((mandi) => {
                    const isSelected = selectedMandi?.id === mandi.id;
                    return (
                      <button
                        type="button"
                        key={mandi.id}
                        onClick={() => setSelectedMandiId(mandi.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                          isSelected
                            ? 'border-primary-700 bg-primary-50/90 shadow-md ring-2 ring-primary-500/20'
                            : 'border-primary-100 bg-white hover:border-primary-300 hover:bg-primary-50/40'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-base text-primary-950 font-bold">{mandi.name}</strong>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-primary-100 text-primary-800">
                              {mandi.code}
                            </span>
                            {mandi.distance_km !== undefined && (
                              <>
                                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                  <LocateFixed className="w-3 h-3 text-emerald-600" />
                                  {t('slot.distanceKm', language, { dist: mandi.distance_km })}
                                </span>
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 flex items-center gap-1">
                                  <Truck className="w-3 h-3 text-amber-700" />
                                  ~₹{Math.round(mandi.distance_km * DEFAULT_TRANSPORT_RATE)}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-primary-700 line-clamp-1">{mandi.address}</p>
                          <div className="flex items-center gap-3 text-[11px] text-primary-600">
                            <span>🕒 {t('slot.openHours', language, { hours: `${mandi.opening_time} – ${mandi.closing_time}` })}</span>
                            <span>•</span>
                            <span>{t('slot.vehiclesPerSlot', language, { cap: mandi.slot_capacity })}</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {isSelected ? (
                            <div className="w-7 h-7 rounded-full bg-primary-700 text-white flex items-center justify-center shadow-sm">
                              <Check className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full border-2 border-primary-300" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* STEP 2: SELECT DATE & 30-MINUTE WINDOW */}
            <section className="bg-white/95 border border-primary-200 rounded-[1.75rem] shadow-md p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-primary-100 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary-600 font-bold">{t('slot.step2Title', language)}</span>
                  <h2 className="text-xl font-bold text-primary-950 mt-0.5">{t('slot.step2Heading', language)}</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
                  <Clock3 className="w-5 h-5" />
                </div>
              </div>

              {/* Date Pills */}
              <div className="mt-5">
                <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-2">
                  {t('slot.selectDate', language)}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {availableDates.map((date) => {
                    const isSelected = selectedDateIso === date.iso;
                    return (
                      <button
                        type="button"
                        key={date.iso}
                        onClick={() => setSelectedDateIso(date.iso)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isSelected
                            ? 'bg-primary-900 text-white border-primary-900 shadow-md ring-2 ring-primary-500/30'
                            : 'bg-primary-50/70 border-primary-200 text-primary-800 hover:border-primary-400 hover:bg-white'
                        }`}
                      >
                        <span className="block text-[11px] font-semibold opacity-80">{date.dayName}</span>
                        <strong className="block text-xl font-extrabold my-0.5">{date.dayNum}</strong>
                        <span className="block text-[10px] uppercase opacity-75">{date.monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 30-Minute Slots Grid */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-primary-800 uppercase tracking-wider">
                    {t('slot.selectTimeWindow', language)}
                  </label>
                  <span className="text-[11px] text-primary-600 font-semibold">{t('slot.slotCapacityNotice', language)}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  {slotTimes.map((slot, index) => {
                    const isSelected = selectedSlotIndex === index;
                    return (
                      <button
                        type="button"
                        key={slot.start}
                        onClick={() => setSelectedSlotIndex(index)}
                        className={`p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-primary-800 bg-primary-100 text-primary-950 font-bold shadow-sm'
                            : 'border-primary-100 bg-white hover:border-primary-300 text-primary-800'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold leading-tight">{slot.label}</p>
                          <small className="text-[11px] text-emerald-700 font-semibold">{t('slot.available', language)}</small>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-primary-800 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* STEP 3: FARMER & CROP DETAILS */}
            <section className="bg-white/95 border border-primary-200 rounded-[1.75rem] shadow-md p-6 sm:p-7">
              <div className="flex items-center justify-between border-b border-primary-100 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary-600 font-bold">{t('slot.step3Title', language)}</span>
                  <h2 className="text-xl font-bold text-primary-950 mt-0.5">{t('slot.step3Heading', language)}</h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-800 flex items-center justify-center">
                  <Wheat className="w-5 h-5" />
                </div>
              </div>

              {/* Delay & Penalty Warning Banner */}
              {farmerDelays.length > 0 && (
                <div className="mt-5 p-4 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-950">
                  <div className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-amber-900">
                        {t('slot.delayWarning', language)}: {farmerDelays.length}
                      </h4>
                      <p className="text-xs text-amber-800 mt-1">
                        {t('slot.delayWarningDesc', language)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4 mt-5">
                <div>
                  <label htmlFor="farmer-name" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                    {t('slot.farmerName', language)}
                  </label>
                  <input
                    id="farmer-name"
                    type="text"
                    required
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder={t('slot.farmerNamePlaceholder', language)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-primary-200 bg-white text-primary-950 font-medium focus:outline-none focus:border-primary-600"
                  />
                </div>

                <div>
                  <label htmlFor="farmer-phone" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                    {t('slot.farmerPhone', language)}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-primary-500">+91</span>
                    <input
                      id="farmer-phone"
                      type="tel"
                      required
                      maxLength={10}
                      value={farmerPhone}
                      onChange={(e) => setFarmerPhone(e.target.value)}
                      placeholder={t('slot.farmerPhonePlaceholder', language)}
                      className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border-2 border-primary-200 bg-white text-primary-950 font-medium focus:outline-none focus:border-primary-600"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="crop-name" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                    {t('slot.cropName', language)}
                  </label>
                  <select
                    id="crop-name"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-primary-200 bg-white text-primary-950 font-medium focus:outline-none focus:border-primary-600"
                  >
                    <option value="Wheat (गहू)">Wheat / गहू / ઘઉં / ਕਣਕ</option>
                    <option value="Soybean (सोयाबीन)">Soybean / सोयाबीन / સોયાબીન</option>
                    <option value="Cotton (कापूस)">Cotton / कापूस / કપાસ / ਨਰਮਾ</option>
                    <option value="Onion (कांदा)">Onion / कांदा / ડુંગળી / ਪਿਆਜ਼</option>
                    <option value="Gram / Chana (हरभरा)">Gram (Chana) / हरभरा / ચણા</option>
                    <option value="Maize / Corn (मका)">Maize (Corn) / मका / મકાઈ / ਮੱਕੀ</option>
                    <option value="Paddy / Rice (धान)">Paddy / Rice / धान / ચોખા / ਝੋਨਾ</option>
                    <option value="Tur / Arhar (तूर)">Tur / Arhar / तूर / તુવેર / ਦਾਲਾਂ</option>
                    <option value="Tomato (टोमॅटो)">Tomato / टोमॅटो / ટામેટા / ਟਮਾਟਰ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                    {t('slot.quantity', language)}
                  </label>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder={t('slot.quantityPlaceholder', language)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-primary-200 bg-white text-primary-950 font-medium focus:outline-none focus:border-primary-600"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="vehicle-number" className="block text-xs font-bold text-primary-800 uppercase tracking-wider mb-1">
                    {t('slot.vehicleNumber', language)}
                  </label>
                  <input
                    id="vehicle-number"
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder={t('slot.vehicleNumberPlaceholder', language)}
                    className="w-full px-3.5 py-2.5 rounded-xl border-2 border-primary-200 bg-white text-primary-950 font-medium focus:outline-none focus:border-primary-600 uppercase"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ASIDE: SUMMARY & BOOKING CONFIRMATION */}
          <aside className="lg:sticky lg:top-24 bg-primary-950 text-white rounded-[1.75rem] shadow-xl p-6 overflow-hidden relative">
            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full border border-primary-400/20" />
            <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full border border-primary-400/20" />

            <div className="relative">
              <span className="text-emerald-400 text-xs uppercase tracking-[.18em] font-bold">
                {t('slot.summaryTitle', language)}
              </span>
              <h3 className="display-font text-2xl font-bold mt-1 text-white">{t('slot.summaryHeading', language)}</h3>

              <div className="space-y-4 mt-6 border-b border-white/10 pb-6">
                <div className="flex gap-3">
                  <MapPin className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-primary-300 font-medium uppercase">{t('slot.summaryMandi', language)}</p>
                    <p className="font-bold text-white text-sm">{selectedMandi?.name || t('common.loading', language)}</p>
                    <p className="text-xs text-primary-300">
                      {selectedMandi?.distance_km !== undefined ? `📍 ${t('slot.distanceKm', language, { dist: selectedMandi.distance_km })}` : ''}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <CalendarCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-primary-300 font-medium uppercase">{t('slot.summaryDate', language)}</p>
                    <p className="font-bold text-white text-sm">{selectedDateIso}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Clock3 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-primary-300 font-medium uppercase">{t('slot.summaryWindow', language)}</p>
                    <p className="font-bold text-white text-base text-emerald-300">{selectedSlot?.label}</p>
                    <p className="text-[11px] text-primary-400">{t('slot.slotCapacityNotice', language)}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Truck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] text-primary-300 font-medium uppercase">{t('slot.summaryCrop', language)}</p>
                    <p className="font-bold text-white text-sm">
                      {cropName} • {quantity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transportation Cost Estimator Card */}
              {selectedMandi && (
                <div className="mt-5">
                  <TransportCostCard
                    mandi={selectedMandi}
                    farmerLocation={userLocation}
                    onRequestLocation={requestLocation}
                  />
                </div>
              )}

              {submitError && (
                <div className="my-4 p-3 rounded-xl bg-red-900/60 border border-red-500 text-red-200 text-xs">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-primary-950 font-bold px-5 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{t('slot.submitting', language)}</span>
                  </>
                ) : (
                  <>
                    <span>{t('slot.confirmBookingBtn', language)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-[11px] text-primary-300 mt-3">
                {t('slot.documents', language)}
              </p>
            </div>
          </aside>
        </form>

        {/* CONFIRMED BOOKING MODAL */}
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-primary-200 overflow-hidden relative animate-in zoom-in-95">
              {/* Top Banner */}
              <div className="bg-emerald-700 text-white p-6 relative">
                <button
                  type="button"
                  onClick={() => setConfirmedBooking(null)}
                  className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  {t('slot.tokenConfirmedTitle', language)}
                </div>
                <h3 className="display-font text-3xl font-bold mt-1 text-white">{t('slot.tokenConfirmedSubtitle', language)}</h3>
                <p className="text-xs text-emerald-100 mt-1">
                  {t('slot.gatePassNotice', language)}
                </p>
              </div>

              {/* Token Number Card */}
              <div className="p-6">
                <div className="p-5 rounded-2xl bg-primary-50 border-2 border-dashed border-primary-300 text-center relative">
                  <span className="text-xs uppercase tracking-wider font-bold text-primary-600">{t('slot.tokenNumber', language)}</span>
                  <div className="display-font text-4xl font-extrabold text-primary-950 tracking-wider my-1">
                    {confirmedBooking.token_number}
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mt-1 uppercase bg-amber-100 text-amber-900 border border-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    {t('token.liveQueue', language)}: {confirmedBooking.status.toUpperCase()}
                  </div>
                </div>

                {/* Details list */}
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-primary-100">
                    <span className="text-primary-600">{t('slot.summaryMandi', language)}</span>
                    <strong className="text-primary-950">{confirmedBooking.mandi_name}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-100">
                    <span className="text-primary-600">{t('register.fullName', language)}</span>
                    <strong className="text-primary-950">{confirmedBooking.farmer_name}</strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-100">
                    <span className="text-primary-600">{t('slot.summaryWindow', language)}</span>
                    <strong className="text-emerald-800 font-bold">
                      {confirmedBooking.slot_start_time} – {confirmedBooking.slot_end_time} (30 mins)
                    </strong>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-primary-100">
                    <span className="text-primary-600">{t('slot.summaryCrop', language)}</span>
                    <strong className="text-primary-950">
                      {confirmedBooking.crop_name} ({confirmedBooking.quantity_quintals} Qtl)
                    </strong>
                  </div>
                  {confirmedBooking.vehicle_number && (
                    <div className="flex justify-between py-1.5 border-b border-primary-100">
                      <span className="text-primary-600">{t('slot.summaryVehicle', language)}</span>
                      <strong className="text-primary-950">{confirmedBooking.vehicle_number}</strong>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-primary-200 text-primary-800 hover:bg-primary-50 font-bold text-sm"
                  >
                    <Printer className="w-4 h-4" />
                    {t('slot.printToken', language)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmedBooking(null)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary-900 text-white hover:bg-primary-800 font-bold text-sm"
                  >
                    {t('slot.doneBtn', language)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
