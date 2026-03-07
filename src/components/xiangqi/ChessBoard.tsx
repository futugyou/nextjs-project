'use client'

import { useMemo, useRef, useEffect } from 'react'
import { Board, Position, Piece, getLegalMoves } from '@/lib/xiangqi'
import { ChessPiece } from './ChessPiece'
import { cn } from '@/lib/utils'

interface ChessBoardProps {
  board: Board
  selectedPos: Position | null
  lastMove: { from: Position; to: Position } | null
  currentTurn: 'red' | 'black'
  onCellClick: (pos: Position) => void
  isAIThinking?: boolean
  playerColor?: 'red' | 'black'
}

// 宫格对角线路径
const PALACE_LINES_RED = [
  [
    [7, 3],
    [9, 5],
  ],
  [
    [7, 5],
    [9, 3],
  ],
]
const PALACE_LINES_BLACK = [
  [
    [0, 3],
    [2, 5],
  ],
  [
    [0, 5],
    [2, 3],
  ],
]

export function ChessBoard({
  board,
  selectedPos,
  lastMove,
  currentTurn,
  onCellClick,
  isAIThinking,
  playerColor = 'red',
}: ChessBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 计算当前选中棋子的合法移动
  const legalMoves = useMemo<Position[]>(() => {
    if (!selectedPos) return []
    const piece = board[selectedPos.row][selectedPos.col]
    if (!piece || piece.color !== currentTurn) return []
    return getLegalMoves(board, selectedPos)
  }, [board, selectedPos, currentTurn])

  // 计算格子大小（响应式）
  const cellSize = 56
  const padding = 28
  const boardWidth = cellSize * 8 + padding * 2
  const boardHeight = cellSize * 9 + padding * 2

  // 绘制棋盘线条
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = boardWidth * dpr
    canvas.height = boardHeight * dpr
    canvas.style.width = `${boardWidth}px`
    canvas.style.height = `${boardHeight}px`
    ctx.scale(dpr, dpr)

    // 背景 - 木纹色
    ctx.fillStyle = '#c8975a'
    ctx.fillRect(0, 0, boardWidth, boardHeight)

    // 木纹纹理（简单斜线模拟）
    ctx.strokeStyle = 'rgba(180, 130, 70, 0.2)'
    ctx.lineWidth = 1
    for (let i = -boardHeight; i < boardWidth; i += 8) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + boardHeight, boardHeight)
      ctx.stroke()
    }

    const lineColor = '#5a3a1a'
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1.5

    // 绘制横线（10条）
    for (let r = 0; r < 10; r++) {
      const y = padding + r * cellSize
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(padding + 8 * cellSize, y)
      ctx.stroke()
    }

    // 绘制竖线（9条，楚河汉界处断开）
    for (let c = 0; c < 9; c++) {
      const x = padding + c * cellSize
      if (c === 0 || c === 8) {
        // 边线不断
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, padding + 9 * cellSize)
        ctx.stroke()
      } else {
        // 上半段（黑方）
        ctx.beginPath()
        ctx.moveTo(x, padding)
        ctx.lineTo(x, padding + 4 * cellSize)
        ctx.stroke()
        // 下半段（红方）
        ctx.beginPath()
        ctx.moveTo(x, padding + 5 * cellSize)
        ctx.lineTo(x, padding + 9 * cellSize)
        ctx.stroke()
      }
    }

    // 楚河汉界文字
    ctx.fillStyle = lineColor
    ctx.font = `bold ${cellSize * 0.45}px "Noto Serif SC", serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const riverY = padding + 4.5 * cellSize
    ctx.fillText('楚　河', padding + 2 * cellSize, riverY)
    ctx.fillText('漢　界', padding + 6 * cellSize, riverY)

    // 宫格对角线
    const drawPalaceLines = (lines: number[][][]) => {
      for (const [from, to] of lines) {
        ctx.beginPath()
        ctx.moveTo(padding + from[1] * cellSize, padding + from[0] * cellSize)
        ctx.lineTo(padding + to[1] * cellSize, padding + to[0] * cellSize)
        ctx.stroke()
      }
    }
    drawPalaceLines(PALACE_LINES_RED)
    drawPalaceLines(PALACE_LINES_BLACK)

    // 炮和兵的位置标记（小十字）
    const marks = [
      // 炮
      [2, 1],
      [2, 7],
      [7, 1],
      [7, 7],
      // 兵
      [3, 0],
      [3, 2],
      [3, 4],
      [3, 6],
      [3, 8],
      [6, 0],
      [6, 2],
      [6, 4],
      [6, 6],
      [6, 8],
    ]

    ctx.strokeStyle = lineColor
    ctx.lineWidth = 1.5
    const markSize = 5

    for (const [r, c] of marks) {
      const x = padding + c * cellSize
      const y = padding + r * cellSize
      const hasLeft = c > 0
      const hasRight = c < 8
      const hasTop = r > 0
      const hasBottom = r < 9

      // 画四角小L形标记
      if (hasTop && hasLeft) {
        ctx.beginPath()
        ctx.moveTo(x - markSize, y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y - markSize)
        ctx.stroke()
      }
      if (hasTop && hasRight) {
        ctx.beginPath()
        ctx.moveTo(x + markSize, y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y - markSize)
        ctx.stroke()
      }
      if (hasBottom && hasLeft) {
        ctx.beginPath()
        ctx.moveTo(x - markSize, y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y + markSize)
        ctx.stroke()
      }
      if (hasBottom && hasRight) {
        ctx.beginPath()
        ctx.moveTo(x + markSize, y)
        ctx.lineTo(x, y)
        ctx.lineTo(x, y + markSize)
        ctx.stroke()
      }
    }

    // 外框
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 3
    ctx.strokeRect(padding - 1, padding - 1, 8 * cellSize + 2, 9 * cellSize + 2)
  }, [cellSize, padding, boardWidth, boardHeight])

  const isLastMovePos = (row: number, col: number) => {
    return (
      (lastMove?.from.row === row && lastMove?.from.col === col) ||
      (lastMove?.to.row === row && lastMove?.to.col === col)
    )
  }

  const isLegalMove = (row: number, col: number) => {
    return legalMoves.some((m) => m.row === row && m.col === col)
  }

  const isSelected = (row: number, col: number) => {
    return selectedPos?.row === row && selectedPos?.col === col
  }

  return (
    <div
      ref={containerRef}
      className="relative inline-block select-none"
      style={{ width: boardWidth, height: boardHeight }}
    >
      {/* 棋盘背景（Canvas绘制）*/}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 rounded-lg shadow-2xl"
        style={{ width: boardWidth, height: boardHeight }}
      />

      {/* 棋子和交互层 */}
      <div className="absolute inset-0" style={{ width: boardWidth, height: boardHeight }}>
        {Array.from({ length: 10 }, (_, row) =>
          Array.from({ length: 9 }, (_, col) => {
            const piece = board[row][col]
            const x = padding + col * cellSize
            const y = padding + row * cellSize
            const legal = isLegalMove(row, col)
            const selected = isSelected(row, col)
            const lastMoveHighlight = isLastMovePos(row, col)

            return (
              <div
                key={`${row}-${col}`}
                className="absolute flex items-center justify-center cursor-pointer"
                style={{
                  left: x - cellSize / 2,
                  top: y - cellSize / 2,
                  width: cellSize,
                  height: cellSize,
                }}
                onClick={() => onCellClick({ row, col })}
              >
                {/* 合法移动目标提示 */}
                {legal && !piece && (
                  <div className="absolute w-4 h-4 rounded-full bg-highlight opacity-70 z-5" />
                )}
                {legal && piece && (
                  <div className="absolute inset-1 rounded-full border-2 border-highlight opacity-80 z-5" />
                )}
                {/* 上一步高亮 */}
                {lastMoveHighlight && !selected && (
                  <div className="absolute inset-1 rounded-full bg-yellow-400 opacity-20 z-4" />
                )}
                {/* 棋子 */}
                {piece && (
                  <ChessPiece
                    piece={piece}
                    isSelected={selected}
                    isLastMove={lastMoveHighlight}
                    onClick={() => onCellClick({ row, col })}
                    size={cellSize - 6}
                  />
                )}
              </div>
            )
          }),
        )}
      </div>

      {/* AI思考遮罩 */}
      {isAIThinking && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg z-20">
          <div className="bg-card/90 backdrop-blur px-6 py-3 rounded-full shadow-lg border border-border">
            <span className="text-foreground font-bold animate-pulse">AI思考中...</span>
          </div>
        </div>
      )}
    </div>
  )
}
