'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Star,
  Heart,
  Moon,
  Sun,
  Cloud,
  Zap,
  Flame,
  Leaf,
  type LucideIcon,
  Trophy,
} from 'lucide-react'
import { useGameStorage } from '@/hook/use-game-record'

interface Card {
  id: number
  icon: LucideIcon
  isFlipped: boolean
  isMatched: boolean
}

const ICONS: LucideIcon[] = [Star, Heart, Moon, Sun, Cloud, Zap, Flame, Leaf]

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function createCards(): Card[] {
  const cardPairs = [...ICONS, ...ICONS]
  const shuffledIcons = shuffleArray(cardPairs)
  return shuffledIcons.map((icon, index) => ({
    id: index,
    icon,
    isFlipped: false,
    isMatched: false,
  }))
}

export default function MemoryMatchGame() {
  const { saveRecord, currentGameData } = useGameStorage('memory')
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [isWon, setIsWon] = useState(false)
  const startTimeRef = useRef<number | null>(null)
  const hasSavedRef = useRef(false)

  const initializeGame = useCallback(
    (isReset = false) => {
      if (isReset && startTimeRef.current !== null && !hasSavedRef.current && !isWon) {
        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000)
        saveRecord(0, duration, false)
        hasSavedRef.current = true
      }

      // 执行重置 UI 逻辑
      setCards(createCards())
      setFlippedCards([])
      setMoves(0)
      setIsChecking(false)
      setIsWon(false)
      startTimeRef.current = null
      hasSavedRef.current = false
    },
    [isWon, saveRecord],
  )

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  useEffect(() => {
    if (cards.length > 0 && cards.every((card) => card.isMatched) && !isWon) {
      setIsWon(true)

      if (!hasSavedRef.current) {
        const endTime = Date.now()
        const duration = startTimeRef.current
          ? Math.floor((endTime - startTimeRef.current) / 1000)
          : 0

        const calculatedScore = Math.max(100, 2000 - moves * 50)

        saveRecord(calculatedScore, duration, true)
        hasSavedRef.current = true
      }
    }
  }, [cards, moves, isWon, saveRecord])

  const handleCardClick = (cardId: number) => {
    if (isChecking || flippedCards.length === 2) return
    if (cards[cardId].isFlipped || cards[cardId].isMatched) return

    if (startTimeRef.current === null) {
      startTimeRef.current = Date.now()
    }

    const newCards = cards.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card))
    setCards(newCards)

    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    if (newFlippedCards.length === 2) {
      setMoves((prev) => prev + 1)
      setIsChecking(true)

      const [firstId, secondId] = newFlippedCards
      const firstCard = newCards[firstId]
      const secondCard = newCards[secondId]

      if (firstCard.icon === secondCard.icon) {
        setCards((prev) =>
          prev.map((card) =>
            card.id === firstId || card.id === secondId ? { ...card, isMatched: true } : card,
          ),
        )
        setFlippedCards([])
        setIsChecking(false)
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card,
            ),
          )
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Widget Container */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-white">记忆配对</h1>
                <div className="flex items-center gap-1.5 text-xs text-amber-400 mt-0.5">
                  <Trophy className="w-3 h-3" />
                  <span>最高分: {currentGameData?.bestRecord?.score || 0}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-slate-400 uppercase tracking-wider">步数</p>
                  <p className="text-2xl font-bold text-white tabular-nums">{moves}</p>
                </div>
                <button
                  onClick={() => initializeGame(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all active:scale-95"
                >
                  重新开始
                </button>
              </div>
            </div>
          </div>

          {/* Game Board */}
          <div className="p-6">
            <div className="grid grid-cols-4 gap-3">
              {cards.map((card) => {
                const Icon = card.icon
                const isRevealed = card.isFlipped || card.isMatched

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card.id)}
                    disabled={isRevealed || isChecking}
                    className={`
                      aspect-square rounded-xl transition-all duration-300 transform
                      ${
                        isRevealed
                          ? card.isMatched
                            ? 'bg-linear-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/50 scale-95'
                            : 'bg-linear-to-br from-violet-500/20 to-indigo-500/20 border-violet-500/50'
                          : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-600/50 hover:border-slate-500/50 hover:scale-105 cursor-pointer'
                      }
                      border-2 flex items-center justify-center
                      shadow-lg
                      disabled:cursor-default
                    `}
                    style={{
                      perspective: '1000px',
                    }}
                  >
                    <div
                      className={`
                        transition-all duration-300
                        ${isRevealed ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                      `}
                    >
                      {isRevealed && (
                        <Icon
                          className={`
                            w-8 h-8
                            ${card.isMatched ? 'text-emerald-400' : 'text-violet-400'}
                          `}
                          strokeWidth={1.5}
                        />
                      )}
                    </div>
                    {!isRevealed && (
                      <div className="w-8 h-8 rounded-lg bg-slate-600/50 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-500/50" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Footer Stats */}
          <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-slate-400">
                  已匹配 {cards.filter((c) => c.isMatched).length / 2} / 8 对
                </span>
              </div>
              <div className="text-xs text-slate-500">
                {Math.round((cards.filter((c) => c.isMatched).length / 16) * 100)}% 完成
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-violet-500 to-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: `${(cards.filter((c) => c.isMatched).length / 16) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Win Modal */}
        {isWon && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">恭喜你！</h2>
              <p className="text-slate-400 mb-6">
                你用 <span className="text-white font-semibold">{moves}</span> 步完成了游戏！
              </p>
              <button
                onClick={() => initializeGame(false)}
                className="px-6 py-3 bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 active:scale-95"
              >
                再玩一次
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
