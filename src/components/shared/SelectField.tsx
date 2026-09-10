import { SelectHTMLAttributes, ReactNode, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  icon?: ReactNode;
  id: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ label, error, hint, icon, id, options, placeholder, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-primary-800"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        <div className="relative">
          {icon && (
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-400 pointer-events-none"
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <select
            ref={ref}
            id={id}
            aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
            aria-invalid={!!error}
            className={`
              w-full rounded-xl border-2 bg-white px-4 py-3 pr-10
              text-base text-gray-800
              min-h-[48px] appearance-none
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${error
                ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
                : 'border-primary-200 hover:border-primary-300'
              }
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-4 h-4"
            aria-hidden="true"
          />
        </div>
        {error && (
          <p id={`${id}-error`} role="alert" className="text-sm text-red-600 flex items-center gap-1">
            <span aria-hidden="true">⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>
        )}
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
export default SelectField;
