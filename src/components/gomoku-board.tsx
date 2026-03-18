'use client'

import { useRef, useEffect, useCallback, useState } from 'react'
import type { Board, CellValue } from '@/lib/gomoku-ai'
import { useTranslations } from 'next-intl'

const BOARD_SIZE = 15
const STAR_POINTS = [
  [3, 3],
  [3, 7],
  [3, 11],
  [7, 3],
  [7, 7],
  [7, 11],
  [11, 3],
  [11, 7],
  [11, 11],
]

interface GomokuBoardProps {
  board: Board
  cursorPos: [number, number]
  winningLine: [number, number][] | null
  lastMove: [number, number] | null
  currentPlayer: CellValue
  gameOver: boolean
  onCellClick: (row: number, col: number) => void
  onCursorMove: (row: number, col: number) => void
  newPieces: Set<string>
}

export default function GomokuBoard({
  board,
  cursorPos,
  winningLine,
  lastMove,
  currentPlayer,
  gameOver,
  onCellClick,
  onCursorMove,
  newPieces,
}: GomokuBoardProps) {
  const t = useTranslations('gomoku')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState(600)
  const animationFrames = useRef<Map<string, number>>(new Map())
  const animationRef = useRef<number | null>(null)

  const cellSize = canvasSize / (BOARD_SIZE + 1)
  const padding = cellSize
  const pieceRadius = cellSize * 0.42

  // Responsive canvas sizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const w = containerRef.current.clientWidth
        const size = Math.min(w, 600)
        setCanvasSize(size)
      }
    }
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  // Track animation progress for new pieces
  useEffect(() => {
    for (const key of newPieces) {
      if (!animationFrames.current.has(key)) {
        animationFrames.current.set(key, 0)
      }
    }
  }, [newPieces])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = canvasSize * dpr
    canvas.height = canvasSize * dpr
    ctx.scale(dpr, dpr)

    // Board background - warm wood color
    ctx.fillStyle = '#d4a54a'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // Wood grain texture
    ctx.strokeStyle = 'rgba(160, 110, 40, 0.08)'
    ctx.lineWidth = 1
    for (let i = 0; i < canvasSize; i += 4) {
      ctx.beginPath()
      ctx.moveTo(0, i + Math.sin(i * 0.05) * 3)
      ctx.lineTo(canvasSize, i + Math.cos(i * 0.05) * 3)
      ctx.stroke()
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(50, 35, 15, 0.6)'
    ctx.lineWidth = 1
    for (let i = 0; i < BOARD_SIZE; i++) {
      const pos = padding + i * cellSize
      ctx.beginPath()
      ctx.moveTo(padding, pos)
      ctx.lineTo(padding + (BOARD_SIZE - 1) * cellSize, pos)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(pos, padding)
      ctx.lineTo(pos, padding + (BOARD_SIZE - 1) * cellSize)
      ctx.stroke()
    }

    // Star points
    ctx.fillStyle = 'rgba(50, 35, 15, 0.8)'
    for (const [r, c] of STAR_POINTS) {
      const x = padding + c * cellSize
      const y = padding + r * cellSize
      ctx.beginPath()
      ctx.arc(x, y, cellSize * 0.1, 0, Math.PI * 2)
      ctx.fill()
    }

    // Winning line highlight
    const winSet = new Set<string>()
    if (winningLine) {
      for (const [r, c] of winningLine) {
        winSet.add(`${r},${c}`)
      }
    }

    // Draw pieces
    let needsRedraw = false
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (board[r][c] === 0) continue
        const x = padding + c * cellSize
        const y = padding + r * cellSize
        const key = `${r},${c}`

        let scale = 1
        if (animationFrames.current.has(key)) {
          const frame = animationFrames.current.get(key)!
          if (frame < 10) {
            // Bounce-in effect
            const progress = frame / 10
            const eased = 1 - Math.pow(1 - progress, 3)
            scale = eased * 1.1
            if (scale > 1) scale = 1 + (1.1 - 1) * (1 - (frame - 7) / 3)
            if (frame < 7) scale = eased * 1.1
            else scale = 1 + 0.1 * (1 - (frame - 7) / 3)
            animationFrames.current.set(key, frame + 1)
            needsRedraw = true
          } else {
            scale = 1
            animationFrames.current.delete(key)
          }
        }

        const radius = pieceRadius * Math.max(0.01, scale)

        const isWinPiece = winSet.has(key)

        // Glow for winning pieces
        if (isWinPiece) {
          ctx.save()
          ctx.shadowColor = board[r][c] === 1 ? 'rgba(255,200,50,0.8)' : 'rgba(255,200,50,0.8)'
          ctx.shadowBlur = 15
          ctx.beginPath()
          ctx.arc(x, y, radius + 2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,200,50,0.3)'
          ctx.fill()
          ctx.restore()
        }

        if (board[r][c] === 1) {
          // Black piece
          const gradient = ctx.createRadialGradient(
            x - radius * 0.25,
            y - radius * 0.25,
            radius * 0.1,
            x,
            y,
            radius,
          )
          gradient.addColorStop(0, '#555')
          gradient.addColorStop(0.6, '#222')
          gradient.addColorStop(1, '#111')
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
          // Specular highlight
          ctx.beginPath()
          ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.22, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,255,255,0.15)'
          ctx.fill()
        } else {
          // White piece
          const gradient = ctx.createRadialGradient(
            x - radius * 0.25,
            y - radius * 0.25,
            radius * 0.1,
            x,
            y,
            radius,
          )
          gradient.addColorStop(0, '#fff')
          gradient.addColorStop(0.7, '#e8e8e8')
          gradient.addColorStop(1, '#ccc')
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()
          // Shadow edge
          ctx.beginPath()
          ctx.arc(x, y, radius, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(0,0,0,0.15)'
          ctx.lineWidth = 1
          ctx.stroke()
          // Specular highlight
          ctx.beginPath()
          ctx.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255,255,255,0.7)'
          ctx.fill()
        }

        // Last move indicator
        if (lastMove && lastMove[0] === r && lastMove[1] === c && !isWinPiece) {
          ctx.beginPath()
          ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2)
          ctx.fillStyle = board[r][c] === 1 ? 'rgba(255,100,100,0.9)' : 'rgba(255,50,50,0.8)'
          ctx.fill()
        }
      }
    }

    // Cursor hover preview
    if (!gameOver && board[cursorPos[0]][cursorPos[1]] === 0) {
      const cx = padding + cursorPos[1] * cellSize
      const cy = padding + cursorPos[0] * cellSize
      ctx.beginPath()
      ctx.arc(cx, cy, pieceRadius, 0, Math.PI * 2)
      ctx.fillStyle = currentPlayer === 1 ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.35)'
      ctx.fill()
      if (currentPlayer === 2) {
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Row/column labels
    ctx.fillStyle = 'rgba(50, 35, 15, 0.5)'
    ctx.font = `${cellSize * 0.3}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (let i = 0; i < BOARD_SIZE; i++) {
      // Column labels (A-O)
      ctx.fillText(
        String.fromCharCode(65 + i),
        padding + i * cellSize,
        padding + BOARD_SIZE * cellSize - cellSize * 0.4,
      )
      // Row labels (1-15)
      ctx.fillText(`${i + 1}`, padding - cellSize * 0.6, padding + i * cellSize)
    }

    if (needsRedraw) {
      animationRef.current = requestAnimationFrame(draw)
    }
  }, [
    board,
    canvasSize,
    cellSize,
    cursorPos,
    currentPlayer,
    gameOver,
    lastMove,
    padding,
    pieceRadius,
    winningLine,
  ])

  useEffect(() => {
    animationRef.current = requestAnimationFrame(draw)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [draw])

  const getGridPos = useCallback(
    (clientX: number, clientY: number): [number, number] | null => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      const scaleX = canvasSize / rect.width
      const scaleY = canvasSize / rect.height
      const col = Math.round((x * scaleX - padding) / cellSize)
      const row = Math.round((y * scaleY - padding) / cellSize)
      if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        return [row, col]
      }
      return null
    },
    [canvasSize, cellSize, padding],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getGridPos(e.clientX, e.clientY)
      if (pos) onCursorMove(pos[0], pos[1])
    },
    [getGridPos, onCursorMove],
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const pos = getGridPos(e.clientX, e.clientY)
      if (pos) onCellClick(pos[0], pos[1])
    },
    [getGridPos, onCellClick],
  )

  const handleTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault()
      const touch = e.touches[0]
      if (!touch) return
      const pos = getGridPos(touch.clientX, touch.clientY)
      if (pos) {
        onCursorMove(pos[0], pos[1])
        onCellClick(pos[0], pos[1])
      }
    },
    [getGridPos, onCellClick, onCursorMove],
  )

  return (
    <div ref={containerRef} className="w-full max-w-150 mx-auto">
      <canvas
        ref={canvasRef}
        style={{ width: canvasSize, height: canvasSize }}
        className="rounded-lg shadow-xl cursor-pointer touch-none"
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onTouchStart={handleTouch}
        role="img"
        aria-label={t('aria-label')}
      />
    </div>
  )
}
