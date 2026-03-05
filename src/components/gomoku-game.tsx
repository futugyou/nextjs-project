'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import GomokuBoard from '@/components/gomoku-board'
import GameControls from '@/components/game-controls'
import GameOverOverlay from '@/components/game-over-overlay'
import {
  createEmptyBoard,
  checkWinner,
  getWinningLine,
  isBoardFull,
  getAIMove,
  type Board,
  type CellValue,
  type Difficulty,
} from '@/lib/gomoku-ai'

const BOARD_SIZE = 15

export default function GomokuGame() {
  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<CellValue>(1) // Black goes first
  const [playerColor, setPlayerColor] = useState<CellValue>(1) // Player is black
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [cursorPos, setCursorPos] = useState<[number, number]>([7, 7])
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<CellValue | 'draw' | null>(null)
  const [winningLine, setWinningLine] = useState<[number, number][] | null>(null)
  const [lastMove, setLastMove] = useState<[number, number] | null>(null)
  const [isThinking, setIsThinking] = useState(false)
  const [scores, setScores] = useState({ player: 0, ai: 0, draw: 0 })
  const [newPieces, setNewPieces] = useState<Set<string>>(new Set())
  const gameContainerRef = useRef<HTMLDivElement>(null)

  const aiColor: CellValue = playerColor === 1 ? 2 : 1

  const placePiece = useCallback(
    (row: number, col: number) => {
      if (board[row][col] !== 0 || gameOver || isThinking) return false
      if (currentPlayer !== playerColor) return false

      const newBoard = board.map((r) => [...r]) as Board
      newBoard[row][col] = currentPlayer

      setBoard(newBoard)
      setLastMove([row, col])
      setNewPieces(new Set([`${row},${col}`]))

      const w = checkWinner(newBoard, row, col)
      if (w !== 0) {
        const line = getWinningLine(newBoard, row, col)
        setWinningLine(line)
        setWinner(w === playerColor ? playerColor : aiColor)
        setGameOver(true)
        setScores((prev) => ({
          ...prev,
          player: w === playerColor ? prev.player + 1 : prev.player,
          ai: w === aiColor ? prev.ai + 1 : prev.ai,
        }))
        return true
      }

      if (isBoardFull(newBoard)) {
        setWinner('draw')
        setGameOver(true)
        setScores((prev) => ({ ...prev, draw: prev.draw + 1 }))
        return true
      }

      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
      return true
    },
    [board, currentPlayer, gameOver, isThinking, playerColor, aiColor],
  )

  // AI move
  useEffect(() => {
    if (currentPlayer !== aiColor || gameOver) return

    setIsThinking(true)
    const timeout = setTimeout(
      () => {
        const [aiRow, aiCol] = getAIMove(board, aiColor, difficulty)
        const newBoard = board.map((r) => [...r]) as Board
        newBoard[aiRow][aiCol] = aiColor

        setBoard(newBoard)
        setLastMove([aiRow, aiCol])
        setNewPieces(new Set([`${aiRow},${aiCol}`]))
        setIsThinking(false)

        const w = checkWinner(newBoard, aiRow, aiCol)
        if (w !== 0) {
          const line = getWinningLine(newBoard, aiRow, aiCol)
          setWinningLine(line)
          setWinner(w === playerColor ? playerColor : aiColor)
          setGameOver(true)
          setScores((prev) => ({
            ...prev,
            player: w === playerColor ? prev.player + 1 : prev.player,
            ai: w === aiColor ? prev.ai + 1 : prev.ai,
          }))
          return
        }

        if (isBoardFull(newBoard)) {
          setWinner('draw')
          setGameOver(true)
          setScores((prev) => ({ ...prev, draw: prev.draw + 1 }))
          return
        }

        setCurrentPlayer(aiColor === 1 ? 2 : 1)
      },
      400 + Math.random() * 300,
    )

    return () => clearTimeout(timeout)
  }, [currentPlayer, aiColor, gameOver, board, difficulty, playerColor])

  // If AI starts (player is white), trigger AI first move
  useEffect(() => {
    if (
      playerColor === 2 &&
      currentPlayer === 1 &&
      !gameOver &&
      board.flat().every((c) => c === 0)
    ) {
      // AI goes first
      setIsThinking(true)
      const timeout = setTimeout(() => {
        const newBoard = board.map((r) => [...r]) as Board
        newBoard[7][7] = 1
        setBoard(newBoard)
        setLastMove([7, 7])
        setNewPieces(new Set(['7,7']))
        setIsThinking(false)
        setCurrentPlayer(2)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [playerColor, currentPlayer, gameOver, board])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return

      let [r, c] = cursorPos
      switch (e.key) {
        case 'ArrowUp':
          r = Math.max(0, r - 1)
          e.preventDefault()
          break
        case 'ArrowDown':
          r = Math.min(BOARD_SIZE - 1, r + 1)
          e.preventDefault()
          break
        case 'ArrowLeft':
          c = Math.max(0, c - 1)
          e.preventDefault()
          break
        case 'ArrowRight':
          c = Math.min(BOARD_SIZE - 1, c + 1)
          e.preventDefault()
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          placePiece(r, c)
          return
        default:
          return
      }
      setCursorPos([r, c])
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [cursorPos, gameOver, placePiece])

  const handleCellClick = useCallback(
    (row: number, col: number) => {
      placePiece(row, col)
    },
    [placePiece],
  )

  const handleCursorMove = useCallback((row: number, col: number) => {
    setCursorPos([row, col])
  }, [])

  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(null)
    setWinningLine(null)
    setLastMove(null)
    setNewPieces(new Set())
    setCursorPos([7, 7])
  }, [])

  const handleDifficultyChange = useCallback(
    (d: Difficulty) => {
      setDifficulty(d)
      handleRestart()
    },
    [handleRestart],
  )

  const handleColorSwitch = useCallback(() => {
    setPlayerColor((prev) => (prev === 1 ? 2 : 1))
    handleRestart()
  }, [handleRestart])

  return (
    <div
      ref={gameContainerRef}
      className="min-h-screen bg-background flex flex-col items-center py-6 px-4"
      tabIndex={0}
    >
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full max-w-[1000px]">
        {/* Controls - top on mobile, side on desktop */}
        <div className="w-full lg:w-[320px] order-2 lg:order-1">
          <GameControls
            currentPlayer={currentPlayer}
            playerColor={playerColor}
            difficulty={difficulty}
            scores={scores}
            isThinking={isThinking}
            onDifficultyChange={handleDifficultyChange}
            onRestart={handleRestart}
            onColorSwitch={handleColorSwitch}
          />
        </div>

        {/* Board */}
        <div className="flex-1 w-full order-1 lg:order-2">
          <GomokuBoard
            board={board}
            cursorPos={cursorPos}
            winningLine={winningLine}
            lastMove={lastMove}
            currentPlayer={currentPlayer}
            gameOver={gameOver}
            onCellClick={handleCellClick}
            onCursorMove={handleCursorMove}
            newPieces={newPieces}
          />
        </div>
      </div>

      {/* Game Over Overlay */}
      {gameOver && winner && (
        <GameOverOverlay winner={winner} playerColor={playerColor} onRestart={handleRestart} />
      )}
    </div>
  )
}
