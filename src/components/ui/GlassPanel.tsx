import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface GlassPanelProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

const defaultVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className = '', variants, ...props }) => {
  return (
    <motion.div
      variants={variants || defaultVariants}
      className={`relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl ${className}`}
      {...props}
    >
      {/* Subtle inner border to enhance glass edge */}
      <div className="absolute inset-0 border border-white/5 rounded-xl pointer-events-none mix-blend-overlay" />
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};
