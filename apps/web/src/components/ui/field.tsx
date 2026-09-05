import React from 'react';
import { cn } from '../../lib/cn';

const controlBase =
  'w-full rounded-xl border bg-cp-surface text-sm text-cp-navy placeholder:text-cp-muted-light transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-cp-bg';

const controlNormal = 'border-cp-border hover:border-slate-300';
const controlError = 'border-rose-300 hover:border-rose-400';
const controlFocus =
  'focus:outline-none focus-visible:border-cp-yellow focus-visible:ring-2 focus-visible:ring-cp-yellow/20';

export interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-cp-navy">
          {label}
          {required && (
            <span className="text-rose-600" aria-hidden="true">
              {' '}
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error ? (
        <p id={errorId} role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-sm text-cp-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, id, ...props },
  ref,
) {
  const describedBy = [
    props['aria-describedby'],
    invalid && id ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <input
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(
        controlBase,
        'h-10 px-3',
        invalid ? controlError : controlNormal,
        controlFocus,
        className,
      )}
      {...props}
    />
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, id, rows = 4, ...props },
  ref,
) {
  const describedBy = [
    props['aria-describedby'],
    invalid && id ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <textarea
      ref={ref}
      id={id}
      rows={rows}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(
        controlBase,
        'min-h-[6.5rem] px-3 py-2.5 leading-relaxed resize-y',
        invalid ? controlError : controlNormal,
        controlFocus,
        className,
      )}
      {...props}
    />
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, id, children, ...props },
  ref,
) {
  const describedBy = [
    props['aria-describedby'],
    invalid && id ? `${id}-error` : undefined,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <select
      ref={ref}
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
      className={cn(
        controlBase,
        'h-10 px-3',
        invalid ? controlError : controlNormal,
        controlFocus,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
