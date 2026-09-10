import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function SecondaryButton({
  children,
  loading = false,
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}: SecondaryButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  };

  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        bg-white hover:bg-primary-50 active:bg-primary-100
        text-primary-700 font-semibold rounded-xl
        border-2 border-primary-300 hover:border-primary-400
        transition-all duration-150
        min-h-[44px]
        disabled:opacity-60 disabled:cursor-not-allowed
        focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}
