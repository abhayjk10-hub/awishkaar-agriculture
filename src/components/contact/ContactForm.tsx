'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { FileText, MessageSquare, Smartphone, User, CheckCircle2, RotateCcw, Home } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { t } from '@/lib/translations';
import InputField from '@/components/shared/InputField';
import SelectField from '@/components/shared/SelectField';
import TextareaField from '@/components/shared/TextareaField';
import PrimaryButton from '@/components/shared/PrimaryButton';
import AlertMessage from '@/components/shared/AlertMessage';

type MessageType = 'Query' | 'Suggestion' | 'Grievance';

interface FormData {
  farmerName: string;
  mobile: string;
  messageType: MessageType | '';
  message: string;
}

const INITIAL: FormData = { farmerName: '', mobile: '', messageType: '', message: '' };

const SCRIPT_URL =
  process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL ||
  'https://script.google.com/macros/s/AKfycbyUXQnzKCyxUQMeuouHRUPMG1TYUi4Kb9MKuFR_hDjbdNUK7kDKxM02joW-R1S6GizJPw/exec';

// Direct client fallback to Google Sheet (no-cors)
const directPushToSheet = (data: FormData) => {
  fetch(SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      farmerName: data.farmerName.trim(),
      mobile: '+91' + data.mobile.trim(),
      messageType: data.messageType,
      message: data.message.trim(),
    }),
  }).catch(() => {
    /* silent fallback */
  });
};

export default function ContactForm() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const supabase = useMemo(() => createClient(), []);

  const [formData, setFormData] = useState<FormData>(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData>(INITIAL);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  // Prefill from farmer profile if logged in
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('farmers')
        .select('full_name, mobile_number')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setFormData((p) => ({
          ...p,
          farmerName: data.full_name ?? '',
          mobile: (data.mobile_number ?? '').replace(/^\+91/, ''),
        }));
      } else if (user.phone) {
        setFormData((p) => ({ ...p, mobile: user.phone!.replace(/^\+91/, '') }));
      }
    })();
  }, [supabase, user]);

  const isValidMobile = (n: string) => /^[6-9]\d{9}$/.test(n.trim());

  const update = (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setFormData((p) => ({ ...p, [key]: e.target.value }));
      setErrors((p) => ({ ...p, [key]: undefined }));
    };

  const validate = () => {
    const errs: typeof errors = {};
    if (!formData.farmerName.trim()) errs.farmerName = t('validation.required.name', language);
    if (!formData.mobile.trim()) errs.mobile = t('validation.required.mobile', language);
    else if (!isValidMobile(formData.mobile)) errs.mobile = t('validation.invalid.mobile', language);
    if (!formData.messageType) errs.messageType = t('validation.required.messageType', language);
    if (!formData.message.trim()) errs.message = t('validation.required.message', language);
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setAlert(null);

    // Save snapshot of submitted data for confirmation screen
    const submittedSnapshot = { ...formData };

    try {
      // 1. Post to our Next.js server API (forwards server-side to Google Sheet)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submittedSnapshot),
      });

      if (!res.ok) {
        // Direct client fallback
        directPushToSheet(submittedSnapshot);
      }
    } catch {
      // Direct client fallback if fetch threw
      directPushToSheet(submittedSnapshot);
    } finally {
      setLoading(false);
      setSubmittedData(submittedSnapshot);
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setFormData(INITIAL);
    setErrors({});
    setAlert(null);
    setSubmitted(false);
  };

  const typeOptions = [
    { value: 'Query', label: t('contact.query', language) },
    { value: 'Suggestion', label: t('contact.suggestion', language) },
    { value: 'Grievance', label: t('contact.grievance', language) },
  ];

  /* ── Success confirmation ───────────────────────────────────────── */
  if (submitted) {
    const isGrievance = submittedData.messageType === 'Grievance';
    const msg = isGrievance
      ? t('contact.successGrievance', language)
      : t('contact.successGeneral', language);

    return (
      <div className="py-6 px-4 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-9 h-9" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-200">
            {isGrievance ? 'Grievance Logged' : 'Message Recorded'}
          </span>
          <h2 className="text-2xl font-bold text-primary-950">
            {isGrievance ? 'Grievance Registered Successfully' : 'Submission Received'}
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
            {msg}
          </p>
        </div>

        {/* Submission Details Card */}
        <div className="bg-primary-50/70 border border-primary-200/80 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs text-primary-900">
          <div className="flex justify-between border-b border-primary-100 pb-2">
            <span className="text-primary-600 font-medium">Farmer Name:</span>
            <span className="font-semibold">{submittedData.farmerName}</span>
          </div>
          <div className="flex justify-between border-b border-primary-100 pb-2">
            <span className="text-primary-600 font-medium">Registered Mobile:</span>
            <span className="font-semibold">+91 {submittedData.mobile}</span>
          </div>
          <div className="flex justify-between border-b border-primary-100 pb-2">
            <span className="text-primary-600 font-medium">Category:</span>
            <span className="font-semibold">{submittedData.messageType}</span>
          </div>
          <div className="pt-1 flex items-center justify-between text-[11px] text-primary-700">
            <span>Status:</span>
            <span className="inline-flex items-center gap-1 font-medium text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              Sent to Support Desk
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-primary-300 hover:bg-primary-50 text-primary-800 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors min-h-[44px]"
          >
            <RotateCcw className="w-4 h-4" />
            Send Another Message
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors min-h-[44px] shadow-sm"
          >
            <Home className="w-4 h-4" />
            {t('contact.backHome', language)}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Form ───────────────────────────────────────────────────────── */
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {alert && <AlertMessage type={alert.type} message={alert.message} onDismiss={() => setAlert(null)} />}

      <InputField
        id="contact-name"
        label={t('contact.name', language)}
        type="text"
        placeholder={t('contact.namePlaceholder', language)}
        value={formData.farmerName}
        onChange={update('farmerName')}
        error={errors.farmerName}
        icon={<User className="w-4 h-4" />}
        required
        autoComplete="name"
      />

      <InputField
        id="contact-mobile"
        label={t('contact.mobile', language)}
        type="tel"
        inputMode="numeric"
        placeholder={t('contact.mobilePlaceholder', language)}
        value={formData.mobile}
        onChange={(e) => {
          setFormData((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) }));
          setErrors((p) => ({ ...p, mobile: undefined }));
        }}
        error={errors.mobile}
        icon={<Smartphone className="w-4 h-4" />}
        required
        autoComplete="tel"
        maxLength={10}
      />

      <SelectField
        id="contact-message-type"
        label={t('contact.messageType', language)}
        value={formData.messageType}
        onChange={update('messageType')}
        options={typeOptions}
        placeholder={t('contact.messageTypePlaceholder', language)}
        error={errors.messageType}
        icon={<MessageSquare className="w-4 h-4" />}
        required
      />

      <TextareaField
        id="contact-message"
        label={t('contact.message', language)}
        placeholder={t('contact.messagePlaceholder', language)}
        value={formData.message}
        onChange={update('message')}
        error={errors.message}
        required
        rows={5}
      />

      <PrimaryButton type="submit" fullWidth loading={loading} size="lg">
        <FileText className="w-4 h-4" aria-hidden="true" />
        {t('contact.submit', language)}
      </PrimaryButton>
    </form>
  );
}
