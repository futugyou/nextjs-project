'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const GRID_SIZE = 20
const INITIAL_SPEED = 150

type Position = { x: number; y: number }
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

interface GameState {
  snake: Position[]
  food: Position
  direction: Direction
  nextDirection: Direction
  score: number
  highScore: number
  level: number
  isGameOver: boolean
  isPlaying: boolean
  isPaused: boolean
}

const getRandomPosition = (snake: Position[]): Position => {
  let position: Position
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    }
  } while (snake.some((segment) => segment.x === position.x && segment.y === position.y))
  return position
}

const initialState: GameState = {
  snake: [{ x: 10, y: 10 }],
  food: { x: 15, y: 15 },
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  highScore: 0,
  level: 1,
  isGameOver: false,
  isPlaying: false,
  isPaused: false,
}

export function SnakeGame() {
  const [gameState, setGameState] = useState<GameState>(initialState)
  const [showStartScreen, setShowStartScreen] = useState(true)
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const getSpeed = useCallback((level: number) => {
    return Math.max(50, INITIAL_SPEED - (level - 1) * 15)
  }, [])

  const startGame = useCallback(() => {
    const newFood = getRandomPosition([{ x: 10, y: 10 }])
    setGameState((prev) => ({
      ...initialState,
      highScore: prev.highScore,
      food: newFood,
      isPlaying: true,
    }))
    setShowStartScreen(false)
  }, [])

  const togglePause = useCallback(() => {
    if (gameState.isGameOver || !gameState.isPlaying) return
    setGameState((prev) => ({ ...prev, isPaused: !prev.isPaused }))
  }, [gameState.isGameOver, gameState.isPlaying])

  const moveSnake = useCallback(() => {
    setGameState((prev) => {
      if (prev.isGameOver || !prev.isPlaying || prev.isPaused) return prev

      const newDirection = prev.nextDirection
      const head = prev.snake[0]
      const newHead: Position = { ...head }

      switch (newDirection) {
        case 'UP':
          newHead.y -= 1
          break
        case 'DOWN':
          newHead.y += 1
          break
        case 'LEFT':
          newHead.x -= 1
          break
        case 'RIGHT':
          newHead.x += 1
          break
      }

      // Check wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        return {
          ...prev,
          isGameOver: true,
          isPlaying: false,
          highScore: Math.max(prev.highScore, prev.score),
        }
      }

      // Check self collision (excluding tail which will move)
      const willEatFood = newHead.x === prev.food.x && newHead.y === prev.food.y
      const bodyToCheck = willEatFood ? prev.snake : prev.snake.slice(0, -1)
      if (bodyToCheck.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        return {
          ...prev,
          isGameOver: true,
          isPlaying: false,
          highScore: Math.max(prev.highScore, prev.score),
        }
      }

      const newSnake = [newHead, ...prev.snake]

      if (willEatFood) {
        const newScore = prev.score + 10
        const newLevel = Math.floor(newScore / 50) + 1
        const newFood = getRandomPosition(newSnake)
        return {
          ...prev,
          snake: newSnake,
          food: newFood,
          direction: newDirection,
          score: newScore,
          level: newLevel,
        }
      } else {
        newSnake.pop()
        return {
          ...prev,
          snake: newSnake,
          direction: newDirection,
        }
      }
    })
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === ' ') {
        if (gameState.isGameOver || showStartScreen) {
          startGame()
        } else {
          togglePause()
        }
        return
      }

      if (gameState.isGameOver || !gameState.isPlaying || gameState.isPaused) return

      setGameState((prev) => {
        let newDirection = prev.nextDirection
        switch (e.key) {
          case 'ArrowUp':
            if (prev.direction !== 'DOWN') newDirection = 'UP'
            break
          case 'ArrowDown':
            if (prev.direction !== 'UP') newDirection = 'DOWN'
            break
          case 'ArrowLeft':
            if (prev.direction !== 'RIGHT') newDirection = 'LEFT'
            break
          case 'ArrowRight':
            if (prev.direction !== 'LEFT') newDirection = 'RIGHT'
            break
        }
        return { ...prev, nextDirection: newDirection }
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    gameState.isGameOver,
    gameState.isPlaying,
    gameState.isPaused,
    showStartScreen,
    startGame,
    togglePause,
  ])

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isGameOver) {
      gameLoopRef.current = setInterval(moveSnake, getSpeed(gameState.level))
    }
    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current)
      }
    }
  }, [
    gameState.isPlaying,
    gameState.isPaused,
    gameState.isGameOver,
    gameState.level,
    moveSnake,
    getSpeed,
  ])

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cellSize = canvas.width / GRID_SIZE

    // Clear canvas
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = '#252542'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellSize, 0)
      ctx.lineTo(i * cellSize, canvas.height)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * cellSize)
      ctx.lineTo(canvas.width, i * cellSize)
      ctx.stroke()
    }

    // Draw food with glow effect
    const foodX = gameState.food.x * cellSize + cellSize / 2
    const foodY = gameState.food.y * cellSize + cellSize / 2
    const foodRadius = cellSize / 2 - 2

    // Glow effect
    const gradient = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, foodRadius * 2)
    gradient.addColorStop(0, 'rgba(255, 180, 50, 0.4)')
    gradient.addColorStop(1, 'rgba(255, 180, 50, 0)')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(foodX, foodY, foodRadius * 2, 0, Math.PI * 2)
    ctx.fill()

    // Food
    ctx.fillStyle = '#ffb432'
    ctx.beginPath()
    ctx.arc(foodX, foodY, foodRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      const x = segment.x * cellSize
      const y = segment.y * cellSize
      const isHead = index === 0

      // Snake body glow
      if (isHead) {
        const glowGradient = ctx.createRadialGradient(
          x + cellSize / 2,
          y + cellSize / 2,
          0,
          x + cellSize / 2,
          y + cellSize / 2,
          cellSize,
        )
        glowGradient.addColorStop(0, 'rgba(74, 222, 128, 0.3)')
        glowGradient.addColorStop(1, 'rgba(74, 222, 128, 0)')
        ctx.fillStyle = glowGradient
        ctx.beginPath()
        ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Snake segment
      const brightness = Math.max(0.4, 1 - index * 0.03)
      ctx.fillStyle = isHead ? '#4ade80' : `rgba(74, 222, 128, ${brightness})`
      ctx.beginPath()
      ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, isHead ? 6 : 4)
      ctx.fill()

      // Eyes on head
      if (isHead) {
        ctx.fillStyle = '#1a1a2e'
        const eyeSize = cellSize / 6
        const eyeOffset = cellSize / 4

        let eye1X = x + cellSize / 2 - eyeOffset
        let eye1Y = y + cellSize / 3
        let eye2X = x + cellSize / 2 + eyeOffset
        let eye2Y = y + cellSize / 3

        if (gameState.direction === 'DOWN') {
          eye1Y = y + (cellSize * 2) / 3
          eye2Y = y + (cellSize * 2) / 3
        } else if (gameState.direction === 'LEFT') {
          eye1X = x + cellSize / 3
          eye2X = x + cellSize / 3
          eye1Y = y + cellSize / 2 - eyeOffset
          eye2Y = y + cellSize / 2 + eyeOffset
        } else if (gameState.direction === 'RIGHT') {
          eye1X = x + (cellSize * 2) / 3
          eye2X = x + (cellSize * 2) / 3
          eye1Y = y + cellSize / 2 - eyeOffset
          eye2Y = y + cellSize / 2 + eyeOffset
        }

        ctx.beginPath()
        ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2)
        ctx.fill()
      }
    })
  }, [gameState.snake, gameState.food, gameState.direction])

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Stats Bar */}
      <div className="flex items-center justify-between w-full max-w-100 px-2">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Score
          </span>
          <span className="text-2xl font-bold text-foreground font-mono">{gameState.score}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Level
          </span>
          <span className="text-2xl font-bold text-primary font-mono">{gameState.level}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            High Score
          </span>
          <span className="text-2xl font-bold text-accent font-mono">{gameState.highScore}</span>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className={cn(
            'border-2 border-border rounded-lg shadow-2xl',
            'transition-all duration-300',
            gameState.isGameOver && 'opacity-50',
          )}
        />

        {/* Start Screen Overlay */}
        {showStartScreen && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-lg backdrop-blur-sm animate-in fade-in duration-300">
            <div className="text-5xl font-bold text-primary mb-2 font-mono tracking-tight">
              SNAKE
            </div>
            <p className="text-muted-foreground mb-8 text-sm font-mono">Use arrow keys to move</p>
            <Button
              onClick={startGame}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg px-8 py-6 transition-transform hover:scale-105"
            >
              Start Game
            </Button>
            <p className="text-xs text-muted-foreground mt-4 font-mono">Press SPACE to start</p>
          </div>
        )}

        {/* Game Over Overlay */}
        {gameState.isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 rounded-lg backdrop-blur-sm animate-in fade-in zoom-in-95 duration-300">
            <div className="text-3xl font-bold text-destructive mb-2 font-mono">GAME OVER</div>
            <div className="text-xl text-foreground mb-1 font-mono">
              Score: <span className="text-primary">{gameState.score}</span>
            </div>
            {gameState.score >= gameState.highScore && gameState.score > 0 && (
              <div className="text-sm text-accent mb-4 font-mono animate-pulse">
                New High Score!
              </div>
            )}
            <Button
              onClick={startGame}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono text-lg px-8 py-6 transition-transform hover:scale-105"
            >
              Play Again
            </Button>
            <p className="text-xs text-muted-foreground mt-4 font-mono">Press SPACE to restart</p>
          </div>
        )}

        {/* Pause Overlay */}
        {gameState.isPaused && !gameState.isGameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-lg backdrop-blur-sm animate-in fade-in duration-200">
            <div className="text-3xl font-bold text-foreground mb-4 font-mono">PAUSED</div>
            <Button
              onClick={togglePause}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono"
            >
              Resume
            </Button>
            <p className="text-xs text-muted-foreground mt-4 font-mono">Press SPACE to resume</p>
          </div>
        )}
      </div>

      {/* Controls Info */}
      <div className="flex flex-wrap justify-center gap-3 text-xs text-muted-foreground font-mono">
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md">
          <kbd className="px-2 py-0.5 bg-muted rounded text-foreground">↑</kbd>
          <kbd className="px-2 py-0.5 bg-muted rounded text-foreground">↓</kbd>
          <kbd className="px-2 py-0.5 bg-muted rounded text-foreground">←</kbd>
          <kbd className="px-2 py-0.5 bg-muted rounded text-foreground">→</kbd>
          <span>Move</span>
        </div>
        <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md">
          <kbd className="px-2 py-0.5 bg-muted rounded text-foreground">Space</kbd>
          <span>Pause</span>
        </div>
      </div>

      {/* Level Progress */}
      <div className="w-full max-w-100">
        <div className="flex justify-between text-xs text-muted-foreground mb-1 font-mono">
          <span>Level {gameState.level}</span>
          <span>Next: {50 - (gameState.score % 50)} pts</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${((gameState.score % 50) / 50) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
