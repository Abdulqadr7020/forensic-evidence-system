import React from 'react';

export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ${className}`}
      {...props}
    >
      {/* Subtle inner border to enhance glass edge */}
      <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none mix-blend-overlay" />
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
