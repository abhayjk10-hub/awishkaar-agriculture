import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
  id: string;
}

const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-sm font-semibold text-primary-800"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
        </label>
        <textarea
          ref={ref}
          id={id}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          aria-invalid={!!error}
          className={`
            w-full rounded-xl border-2 bg-white px-4 py-3
            text-base text-gray-800 placeholder-gray-400
            min-h-[120px] resize-y
            transition-colors duration-150
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error
              ? 'border-red-400 focus:ring-red-400 focus:border-red-400'
              : 'border-primary-200 hover:border-primary-300'
            }
            ${className}
          `}
          {...props}
        />
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

TextareaField.displayName = 'TextareaField';
export default TextareaField;
