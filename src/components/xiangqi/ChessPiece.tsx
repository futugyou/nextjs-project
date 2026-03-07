'use client'

import { Piece, PIECE_CHARS } from '@/lib/xiangqi'
import { cn } from '@/lib/utils'

interface ChessPieceProps {
  piece: Piece
  isSelected?: boolean
  isLastMove?: boolean
  onClick?: () => void
  size?: number
}

export function ChessPiece({ piece, isSelected, isLastMove, onClick, size = 48 }: ChessPieceProps) {
  const char = PIECE_CHARS[piece.color][piece.type]
  const isRed = piece.color === 'red'

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center rounded-full border-2 font-bold transition-all duration-150 select-none cursor-pointer',
        'shadow-md hover:shadow-lg active:scale-95',
        isRed
          ? 'bg-piece-red-bg border-piece-red text-piece-red'
          : 'bg-piece-black-bg border-piece-black text-piece-black',
        isSelected && 'ring-4 ring-highlight ring-offset-1 scale-110 z-10',
        isLastMove && !isSelected && 'ring-2 ring-accent ring-offset-1',
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.44,
        lineHeight: 1,
      }}
      aria-label={`${piece.color === 'red' ? '红方' : '黑方'}${char}`}
    >
      {/* 外圈装饰 */}
      <span
        className={cn(
          'absolute inset-[3px] rounded-full border opacity-40',
          isRed ? 'border-piece-red' : 'border-piece-black',
        )}
      />
      <span className="relative z-10 font-bold">{char}</span>
    </button>
  )
}
