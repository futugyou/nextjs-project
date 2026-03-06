'use client'

import { useState, useCallback, useEffect } from 'react'

export type Direction = 'up' | 'down' | 'left' | 'right'

export interface Tile {
  id: number
  value: number
  row: number
  col: number
  isNew?: boolean
  isMerged?: boolean
}

export interface GameState {
  tiles: Tile[]
  score: number
  bestScore: number
  gameOver: boolean
  won: boolean
}

let tileIdCounter = 0

function createEmptyGrid(): (Tile | null)[][] {
  return Array(4)
    .fill(null)
    .map(() => Array(4).fill(null))
}

function getRandomEmptyCell(grid: (Tile | null)[][]): { row: number; col: number } | null {
  const emptyCells: { row: number; col: number }[] = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!grid[row][col]) {
        emptyCells.push({ row, col })
      }
    }
  }
  if (emptyCells.length === 0) return null
  return emptyCells[Math.floor(Math.random() * emptyCells.length)]
}

function addRandomTile(grid: (Tile | null)[][]): Tile | null {
  const cell = getRandomEmptyCell(grid)
  if (!cell) return null
  const value = Math.random() < 0.9 ? 2 : 4
  const tile: Tile = {
    id: ++tileIdCounter,
    value,
    row: cell.row,
    col: cell.col,
    isNew: true,
  }
  grid[cell.row][cell.col] = tile
  return tile
}

function tilesToGrid(tiles: Tile[]): (Tile | null)[][] {
  const grid = createEmptyGrid()
  tiles.forEach((tile) => {
    grid[tile.row][tile.col] = tile
  })
  return grid
}

function gridToTiles(grid: (Tile | null)[][]): Tile[] {
  const tiles: Tile[] = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (grid[row][col]) {
        tiles.push(grid[row][col]!)
      }
    }
  }
  return tiles
}

function canMove(grid: (Tile | null)[][]): boolean {
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (!grid[row][col]) return true
      const value = grid[row][col]!.value
      if (row < 3 && grid[row + 1][col]?.value === value) return true
      if (col < 3 && grid[row][col + 1]?.value === value) return true
    }
  }
  return false
}

function slide(
  grid: (Tile | null)[][],
  direction: Direction,
): { newGrid: (Tile | null)[][]; score: number; moved: boolean } {
  let score = 0
  let moved = false
  const newGrid = createEmptyGrid()

  const isVertical = direction === 'up' || direction === 'down'
  const isReverse = direction === 'down' || direction === 'right'

  for (let i = 0; i < 4; i++) {
    const line: (Tile | null)[] = []
    for (let j = 0; j < 4; j++) {
      const idx = isReverse ? 3 - j : j
      const cell = isVertical ? grid[idx][i] : grid[i][idx]
      if (cell) line.push({ ...cell, isNew: false, isMerged: false })
    }

    const merged: Tile[] = []
    let skip = false
    for (let j = 0; j < line.length; j++) {
      if (skip) {
        skip = false
        continue
      }
      const current = line[j]!
      if (j < line.length - 1 && line[j + 1]?.value === current.value) {
        merged.push({
          ...current,
          id: ++tileIdCounter,
          value: current.value * 2,
          isMerged: true,
        })
        score += current.value * 2
        skip = true
      } else {
        merged.push(current)
      }
    }

    for (let j = 0; j < 4; j++) {
      const idx = isReverse ? 3 - j : j
      const tile = merged[j] || null
      if (tile) {
        const newRow = isVertical ? idx : i
        const newCol = isVertical ? i : idx
        const oldRow = tile.row
        const oldCol = tile.col
        if (newRow !== oldRow || newCol !== oldCol) moved = true
        tile.row = newRow
        tile.col = newCol
      }
      if (isVertical) {
        newGrid[idx][i] = tile
      } else {
        newGrid[i][idx] = tile
      }
    }
  }

  return { newGrid, score, moved }
}

function checkWin(tiles: Tile[]): boolean {
  return tiles.some((tile) => tile.value === 2048)
}

export function useGame2048() {
  const [gameState, setGameState] = useState<GameState>(() => {
    const grid = createEmptyGrid()
    addRandomTile(grid)
    addRandomTile(grid)

    let bestScore = 0
    if (typeof window !== 'undefined') {
      bestScore = parseInt(localStorage.getItem('2048-best-score') || '0', 10)
    }

    return {
      tiles: gridToTiles(grid),
      score: 0,
      bestScore,
      gameOver: false,
      won: false,
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBest = parseInt(localStorage.getItem('2048-best-score') || '0', 10)
      if (savedBest !== gameState.bestScore) {
        setGameState((prev) => ({ ...prev, bestScore: savedBest }))
      }
    }
  }, [])

  const move = useCallback((direction: Direction) => {
    setGameState((prev) => {
      if (prev.gameOver) return prev

      const grid = tilesToGrid(prev.tiles)
      const { newGrid, score, moved } = slide(grid, direction)

      if (!moved) return prev

      addRandomTile(newGrid)
      const newTiles = gridToTiles(newGrid)
      const newScore = prev.score + score
      const isWon = checkWin(newTiles)
      const isGameOver = !canMove(newGrid)

      const newBestScore = Math.max(newScore, prev.bestScore)
      if (typeof window !== 'undefined' && newBestScore > prev.bestScore) {
        localStorage.setItem('2048-best-score', newBestScore.toString())
      }

      return {
        tiles: newTiles,
        score: newScore,
        bestScore: newBestScore,
        gameOver: isGameOver,
        won: isWon || prev.won,
      }
    })
  }, [])

  const resetGame = useCallback(() => {
    const grid = createEmptyGrid()
    addRandomTile(grid)
    addRandomTile(grid)

    let bestScore = 0
    if (typeof window !== 'undefined') {
      bestScore = parseInt(localStorage.getItem('2048-best-score') || '0', 10)
    }

    setGameState({
      tiles: gridToTiles(grid),
      score: 0,
      bestScore,
      gameOver: false,
      won: false,
    })
  }, [])

  return {
    ...gameState,
    move,
    resetGame,
  }
}
