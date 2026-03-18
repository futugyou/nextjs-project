'use client'

import { useEffect, useRef } from 'react'
import { MoveRecord } from '@/lib/xiangqi'
import { Difficulty } from '@/lib/xiangqi-ai'
import { cn } from '@/lib/utils'
import { RotateCcw, Flag, ChevronDown } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface GameSidebarProps {
  moveHistory: MoveRecord[]
  currentTurn: 'red' | 'black'
  isAIThinking: boolean
  difficulty: Difficulty
  onDifficultyChange: (d: Difficulty) => void
  onUndo: () => void
  onNewGame: () => void
  capturedByRed: string[]
  capturedByBlack: string[]
}

const difficultyLabels: Record<Difficulty, string> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
}

const difficultyColors: Record<Difficulty, string> = {
  beginner: 'text-green-400',
  intermediate: 'text-yellow-400',
  advanced: 'text-red-400',
}

export function GameSidebar({
  moveHistory,
  currentTurn,
  isAIThinking,
  difficulty,
  onDifficultyChange,
  onUndo,
  onNewGame,
  capturedByRed,
  capturedByBlack,
}: GameSidebarProps) {
  const historyRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('gomoku')

  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight
    }
  }, [moveHistory])

  return (
    <div className="flex flex-col gap-4 w-full h-full min-h-0">
      {/* 当前回合状态 */}
      <div className="bg-card rounded-xl border border-border p-4 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">当前回合</span>
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold',
              currentTurn === 'red'
                ? 'bg-piece-red/20 text-piece-red border border-piece-red/30'
                : 'bg-piece-black-bg border border-border text-foreground',
            )}
          >
            <span
              className={cn(
                'w-3 h-3 rounded-full',
                currentTurn === 'red' ? 'bg-piece-red' : 'bg-foreground',
              )}
            />
            {currentTurn === 'red' ? '红方' : '黑方'}
            {isAIThinking && currentTurn === 'black' && (
              <span className="text-xs text-muted-foreground ml-1 animate-pulse">思考中</span>
            )}
          </div>
        </div>
        {/* 难度选择 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">AI难度</span>
          <div className="relative flex-1">
            <select
              value={difficulty}
              onChange={(e) => onDifficultyChange(e.target.value as Difficulty)}
              className={cn(
                'w-full appearance-none bg-secondary border border-border rounded-lg px-3 py-1.5 pr-8',
                'text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring',
                difficultyColors[difficulty],
              )}
            >
              {(Object.keys(difficultyLabels) as Difficulty[]).map((d) => (
                <option key={d} value={d} className="text-foreground bg-secondary">
                  {t(difficultyLabels[d])}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 被吃棋子展示 */}
      <div className="bg-card rounded-xl border border-border p-3 shadow-md">
        <h3 className="text-xs text-muted-foreground mb-2 font-medium">被吃棋子</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-1 flex-wrap min-h-6">
            <span className="text-xs text-piece-red mr-1 w-8">红方：</span>
            {capturedByBlack.map((char, i) => (
              <span key={i} className="text-sm text-piece-red font-bold opacity-60">
                {char}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-1 flex-wrap min-h-6">
            <span className="text-xs text-muted-foreground mr-1 w-8">黑方：</span>
            {capturedByRed.map((char, i) => (
              <span key={i} className="text-sm text-foreground font-bold opacity-60">
                {char}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 棋谱记录 */}
      <div className="bg-card rounded-xl border border-border flex flex-col shadow-md flex-1 min-h-0">
        <div className="p-3 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">棋谱记录</h3>
          <span className="text-xs text-muted-foreground">
            {Math.ceil(moveHistory.length / 2)} 回
          </span>
        </div>
        <div ref={historyRef} className="flex-1 overflow-y-auto p-2 min-h-0">
          {moveHistory.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-4">暂无记录</p>
          ) : (
            <div className="space-y-0.5">
              {Array.from({ length: Math.ceil(moveHistory.length / 2) }, (_, i) => {
                const redMove = moveHistory[i * 2]
                const blackMove = moveHistory[i * 2 + 1]
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1 text-sm rounded px-1 py-0.5 hover:bg-secondary/50"
                  >
                    <span className="text-muted-foreground text-xs w-6 shrink-0">{i + 1}.</span>
                    <span
                      className={cn(
                        'flex-1 text-xs font-mono px-1 py-0.5 rounded',
                        i * 2 === moveHistory.length - 1
                          ? 'bg-primary/20 text-primary font-bold'
                          : 'text-piece-red',
                      )}
                    >
                      {redMove.notation}
                    </span>
                    {blackMove && (
                      <span
                        className={cn(
                          'flex-1 text-xs font-mono px-1 py-0.5 rounded',
                          i * 2 + 1 === moveHistory.length - 1
                            ? 'bg-secondary/80 text-foreground font-bold'
                            : 'text-muted-foreground',
                        )}
                      >
                        {blackMove.notation}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <button
          onClick={onUndo}
          disabled={moveHistory.length < 2 || isAIThinking}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-medium text-sm',
            'transition-all duration-150',
            moveHistory.length >= 2 && !isAIThinking
              ? 'bg-secondary border-border text-foreground hover:bg-accent/20 hover:border-accent active:scale-95'
              : 'bg-secondary/50 border-border/50 text-muted-foreground cursor-not-allowed',
          )}
          aria-label="悔棋"
        >
          <RotateCcw className="w-4 h-4" />
          <span>悔棋</span>
        </button>
        <button
          onClick={onNewGame}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border font-bold text-sm',
            'bg-primary border-primary/80 text-primary-foreground',
            'hover:opacity-90 active:scale-95 transition-all duration-150 shadow-md',
          )}
          aria-label="新游戏"
        >
          <Flag className="w-4 h-4" />
          <span>新游戏</span>
        </button>
      </div>
    </div>
  )
}
