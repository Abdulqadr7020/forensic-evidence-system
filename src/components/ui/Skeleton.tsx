import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string;
  height?: string;
  isCircle?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  isCircle = false,
  className = '',
  style,
  ...props
}) => {
  return (
    <div
      className={`animate-pulse bg-[var(--surface-active)] ${
        isCircle ? 'rounded-full' : 'rounded-md'
      } ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-2 p-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-2">
          <Skeleton height="16px" width="120px" />
          <Skeleton height="16px" className="flex-1" />
          <Skeleton height="16px" width="80px" />
          <Skeleton height="16px" width="60px" />
        </div>
      ))}
    </div>
  );
};

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 space-y-3">
      <Skeleton height="12px" width="90px" />
      <Skeleton height="28px" width="60px" />
      <Skeleton height="10px" width="140px" />
    </div>
  );
};
