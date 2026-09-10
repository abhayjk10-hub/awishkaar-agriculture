import { ReactNode, ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function PrimaryButton({
  children,
  loading = false,
  fullWidth = false,
  size = 'md',
  className = '',
  disabled,
  ...props
}: PrimaryButtonProps) {
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
        bg-primary-600 hover:bg-primary-700 active:bg-primary-800
        text-white font-semibold rounded-xl
        transition-all duration-150
        shadow-sm hover:shadow-md
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
