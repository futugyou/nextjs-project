'use client'

import { Trophy, RotateCcw } from 'lucide-react'
import type { CellValue } from '@/lib/gomoku-ai'

interface GameOverOverlayProps {
  winner: CellValue | 'draw'
  playerColor: CellValue
  onRestart: () => void
}

export default function GameOverOverlay({ winner, playerColor, onRestart }: GameOverOverlayProps) {
  const isDraw = winner === 'draw'
  const playerWon = winner === playerColor

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center animate-in zoom-in-95 duration-300">
        <div className="mb-4">
          {isDraw ? (
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">{'='}</span>
            </div>
          ) : (
            <div
              className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                playerWon ? 'bg-accent' : 'bg-muted'
              }`}
            >
              <Trophy
                className={`w-8 h-8 ${
                  playerWon ? 'text-accent-foreground' : 'text-muted-foreground'
                }`}
              />
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isDraw ? '平局' : playerWon ? '恭喜你赢了！' : 'AI 获胜'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {isDraw
            ? '棋盘已满，双方势均力敌。'
            : playerWon
              ? '你成功连成了五子，太厉害了！'
              : 'AI 成功连成了五子，再接再厉！'}
        </p>

        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <RotateCcw className="w-4 h-4" />
          再来一局
        </button>
      </div>
    </div>
  )
}
