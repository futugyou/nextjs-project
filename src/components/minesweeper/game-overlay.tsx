'use client'

import { Trophy, Frown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GameStatus } from '@/hook/use-minesweeper'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface GameOverlayProps {
  status: GameStatus
  time: number
  onReset: () => void
}

export function GameOverlay({ status, time, onReset }: GameOverlayProps) {
  const t = useTranslations('minesweeper')
  if (status !== 'won' && status !== 'lost') return null

  const isWon = status === 'won'

  return (
    <div className="absolute inset-0 flex items-center justify-center rounded-lg z-10">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px] rounded-lg" />

      {/* Card */}
      <div
        className={cn(
          'relative flex flex-col items-center gap-4 px-8 py-6 rounded-xl border shadow-lg bg-card',
          isWon ? 'border-yellow-400/50' : 'border-destructive/40',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-center w-14 h-14 rounded-full',
            isWon ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-red-100 dark:bg-red-900/30',
          )}
        >
          {isWon ? (
            <Trophy size={28} className="text-yellow-500" strokeWidth={1.5} />
          ) : (
            <Frown size={28} className="text-destructive" strokeWidth={1.5} />
          )}
        </div>

        <div className="text-center">
          <p className="text-base font-semibold text-foreground">{isWon ? t('win') : t('fail')}</p>
          {isWon && (
            <p className="mt-1 text-sm text-muted-foreground">
              {t('use')} <span className="font-mono font-bold text-foreground">{time}</span>
              {t('use_unit')}
            </p>
          )}
        </div>

        <Button
          onClick={onReset}
          size="sm"
          variant={isWon ? 'default' : 'destructive'}
          className="gap-2"
        >
          <RotateCcw size={13} strokeWidth={2} />
          {t('again')}
        </Button>
      </div>
    </div>
  )
}
