import { ReactNode } from 'react';

interface FormCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export default function FormCard({ children, className = '', title, subtitle }: FormCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-md border border-primary-100 p-6 sm:p-8 ${className}`}>
      {title && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-primary-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-primary-600">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
