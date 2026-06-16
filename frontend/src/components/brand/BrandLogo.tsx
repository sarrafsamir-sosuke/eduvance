type BrandLogoProps = {
  compact?: boolean;
  inverted?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export function BrandLogo({
  compact = false,
  inverted = false,
  size = 'md',
  className = '',
}: BrandLogoProps) {
  return (
    <span className={`brand-logo brand-logo-${size}${inverted ? ' brand-logo-inverted' : ''} ${className}`}>
      <span className="brand-logo-mark" aria-hidden="true">E</span>
      {!compact ? (
        <span className="brand-logo-copy">
          <strong>EduVance</strong>
          <small>Gamified Learning</small>
        </span>
      ) : null}
    </span>
  );
}
