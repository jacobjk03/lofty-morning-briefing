import sharp from 'sharp'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const svgPath = resolve(root, 'app/icon.svg')
const svg = readFileSync(svgPath)

mkdirSync(resolve(root, 'public'), { recursive: true })

// Sizes: [filename, px]
const targets = [
  // Next.js picks these up from /app automatically
  ['app/apple-icon.png', 180],
  // Public brand exports
  ['public/lofty-avatar-512.png', 512],
  ['public/lofty-avatar-1024.png', 1024],
  ['public/lofty-avatar-256.png', 256],
  ['public/lofty-avatar-64.png', 64],
  ['public/lofty-avatar-32.png', 32],
  ['public/lofty-avatar-16.png', 16],
]

const results = []
for (const [rel, size] of targets) {
  const out = resolve(root, rel)
  await sharp(svg)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(out)
  results.push(`${rel} ${size}x${size}`)
}

// Build a multi-resolution .ico for legacy browsers. sharp doesn't do .ico
// natively, so we embed a 32x32 PNG inside a tiny ICO container.
function pngBufferAt(size) {
  return sharp(svg)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
}

const icoSizes = [16, 32, 48]
const pngs = await Promise.all(icoSizes.map(pngBufferAt))
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2) // image type = icon
header.writeUInt16LE(pngs.length, 4)

const entries = []
let dataOffset = 6 + pngs.length * 16
for (let i = 0; i < pngs.length; i++) {
  const entry = Buffer.alloc(16)
  const size = icoSizes[i]
  entry.writeUInt8(size >= 256 ? 0 : size, 0)
  entry.writeUInt8(size >= 256 ? 0 : size, 1)
  entry.writeUInt8(0, 2)       // palette
  entry.writeUInt8(0, 3)       // reserved
  entry.writeUInt16LE(1, 4)    // planes
  entry.writeUInt16LE(32, 6)   // bit depth
  entry.writeUInt32LE(pngs[i].length, 8)
  entry.writeUInt32LE(dataOffset, 12)
  entries.push(entry)
  dataOffset += pngs[i].length
}

const ico = Buffer.concat([header, ...entries, ...pngs])
writeFileSync(resolve(root, 'app/favicon.ico'), ico)
results.push(`app/favicon.ico (16/32/48 combined)`)

console.log('Exported:')
for (const r of results) console.log('  ' + r)
