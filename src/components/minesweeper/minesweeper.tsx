'use client'

import { useState, useMemo } from 'react'
import { useMinesweeper, DIFFICULTY_CONFIG, type Difficulty } from '@/hook/use-minesweeper'
import { Board } from './board'
import { StatusBar } from './status-bar'
import { DifficultySelector } from './difficulty-selector'
import { GameOverlay } from './game-overlay'
import { Bomb, MousePointerClick, Flag } from 'lucide-react'

// Determine ideal cell size based on difficulty
function getCellSize(difficulty: Difficulty): number {
  if (difficulty === 'expert') return 22
  if (difficulty === 'intermediate') return 26
  return 32
}

export function Minesweeper() {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner')
  const { board, gameStatus, minesRemaining, time, revealCell, toggleFlag, resetGame } =
    useMinesweeper(difficulty)

  const cellSize = useMemo(() => getCellSize(difficulty), [difficulty])
  const cfg = DIFFICULTY_CONFIG[difficulty]

  const boardWidth = cfg.cols * cellSize

  return (
    <div className="flex flex-col items-center gap-5 w-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2">
          <Bomb size={20} className="text-foreground" strokeWidth={1.5} />
          <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">扫雷</h1>
        </div>
        <p className="text-xs text-muted-foreground">左键揭示 · 右键标旗</p>
      </div>

      {/* Difficulty selector */}
      <DifficultySelector current={difficulty} onChange={setDifficulty} />

      {/* Game area */}
      <div className="flex flex-col gap-2.5" style={{ width: Math.max(boardWidth, 260) }}>
        {/* Status bar */}
        <StatusBar
          minesRemaining={minesRemaining}
          time={time}
          gameStatus={gameStatus}
          onReset={resetGame}
        />

        {/* Board container */}
        <div className="relative rounded-lg overflow-hidden border border-border bg-card p-2.5">
          <Board
            board={board}
            gameStatus={gameStatus}
            cellSize={cellSize}
            onReveal={revealCell}
            onFlag={toggleFlag}
          />
          <GameOverlay status={gameStatus} time={time} onReset={resetGame} />
        </div>

        {/* Hint */}
        <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <MousePointerClick size={11} strokeWidth={1.5} />
            左键揭示格子
          </span>
          <span className="w-px h-3 bg-border" />
          <span className="flex items-center gap-1">
            <Flag size={11} strokeWidth={1.5} />
            右键插旗标记
          </span>
        </div>
      </div>
    </div>
  )
}
