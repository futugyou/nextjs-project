'use client'

import { Flag, Bomb } from 'lucide-react'
import type { Cell as CellType } from '@/hook/use-minesweeper'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface CellProps {
  cell: CellType
  size: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
  gameOver: boolean
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-num-1',
  2: 'text-num-2',
  3: 'text-num-3',
  4: 'text-num-4',
  5: 'text-num-5',
  6: 'text-num-6',
  7: 'text-num-7',
  8: 'text-num-8',
}

export function Cell({ cell, size, onReveal, onFlag, gameOver }: CellProps) {
  const t = useTranslations('minesweeper')
  const handleClick = () => {
    if (!gameOver) onReveal(cell.row, cell.col)
  }

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!gameOver) onFlag(cell.row, cell.col)
  }

  const fontSize = size <= 22 ? 'text-[9px]' : size <= 28 ? 'text-xs' : 'text-sm'
  const iconSize = size <= 22 ? 9 : size <= 28 ? 11 : 13

  const isRevealed = cell.isRevealed
  const isFlagged = cell.isFlagged
  const isMine = cell.isMine
  const isExploded = cell.isExploded

  return (
    <button
      className={cn(
        'relative flex items-center justify-center select-none transition-colors duration-75 focus:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-[2px]',
        'font-mono font-bold leading-none',
        fontSize,
        // Unrevealed
        !isRevealed &&
          !isFlagged &&
          'bg-cell-unrevealed hover:bg-secondary border border-border active:bg-cell-revealed cursor-pointer',
        // Flagged (unrevealed)
        isFlagged && !isRevealed && 'bg-cell-unrevealed border border-border cursor-pointer',
        // Revealed — normal
        isRevealed && !isMine && 'bg-cell-revealed border border-border/40 cursor-default',
        // Revealed — mine (not the exploded one)
        isRevealed && isMine && !isExploded && 'bg-muted border border-border cursor-default',
        // Exploded mine
        isExploded && 'bg-cell-mine border border-cell-mine cursor-default',
      )}
      style={{ width: size, height: size }}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      aria-label={
        isFlagged
          ? t('flagged')
          : isRevealed
            ? isMine
              ? t('mine')
              : cell.neighborCount > 0
                ? t('neighbor_count', { count: cell.neighborCount })
                : t('empty')
            : t('unrevealed')
      }
    >
      {/* Flagged */}
      {isFlagged && !isRevealed && (
        <Flag size={iconSize} className="text-cell-flag fill-cell-flag" strokeWidth={1.5} />
      )}

      {/* Revealed mine */}
      {isRevealed && isMine && (
        <Bomb
          size={iconSize}
          className={cn(isExploded ? 'text-destructive-foreground' : 'text-foreground')}
          strokeWidth={1.5}
        />
      )}

      {/* Revealed number */}
      {isRevealed && !isMine && cell.neighborCount > 0 && (
        <span
          className={cn('tabular-nums', NUMBER_COLORS[cell.neighborCount] ?? 'text-foreground')}
        >
          {cell.neighborCount}
        </span>
      )}
    </button>
  )
}
