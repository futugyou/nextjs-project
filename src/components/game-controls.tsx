'use client'

import type { CellValue, Difficulty } from '@/lib/gomoku-ai'
import { RotateCcw, Keyboard, Mouse } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface GameControlsProps {
  currentPlayer: CellValue
  playerColor: CellValue
  difficulty: Difficulty
  scores: { player: number; ai: number; draw: number }
  isThinking: boolean
  onDifficultyChange: (d: Difficulty) => void
  onRestart: () => void
  onColorSwitch: () => void
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: '初级',
  intermediate: '中级',
  advanced: '高级',
}

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'bg-green-100 text-green-800 border-green-300',
  intermediate: 'bg-amber-100 text-amber-800 border-amber-300',
  advanced: 'bg-red-100 text-red-800 border-red-300',
}

export default function GameControls({
  currentPlayer,
  playerColor,
  difficulty,
  scores,
  isThinking,
  onDifficultyChange,
  onRestart,
  onColorSwitch,
}: GameControlsProps) {
  const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced']
  const t = useTranslations('gomoku')

  return (
    <div className="w-full max-w-150 mx-auto flex flex-col gap-4">
      {/* Score & Status */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">{t('title')}</h2>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Keyboard className="w-3 h-3" /> {t('keys')}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Mouse className="w-3 h-3" /> {t('mouse')}
            </span>
          </div>
        </div>

        {/* Turn Indicator */}
        <div className="flex items-center justify-center gap-3 mb-4 py-2 px-4 rounded-lg bg-secondary">
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              currentPlayer === 1
                ? 'bg-foreground border-foreground shadow-md scale-110'
                : 'bg-foreground border-foreground opacity-40'
            }`}
          />
          <span className="text-sm font-medium text-secondary-foreground">
            {isThinking
              ? t('thinking')
              : currentPlayer === playerColor
                ? t('user_turn')
                : t('ai_turn')}
          </span>
          <div
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              currentPlayer === 2
                ? 'bg-card border-muted-foreground shadow-md scale-110'
                : 'bg-card border-muted-foreground opacity-40'
            }`}
          />
        </div>

        {/* Scores */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-xs text-muted-foreground mb-0.5">{t('user_won_count')}</div>
            <div className="text-xl font-bold text-foreground">{scores.player}</div>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-xs text-muted-foreground mb-0.5">{t('draw_count')}</div>
            <div className="text-xl font-bold text-muted-foreground">{scores.draw}</div>
          </div>
          <div className="bg-secondary rounded-lg p-2">
            <div className="text-xs text-muted-foreground mb-0.5">{t('ai_won_count')}</div>
            <div className="text-xl font-bold text-foreground">{scores.ai}</div>
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-md">
        <div className="text-xs text-muted-foreground mb-2 font-medium">
          {t('difficulty_choose')}
        </div>
        <div className="flex gap-2">
          {difficulties.map((d) => (
            <button
              key={d}
              onClick={() => onDifficultyChange(d)}
              className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all duration-200 ${
                difficulty === d
                  ? difficultyColors[d]
                  : 'bg-muted text-muted-foreground border-border hover:bg-secondary'
              }`}
            >
              {difficultyLabels[d]}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onColorSwitch}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
        >
          <div className="flex items-center gap-1">
            <div
              className={`w-3.5 h-3.5 rounded-full ${playerColor === 1 ? 'bg-foreground' : 'bg-card border border-muted-foreground'}`}
            />
            <span className="text-muted-foreground">{'→'}</span>
            <div
              className={`w-3.5 h-3.5 rounded-full ${playerColor === 1 ? 'bg-card border border-muted-foreground' : 'bg-foreground'}`}
            />
          </div>
          {t('change_color')}
        </button>
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <RotateCcw className="w-4 h-4" />
          {t('restart')}
        </button>
      </div>
    </div>
  )
}
