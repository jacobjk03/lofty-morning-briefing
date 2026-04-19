'use client'

interface LoftyMarkProps {
  size?: number
  /** Adds a soft halo/shadow for hero contexts. Off by default for inline use. */
  halo?: boolean
  /** Breathing pulse ring — for active/thinking states. */
  pulse?: boolean
  className?: string
}

/**
 * Mini Lofty AI identity mark — the gradient orb in a small, reusable form.
 * Use anywhere we previously had a sparkle icon to mean "this is from Lofty AI".
 *
 * Tune size to match surrounding type: 12–14px for inline kickers, 20–28px for
 * message bubbles, 40+ for modal headers.
 */
export default function LoftyMark({ size = 16, halo = false, pulse = false, className = '' }: LoftyMarkProps) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-pill shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 30% 25%, #67E8F9 0%, #2563EB 55%, #0B1220 100%)',
        boxShadow: halo
          ? '0 0 0 4px rgba(37,99,235,0.08), 0 8px 22px -8px rgba(37,99,235,0.45)'
          : 'inset 0 1px 0 rgba(255,255,255,0.2)',
      }}
    >
      {/* Inner highlight */}
      <span
        aria-hidden="true"
        className="absolute rounded-pill"
        style={{
          top: size * 0.12,
          left: size * 0.18,
          width: size * 0.34,
          height: size * 0.2,
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(0.6px)',
        }}
      />
      {pulse && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-pill animate-ping"
          style={{ border: '1px solid rgba(103,232,249,0.5)' }}
        />
      )}
    </span>
  )
}
