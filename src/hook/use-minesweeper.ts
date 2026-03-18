import { useState, useCallback, useEffect, useRef } from 'react'

export type Difficulty = 'beginner' | 'intermediate' | 'expert'
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost'

export interface Cell {
  isMine: boolean
  isRevealed: boolean
  isFlagged: boolean
  neighborCount: number
  row: number
  col: number
  isExploded?: boolean
}

export interface DifficultyConfig {
  rows: number
  cols: number
  mines: number
  label: string
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10, label: 'beginner' },
  intermediate: { rows: 16, cols: 16, mines: 40, label: 'intermediate' },
  expert: { rows: 16, cols: 30, mines: 99, label: 'expert' },
}

type Board = Cell[][]

function createEmptyBoard(rows: number, cols: number): Board {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      neighborCount: 0,
      row: r,
      col: c,
    })),
  )
}

function placeMines(
  board: Board,
  rows: number,
  cols: number,
  mines: number,
  safeRow: number,
  safeCol: number,
): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  let placed = 0
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)
    // Safe zone: avoid the first clicked cell and its immediate neighbors
    if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue
    if (!newBoard[r][c].isMine) {
      newBoard[r][c].isMine = true
      placed++
    }
  }
  return newBoard
}

function calculateNeighbors(board: Board, rows: number, cols: number): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (newBoard[nr][nc].isMine) count++
          }
        }
      }
      newBoard[r][c].neighborCount = count
    }
  }
  return newBoard
}

function floodFill(
  board: Board,
  rows: number,
  cols: number,
  startRow: number,
  startCol: number,
): Board {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })))
  const queue: [number, number][] = [[startRow, startCol]]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const [r, c] = queue.shift()!
    const key = `${r},${c}`
    if (visited.has(key)) continue
    visited.add(key)

    const cell = newBoard[r][c]
    if (cell.isMine || cell.isFlagged || cell.isRevealed) continue

    cell.isRevealed = true

    if (cell.neighborCount === 0) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          const nr = r + dr
          const nc = c + dc
          if (
            nr >= 0 &&
            nr < rows &&
            nc >= 0 &&
            nc < cols &&
            !newBoard[nr][nc].isRevealed &&
            !newBoard[nr][nc].isFlagged &&
            !newBoard[nr][nc].isMine
          ) {
            queue.push([nr, nc])
          }
        }
      }
    }
  }
  return newBoard
}

function checkWin(board: Board): boolean {
  for (const row of board) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) return false
    }
  }
  return true
}

export function useMinesweeper(difficulty: Difficulty) {
  const { rows, cols, mines } = DIFFICULTY_CONFIG[difficulty]
  const [board, setBoard] = useState<Board>(() => createEmptyBoard(rows, cols))
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle')
  const [flagCount, setFlagCount] = useState(0)
  const [time, setTime] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const firstClickRef = useRef(true)

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    timerRef.current = setInterval(() => {
      setTime((t) => (t >= 999 ? 999 : t + 1))
    }, 1000)
  }, [stopTimer])

  // Reset when difficulty changes
  const resetGame = useCallback(() => {
    stopTimer()
    setBoard(createEmptyBoard(rows, cols))
    setGameStatus('idle')
    setFlagCount(0)
    setTime(0)
    firstClickRef.current = true
  }, [rows, cols, stopTimer])

  useEffect(() => {
    resetGame()
  }, [difficulty]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => stopTimer()
  }, [stopTimer])

  const revealCell = useCallback(
    (row: number, col: number) => {
      if (gameStatus === 'won' || gameStatus === 'lost') return

      setBoard((prevBoard) => {
        const cell = prevBoard[row][col]
        if (cell.isRevealed || cell.isFlagged) return prevBoard

        let workingBoard = prevBoard.map((r) => r.map((c) => ({ ...c })))

        if (gameStatus === 'idle') {
          workingBoard = placeMines(workingBoard, rows, cols, mines, row, col)
          workingBoard = calculateNeighbors(workingBoard, rows, cols)
        }

        // Hit a mine
        if (workingBoard[row][col].isMine) {
          stopTimer()
          // Reveal all mines
          const lostBoard = workingBoard.map((r) =>
            r.map((c) => ({
              ...c,
              isRevealed: c.isMine ? true : c.isRevealed,
              isExploded: c.row === row && c.col === col ? true : c.isExploded,
            })),
          )
          setGameStatus('lost')
          return lostBoard
        }

        // Flood fill for empty cells or reveal single numbered cell
        const filledBoard = floodFill(workingBoard, rows, cols, row, col)

        if (checkWin(filledBoard)) {
          stopTimer()
          setGameStatus('won')
          // Auto-flag all remaining mines
          return filledBoard.map((r) =>
            r.map((c) => ({ ...c, isFlagged: c.isMine ? true : c.isFlagged })),
          )
        }

        return filledBoard
      })

      if (gameStatus === 'idle') {
        setGameStatus('playing')
        startTimer()
      }
    },
    [gameStatus, rows, cols, mines, startTimer, stopTimer],
  )

  const toggleFlag = useCallback(
    (row: number, col: number) => {
      if (gameStatus === 'won' || gameStatus === 'lost') return
      if (gameStatus === 'idle') return // Can't flag before first click

      setBoard((prevBoard) => {
        const cell = prevBoard[row][col]
        if (cell.isRevealed) return prevBoard

        const newBoard = prevBoard.map((r) => r.map((c) => ({ ...c })))
        const target = newBoard[row][col]

        if (target.isFlagged) {
          target.isFlagged = false
          setFlagCount((f) => f - 1)
        } else {
          target.isFlagged = true
          setFlagCount((f) => f + 1)
        }
        return newBoard
      })
    },
    [gameStatus],
  )

  const minesRemaining = mines - flagCount

  return {
    board,
    gameStatus,
    minesRemaining,
    time,
    revealCell,
    toggleFlag,
    resetGame,
  }
}
