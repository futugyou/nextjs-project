import { useState, useEffect } from 'react'

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
  const [allStats, setAllStats] = useState<Record<string, GameStats>>({})

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      setAllStats(JSON.parse(saved))
    }
  }, [])

  const saveRecord = (score: number, duration: number, completed: boolean) => {
    if (!gameSlug) return

    const newRecord: GameRecord = {
      id: Date.now().toString(),
      gameSlug,
      score,
      duration,
      completed,
      timestamp: Date.now(),
    }

    const updatedStats = { ...allStats }
    const currentGameStats = updatedStats[gameSlug] || { history: [] }

    const newHistory = [newRecord, ...currentGameStats.history].slice(0, MAX_HISTORY_PER_GAME)

    let newBest = currentGameStats.bestRecord
    if (!newBest || score > newBest.score) {
      newBest = newRecord
    }

    updatedStats[gameSlug] = {
      bestRecord: newBest,
      history: newHistory,
    }

    setAllStats(updatedStats)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats))
  }

  const currentGameData = gameSlug ? allStats[gameSlug] : null

  return {
    saveRecord,
    currentGameData,
    allStats,
  }
}
