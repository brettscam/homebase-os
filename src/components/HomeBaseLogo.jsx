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

// Animated tree SVG — draws on with path animation, positioned beside the house
const AnimatedTree = ({ size = 64, delay = 0.8, className = '' }) => {
  // Tree dimensions relative to provided size
  const w = size * 0.5;
  const h = size;
  const cx = w / 2; // center x of tree

  // Trunk
  const trunkW = w * 0.12;
  const trunkH = h * 0.3;
  const trunkX = cx - trunkW / 2;
  const trunkY = h * 0.68;

  // Three-tier canopy (bottom to top, overlapping triangles)
  const canopy = [
    // Bottom tier (widest)
    { tipY: h * 0.22, baseY: h * 0.58, halfW: w * 0.38 },
    // Middle tier
    { tipY: h * 0.12, baseY: h * 0.42, halfW: w * 0.28 },
    // Top tier (smallest)
    { tipY: h * 0.02, baseY: h * 0.28, halfW: w * 0.18 },
  ];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className={className}
    >
      {/* Trunk */}
      <motion.rect
        x={trunkX}
        y={trunkY}
        width={trunkW}
        height={trunkH}
        stroke="currentColor"
        strokeWidth={w * 0.06}
        strokeLinecap="round"
        fill="none"
        rx={w * 0.02}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay }}
      />
      {/* Canopy tiers — drawn bottom to top */}
      {canopy.map((tier, i) => (
        <motion.path
          key={i}
          d={`M${cx} ${tier.tipY} L${cx + tier.halfW} ${tier.baseY} L${cx - tier.halfW} ${tier.baseY} Z`}
          stroke="currentColor"
          strokeWidth={w * 0.06}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            ease: 'easeOut',
            delay: delay + 0.3 + i * 0.2,
          }}
        />
      ))}
    </svg>
  );
};

// Animated ground line — a subtle baseline under the house and tree
const GroundLine = ({ width = 160, delay = 1.0 }) => (
  <svg width={width} height={4} viewBox={`0 0 ${width} 4`} fill="none" className="mt-0">
    <motion.line
      x1={0}
      y1={2}
      x2={width}
      y2={2}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 0.35 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay }}
    />
  </svg>
);

// Animated "HB" monogram — draws the letters with path animation
const HBMonogram = ({ size = 28, delay = 1.6, className = '' }) => {
  const w = size * 2.2;
  const h = size;
  const sw = size * 0.08; // stroke width

  // H letter paths — left vertical, crossbar, right vertical
  const hLeft = size * 0.08;
  const hRight = size * 0.48;
  const hMid = (hLeft + hRight) / 2;
  const hTop = size * 0.1;
  const hBot = size * 0.9;
  const hCross = size * 0.5;

  // B letter — vertical stem + two bumps
  const bLeft = size * 0.62;
  const bTop = hTop;
  const bBot = hBot;
  const bMidY = hCross;
  const bBulge1 = size * 1.05; // right extent of top bump
  const bBulge2 = size * 1.1;  // right extent of bottom bump

  // Single path for H
  const hPath = `M${hLeft} ${hBot} L${hLeft} ${hTop} M${hLeft} ${hCross} L${hRight} ${hCross} M${hRight} ${hTop} L${hRight} ${hBot}`;

  // Single path for B
  const bPath = [
    `M${bLeft} ${bBot}`,
    `L${bLeft} ${bTop}`,
    `C${bLeft} ${bTop} ${bBulge1} ${bTop} ${bBulge1} ${bMidY}`,
    `C${bBulge1} ${bMidY} ${bLeft} ${bMidY} ${bLeft} ${bMidY}`,
    `C${bLeft} ${bMidY} ${bBulge2} ${bMidY} ${bBulge2} ${bBot}`,
    `C${bBulge2} ${bBot} ${bLeft} ${bBot} ${bLeft} ${bBot}`,
  ].join(' ');

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      className={className}
    >
      {/* H */}
      <motion.path
        d={hPath}
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay }}
      />
      {/* B */}
      <motion.path
        d={bPath}
        stroke="currentColor"
        strokeWidth={sw}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: delay + 0.3 }}
      />
    </svg>
  );
};

// Animated progress dots — subtle pulsing indicators
const ProgressDots = ({ delay = 1.8 }) => (
  <motion.div
    className="flex items-center gap-1.5 mt-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
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
          delay: delay + i * 0.2,
        }}
      />
    ))}
  </motion.div>
);

// Thin animated progress bar — fills smoothly over each cycle
const ProgressBar = ({ cycleDuration = 7.2, delay = 0.5 }) => (
  <motion.div
    className="w-32 h-0.5 rounded-full bg-hb-teal/10 overflow-hidden mt-5"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay, duration: 0.4 }}
  >
    <motion.div
      className="h-full rounded-full bg-hb-teal/30"
      animate={{ width: ['0%', '100%'] }}
      transition={{
        duration: cycleDuration * 0.75,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
    />
  </motion.div>
);

// Full loading screen with animated logo, tree, branding text, and progress
export const HomeBaseLoader = ({ message = 'Loading...' }) => {
  // Total animation cycle: ~5s draw-on + 1.5s hold + 0.7s fade = ~7.2s
  const cycleDuration = 7.2;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-hb-warm z-50">
      <motion.div
        className="flex flex-col items-center"
        // Loop the entire illustration: draw on, hold, fade, repeat
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: cycleDuration,
          times: [0, 0.05, 0.8, 1],       // fade-in ~0.35s, hold, fade-out ~1.4s
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Scene: house + tree side by side */}
        <div className="flex items-end gap-1 text-hb-teal mb-1">
          <HomeBaseLogo size={72} animate />
          <AnimatedTree size={56} delay={0.9} />
        </div>

        {/* Ground line under the scene */}
        <div className="text-hb-teal -mt-1">
          <GroundLine width={140} delay={1.0} />
        </div>

        {/* HB monogram drawn in below the scene */}
        <motion.div
          className="text-hb-teal mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.4 }}
        >
          <HBMonogram size={26} delay={1.5} />
        </motion.div>

        {/* "Homebase" brand text — fades in after illustration draws */}
        <motion.p
          className="text-center text-xl font-semibold tracking-wide text-hb-teal select-none mt-2"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.2, duration: 0.6, ease: 'easeOut' }}
        >
          Homebase
        </motion.p>

        {/* Tagline — subtle, fades in after the brand name */}
        <motion.p
          className="text-center text-xs font-medium text-hb-slate/60 tracking-wider select-none mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.6, duration: 0.5, ease: 'easeOut' }}
        >
          your home, organized
        </motion.p>
      </motion.div>

      {/* Status message — persistent, outside the looping container */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-sm font-medium text-hb-slate tracking-wide mt-6"
      >
        {message}
      </motion.p>

      {/* Progress bar — thin filling bar synced to the cycle */}
      <ProgressBar cycleDuration={cycleDuration} delay={0.5} />

      {/* Progress dots */}
      <ProgressDots delay={1.0} />
    </div>
  );
};

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
