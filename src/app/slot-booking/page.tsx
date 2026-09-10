'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowRight, CalendarCheck, Check, ChevronLeft, ChevronRight, Clock3, MapPin, Wheat } from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

const dates = [
  { day: 'slot.today', date: '09', month: 'slot.september' },
  { day: 'slot.thursday', date: '10', month: 'slot.september' },
  { day: 'slot.friday', date: '11', month: 'slot.september' },
  { day: 'slot.saturday', date: '12', month: 'slot.september' },
  { day: 'slot.monday', date: '14', month: 'slot.september' },
];

const times = [
  { label: '07:00 – 09:00', seats: '18 spots left' },
  { label: '09:00 – 11:00', seats: '9 spots left' },
  { label: '11:00 – 13:00', seats: '4 spots left' },
  { label: '14:00 – 16:00', seats: '22 spots left' },
];

export default function SlotBookingPage() {
  const { language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);

  return (
    <PageContainer>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
          <div>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-[.18em]">{t('slot.eyebrow', language)}</p>
            <h1 className="display-font text-4xl sm:text-5xl text-primary-950 mt-2">{t('slot.title', language)}</h1>
            <p className="text-primary-700 mt-3 max-w-xl">{t('slot.subtitle', language)}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-primary-700 bg-white/70 border border-primary-200 rounded-full px-4 py-2"><span className="w-2 h-2 rounded-full bg-emerald-500" /> {t('slot.live', language)}</div>
        </div>

        <div className="grid lg:grid-cols-[1fr_360px] gap-5 items-start">
          <section className="bg-white/90 border border-primary-200 rounded-[1.75rem] shadow-lg p-5 sm:p-7">
            <div className="flex items-center justify-between border-b border-primary-100 pb-5">
              <div><p className="text-xs uppercase tracking-wider text-primary-500 font-semibold">{t('slot.stepOne', language)}</p><h2 className="text-xl font-bold text-primary-950 mt-1">{t('slot.locationQuestion', language)}</h2></div>
              <div className="w-11 h-11 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center"><MapPin className="w-5 h-5" /></div>
            </div>
            <label htmlFor="mandi" className="block text-sm font-semibold text-primary-800 mt-6 mb-2">{t('slot.selectMandi', language)}</label>
            <select id="mandi" className="w-full min-h-[52px] rounded-xl border-2 border-primary-200 bg-primary-50 px-4 text-primary-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200">
              <option>{t('slot.mainYard', language)}</option><option>{t('slot.puneYard', language)}</option><option>{t('slot.ahmednagarYard', language)}</option>
            </select>
            <div className="flex items-center gap-2 text-xs text-primary-600 mt-3"><MapPin className="w-3.5 h-3.5" /> {t('slot.distance', language)}</div>

            <div className="flex items-center justify-between mt-9 mb-4"><div><p className="text-xs uppercase tracking-wider text-primary-500 font-semibold">{t('slot.stepTwo', language)}</p><h2 className="text-xl font-bold text-primary-950 mt-1">{t('slot.windowQuestion', language)}</h2></div><div className="flex gap-1"><button type="button" aria-label="Previous dates" className="w-9 h-9 rounded-lg border border-primary-200 flex items-center justify-center text-primary-600 hover:bg-primary-50"><ChevronLeft className="w-4 h-4" /></button><button type="button" aria-label="Next dates" className="w-9 h-9 rounded-lg border border-primary-200 flex items-center justify-center text-primary-600 hover:bg-primary-50"><ChevronRight className="w-4 h-4" /></button></div></div>
            <div className="grid grid-cols-5 gap-2 mb-6">
              {dates.map((date, index) => <button type="button" key={date.date} onClick={() => setSelectedDate(index)} className={`min-h-[84px] rounded-xl border text-center transition-colors ${selectedDate === index ? 'bg-primary-800 text-white border-primary-800 shadow-md' : 'bg-primary-50 border-primary-100 text-primary-700 hover:border-primary-400'}`}><span className="block text-xs opacity-75">{t(date.day, language)}</span><strong className="block text-2xl mt-1">{date.date}</strong><span className="block text-xs opacity-75">{t(date.month, language)}</span></button>)}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {times.map((time, index) => <button type="button" key={time.label} onClick={() => setSelectedTime(index)} className={`flex items-center justify-between text-left rounded-xl border-2 px-4 py-3 min-h-[64px] transition-colors ${selectedTime === index ? 'border-primary-600 bg-primary-50' : 'border-primary-100 hover:border-primary-300'}`}><span><strong className="block text-primary-900">{time.label}</strong><small className="text-primary-600">{time.seats}</small></span>{selectedTime === index && <span className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center"><Check className="w-4 h-4" /></span>}</button>)}
            </div>
          </section>

          <aside className="lg:sticky lg:top-24 bg-primary-950 text-white rounded-[1.75rem] shadow-xl p-6 overflow-hidden relative">
            <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full border border-primary-400/20" /><div className="absolute -right-8 -top-8 w-24 h-24 rounded-full border border-primary-400/20" />
            <div className="relative"><p className="text-primary-300 text-xs uppercase tracking-[.18em] font-semibold">{t('slot.summary', language)}</p><h2 className="display-font text-3xl mt-2">{t('slot.summaryTitle', language)}</h2><div className="space-y-5 mt-8"><div className="flex gap-3"><MapPin className="w-5 h-5 text-primary-300 shrink-0" /><div><p className="text-xs text-primary-300">{t('slot.mandi', language)}</p><p className="font-semibold">{t('slot.mainYard', language)}</p></div></div><div className="flex gap-3"><CalendarCheck className="w-5 h-5 text-primary-300 shrink-0" /><div><p className="text-xs text-primary-300">{t('slot.date', language)}</p><p className="font-semibold">{t(dates[selectedDate].day, language)}, {dates[selectedDate].date} {t(dates[selectedDate].month, language)} 2026</p></div></div><div className="flex gap-3"><Clock3 className="w-5 h-5 text-primary-300 shrink-0" /><div><p className="text-xs text-primary-300">{t('slot.window', language)}</p><p className="font-semibold">{times[selectedTime].label}</p></div></div></div><div className="border-t border-white/15 mt-8 pt-5 flex gap-3 text-sm text-primary-100"><Wheat className="w-5 h-5 text-primary-300 shrink-0" /><p>{t('slot.documents', language)}</p></div><Link href="/login" className="mt-7 w-full inline-flex items-center justify-center gap-2 bg-primary-300 text-primary-950 hover:bg-white font-bold px-5 py-3.5 rounded-xl transition-colors">{t('slot.signIn', language)} <ArrowRight className="w-4 h-4" /></Link><p className="text-center text-xs text-primary-300 mt-4">{t('slot.signInHint', language)}</p></div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}
