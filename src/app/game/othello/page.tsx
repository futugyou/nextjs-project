'use client'

import { useState, useCallback, useEffect } from 'react'
import { RotateCcw, Trophy, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CellState = 'empty' | 'black' | 'white'
type Player = 'black' | 'white'

const BOARD_SIZE = 8
const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
]

function createInitialBoard(): CellState[][] {
  const board: CellState[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill('empty'))

  // Standard starting position
  board[3][3] = 'white'
  board[3][4] = 'black'
  board[4][3] = 'black'
  board[4][4] = 'white'

  return board
}

export default function OthelloGame() {
  const [board, setBoard] = useState<CellState[][]>(createInitialBoard)
  const [currentPlayer, setCurrentPlayer] = useState<Player>('black')
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<Player | 'tie' | null>(null)
  const [flippingCells, setFlippingCells] = useState<Set<string>>(new Set())
  const [lastMove, setLastMove] = useState<{ row: number; col: number } | null>(null)
  const [passMessage, setPassMessage] = useState<string | null>(null)

  // Count discs
  const countDiscs = useCallback((board: CellState[][]) => {
    let black = 0
    let white = 0
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === 'black') black++
        else if (board[row][col] === 'white') white++
      }
    }
    return { black, white }
  }, [])

  const scores = countDiscs(board)

  // Check if a position is valid
  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE
  }

  // Get opponent
  const getOpponent = (player: Player): Player => {
    return player === 'black' ? 'white' : 'black'
  }

  // Get cells to flip for a move
  const getCellsToFlip = useCallback(
    (board: CellState[][], row: number, col: number, player: Player): [number, number][] => {
      if (board[row][col] !== 'empty') return []

      const opponent = getOpponent(player)
      const cellsToFlip: [number, number][] = []

      for (const [dx, dy] of DIRECTIONS) {
        const directionCells: [number, number][] = []
        let x = row + dx
        let y = col + dy

        // Move in direction while finding opponent discs
        while (isValidPosition(x, y) && board[x][y] === opponent) {
          directionCells.push([x, y])
          x += dx
          y += dy
        }

        // If we found a player disc at the end, these cells can be flipped
        if (directionCells.length > 0 && isValidPosition(x, y) && board[x][y] === player) {
          cellsToFlip.push(...directionCells)
        }
      }

      return cellsToFlip
    },
    [],
  )

  // Check if a move is valid
  const isValidMove = useCallback(
    (board: CellState[][], row: number, col: number, player: Player): boolean => {
      return getCellsToFlip(board, row, col, player).length > 0
    },
    [getCellsToFlip],
  )

  // Get all valid moves for a player
  const getValidMoves = useCallback(
    (board: CellState[][], player: Player): [number, number][] => {
      const moves: [number, number][] = []
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (isValidMove(board, row, col, player)) {
            moves.push([row, col])
          }
        }
      }
      return moves
    },
    [isValidMove],
  )

  // Valid moves for current player
  const validMoves = getValidMoves(board, currentPlayer)

  // Make a move
  const makeMove = useCallback(
    (row: number, col: number) => {
      if (gameOver) return
      if (!isValidMove(board, row, col, currentPlayer)) return

      const cellsToFlip = getCellsToFlip(board, row, col, currentPlayer)

      // Start flip animation
      const flipping = new Set(cellsToFlip.map(([r, c]) => `${r}-${c}`))
      setFlippingCells(flipping)
      setLastMove({ row, col })

      // Update board after animation delay
      setTimeout(() => {
        const newBoard = board.map((row) => [...row])
        newBoard[row][col] = currentPlayer

        for (const [r, c] of cellsToFlip) {
          newBoard[r][c] = currentPlayer
        }

        setBoard(newBoard)
        setFlippingCells(new Set())

        // Check next player's moves
        const opponent = getOpponent(currentPlayer)
        const opponentMoves = getValidMoves(newBoard, opponent)
        const currentPlayerMoves = getValidMoves(newBoard, currentPlayer)

        if (opponentMoves.length > 0) {
          setCurrentPlayer(opponent)
          setPassMessage(null)
        } else if (currentPlayerMoves.length > 0) {
          // Opponent must pass
          setPassMessage(`${opponent === 'black' ? '黑棋' : '白棋'}没有可走的位置，跳过回合！`)
          setTimeout(() => setPassMessage(null), 2000)
        } else {
          // Game over - no one can move
          const finalScores = countDiscs(newBoard)
          setGameOver(true)
          if (finalScores.black > finalScores.white) {
            setWinner('black')
          } else if (finalScores.white > finalScores.black) {
            setWinner('white')
          } else {
            setWinner('tie')
          }
        }
      }, 300)
    },
    [board, currentPlayer, gameOver, getCellsToFlip, getValidMoves, isValidMove, countDiscs],
  )

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(createInitialBoard())
    setCurrentPlayer('black')
    setGameOver(false)
    setWinner(null)
    setFlippingCells(new Set())
    setLastMove(null)
    setPassMessage(null)
  }, [])

  // Check if cell is a valid move
  const isCellValidMove = (row: number, col: number): boolean => {
    return validMoves.some(([r, c]) => r === row && c === col)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">黑白棋</h1>
        <p className="text-slate-400 text-sm">Othello / Reversi</p>
      </div>

      {/* Scoreboard */}
      <div className="flex items-center gap-8 mb-6">
        {/* Black Score */}
        <div
          className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
            currentPlayer === 'black' && !gameOver
              ? 'bg-slate-700 ring-2 ring-slate-500'
              : 'bg-slate-800/50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-600 shadow-lg" />
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{scores.black}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">黑棋</div>
          </div>
        </div>

        {/* VS */}
        <div className="text-slate-500 font-medium">VS</div>

        {/* White Score */}
        <div
          className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${
            currentPlayer === 'white' && !gameOver
              ? 'bg-slate-700 ring-2 ring-slate-500'
              : 'bg-slate-800/50'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 shadow-lg" />
          <div className="text-right">
            <div className="text-2xl font-bold text-white">{scores.white}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider">白棋</div>
          </div>
        </div>
      </div>

      {/* Turn Indicator */}
      {!gameOver && (
        <div className="flex items-center gap-3 mb-6 px-6 py-3 bg-slate-800/80 rounded-full">
          <div
            className={`relative w-6 h-6 rounded-full ${
              currentPlayer === 'black'
                ? 'bg-slate-900 border border-slate-600'
                : 'bg-white border border-slate-300'
            }`}
          >
            <div
              className={`absolute inset-0 rounded-full animate-ping ${
                currentPlayer === 'black' ? 'bg-slate-700' : 'bg-white/50'
              }`}
              style={{ animationDuration: '1.5s' }}
            />
          </div>
          <span className="text-white font-medium">
            {currentPlayer === 'black' ? '黑棋' : '白棋'}回合
          </span>
        </div>
      )}

      {/* Pass Message */}
      {passMessage && (
        <div className="mb-4 px-6 py-2 bg-amber-500/20 border border-amber-500/30 rounded-lg">
          <span className="text-amber-400 font-medium">{passMessage}</span>
        </div>
      )}

      {/* Game Board */}
      <div className="relative">
        <div className="bg-emerald-800 p-2 md:p-3 rounded-xl shadow-2xl">
          <div
            className="grid gap-[2px] bg-white/20"
            style={{
              gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            }}
          >
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isValid = isCellValidMove(rowIndex, colIndex)
                const isFlipping = flippingCells.has(`${rowIndex}-${colIndex}`)
                const isLast = lastMove?.row === rowIndex && lastMove?.col === colIndex

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => makeMove(rowIndex, colIndex)}
                    disabled={!isValid || gameOver}
                    className={`
                      relative w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14
                      bg-emerald-700 
                      flex items-center justify-center
                      transition-all duration-200
                      ${isValid && !gameOver ? 'hover:bg-emerald-600 cursor-pointer' : 'cursor-default'}
                      ${isLast ? 'ring-2 ring-yellow-400/50 ring-inset' : ''}
                    `}
                  >
                    {/* Placed Disc */}
                    {cell !== 'empty' && (
                      <div
                        className={`
                          w-[75%] h-[75%] rounded-full
                          shadow-lg
                          transition-all duration-300
                          ${isFlipping ? 'animate-flip' : ''}
                          ${
                            cell === 'black'
                              ? 'bg-gradient-to-br from-slate-700 via-slate-900 to-black border border-slate-600'
                              : 'bg-gradient-to-br from-white via-slate-100 to-slate-200 border border-slate-300'
                          }
                        `}
                        style={{
                          boxShadow:
                            cell === 'black'
                              ? 'inset 2px 2px 4px rgba(255,255,255,0.1), 2px 2px 8px rgba(0,0,0,0.5)'
                              : 'inset 2px 2px 4px rgba(255,255,255,0.8), 2px 2px 8px rgba(0,0,0,0.3)',
                        }}
                      />
                    )}

                    {/* Valid Move Indicator (Ghost Circle) */}
                    {isValid && cell === 'empty' && !gameOver && (
                      <div
                        className={`
                        absolute w-[60%] h-[60%] rounded-full
                        border-2 border-dashed
                        ${
                          currentPlayer === 'black'
                            ? 'border-slate-900/40 bg-slate-900/10'
                            : 'border-white/40 bg-white/10'
                        }
                        animate-pulse
                      `}
                      />
                    )}
                  </button>
                )
              }),
            )}
          </div>
        </div>

        {/* Board shadow/glow effect */}
        <div className="absolute -inset-4 bg-emerald-500/10 rounded-2xl blur-xl -z-10" />
      </div>

      {/* Reset Button */}
      <Button
        onClick={resetGame}
        variant="outline"
        className="mt-8 gap-2 bg-slate-800 border-slate-600 text-white hover:bg-slate-700 hover:text-white"
      >
        <RotateCcw className="w-4 h-4" />
        重新开始
      </Button>

      {/* Game Over Overlay */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl border border-slate-700 animate-in zoom-in-95 duration-300">
            <div className="mb-4">
              <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">游戏结束</h2>

            {winner === 'tie' ? (
              <p className="text-xl text-slate-300 mb-6">平局！</p>
            ) : (
              <div className="mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div
                    className={`w-8 h-8 rounded-full ${
                      winner === 'black'
                        ? 'bg-slate-900 border-2 border-slate-600'
                        : 'bg-white border-2 border-slate-300'
                    }`}
                  />
                  <span className="text-xl text-white font-semibold">
                    {winner === 'black' ? '黑棋' : '白棋'}获胜！
                  </span>
                </div>
              </div>
            )}

            {/* Final Score */}
            <div className="flex items-center justify-center gap-6 mb-8 p-4 bg-slate-700/50 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-600" />
                <span className="text-2xl font-bold text-white">{scores.black}</span>
              </div>
              <span className="text-slate-500">-</span>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white border border-slate-300" />
                <span className="text-2xl font-bold text-white">{scores.white}</span>
              </div>
            </div>

            <Button
              onClick={resetGame}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              size="lg"
            >
              <RotateCcw className="w-4 h-4" />
              再来一局
            </Button>
          </div>
        </div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes flip {
          0% {
            transform: rotateY(0deg) scale(1);
          }
          50% {
            transform: rotateY(90deg) scale(1.1);
          }
          100% {
            transform: rotateY(180deg) scale(1);
          }
        }
        .animate-flip {
          animation: flip 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}
