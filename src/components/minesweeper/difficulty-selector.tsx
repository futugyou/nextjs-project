'use client'

import { DIFFICULTY_CONFIG, type Difficulty } from '@/hook/use-minesweeper'
import { cn } from '@/lib/utils'

interface DifficultySelectorProps {
  current: Difficulty
  onChange: (d: Difficulty) => void
}

const difficulties: Difficulty[] = ['beginner', 'intermediate', 'expert']

export function DifficultySelector({ current, onChange }: DifficultySelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-secondary/60 border border-border">
      {difficulties.map((d) => {
        const cfg = DIFFICULTY_CONFIG[d]
        const isActive = d === current
        return (
          <button
            key={d}
            onClick={() => onChange(d)}
            className={cn(
              'relative px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
            )}
          >
            <span>{cfg.label}</span>
            {isActive && (
              <span className="ml-1.5 text-[10px] opacity-70">
                {cfg.cols}×{cfg.rows}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
