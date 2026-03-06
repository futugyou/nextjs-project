'use client'

import { Cell } from './cell'
import type { Cell as CellType, GameStatus } from '@/hook/use-minesweeper'

interface BoardProps {
  board: CellType[][]
  gameStatus: GameStatus
  cellSize: number
  onReveal: (row: number, col: number) => void
  onFlag: (row: number, col: number) => void
}

export function Board({ board, gameStatus, cellSize, onReveal, onFlag }: BoardProps) {
  const gameOver = gameStatus === 'won' || gameStatus === 'lost'

  return (
    <div
      className="select-none"
      onContextMenu={(e) => e.preventDefault()}
      role="grid"
      aria-label="扫雷棋盘"
    >
      {board.map((row, rIdx) => (
        <div key={rIdx} className="flex" role="row">
          {row.map((cell) => (
            <Cell
              key={`${cell.row}-${cell.col}`}
              cell={cell}
              size={cellSize}
              onReveal={onReveal}
              onFlag={onFlag}
              gameOver={gameOver}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
