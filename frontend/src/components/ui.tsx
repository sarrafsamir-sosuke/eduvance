import type {
  ButtonHTMLAttributes,
  CSSProperties,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

import { BrandLogo } from './brand/BrandLogo';
import { Icon } from './Icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
  full?: boolean;
  loading?: boolean;
};

export function Button({
  children,
  className = '',
  variant = 'primary',
  full = false,
  loading = false,
  type = 'button',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant}${full ? ' button-full' : ''} ${className}`}
      type={type}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="button-spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: string;
  helper?: string;
  error?: string;
};

export function Input({ label, icon, helper, error, className = '', ...props }: InputProps) {
  return (
    <label className="input-group">
      {label ? <span className="input-label">{label}</span> : null}
      <span className={`input-shell${error ? ' input-shell-error' : ''}`}>
        {icon ? (
          <span className="input-icon" aria-hidden="true">
            <Icon name={icon} size={18} />
          </span>
        ) : null}
        <input className={`input-field ${className}`} {...props} />
      </span>
      {error ? <span className="input-error">{error}</span> : null}
      {helper && !error ? <span className="input-helper">{helper}</span> : null}
    </label>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  helper?: string;
};

export function Textarea({ label, helper, className = '', ...props }: TextareaProps) {
  return (
    <label className="input-group">
      {label ? <span className="input-label">{label}</span> : null}
      <span className="input-shell input-shell-area">
        <textarea className={`input-field input-textarea ${className}`} {...props} />
      </span>
      {helper ? <span className="input-helper">{helper}</span> : null}
    </label>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ label, className = '', children, ...props }: SelectProps) {
  return (
    <label className="input-group">
      {label ? <span className="input-label">{label}</span> : null}
      <span className="input-shell">
        <select className={`input-field input-select ${className}`} {...props}>
          {children}
        </select>
      </span>
    </label>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  const style = { '--progress': `${safeValue}%` } as CSSProperties;

  return (
    <div className="progress-track" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
      <span className="progress-fill" style={style} />
    </div>
  );
}

type BadgeProps = {
  children: ReactNode;
  tone?: 'blue' | 'green' | 'red' | 'yellow' | 'slate' | 'purple';
  className?: string;
};

export function Badge({ children, tone = 'blue', className = '' }: BadgeProps) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}

type CardProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'article' | 'section';
};

export function Card({ children, className = '', as: Tag = 'article' }: CardProps) {
  return <Tag className={`card ${className}`}>{children}</Tag>;
}

type StatCardProps = {
  label: string;
  value: string;
  icon: string;
  tone?: 'blue' | 'green' | 'red' | 'yellow' | 'slate' | 'purple';
  hint?: string;
  hintTone?: 'up' | 'down' | 'flat';
};

export function StatCard({ label, value, icon, tone = 'blue', hint, hintTone = 'up' }: StatCardProps) {
  return (
    <article className="stat-card">
      <div className="stat-card-head">
        <p>{label}</p>
        <span className={`stat-icon stat-${tone}`} aria-hidden="true">
          <Icon name={icon} size={18} />
        </span>
      </div>
      <strong>{value}</strong>
      {hint ? <small className={`stat-hint stat-hint-${hintTone}`}>{hint}</small> : null}
    </article>
  );
}

export function EmptyState({
  title,
  description,
  action,
  icon = 'sparkles',
}: {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: string;
}) {
  return (
    <div className="empty-state">
      <span className="empty-state-icon" aria-hidden="true">
        <Icon name={icon} size={26} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Spinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="page-loader" role="status">
      <span className="loader-ring" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="full-loader">
      <BrandLogo size="lg" />
      <span className="loader-ring" aria-hidden="true" />
    </div>
  );
}
