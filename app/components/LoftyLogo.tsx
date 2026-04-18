export default function LoftyLogo({ size = 32 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-lg font-extrabold text-white"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #2563EB, #1d4ed8)',
        fontSize: size * 0.55,
        letterSpacing: '-0.05em',
      }}
    >
      K
    </div>
  )
}
