import React from 'react';
import { motion } from 'framer-motion';

// Animated HomeBase logo mark — used for loading states and branding
export const HomeBaseLogo = ({ size = 48, animate = true, className = '' }) => {
  const s = size;
  const half = s / 2;
  const roofY = s * 0.18;
  const baseY = s * 0.82;
  const wallLeft = s * 0.22;
  const wallRight = s * 0.78;
  const doorLeft = s * 0.4;
  const doorRight = s * 0.6;
  const doorTop = s * 0.55;

  return (
    <svg
      width={s}
      height={s}
      viewBox={`0 0 ${s} ${s}`}
      fill="none"
      className={className}
    >
      {/* Roof */}
      <motion.path
        d={`M${half} ${roofY} L${wallRight + 4} ${s * 0.42} L${wallLeft - 4} ${s * 0.42} Z`}
        stroke="currentColor"
        strokeWidth={s * 0.05}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={animate ? { pathLength: 0, opacity: 0 } : {}}
        animate={animate ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {/* Walls */}
      <motion.rect
        x={wallLeft}
        y={s * 0.42}
        width={wallRight - wallLeft}
        height={baseY - s * 0.42}
        stroke="currentColor"
        strokeWidth={s * 0.05}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        rx={s * 0.02}
        initial={animate ? { pathLength: 0, opacity: 0 } : {}}
        animate={animate ? { pathLength: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
      />
      {/* Door */}
      <motion.rect
        x={doorLeft}
        y={doorTop}
        width={doorRight - doorLeft}
        height={baseY - doorTop}
        stroke="currentColor"
        strokeWidth={s * 0.04}
        fill="currentColor"
        fillOpacity={0.1}
        rx={s * 0.02}
        initial={animate ? { scaleY: 0, opacity: 0 } : {}}
        animate={animate ? { scaleY: 1, opacity: 1 } : {}}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.6 }}
        style={{ transformOrigin: `${half}px ${baseY}px` }}
      />
    </svg>
  );
};

// Full loading screen with animated logo
export const HomeBaseLoader = ({ message = 'Loading...' }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-hb-warm z-50">
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="text-hb-teal mb-6"
    >
      <HomeBaseLogo size={64} animate />
    </motion.div>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="text-sm font-medium text-hb-slate tracking-wide"
    >
      {message}
    </motion.p>
  </div>
);

// Inline spinner with logo mark
export const HomeBaseSpinner = ({ size = 32, className = '' }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      className="text-hb-teal"
    >
      <HomeBaseLogo size={size} animate={false} />
    </motion.div>
  </div>
);
