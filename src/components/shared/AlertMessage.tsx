import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { t } from '@/lib/translations';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertMessageProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
}

const config = {
  success: {
    bg: 'bg-green-50 border-green-300',
    text: 'text-green-800',
    icon: CheckCircle2,
    iconColor: 'text-green-600',
  },
  error: {
    bg: 'bg-red-50 border-red-300',
    text: 'text-red-800',
    icon: XCircle,
    iconColor: 'text-red-600',
  },
  info: {
    bg: 'bg-blue-50 border-blue-300',
    text: 'text-blue-800',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-300',
    text: 'text-amber-800',
    icon: AlertCircle,
    iconColor: 'text-amber-600',
  },
};

export default function AlertMessage({ type, message, onDismiss }: AlertMessageProps) {
  const { language } = useLanguage();
  const { bg, text, icon: Icon, iconColor } = config[type];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`flex items-start gap-3 p-4 rounded-xl border ${bg} ${text}`}
    >
      <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} aria-hidden="true" />
      <p className="flex-1 text-sm font-medium leading-relaxed">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`flex-shrink-0 ${text} hover:opacity-70 transition-opacity`}
          aria-label={t('common.dismiss', language)}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
