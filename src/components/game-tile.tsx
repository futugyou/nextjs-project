'use client'

import { motion } from 'framer-motion'
import type { Tile } from '@/hook/use-game-2048'

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: 'bg-amber-100', text: 'text-slate-700' },
  4: { bg: 'bg-amber-200', text: 'text-slate-700' },
  8: { bg: 'bg-amber-300', text: 'text-slate-800' },
  16: { bg: 'bg-amber-400', text: 'text-slate-800' },
  32: { bg: 'bg-amber-500', text: 'text-white' },
  64: { bg: 'bg-amber-600', text: 'text-white' },
  128: { bg: 'bg-yellow-400', text: 'text-slate-800' },
  256: { bg: 'bg-yellow-500', text: 'text-white' },
  512: { bg: 'bg-orange-400', text: 'text-white' },
  1024: { bg: 'bg-orange-500', text: 'text-white' },
  2048: { bg: 'bg-orange-600', text: 'text-white' },
}

function getTileStyle(value: number) {
  return TILE_COLORS[value] || { bg: 'bg-orange-700', text: 'text-white' }
}

function getFontSize(value: number) {
  if (value >= 1000) return 'text-xl sm:text-2xl'
  if (value >= 100) return 'text-2xl sm:text-3xl'
  return 'text-3xl sm:text-4xl'
}

interface GameTileProps {
  tile: Tile
  cellSize: number
  gap: number
}

export function GameTile({ tile, cellSize, gap }: GameTileProps) {
  const { bg, text } = getTileStyle(tile.value)
  const x = tile.col * (cellSize + gap)
  const y = tile.row * (cellSize + gap)

  return (
    <motion.div
      key={tile.id}
      initial={tile.isNew ? { scale: 0, x, y } : tile.isMerged ? { scale: 1.1, x, y } : { x, y }}
      animate={{ scale: 1, x, y }}
      transition={{
        x: { type: 'spring', stiffness: 300, damping: 30, duration: 0.15 },
        y: { type: 'spring', stiffness: 300, damping: 30, duration: 0.15 },
        scale: { type: 'spring', stiffness: 400, damping: 20, duration: 0.2 },
      }}
      className={`absolute rounded-lg ${bg} ${text} font-bold flex items-center justify-center ${getFontSize(tile.value)} select-none shadow-md`}
      style={{
        width: cellSize,
        height: cellSize,
      }}
    >
      {tile.value}
    </motion.div>
  )
}
