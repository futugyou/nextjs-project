'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useGame2048, type Direction } from '@/hook/use-game-2048'
import { GameTile } from '@/components/game-tile'
import { Button } from '@/components/ui/button'
import { RotateCcw, Trophy } from 'lucide-react'
import { useGameStorage } from '@/hook/use-game-record'
import { useTranslations } from 'next-intl'

const CELL_SIZE = 80
const GAP = 12
const BOARD_SIZE = CELL_SIZE * 4 + GAP * 3

export default function Page() {
  const t = useTranslations('2048')
  const { tiles, score, gameOver, won, move, resetGame } = useGame2048()
  const { saveRecord, currentGameData } = useGameStorage('2048')
  const boardRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const startTime = useRef(Date.now())

  useEffect(() => {
    if (gameOver) {
      const duration = Math.floor((Date.now() - startTime.current) / 1000)
      saveRecord(score, duration, won)
    }
  }, [gameOver, score, won, saveRecord])

  const handleReset = () => {
    startTime.current = Date.now()
    resetGame()
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const directionMap: Record<string, Direction> = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right',
        }
        move(directionMap[e.key])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [move])

  // Touch controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.x
    const dy = touch.clientY - touchStart.y
    const absDx = Math.abs(dx)
    const absDy = Math.abs(dy)

    const minSwipeDistance = 30

    if (Math.max(absDx, absDy) > minSwipeDistance) {
      if (absDx > absDy) {
        move(dx > 0 ? 'right' : 'left')
      } else {
        move(dy > 0 ? 'down' : 'up')
      }
    }
    setTouchStart(null)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-4 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="flex flex-col items-center gap-4 w-full max-w-md">
        <h1 className="text-5xl font-black text-slate-800 tracking-tight">2048</h1>

        {/* Score Board */}
        <div className="flex gap-4 w-full">
          <div className="flex-1 bg-slate-700 rounded-lg p-3 text-center">
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
              {t('score')}
            </p>
            <p className="text-2xl font-bold text-white">{score}</p>
          </div>
          <div className="flex-1 bg-slate-700 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <Trophy className="w-3 h-3 text-amber-400" />
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wide">
                {t('best_score')}
              </p>
            </div>
            <p className="text-2xl font-bold text-amber-400">
              {currentGameData?.bestRecord?.score || 0}
            </p>
          </div>
        </div>

        <Button
          onClick={resetGame}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition-colors"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {t('new_game')}
        </Button>
      </div>

      <div
        ref={boardRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative bg-slate-300 rounded-xl p-3 shadow-xl touch-none"
        style={{
          width: BOARD_SIZE + 24,
          height: BOARD_SIZE + 24,
        }}
      >
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="bg-slate-400/50 rounded-lg"
              style={{ width: CELL_SIZE, height: CELL_SIZE }}
            />
          ))}
        </div>

        <div className="absolute inset-3">
          <AnimatePresence>
            {tiles.map((tile) => (
              <GameTile key={tile.id} tile={tile} cellSize={CELL_SIZE} gap={GAP} />
            ))}
          </AnimatePresence>
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-slate-800/80 rounded-xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <p className="text-3xl font-bold text-white"> {t('game_over')}</p>
            <p className="text-xl text-slate-300">
              {' '}
              {t('final_score')}: {score}
            </p>
            <Button
              onClick={handleReset}
              className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg shadow-md"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('new_game')}
            </Button>
          </div>
        )}

        {/* Win Overlay */}
        {won && !gameOver && (
          <div className="absolute inset-0 bg-amber-500/90 rounded-xl flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <Trophy className="w-16 h-16 text-white" />
            <p className="text-3xl font-bold text-white"> {t('congratulation')}</p>
            <p className="text-lg text-white/90"> {t('congratulation_desc')}</p>
            <div className="flex gap-3">
              <Button
                onClick={() => {}}
                variant="outline"
                className="bg-white/20 border-white/30 text-white hover:bg-white/30 font-semibold px-6 py-3 rounded-lg"
              >
                {t('continue_game')}
              </Button>
              <Button
                onClick={resetGame}
                className="bg-white text-amber-600 hover:bg-white/90 font-semibold px-6 py-3 rounded-lg"
              >
                {t('new_game')}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="text-center text-slate-500 text-sm max-w-xs">
        <p className="font-medium mb-1">{t('op_title')}</p>
        <p>
          {t.rich('op_desc', {
            kbd: (chunks) => (
              <span className="font-mono bg-slate-200 px-1 rounded text-slate-700">{chunks}</span>
            ),
            bold: (chunks) => <span className="font-semibold text-slate-900">{chunks}</span>,
          })}
        </p>
      </div>
    </div>
  )
}
