import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  isInteractive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, isInteractive = false, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 sm:p-5 transition-all duration-150 ${
          isInteractive
            ? 'hover:border-[var(--border-strong)] hover:bg-[var(--surface-hover)] cursor-pointer'
            : ''
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`flex items-center justify-between gap-4 mb-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <h3
      className={`text-sm font-semibold text-[var(--text-primary)] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs text-[var(--text-muted)] leading-relaxed ${className}`} {...props}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className={`space-y-3 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-muted)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
