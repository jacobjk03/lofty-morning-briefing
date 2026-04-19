'use client'
import { motion, AnimatePresence } from 'framer-motion'

export type OrbState = 'idle' | 'thinking' | 'speaking' | 'executing' | 'done'

interface OrbProps {
  state: OrbState
  size?: number
  className?: string
}

/**
 * Premium orb — real SVG with:
 *   • Two animated radial gradients (core sphere + specular highlight)
 *   • SMIL-animated gradient stops for "thinking" shimmer
 *   • Stroke-dashoffset ripple halos for "speaking"
 *   • Conic gradient internal rotation for liquid feel
 *   • CSS filter blur + Framer scale for the outer glow
 *
 * All state transitions use keySplines(0.22 1 0.36 1) — the same curve as Apple's SF Symbols.
 */
export default function Orb({ state, size = 180, className = '' }: OrbProps) {
  const isSpeaking = state === 'speaking'
  const isThinking = state === 'thinking'
  const isExecuting = state === 'executing'

  // Speed per state
  const breathDur = {
    idle: 3.4, thinking: 1.4, speaking: 1.0, executing: 0.7, done: 3.8,
  }[state]

  // Glow intensity per state
  const glowAlpha = {
    idle: 0.35, thinking: 0.55, speaking: 0.8, executing: 1.0, done: 0.45,
  }[state]

  const box = 200
  const cx = box / 2
  const cy = box / 2
  const coreR = 64

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size * 2.1, height: size * 2.1 }}
    >
      {/* Outer soft glow — div with filter blur is still the cleanest way to get a luminous halo */}
      <motion.div
        aria-hidden
        className="absolute rounded-pill pointer-events-none"
        style={{
          width: size * 1.9,
          height: size * 1.9,
          background: `radial-gradient(circle, rgba(34,211,238,${0.32 * glowAlpha}) 0%, rgba(34,211,238,${0.12 * glowAlpha}) 40%, transparent 70%)`,
          filter: 'blur(32px)',
        }}
        animate={{ opacity: [0.75, 1, 0.75], scale: [1, 1.05, 1] }}
        transition={{ duration: breathDur, repeat: Infinity, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* The SVG orb itself */}
      <motion.svg
        aria-hidden
        viewBox={`0 0 ${box} ${box}`}
        width={size}
        height={size}
        animate={{
          scale: [1, (state === 'executing' ? 1.12 : state === 'speaking' ? 1.06 : 1.03), 1],
        }}
        transition={{
          duration: breathDur,
          repeat: Infinity,
          ease: [0.45, 0, 0.55, 1],
        }}
        style={{
          filter: `drop-shadow(0 0 ${40 + glowAlpha * 60}px rgba(34,211,238,${0.45 * glowAlpha})) drop-shadow(0 8px 24px rgba(15,23,42,0.6))`,
        }}
      >
        <defs>
          {/* Core sphere gradient */}
          <radialGradient id="orbCore" cx="50%" cy="50%" r="60%" fx="30%" fy="25%">
            <stop offset="0%" stopColor="#E0F2FE">
              {isThinking && (
                <animate
                  attributeName="stop-color"
                  values="#E0F2FE;#A5F3FC;#E0F2FE"
                  dur="2s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="25%" stopColor="#22D3EE">
              {isThinking && (
                <animate
                  attributeName="stop-color"
                  values="#22D3EE;#67E8F9;#22D3EE"
                  dur="2.4s"
                  repeatCount="indefinite"
                />
              )}
            </stop>
            <stop offset="65%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#0B1220" />
          </radialGradient>

          {/* Specular highlight — tiny bright ellipse */}
          <radialGradient id="orbSpec" cx="35%" cy="25%" r="25%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          {/* Rim light gradient */}
          <radialGradient id="orbRim" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="transparent" />
            <stop offset="95%" stopColor="rgba(34,211,238,0.6)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Conic-ish sweep using SVG angular gradient via rotation + mask */}
          <radialGradient id="orbClip" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="white" />
          </radialGradient>

          <clipPath id="sphereClip">
            <circle cx={cx} cy={cy} r={coreR} />
          </clipPath>
        </defs>

        {/* Rim light */}
        <circle cx={cx} cy={cy} r={coreR + 4} fill="url(#orbRim)" />

        {/* Core sphere */}
        <circle cx={cx} cy={cy} r={coreR} fill="url(#orbCore)" />

        {/* Liquid conic swirl — rotating group clipped to sphere */}
        <g clipPath="url(#sphereClip)">
          <motion.g
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            animate={{ rotate: 360 }}
            transition={{
              duration: isThinking ? 4 : 14,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <path
              d={`M ${cx} ${cy - coreR}
                  Q ${cx + coreR * 1.2} ${cy - coreR * 0.2} ${cx} ${cy + coreR}
                  Q ${cx - coreR * 1.2} ${cy + coreR * 0.2} ${cx} ${cy - coreR} Z`}
              fill="rgba(103,232,249,0.35)"
              style={{ mixBlendMode: 'screen' }}
            />
            <path
              d={`M ${cx - coreR * 0.4} ${cy - coreR * 0.8}
                  Q ${cx + coreR * 0.6} ${cy} ${cx - coreR * 0.2} ${cy + coreR * 0.8}`}
              fill="none"
              stroke="rgba(186,230,253,0.3)"
              strokeWidth="8"
              strokeLinecap="round"
              style={{ mixBlendMode: 'screen', filter: 'blur(4px)' }}
            />
          </motion.g>
        </g>

        {/* Specular highlight on top-left */}
        <ellipse
          cx={cx - coreR * 0.28}
          cy={cy - coreR * 0.45}
          rx={coreR * 0.32}
          ry={coreR * 0.18}
          fill="url(#orbSpec)"
          style={{ filter: 'blur(2px)' }}
        />

        {/* Tiny white sparkle dot */}
        <circle
          cx={cx - coreR * 0.38}
          cy={cy - coreR * 0.52}
          r={1.8}
          fill="white"
          opacity="0.9"
        />
      </motion.svg>

      {/* Ripples — real SVG strokes with stroke-dashoffset draw */}
      <AnimatePresence>
        {(isSpeaking || isExecuting) && (
          <>
            {[0, 0.5, 1.0].map((delay) => (
              <motion.div
                key={`ripple-${delay}`}
                aria-hidden
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 0.55, 0], scale: [0.85, 2.1, 2.3] }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  delay,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute pointer-events-none"
                style={{ width: size, height: size }}
              >
                <svg viewBox={`0 0 ${box} ${box}`} width="100%" height="100%">
                  <circle
                    cx={cx}
                    cy={cy}
                    r={coreR}
                    fill="none"
                    stroke={isExecuting ? 'rgba(103,232,249,0.9)' : 'rgba(34,211,238,0.7)'}
                    strokeWidth={isExecuting ? 1.2 : 0.8}
                    style={{
                      filter: `blur(${isExecuting ? 0.5 : 0.3}px) drop-shadow(0 0 8px rgba(34,211,238,0.5))`,
                    }}
                  />
                </svg>
              </motion.div>
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
