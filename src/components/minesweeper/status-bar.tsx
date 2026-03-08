'use client'

import { Bomb, Flag, RotateCcw, Trophy, Frown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { GameStatus } from '@/hook/use-minesweeper'
import { cn } from '@/lib/utils'

interface StatusBarProps {
  minesRemaining: number
  time: number
  gameStatus: GameStatus
  onReset: () => void
}

function Digit({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn('font-mono font-bold tabular-nums text-lg leading-none', className)}>
      {value}
    </span>
  )
}

function SegmentDisplay({
  value,
  icon: Icon,
  iconClassName,
  className,
}: {
  value: number
  icon: React.ElementType
  iconClassName?: string
  className?: string
}) {
  const displayValue = Math.max(-99, Math.min(999, value))
  const sign = displayValue < 0 ? '-' : ''
  const abs = Math.abs(displayValue).toString().padStart(3, '0')

  return (
    <div
      className={cn(
        'flex items-center gap-2 min-w-20 px-3 py-1.5 rounded-md bg-secondary/60',
        className,
      )}
    >
      <Icon size={14} className={cn('shrink-0', iconClassName)} strokeWidth={2} />
      <div className="flex items-baseline">
        {sign && <Digit value={sign} className="text-destructive" />}
        {abs.split('').map((d, i) => (
          <Digit key={i} value={d} className="text-foreground" />
        ))}
      </div>
    </div>
  )
}

export function StatusBar({ minesRemaining, time, gameStatus, onReset }: StatusBarProps) {
  const ResetIcon = gameStatus === 'won' ? Trophy : gameStatus === 'lost' ? Frown : RotateCcw

  const iconClass =
    gameStatus === 'won'
      ? 'text-yellow-500'
      : gameStatus === 'lost'
        ? 'text-destructive'
        : 'text-foreground'

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-card border border-border">
      {/* Mine counter */}
      <SegmentDisplay value={minesRemaining} icon={Bomb} iconClassName="text-muted-foreground" />

      {/* Reset button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="h-8 w-8 p-0 rounded-md"
        aria-label="重新开始游戏"
      >
        <ResetIcon size={15} className={iconClass} strokeWidth={2} />
      </Button>

      {/* Timer */}
      <SegmentDisplay value={time} icon={Flag} iconClassName="text-muted-foreground" />
    </div>
  )
}
