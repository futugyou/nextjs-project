'use client'

import { cn } from '@/lib/utils'
import { Trophy, RotateCcw } from 'lucide-react'

interface WinModalProps {
  winner: 'red' | 'black' | null
  onPlayAgain: () => void
}

export function WinModal({ winner, onPlayAgain }: WinModalProps) {
  if (!winner) return null

  const isRedWin = winner === 'red'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onPlayAgain}
    >
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 mx-4 text-center max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 装饰圆圈 */}
        <div
          className={cn(
            'absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-card',
            isRedWin ? 'bg-piece-red' : 'bg-piece-black-bg',
          )}
        >
          <Trophy className="w-8 h-8 text-accent" />
        </div>

        <div className="mt-6 space-y-4">
          <h2 className={cn('text-3xl font-bold', isRedWin ? 'text-piece-red' : 'text-foreground')}>
            {isRedWin ? '红方胜' : '黑方胜'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isRedWin ? '恭喜！您击败了AI对手。' : '很遗憾，本局您被AI击败。再接再厉！'}
          </p>

          {/* 装饰分隔线 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-muted-foreground text-xs">将</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={onPlayAgain}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl',
              'bg-primary text-primary-foreground font-bold text-base',
              'hover:opacity-90 active:scale-95 transition-all duration-150 shadow-md',
            )}
          >
            <RotateCcw className="w-5 h-5" />
            再来一局
          </button>
        </div>
      </div>
    </div>
  )
}
