import React from 'react';
import { motion } from 'framer-motion';

// ─── H-Frame Logomark (Variant C — Diagonal Balance) ──────────────
// Architectural doorframe with grid fill and blueprint extension lines.
// Lintel extends top-left, threshold extends bottom-right.

export const HomeBaseLogo = ({ size = 48, animate = true, className = '' }) => {
  const id = React.useId();
  const gridId = `grid-${id}`;

  // All coordinates are proportional to a 140-unit viewBox
  const draw = animate
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5, ease: 'easeOut' } }
    : {};
  const drawDelay = (d) =>
    animate
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, ease: 'easeOut', delay: d } }
      : {};

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      fill="none"
      className={className}
    >
      <defs>
        <pattern id={gridId} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.35" opacity="0.22" />
        </pattern>
      </defs>

      {/* Lintel extension — top-left */}
      <motion.line x1="0" y1="26" x2="28" y2="26" stroke="currentColor" strokeWidth="1.25" opacity="0.5" {...drawDelay(0.6)} />

      {/* Threshold extension — bottom-right */}
      <motion.line x1="120" y1="117" x2="140" y2="117" stroke="currentColor" strokeWidth="1.25" opacity="0.5" {...drawDelay(0.8)} />

      {/* H-Frame mark */}
      <g transform="translate(20, 18)">
        {/* Grid fill */}
        <motion.rect x="10" y="12" width="80" height="80" fill={`url(#${gridId})`} {...drawDelay(0.3)} />
        {/* Left pillar */}
        <motion.rect x="0" y="10" width="10" height="88" fill="currentColor" {...draw} />
        {/* Right pillar */}
        <motion.rect x="90" y="10" width="10" height="88" fill="currentColor" {...drawDelay(0.1)} />
        {/* Lintel (top beam) */}
        <motion.rect x="0" y="0" width="100" height="12" fill="currentColor" {...drawDelay(0.2)} />
        {/* Threshold (bottom beam) */}
        <motion.rect x="0" y="96" width="100" height="6" fill="currentColor" {...drawDelay(0.4)} />
      </g>
    </svg>
  );
};

// ─── Full Logo — Mark + HOMEBASE wordmark ──────────────────────────
// Used on login page and larger brand placements.

export const HomeBaseFullLogo = ({ height = 80, className = '' }) => {
  const id = React.useId();
  const gridId = `gridfull-${id}`;

  return (
    <svg
      height={height}
      viewBox="0 0 540 100"
      fill="none"
      className={className}
    >
      <defs>
        <pattern id={gridId} width="8" height="8" patternUnits="userSpaceOnUse">
          <path d="M 8 0 L 0 0 0 8" fill="none" stroke="#2B9E8F" strokeWidth="0.35" opacity="0.22" />
        </pattern>
      </defs>

      {/* Lintel extends left */}
      <line x1="0" y1="18" x2="20" y2="18" stroke="#2B9E8F" strokeWidth="1.25" opacity="0.5" />

      {/* Mark */}
      <g transform="translate(14, 10)">
        <rect x="8" y="10" width="60" height="60" fill={`url(#${gridId})`} />
        <rect x="0" y="8" width="8" height="68" fill="#2B9E8F" />
        <rect x="68" y="8" width="8" height="68" fill="#2B9E8F" />
        <rect x="0" y="0" width="76" height="10" fill="#2B9E8F" />
        <rect x="0" y="74" width="76" height="5" fill="#2B9E8F" />
      </g>

      {/* Threshold extends into wordmark area */}
      <line x1="90" y1="87" x2="118" y2="87" stroke="#2B9E8F" strokeWidth="1.25" opacity="0.5" />

      {/* Wordmark */}
      <text x="124" y="62" fill="#1e293b" fontFamily="Inter, -apple-system, sans-serif" fontSize="40" fontWeight="500" letterSpacing="5">HOMEBASE</text>

      {/* Letter extensions — H top and final E right */}
      <line x1="124" y1="26" x2="124" y2="16" stroke="#2B9E8F" strokeWidth="1.25" opacity="0.5" />
      <line x1="490" y1="68" x2="508" y2="68" stroke="#2B9E8F" strokeWidth="1.25" opacity="0.5" />
    </svg>
  );
};

// ─── Full-screen loading screen ────────────────────────────────────

export const HomeBaseLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-hb-warm z-50">
      {/* Animated H-frame mark */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-hb-teal mb-6"
      >
        <HomeBaseLogo size={96} animate />
      </motion.div>

      {/* Brand name */}
      <motion.p
        className="text-xl font-medium tracking-[0.35em] text-hb-navy select-none uppercase"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: 'easeOut' }}
      >
        Homebase
      </motion.p>

      {/* Tagline */}
      <motion.p
        className="text-xs font-medium text-hb-slate/60 tracking-wider select-none mt-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        your home, organized
      </motion.p>

      {/* Status message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-sm font-medium text-hb-slate tracking-wide mt-8"
      >
        {message}
      </motion.p>

      {/* Progress bar */}
      <motion.div
        className="w-32 h-0.5 rounded-full bg-hb-teal/10 overflow-hidden mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
      >
        <motion.div
          className="h-full rounded-full bg-hb-teal/30"
          animate={{ width: ['0%', '100%'] }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.8,
          }}
        />
      </motion.div>

      {/* Pulsing dots */}
      <motion.div
        className="flex items-center gap-1.5 mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.4 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="block w-1.5 h-1.5 rounded-full bg-hb-teal/40"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.85, 1.15, 0.85],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1 + i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
};

// ─── Inline spinner ────────────────────────────────────────────────

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
