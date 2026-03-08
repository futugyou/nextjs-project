'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

// Tetromino shapes and their rotations
const TETROMINOES: { [key: string]: { shape: number[][]; color: string } } = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#00f0f0', // Cyan
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#f0f000', // Yellow
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a000f0', // Purple
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#00f000', // Green
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#f00000', // Red
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#0000f0', // Blue
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f0a000', // Orange
  },
}

const BOARD_WIDTH = 10
const BOARD_HEIGHT = 20
const CELL_SIZE = 28

type Board = (string | null)[][]
type Piece = {
  shape: number[][]
  color: string
  x: number
  y: number
}

const createEmptyBoard = (): Board => {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null))
}

const getRandomTetromino = (): { shape: number[][]; color: string } => {
  const pieces = Object.keys(TETROMINOES)
  const randomPiece = pieces[Math.floor(Math.random() * pieces.length)]
  return {
    shape: TETROMINOES[randomPiece].shape.map((row) => [...row]),
    color: TETROMINOES[randomPiece].color,
  }
}

const rotate = (matrix: number[][]): number[][] => {
  const N = matrix.length
  const rotated = matrix.map((row, i) => row.map((_, j) => matrix[N - 1 - j][i]))
  return rotated
}

export default function TetrisGame() {
  const [board, setBoard] = useState<Board>(createEmptyBoard)
  const [currentPiece, setCurrentPiece] = useState<Piece | null>(null)
  const [nextPiece, setNextPiece] = useState<{ shape: number[][]; color: string } | null>(null)
  const [score, setScore] = useState(0)
  const [lines, setLines] = useState(0)
  const [level, setLevel] = useState(1)
  const [gameOver, setGameOver] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  const boardRef = useRef<Board>(board)
  const currentPieceRef = useRef<Piece | null>(currentPiece)
  const gameOverRef = useRef(gameOver)
  const isPausedRef = useRef(isPaused)
  const lastDropTimeRef = useRef(0)
  const animationFrameRef = useRef<number | null>(null)

  // Keep refs in sync
  useEffect(() => {
    boardRef.current = board
  }, [board])

  useEffect(() => {
    currentPieceRef.current = currentPiece
  }, [currentPiece])

  useEffect(() => {
    gameOverRef.current = gameOver
  }, [gameOver])

  useEffect(() => {
    isPausedRef.current = isPaused
  }, [isPaused])

  // Calculate drop speed based on level
  const getDropSpeed = useCallback(() => {
    return Math.max(100, 1000 - (level - 1) * 100)
  }, [level])

  // Check collision
  const checkCollision = useCallback((piece: Piece, boardToCheck: Board): boolean => {
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const newX = piece.x + x
          const newY = piece.y + y
          if (
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            newY >= BOARD_HEIGHT ||
            (newY >= 0 && boardToCheck[newY][newX])
          ) {
            return true
          }
        }
      }
    }
    return false
  }, [])

  // Merge piece into board
  const mergePiece = useCallback((piece: Piece, boardToMerge: Board): Board => {
    const newBoard = boardToMerge.map((row) => [...row])
    for (let y = 0; y < piece.shape.length; y++) {
      for (let x = 0; x < piece.shape[y].length; x++) {
        if (piece.shape[y][x]) {
          const boardY = piece.y + y
          const boardX = piece.x + x
          if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
            newBoard[boardY][boardX] = piece.color
          }
        }
      }
    }
    return newBoard
  }, [])

  // Clear completed lines
  const clearLines = useCallback(
    (boardToClear: Board): { newBoard: Board; linesCleared: number } => {
      let linesCleared = 0
      const newBoard = boardToClear.filter((row) => {
        const isFull = row.every((cell) => cell !== null)
        if (isFull) linesCleared++
        return !isFull
      })

      while (newBoard.length < BOARD_HEIGHT) {
        newBoard.unshift(Array(BOARD_WIDTH).fill(null))
      }

      return { newBoard, linesCleared }
    },
    [],
  )

  // Spawn new piece
  const spawnPiece = useCallback(() => {
    const pieceData = nextPiece || getRandomTetromino()
    const newPiece: Piece = {
      shape: pieceData.shape,
      color: pieceData.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(pieceData.shape[0].length / 2),
      y: 0,
    }

    setNextPiece(getRandomTetromino())

    if (checkCollision(newPiece, boardRef.current)) {
      setGameOver(true)
      return null
    }

    return newPiece
  }, [nextPiece, checkCollision])

  // Move piece
  const movePiece = useCallback(
    (dx: number, dy: number) => {
      if (!currentPieceRef.current || gameOverRef.current || isPausedRef.current) return false

      const newPiece: Piece = {
        ...currentPieceRef.current,
        x: currentPieceRef.current.x + dx,
        y: currentPieceRef.current.y + dy,
      }

      if (!checkCollision(newPiece, boardRef.current)) {
        setCurrentPiece(newPiece)
        return true
      }

      // If moving down and collision, lock piece
      if (dy > 0) {
        const mergedBoard = mergePiece(currentPieceRef.current, boardRef.current)
        const { newBoard, linesCleared } = clearLines(mergedBoard)

        setBoard(newBoard)

        if (linesCleared > 0) {
          const points = [0, 100, 300, 500, 800]
          setScore((prev) => prev + points[linesCleared] * level)
          setLines((prev) => {
            const newLines = prev + linesCleared
            const newLevel = Math.floor(newLines / 10) + 1
            if (newLevel > level) {
              setLevel(newLevel)
            }
            return newLines
          })
        }

        const newCurrentPiece = spawnPiece()
        setCurrentPiece(newCurrentPiece)
      }

      return false
    },
    [checkCollision, mergePiece, clearLines, spawnPiece, level],
  )

  // Rotate piece
  const rotatePiece = useCallback(() => {
    if (!currentPieceRef.current || gameOverRef.current || isPausedRef.current) return

    const rotated = rotate(currentPieceRef.current.shape)
    const newPiece: Piece = {
      ...currentPieceRef.current,
      shape: rotated,
    }

    // Wall kick - try to fit the rotated piece
    const kicks = [0, -1, 1, -2, 2]
    for (const kick of kicks) {
      const kickedPiece = { ...newPiece, x: newPiece.x + kick }
      if (!checkCollision(kickedPiece, boardRef.current)) {
        setCurrentPiece(kickedPiece)
        return
      }
    }
  }, [checkCollision])

  // Hard drop
  const hardDrop = useCallback(() => {
    if (!currentPieceRef.current || gameOverRef.current || isPausedRef.current) return

    let dropDistance = 0
    const piece = currentPieceRef.current

    while (!checkCollision({ ...piece, y: piece.y + dropDistance + 1 }, boardRef.current)) {
      dropDistance++
    }

    const droppedPiece: Piece = { ...piece, y: piece.y + dropDistance }
    const mergedBoard = mergePiece(droppedPiece, boardRef.current)
    const { newBoard, linesCleared } = clearLines(mergedBoard)

    setBoard(newBoard)
    setScore((prev) => prev + dropDistance * 2)

    if (linesCleared > 0) {
      const points = [0, 100, 300, 500, 800]
      setScore((prev) => prev + points[linesCleared] * level)
      setLines((prev) => {
        const newLines = prev + linesCleared
        const newLevel = Math.floor(newLines / 10) + 1
        if (newLevel > level) {
          setLevel(newLevel)
        }
        return newLines
      })
    }

    const newPiece = spawnPiece()
    setCurrentPiece(newPiece)
  }, [checkCollision, mergePiece, clearLines, spawnPiece, level])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameStarted) return

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        setIsPaused((prev) => !prev)
        return
      }

      if (gameOver || isPaused) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          movePiece(-1, 0)
          break
        case 'ArrowRight':
          e.preventDefault()
          movePiece(1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          movePiece(0, 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          rotatePiece()
          break
        case ' ':
          e.preventDefault()
          hardDrop()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [movePiece, rotatePiece, hardDrop, gameOver, isPaused, gameStarted])

  // Game loop using requestAnimationFrame
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const gameLoop = (timestamp: number) => {
      if (gameOverRef.current || isPausedRef.current) return

      const dropSpeed = getDropSpeed()

      if (timestamp - lastDropTimeRef.current >= dropSpeed) {
        movePiece(0, 1)
        lastDropTimeRef.current = timestamp
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    animationFrameRef.current = requestAnimationFrame(gameLoop)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameStarted, gameOver, isPaused, getDropSpeed, movePiece])

  // Start game
  const startGame = useCallback(() => {
    const newBoard = createEmptyBoard()
    setBoard(newBoard)
    boardRef.current = newBoard
    setScore(0)
    setLines(0)
    setLevel(1)
    setGameOver(false)
    setIsPaused(false)
    setGameStarted(true)

    const firstNext = getRandomTetromino()
    setNextPiece(firstNext)

    const firstPiece = getRandomTetromino()
    const initialPiece: Piece = {
      shape: firstPiece.shape,
      color: firstPiece.color,
      x: Math.floor(BOARD_WIDTH / 2) - Math.floor(firstPiece.shape[0].length / 2),
      y: 0,
    }
    setCurrentPiece(initialPiece)
    lastDropTimeRef.current = 0
  }, [])

  // Render board with current piece
  const renderBoard = () => {
    const displayBoard = board.map((row) => [...row])

    if (currentPiece) {
      for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
          if (currentPiece.shape[y][x]) {
            const boardY = currentPiece.y + y
            const boardX = currentPiece.x + x
            if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
              displayBoard[boardY][boardX] = currentPiece.color
            }
          }
        }
      }
    }

    return displayBoard
  }

  // Render next piece preview
  const renderNextPiece = () => {
    if (!nextPiece) return null

    const previewSize = 4
    const preview: (string | null)[][] = Array.from({ length: previewSize }, () =>
      Array(previewSize).fill(null),
    )

    const offsetY = Math.floor((previewSize - nextPiece.shape.length) / 2)
    const offsetX = Math.floor((previewSize - nextPiece.shape[0].length) / 2)

    for (let y = 0; y < nextPiece.shape.length; y++) {
      for (let x = 0; x < nextPiece.shape[y].length; x++) {
        if (nextPiece.shape[y][x]) {
          preview[y + offsetY][x + offsetX] = nextPiece.color
        }
      }
    }

    return preview
  }

  const displayBoard = renderBoard()
  const nextPiecePreview = renderNextPiece()

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {/* Main Game Board */}
        <div className="relative">
          <div
            className="grid gap-px bg-slate-800 p-1 rounded-lg shadow-2xl shadow-purple-500/20"
            style={{
              gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${CELL_SIZE}px)`,
            }}
          >
            {displayBoard.map((row, y) =>
              row.map((cell, x) => (
                <div
                  key={`${y}-${x}`}
                  className="rounded-sm transition-colors duration-75"
                  style={{
                    width: CELL_SIZE,
                    height: CELL_SIZE,
                    backgroundColor: cell || '#1e293b',
                    boxShadow: cell
                      ? `inset 0 0 0 2px rgba(255,255,255,0.2), inset 0 0 8px rgba(0,0,0,0.3)`
                      : 'inset 0 0 0 1px rgba(255,255,255,0.05)',
                  }}
                />
              )),
            )}
          </div>

          {/* Overlay for game states */}
          {(!gameStarted || gameOver || isPaused) && (
            <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <div className="text-center">
                {gameOver ? (
                  <>
                    <h2 className="text-3xl font-bold text-red-400 mb-4">游戏结束</h2>
                    <p className="text-xl text-white mb-4">最终得分: {score}</p>
                    <button
                      onClick={startGame}
                      className="px-6 py-3 bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105"
                    >
                      重新开始
                    </button>
                  </>
                ) : isPaused ? (
                  <>
                    <h2 className="text-3xl font-bold text-yellow-400 mb-4">暂停</h2>
                    <p className="text-white mb-4">按 P 或 ESC 继续</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-purple-400 mb-6">
                      俄罗斯方块
                    </h2>
                    <button
                      onClick={startGame}
                      className="px-8 py-4 bg-linear-to-r from-cyan-500 to-purple-500 text-white font-bold text-xl rounded-lg hover:from-cyan-600 hover:to-purple-600 transition-all transform hover:scale-105 shadow-lg shadow-purple-500/30"
                    >
                      开始游戏
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="flex flex-col gap-4">
          {/* Next Piece Preview */}
          <div className="bg-slate-800/80 p-4 rounded-lg shadow-xl">
            <h3 className="text-white font-bold mb-3 text-center">下一个</h3>
            <div
              className="grid gap-px bg-slate-900 p-2 rounded"
              style={{
                gridTemplateColumns: `repeat(4, ${CELL_SIZE * 0.7}px)`,
              }}
            >
              {nextPiecePreview?.map((row, y) =>
                row.map((cell, x) => (
                  <div
                    key={`next-${y}-${x}`}
                    className="rounded-sm"
                    style={{
                      width: CELL_SIZE * 0.7,
                      height: CELL_SIZE * 0.7,
                      backgroundColor: cell || '#0f172a',
                      boxShadow: cell ? `inset 0 0 0 2px rgba(255,255,255,0.2)` : 'none',
                    }}
                  />
                )),
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-slate-800/80 p-4 rounded-lg shadow-xl">
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm">得分</p>
                <p className="text-2xl font-bold text-white">{score.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">等级</p>
                <p className="text-2xl font-bold text-cyan-400">{level}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">消除行数</p>
                <p className="text-2xl font-bold text-purple-400">{lines}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-800/80 p-4 rounded-lg shadow-xl">
            <h3 className="text-white font-bold mb-3">操作说明</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>← →</span>
                <span>左右移动</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>↓</span>
                <span>加速下落</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>↑</span>
                <span>旋转</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>空格</span>
                <span>直接落下</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>P / ESC</span>
                <span>暂停</span>
              </div>
            </div>
          </div>

          {/* Pause Button */}
          {gameStarted && !gameOver && (
            <button
              onClick={() => setIsPaused((prev) => !prev)}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              {isPaused ? '继续游戏' : '暂停游戏'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
