import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'mini_games_records'
const MAX_HISTORY_PER_GAME = 10

export interface GameRecord {
  id: string
  gameSlug: string
  score: number
  duration: number
  completed: boolean
  timestamp: number
}

export interface GameStats {
  bestRecord?: GameRecord
  history: GameRecord[]
}

export const useGameStorage = (gameSlug?: string) => {
  const [allStats, setAllStats] = useState<Record<string, any>>(() => {
    if (typeof window === 'undefined') return {}
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : {}
  })

  const saveRecord = useCallback(
    (score: number, duration: number, completed: boolean) => {
      if (!gameSlug) return

      const newRecord = {
        id: Date.now().toString(),
        gameSlug,
        score,
        duration,
        completed,
        timestamp: Date.now(),
      }

      setAllStats((prevStats) => {
        const currentGameStats = prevStats[gameSlug] || { history: [] }

        const newHistory = [newRecord, ...currentGameStats.history].slice(0, 10)

        let newBest = currentGameStats.bestRecord
        if (!newBest || score > newBest.score) {
          newBest = newRecord
        }

        const updated = {
          ...prevStats,
          [gameSlug]: {
            bestRecord: newBest,
            history: newHistory,
          },
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        return updated
      })
    },
    [gameSlug],
  )

  const currentGameData = gameSlug ? allStats[gameSlug] : null

  return {
    saveRecord,
    currentGameData,
    allStats,
  }
}
