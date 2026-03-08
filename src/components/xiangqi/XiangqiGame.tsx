'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import {
  Board,
  Position,
  Move,
  MoveRecord,
  PieceColor,
  PIECE_CHARS,
  createInitialBoard,
  applyMove,
  getLegalMoves,
  isCheckmate,
  isInCheck,
  generateNotation,
  cloneBoard,
} from '@/lib/xiangqi'
import { Difficulty, getAIMove } from '@/lib/xiangqi-ai'
import { ChessBoard } from './ChessBoard'
import { GameSidebar } from './GameSidebar'
import { WinModal } from './WinModal'
import { cn } from '@/lib/utils'

// 音效占位函数
function playMoveSound() {
  // 可接入真实音效：const audio = new Audio('/sounds/move.mp3'); audio.play()
}
function playCaptureSound() {
  // const audio = new Audio('/sounds/capture.mp3'); audio.play()
}

export function XiangqiGame() {
  const [board, setBoard] = useState<Board>(createInitialBoard)
  const [selectedPos, setSelectedPos] = useState<Position | null>(null)
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('red')
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([])
  const [boardHistory, setBoardHistory] = useState<Board[]>([createInitialBoard()])
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null)
  const [winner, setWinner] = useState<PieceColor | null>(null)
  const [difficulty, setDifficulty] = useState<Difficulty>('intermediate')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const [inCheck, setInCheck] = useState<PieceColor | null>(null)

  // 被吃棋子统计
  const { capturedByRed, capturedByBlack } = useMemo(() => {
    const byRed: string[] = []
    const byBlack: string[] = []
    for (const record of moveHistory) {
      if (record.move.captured) {
        const char = PIECE_CHARS[record.move.captured.color][record.move.captured.type]
        if (record.move.piece.color === 'red') byRed.push(char)
        else byBlack.push(char)
      }
    }
    return { capturedByRed: byRed, capturedByBlack: byBlack }
  }, [moveHistory])

  // 执行一步棋
  const executeMove = useCallback((move: Move, newBoard: Board) => {
    if (move.captured) playCaptureSound()
    else playMoveSound()

    const notation = generateNotation(move)
    const record: MoveRecord = { move, notation }

    setBoard(newBoard)
    setLastMove({ from: move.from, to: move.to })
    setMoveHistory((prev) => [...prev, record])
    setBoardHistory((prev) => [...prev, newBoard])
    setSelectedPos(null)

    const nextTurn: PieceColor = move.piece.color === 'red' ? 'black' : 'red'

    // 检测将军与将死
    if (isCheckmate(newBoard, nextTurn)) {
      setWinner(move.piece.color)
      setCurrentTurn(nextTurn)
    } else {
      if (isInCheck(newBoard, nextTurn)) {
        setInCheck(nextTurn)
      } else {
        setInCheck(null)
      }
      setCurrentTurn(nextTurn)
    }
  }, [])

  // 处理格子点击
  const handleCellClick = useCallback(
    (pos: Position) => {
      if (winner || isAIThinking || currentTurn !== 'red') return

      const piece = board[pos.row][pos.col]

      if (selectedPos) {
        // 尝试移动
        const fromPiece = board[selectedPos.row][selectedPos.col]
        if (fromPiece && fromPiece.color === 'red') {
          const legalMoves = getLegalMoves(board, selectedPos)
          const isLegal = legalMoves.some((m) => m.row === pos.row && m.col === pos.col)

          if (isLegal) {
            const move: Move = {
              from: selectedPos,
              to: pos,
              piece: fromPiece,
              captured: board[pos.row][pos.col],
            }
            const newBoard = applyMove(board, move)
            executeMove(move, newBoard)
            return
          }
        }

        // 重新选择棋子
        if (piece && piece.color === 'red') {
          setSelectedPos(pos)
          return
        }
        setSelectedPos(null)
      } else {
        if (piece && piece.color === 'red') {
          setSelectedPos(pos)
        }
      }
    },
    [board, selectedPos, winner, isAIThinking, currentTurn, executeMove],
  )

  // AI回合
  useEffect(() => {
    if (currentTurn !== 'black' || winner || isAIThinking) return

    setIsAIThinking(true)
    const delay = difficulty === 'advanced' ? 600 : 300

    const timer = setTimeout(() => {
      const aiMove = getAIMove(board, 'black', difficulty)
      if (aiMove) {
        const newBoard = applyMove(board, aiMove)
        executeMove(aiMove, newBoard)
      }
      setIsAIThinking(false)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [currentTurn, board, winner, difficulty, executeMove])

  // 悔棋（撤销最近两步：玩家+AI）
  const handleUndo = useCallback(() => {
    if (moveHistory.length < 2 || isAIThinking) return
    const newHistory = moveHistory.slice(0, -2)
    const newBoardHistory = boardHistory.slice(0, -2)
    const prevBoard = newBoardHistory[newBoardHistory.length - 1]

    setBoard(prevBoard)
    setMoveHistory(newHistory)
    setBoardHistory(newBoardHistory)
    setCurrentTurn('red')
    setSelectedPos(null)
    setWinner(null)
    setInCheck(null)
    const lastMoveRecord = newHistory[newHistory.length - 1]
    setLastMove(
      lastMoveRecord ? { from: lastMoveRecord.move.from, to: lastMoveRecord.move.to } : null,
    )
  }, [moveHistory, boardHistory, isAIThinking])

  // 新游戏
  const handleNewGame = useCallback(() => {
    const initial = createInitialBoard()
    setBoard(initial)
    setSelectedPos(null)
    setCurrentTurn('red')
    setMoveHistory([])
    setBoardHistory([initial])
    setLastMove(null)
    setWinner(null)
    setInCheck(null)
    setIsAIThinking(false)
  }, [])

  return (
    <div className="flex flex-col items-center gap-4 w-full min-h-screen p-4 md:p-6">
      {/* 标题 */}
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-widest">象棋对弈</h1>
        <p className="text-muted-foreground text-sm mt-1 tracking-wider">人机对弈 · 红方先行</p>
      </header>

      {/* 将军提示 */}
      {inCheck && !winner && (
        <div
          className={cn(
            'px-6 py-2 rounded-full font-bold text-sm animate-pulse border',
            inCheck === 'red'
              ? 'bg-piece-red/20 text-piece-red border-piece-red/40'
              : 'bg-secondary border-border text-foreground',
          )}
        >
          {inCheck === 'red' ? '红方被将军！' : '黑方被将军！'}
        </div>
      )}

      {/* 主游戏区域 */}
      <main className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full max-w-5xl">
        {/* 黑方标识 */}
        <div className="hidden lg:block w-64" />

        {/* 棋盘容器 */}
        <div className="flex flex-col items-center gap-2">
          {/* 黑方标识（移动端） */}
          <div className="flex items-center gap-2 lg:hidden">
            <span
              className={cn(
                'w-3 h-3 rounded-full bg-foreground',
                currentTurn === 'black' && !winner ? 'ring-2 ring-accent ring-offset-1' : '',
              )}
            />
            <span
              className={cn(
                'text-sm font-bold',
                currentTurn === 'black' ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              黑方（AI）
              {isAIThinking && <span className="ml-1 text-xs animate-pulse">思考中...</span>}
            </span>
          </div>

          {/* 棋盘 */}
          <ChessBoard
            board={board}
            selectedPos={selectedPos}
            lastMove={lastMove}
            currentTurn={currentTurn}
            onCellClick={handleCellClick}
            isAIThinking={isAIThinking}
            playerColor="red"
          />

          {/* 红方标识（移动端） */}
          <div className="flex items-center gap-2 lg:hidden">
            <span
              className={cn(
                'w-3 h-3 rounded-full bg-piece-red',
                currentTurn === 'red' && !winner ? 'ring-2 ring-accent ring-offset-1' : '',
              )}
            />
            <span
              className={cn(
                'text-sm font-bold',
                currentTurn === 'red' ? 'text-piece-red' : 'text-muted-foreground',
              )}
            >
              红方（您）
            </span>
          </div>
        </div>

        {/* 侧边栏 */}
        <aside className="w-full lg:w-64 lg:min-h-150 flex flex-col">
          {/* 玩家标识（桌面端） */}
          <div className="hidden lg:flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-3 h-3 rounded-full bg-foreground shrink-0',
                  currentTurn === 'black' && !winner ? 'ring-2 ring-accent ring-offset-1' : '',
                )}
              />
              <span
                className={cn(
                  'text-sm font-bold',
                  currentTurn === 'black' ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                黑方（AI）
                {isAIThinking && (
                  <span className="ml-1 text-xs animate-pulse text-muted-foreground">
                    思考中...
                  </span>
                )}
              </span>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-2 mt-auto">
              <span
                className={cn(
                  'w-3 h-3 rounded-full bg-piece-red shrink-0',
                  currentTurn === 'red' && !winner ? 'ring-2 ring-accent ring-offset-1' : '',
                )}
              />
              <span
                className={cn(
                  'text-sm font-bold',
                  currentTurn === 'red' ? 'text-piece-red' : 'text-muted-foreground',
                )}
              >
                红方（您）
              </span>
            </div>
          </div>

          <GameSidebar
            moveHistory={moveHistory}
            currentTurn={currentTurn}
            isAIThinking={isAIThinking}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onUndo={handleUndo}
            onNewGame={handleNewGame}
            capturedByRed={capturedByRed}
            capturedByBlack={capturedByBlack}
          />
        </aside>
      </main>

      {/* 胜负弹窗 */}
      <WinModal winner={winner} onPlayAgain={handleNewGame} />
    </div>
  )
}
