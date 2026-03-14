'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import GomokuBoard from '@/components/gomoku-board'
import GameControls from '@/components/game-controls'
import GameOverOverlay from '@/components/game-over-overlay'
import { useGameStorage } from '@/hook/use-game-record'
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
const BASE_SCORE = 1000
const PENALTY_PER_MOVE = 10

export default function GomokuGame() {
  const { saveRecord, currentGameData } = useGameStorage('gomoku')

  const [board, setBoard] = useState<Board>(() => createEmptyBoard())
  const [currentPlayer, setCurrentPlayer] = useState<CellValue>(1)
  const [playerColor, setPlayerColor] = useState<CellValue>(1)
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [cursorPos, setCursorPos] = useState<[number, number]>([7, 7])
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<CellValue | 'draw' | null>(null)
  const [winningLine, setWinningLine] = useState<[number, number][] | null>(null)
  const [lastMove, setLastMove] = useState<[number, number]>([-1, -1])
  const [isThinking, setIsThinking] = useState(false)
  const [scores, setScores] = useState({ player: 0, ai: 0, draw: 0 })
  const [newPieces, setNewPieces] = useState<Set<string>>(new Set())

  const [moveCount, setMoveCount] = useState(0)
  const [startTime, setStartTime] = useState<number>(Date.now())
  const gameContainerRef = useRef<HTMLDivElement>(null)

  const aiColor: CellValue = playerColor === 1 ? 2 : 1

  const handleGameOver = useCallback(
    (winnerValue: CellValue | 'draw') => {
      const duration = Math.floor((Date.now() - startTime) / 1000)

      let finalScore = 0
      if (winnerValue === playerColor) {
        finalScore = Math.max(100, BASE_SCORE - moveCount * PENALTY_PER_MOVE)
      } else if (winnerValue === 'draw') {
        finalScore = 50
      }

      saveRecord(finalScore, duration, winnerValue === playerColor)

      setWinner(winnerValue)
      setGameOver(true)
      setScores((prev) => ({
        ...prev,
        player: winnerValue === playerColor ? prev.player + 1 : prev.player,
        ai: winnerValue === aiColor ? prev.ai + 1 : prev.ai,
        draw: winnerValue === 'draw' ? prev.draw + 1 : prev.draw,
      }))
    },
    [startTime, moveCount, playerColor, aiColor, saveRecord],
  )

  const placePiece = useCallback(
    (row: number, col: number) => {
      if (board[row][col] !== 0 || gameOver || isThinking) return false
      if (currentPlayer !== playerColor) return false

      setMoveCount((prev) => prev + 1)

      const newBoard = board.map((r) => [...r]) as Board
      newBoard[row][col] = currentPlayer

      setBoard(newBoard)
      setLastMove([row, col])
      setNewPieces(new Set([`${row},${col}`]))

      const w = checkWinner(newBoard, row, col)
      if (w !== 0) {
        setWinningLine(getWinningLine(newBoard, row, col))
        handleGameOver(w === playerColor ? playerColor : aiColor)
        return true
      }

      if (isBoardFull(newBoard)) {
        handleGameOver('draw')
        return true
      }

      setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
      return true
    },
    [board, currentPlayer, gameOver, isThinking, playerColor, aiColor, handleGameOver],
  )

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
          setWinningLine(getWinningLine(newBoard, aiRow, aiCol))
          handleGameOver(w === playerColor ? playerColor : aiColor)
          return
        }

        if (isBoardFull(newBoard)) {
          handleGameOver('draw')
          return
        }

        setCurrentPlayer(aiColor === 1 ? 2 : 1)
      },
      400 + Math.random() * 300,
    )

    return () => clearTimeout(timeout)
  }, [currentPlayer, aiColor, gameOver, board, difficulty, playerColor, handleGameOver])

  const handleRestart = useCallback(() => {
    setBoard(createEmptyBoard())
    setCurrentPlayer(1)
    setGameOver(false)
    setWinner(null)
    setWinningLine(null)
    setLastMove([-1, -1])
    setNewPieces(new Set())
    setCursorPos([7, 7])
    setMoveCount(0)
    setStartTime(Date.now())
  }, [])

  const handleColorSwitch = useCallback(() => {
    setPlayerColor((prev) => (prev === 1 ? 2 : 1))
    handleRestart()
  }, [handleRestart])

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

  const handleDifficultyChange = useCallback(
    (d: Difficulty) => {
      setDifficulty(d)
      handleRestart()
    },
    [handleRestart],
  )

  return (
    <div
      ref={gameContainerRef}
      className="min-h-screen bg-background flex flex-col items-center py-6 px-4 focus:outline-none"
      tabIndex={0}
    >
      <div className="flex flex-col lg:flex-row items-start gap-6 w-full max-w-250">
        <div className="w-full lg:w-[320px] order-2 lg:order-1 space-y-4">
          {currentGameData?.bestRecord && (
            <div className="p-4 bg-card rounded-lg border border-yellow-500/20 shadow-sm">
              <p className="text-xs font-bold text-yellow-600 uppercase mb-1">历史最佳得分</p>
              <p className="text-2xl font-black">{currentGameData.bestRecord.score}</p>
              <p className="text-[10px] text-muted-foreground">
                用时: {currentGameData.bestRecord.duration}秒 |{' '}
                {new Date(currentGameData.bestRecord.timestamp).toLocaleDateString()}
              </p>
            </div>
          )}

          <GameControls
            currentPlayer={currentPlayer}
            playerColor={playerColor}
            difficulty={difficulty}
            scores={scores}
            isThinking={isThinking}
            onDifficultyChange={(d) => {
              setDifficulty(d)
              handleRestart()
            }}
            onRestart={handleRestart}
            onColorSwitch={handleColorSwitch}
          />
        </div>

        <div className="flex-1 w-full order-1 lg:order-2">
          <GomokuBoard
            board={board}
            cursorPos={cursorPos}
            winningLine={winningLine}
            lastMove={lastMove[0] === -1 ? null : (lastMove as [number, number])}
            currentPlayer={currentPlayer}
            gameOver={gameOver}
            onCellClick={placePiece}
            onCursorMove={(r, c) => setCursorPos([r, c])}
            newPieces={newPieces}
          />
        </div>
      </div>

      {gameOver && winner && (
        <GameOverOverlay winner={winner} playerColor={playerColor} onRestart={handleRestart} />
      )}
    </div>
  )
}
