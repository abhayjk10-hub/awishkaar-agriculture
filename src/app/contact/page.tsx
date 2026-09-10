'use client';

import { useState } from 'react';
import {
  ArrowRight,
  Clock,
  Mail,
  Phone,
  ShieldCheck,
  HelpCircle,
  MapPin,
  ChevronDown,
  Building2,
  FileCheck,
  CheckCircle2,
} from 'lucide-react';
import PageContainer from '@/components/shared/PageContainer';
import FormCard from '@/components/shared/FormCard';
import ContactForm from '@/components/contact/ContactForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

interface FAQItem {
  question: string;
  answer: string;
}

export default function ContactPage() {
  const { language } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: language === 'hi' 
        ? 'मंडी टोकन स्थिति कैसे जांचें?' 
        : language === 'mr'
        ? 'मंडी टोकन स्थिती कशी तपासावी?'
        : language === 'pa'
        ? 'ਮੰਡੀ ਟੋਕਨ ਸਥਿਤੀ ਦੀ ਜਾਂਚ ਕਿਵੇਂ ਕਰੀਏ?'
        : language === 'gu'
        ? 'મંડી ટોકન સ્થિતિ કેવી રીતે તપાસવી?'
        : 'How do I check my Mandi Token status?',
      answer: language === 'hi'
        ? 'होम पेज पर लाइव टोकन मार्की देखें या स्लॉट बुकिंग अनुभाग में अपने पंजीकृत मोबाइल नंबर से लॉगिन करें। आपको SMS के माध्यम से भी सूचनाएं प्राप्त होती हैं।'
        : language === 'mr'
        ? 'मुख्य पानावर थेट टोकन पट्टी पहा किंवा स्लॉट बुकिंग विभागात नोंदणीकृत मोबाईल नंबरने लॉगिन करा. आपल्याला SMS द्वारे अपडेट्स मिळतात.'
        : language === 'pa'
        ? 'ਮੁੱਖ ਪੰਨੇ ਤੇ ਲਾਈਵ ਟੋਕਨ ਪੱਟੀ ਵੇਖੋ ਜਾਂ ਸਲਾਟ ਬੁਕਿੰਗ ਭਾਗ ਵਿੱਚ ਆਪਣੇ ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ ਨੰਬਰ ਨਾਲ ਲਾਗਇਨ ਕਰੋ। ਤੁਹਾਨੂੰ SMS ਰਾਹੀਂ ਵੀ ਅੱਪਡੇਟ ਮਿਲਣਗੇ।'
        : language === 'gu'
        ? 'મુખ્ય પૃષ્ઠ પર લાઇવ ટોકન પટ્ટી જુઓ અથવા સ્લોટ બુકિંગ વિભાગમાં તમારા નોંધાયેલા મોબાઇલ નંબરથી લૉગિન કરો. તમને SMS દ્વારા પણ અપડેટ્સ મળશે.'
        : 'View the live token marquee on the Home page or log in with your registered mobile number under the Slot Booking section. You will also receive real-time updates via SMS.',
    },
    {
      question: language === 'hi'
        ? 'खरीद के लिए मंडी लाते समय कौन से दस्तावेज चाहिए?'
        : language === 'mr'
        ? 'खरेदीसाठी बाजारात येताना कोणती कागदपत्रे लागतात?'
        : language === 'pa'
        ? 'ਖਰੀਦ ਲਈ ਮੰਡੀ ਲਿਆਉਣ ਵੇਲੇ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ?'
        : language === 'gu'
        ? 'ખરીદી માટે મંડીમાં આવતી વખતે કયા દસ્તાવેજો જરૂરી છે?'
        : 'What documents are required at the Mandi for procurement?',
      answer: language === 'hi'
        ? 'आधार कार्ड, 7/12 भू-अभिलेख / खतौनी, बैंक पासबुक प्रति, और किसान मित्र डिजिटल टोकन कन्फर्मेशन पर्ची।'
        : language === 'mr'
        ? 'आधार कार्ड, ७/१२ उतारा / जमिनीचे कागदपत्र, बँक पासबुक प्रत आणि किसान मित्र डिजिटल टोकन पावती.'
        : language === 'pa'
        ? 'ਆਧਾਰ ਕਾਰਡ, 7/12 ਜ਼ਮੀਨ ਦੇ ਰਿਕਾਰਡ / ਜਮ੍ਹਾਂਬੰਦੀ, ਬੈਂਕ ਪਾਸਬੁੱਕ ਕਾਪੀ, ਅਤੇ ਕਿਸਾਨ ਮਿੱਤਰ ਡਿਜੀਟਲ ਟੋਕਨ ਰਸੀਦ।'
        : language === 'gu'
        ? 'આધાર કાર્ડ, ૭/૧૨ જમીનનો દાખલો, બેંક પાસબુક નકલ અને કિસાન મિત્ર ડિજિટલ ટોકન રસીદ.'
        : 'Aadhaar Card, 7/12 Land Record / Khatauni, Bank Passbook copy, and your Kisan Mitra digital token confirmation receipt.',
    },
    {
      question: language === 'hi'
        ? 'शिकायत दर्ज होने के बाद समाधान में कितना समय लगता है?'
        : language === 'mr'
        ? 'तक्रार नोंदवल्यानंतर निवारणासाठी किती वेळ लागतो?'
        : language === 'pa'
        ? 'ਸ਼ਿਕਾਇਤ ਦਰਜ ਹੋਣ ਤੋਂ ਬਾਅਦ ਹੱਲ ਵਿੱਚ ਕਿੰਨਾ ਸਮਾਂ ਲੱਗਦਾ ਹੈ?'
        : language === 'gu'
        ? 'ફરિયાદ નોંધાયા પછી નિરાકરણમાં કેટલો સમય લાગે છે?'
        : 'How long does it take for grievance resolution?',
      answer: language === 'hi'
        ? 'सभी शिकायतों की जांच नोडल APMC अधिकारी द्वारा की जाती है। सामान्य शिकायतों का निवारण 24 से 48 कार्य घंटों के भीतर किया जाता है।'
        : language === 'mr'
        ? 'सर्व तक्रारींची तपासणी नियुक्त नोडल अधिकाऱ्याद्वारे केली जाते. २४ ते ४८ कामकाजाच्या तासांत निवारण केले जाते.'
        : language === 'pa'
        ? 'ਸਾਰੀਆਂ ਸ਼ਿਕਾਇਤਾਂ ਦੀ ਜਾਂਚ ਨੋਡਲ ਅਧਿਕਾਰੀ ਦੁਆਰਾ ਕੀਤੀ ਜਾਂਦੀ ਹੈ। 24 ਤੋਂ 48 ਕੰਮ ਦੇ ਘੰਟਿਆਂ ਵਿੱਚ ਨਿਪਟਾਰਾ ਕੀਤਾ ਜਾਂਦਾ ਹੈ।'
        : language === 'gu'
        ? 'તમામ ફરિયાદોની તપાસ નોડલ અધિકારી દ્વારા કરવામાં આવે છે. ૨૪ થી ૪૮ કામકાજના કલાકોમાં ઉકેલ લાવવામાં આવે છે.'
        : 'All grievances are reviewed by the designated APMC Nodal Officer. Standard grievances are investigated and resolved within 24 to 48 working hours.',
    },
    {
      question: language === 'hi'
        ? 'एमएसपी (MSP) भुगतान बैंक खाते में कब जमा होता है?'
        : language === 'mr'
        ? 'हमीभाव (MSP) रक्कम बँक खात्यात कधी जमा होते?'
        : language === 'pa'
        ? 'MSP ਭੁਗਤਾਨ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਕਦੋਂ ਜਮ੍ਹਾਂ ਹੁੰਦਾ ਹੈ?'
        : language === 'gu'
        ? 'ટેકાના ભાવ (MSP) ચૂકવણી બેંક ખાતામાં ક્યારે જમા થાય છે?'
        : 'When is the MSP payment credited to the bank account?',
      answer: language === 'hi'
        ? 'गुणवत्ता परीक्षण और वजन पर्ची जारी होने के बाद, प्रत्यक्ष लाभ अंतरण (DBT) के माध्यम से 48 से 72 घंटों में राशि सीधे किसान के बैंक खाते में भेज दी जाती है।'
        : language === 'mr'
        ? 'दर्जा तपासणी आणि वजन पावती जारी झाल्यानंतर, DBT द्वारे ४८ ते ७२ तासांत रक्कम थेट बँक खात्यात पाठवली जाते.'
        : language === 'pa'
        ? 'ਗੁਣਵੱਤਾ ਤਸਦੀਕ ਅਤੇ ਵਜ਼ਨ ਪਰਚੀ ਜਾਰੀ ਹੋਣ ਤੋਂ ਬਾਅਦ, DBT ਰਾਹੀਂ 48 ਤੋਂ 72 ਘੰਟਿਆਂ ਵਿੱਚ ਰਕਮ ਸਿੱਧੇ ਬੈਂਕ ਖਾਤੇ ਵਿੱਚ ਭੇਜੀ ਜਾਂਦੀ ਹੈ।'
        : language === 'gu'
        ? 'ગુણવત્તા ચકાસણી અને વજન રસીદ પછી, DBT દ્વારા ૪૮ થી ૭૨ કલાકમાં રકમ સીધી બેંક ખાતામાં જમા થાય છે.'
        : 'After quality verification and weighbridge slip generation, funds are directly credited to the farmer’s bank account via DBT within 48 to 72 hours.',
    },
  ];

  const regionalCenters = [
    {
      yard: 'APMC Nashik — Main Yard',
      address: 'Panchavati Market Yard, Nashik, Maharashtra 422003',
      timings: 'Mon – Sat: 06:00 – 18:00',
      contact: '0253-2512345',
    },
    {
      yard: 'APMC Pune — Gultekdi Yard',
      address: 'Market Yard, Gultekdi, Pune, Maharashtra 411037',
      timings: 'Mon – Sat: 06:00 – 19:00',
      contact: '020-24267890',
    },
    {
      yard: 'APMC Ahmednagar — Central Yard',
      address: 'Station Road, Market Yard, Ahmednagar, Maharashtra 414001',
      timings: 'Mon – Sat: 07:00 – 18:00',
      contact: '0241-2324567',
    },
  ];

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto space-y-10">

        {/* Page heading */}
        <div className="grid lg:grid-cols-[.8fr_1.2fr] gap-6 items-end">
          <div>
            <p className="text-primary-600 text-sm font-semibold uppercase tracking-[.18em]">
              {t('contact.supportDesk', language)}
            </p>
            <h1 className="display-font text-4xl sm:text-5xl text-primary-950 mt-2">
              {t('contact.heading', language)}
            </h1>
          </div>
          <p className="text-primary-700 max-w-lg lg:justify-self-end text-base leading-relaxed">
            {t('contact.lead', language)}
          </p>
        </div>

        {/* Contact info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Phone,
              label: t('contact.helpline', language),
              value: '1800-180-1551',
              sub: t('contact.hours', language),
              href: 'tel:1800-180-1551',
            },
            {
              icon: Mail,
              label: t('contact.email', language),
              value: 'support@kisanmitra.gov.in',
              sub: t('contact.reply', language),
              href: 'mailto:support@kisanmitra.gov.in',
            },
            {
              icon: Clock,
              label: t('contact.response', language),
              value: t('contact.within', language),
              sub: 'Direct Nodal Officer Review',
              href: undefined,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/90 rounded-2xl border border-primary-200/90 shadow-sm p-5 hover:border-primary-400 transition-all"
            >
              <div className="w-10 h-10 bg-primary-100/80 rounded-xl flex items-center justify-center mb-4 text-primary-700">
                <item.icon className="w-5 h-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold text-primary-600 uppercase tracking-wider mb-1">
                {item.label}
              </p>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-base font-bold text-primary-950 hover:text-primary-700 transition-colors"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-base font-bold text-primary-950">{item.value}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">{item.sub}</p>
            </div>
          ))}
        </div>

        {/* Form + Side panel */}
        <div className="grid lg:grid-cols-[.7fr_1.3fr] gap-6 items-start">
          <div className="rounded-[1.75rem] bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 text-white p-7 min-h-[300px] flex flex-col justify-between shadow-xl border border-primary-800">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
                <ShieldCheck className="w-6 h-6 text-primary-300" />
              </div>
              <div>
                <h2 className="display-font text-2xl sm:text-3xl text-white">
                  {t('contact.voiceTitle', language)}
                </h2>
                <p className="text-primary-200/90 text-sm leading-relaxed mt-3">
                  {t('contact.voiceBody', language)}
                </p>
              </div>

              <div className="pt-2 space-y-2 border-t border-white/10 text-xs text-primary-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Verified procurement officers on duty</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Direct SMS acknowledgement on your phone</span>
                </div>
              </div>
            </div>

            <a
              href="tel:1800-180-1551"
              className="group flex items-center justify-between text-sm font-semibold bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-4 py-3 pt-3 mt-6 transition-all"
            >
              <span>{t('contact.call', language)}</span>
              <ArrowRight className="w-4 h-4 text-primary-300 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <FormCard className="bg-white/95 border-primary-200/90 shadow-lg">
            <div className="mb-5">
              <p className="text-xs uppercase tracking-wider text-primary-600 font-semibold">
                {t('contact.sendMessage', language)}
              </p>
              <h2 className="text-2xl font-bold text-primary-950 mt-1">
                {t('contact.helpHeading', language)}
              </h2>
            </div>
            <ContactForm />
          </FormCard>
        </div>

        {/* ── Frequently Asked Questions (FAQ) ───────────────────────── */}
        <div className="rounded-2xl border border-primary-200/90 bg-white/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-950">
                {language === 'hi'
                  ? 'अक्सर पूछे जाने वाले प्रश्न (FAQ)'
                  : language === 'mr'
                  ? 'नेहमी विचारले जाणारे प्रश्न (FAQ)'
                  : language === 'pa'
                  ? 'ਅਕਸਰ ਪੁੱਛੇ ਜਾਂਦੇ ਸਵਾਲ (FAQ)'
                  : language === 'gu'
                  ? 'વારંવાર પૂછાતા પ્રશ્નો (FAQ)'
                  : 'Frequently Asked Questions'}
              </h2>
              <p className="text-xs text-primary-600">
                {language === 'hi'
                  ? 'किसानों द्वारा सबसे अधिक पूछे जाने वाले प्रश्नों के तुरंत उत्तर'
                  : language === 'mr'
                  ? 'शेतकऱ्यांनी वारंवार विचारलेल्या प्रश्नांची जलद उत्तरे'
                  : language === 'pa'
                  ? 'ਕਿਸਾਨਾਂ ਦੁਆਰਾ ਸਭ ਤੋਂ ਵੱਧ ਪੁੱਛੇ ਗਏ ਸਵਾਲਾਂ ਦੇ ਤੁਰੰਤ ਜਵਾਬ'
                  : language === 'gu'
                  ? 'ખેડૂતો દ્વારા વારંવાર પૂછાતા પ્રશ્નોના ઝડપી જવાબો'
                  : 'Quick answers to common questions about slot booking and procurement'}
              </p>
            </div>
          </div>

          <div className="divide-y divide-primary-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 font-semibold text-primary-950 hover:text-primary-700 text-sm sm:text-base transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-primary-600 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-primary-800' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed pl-1 pr-4 animate-in fade-in duration-200">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Regional APMC Mandi Centers ─────────────────────────── */}
        <div className="rounded-2xl border border-primary-200/90 bg-white/90 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary-950">
                {language === 'hi'
                  ? 'क्षेत्रीय मंडी सहायता केंद्र'
                  : language === 'mr'
                  ? 'प्रादेशिक कृषी उत्पन्न बाजार समिती मदत केंद्रे'
                  : language === 'pa'
                  ? 'ਖੇਤਰੀ ਮੰਡੀ ਸਹਾਇਤਾ ਕੇਂਦਰ'
                  : language === 'gu'
                  ? 'પ્રાદેશિક મંડી સહાય કેન્દ્રો'
                  : 'Regional APMC Support Centers'}
              </h2>
              <p className="text-xs text-primary-600">
                {language === 'hi'
                  ? 'निकटतम केंद्र पर भौतिक सहायता और टोकन सहायता के लिए संपर्क करें'
                  : language === 'mr'
                  ? 'जवळच्या केंद्रावर प्रत्यक्ष मदत आणि टोकन सहाय्यासाठी संपर्क साधा'
                  : language === 'pa'
                  ? 'ਨੇੜਲੇ ਕੇਂਦਰ ਤੇ ਵਿਅਕਤੀਗਤ ਸਹਾਇਤਾ ਅਤੇ ਟੋਕਨ ਮਦਦ ਲਈ ਸੰਪਰਕ ਕਰੋ'
                  : language === 'gu'
                  ? 'નજીકના કેન્દ્ર પર રૂબરૂ સહાય અને ટોકન મદદ માટે સંપર્ક કરો'
                  : 'In-person help desks and on-ground procurement support offices'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {regionalCenters.map((center) => (
              <div
                key={center.yard}
                className="bg-primary-50/40 rounded-xl border border-primary-100 p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <h3 className="font-bold text-sm text-primary-950">{center.yard}</h3>
                  <div className="flex items-start gap-1.5 text-xs text-gray-600 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-primary-600 shrink-0 mt-0.5" />
                    <span>{center.address}</span>
                  </div>
                </div>

                <div className="space-y-1 border-t border-primary-100 pt-3 text-xs">
                  <div className="flex items-center gap-1.5 text-primary-700">
                    <Clock className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <span>{center.timings}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-primary-900 font-medium">
                    <Phone className="w-3.5 h-3.5 text-primary-600 shrink-0" />
                    <a href={`tel:${center.contact}`} className="hover:underline">
                      {center.contact}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </PageContainer>
  );
}
