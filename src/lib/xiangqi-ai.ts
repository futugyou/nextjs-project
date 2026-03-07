// 中国象棋AI引擎

import {
  Board,
  Move,
  PieceColor,
  PieceType,
  PIECE_VALUES,
  getAllLegalMoves,
  applyMove,
  isInCheck,
  isCheckmate,
} from './xiangqi'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

// 棋子位置价值表（鼓励好的棋子位置）
const POSITION_BONUS: Partial<Record<PieceType, number[][]>> = {
  soldier: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [2, 4, 8, 16, 20, 16, 8, 4, 2],
    [2, 4, 8, 16, 20, 16, 8, 4, 2],
    [0, 0, 6, 12, 16, 12, 6, 0, 0],
    [0, 0, 3, 6, 8, 6, 3, 0, 0],
    [0, 0, 0, 2, 4, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  horse: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [2, 4, 6, 8, 10, 8, 6, 4, 2],
    [4, 6, 8, 10, 12, 10, 8, 6, 4],
    [4, 8, 10, 12, 14, 12, 10, 8, 4],
    [4, 8, 10, 12, 14, 12, 10, 8, 4],
    [4, 6, 8, 10, 12, 10, 8, 6, 4],
    [2, 4, 6, 8, 10, 8, 6, 4, 2],
    [0, 2, 4, 6, 8, 6, 4, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  cannon: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 6, 6, 6, 2, 0, 0],
    [4, 0, 8, 6, 10, 6, 8, 0, 4],
    [0, 0, 0, 2, 4, 2, 0, 0, 0],
    [0, 0, 4, 0, 4, 0, 4, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 4, 0, 4, 0, 4, 0, 0],
    [0, 0, 0, 2, 4, 2, 0, 0, 0],
    [4, 0, 8, 6, 10, 6, 8, 0, 4],
    [0, 0, 2, 6, 6, 6, 2, 0, 0],
  ],
}

// 评估棋盘局面（正值有利于红方）
function evaluateBoard(board: Board): number {
  let score = 0

  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c]
      if (!piece) continue

      const value = PIECE_VALUES[piece.type]
      const posBonus = POSITION_BONUS[piece.type]
      let bonus = 0

      if (posBonus) {
        if (piece.color === 'red') {
          bonus = posBonus[r][c]
        } else {
          // 黑方的位置表是红方的镜像
          bonus = posBonus[9 - r][8 - c]
        }
      }

      const total = value + bonus
      if (piece.color === 'red') {
        score += total
      } else {
        score -= total
      }
    }
  }

  // 将军奖励
  if (isInCheck(board, 'black')) score += 50
  if (isInCheck(board, 'red')) score -= 50

  // 将死奖励
  if (isCheckmate(board, 'black')) score += 100000
  if (isCheckmate(board, 'red')) score -= 100000

  return score
}

// Minimax + Alpha-Beta剪枝
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
): number {
  if (depth === 0) return evaluateBoard(board)

  const color: PieceColor = isMaximizing ? 'red' : 'black'
  const moves = getAllLegalMoves(board, color)

  if (moves.length === 0) {
    // 无合法移动 = 被将死
    return isMaximizing ? -100000 : 100000
  }

  if (isMaximizing) {
    let maxScore = -Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const score = minimax(newBoard, depth - 1, alpha, beta, false)
      maxScore = Math.max(maxScore, score)
      alpha = Math.max(alpha, score)
      if (beta <= alpha) break // Alpha-Beta剪枝
    }
    return maxScore
  } else {
    let minScore = Infinity
    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const score = minimax(newBoard, depth - 1, alpha, beta, true)
      minScore = Math.min(minScore, score)
      beta = Math.min(beta, score)
      if (beta <= alpha) break
    }
    return minScore
  }
}

// 获取AI移动
export function getAIMove(board: Board, color: PieceColor, difficulty: Difficulty): Move | null {
  const moves = getAllLegalMoves(board, color)
  if (moves.length === 0) return null

  if (difficulty === 'beginner') {
    // 初级：随机移动
    return moves[Math.floor(Math.random() * moves.length)]
  }

  if (difficulty === 'intermediate') {
    // 中级：评估1步，选最佳移动
    const isMaximizing = color === 'red'
    let bestMove = moves[0]
    let bestScore = isMaximizing ? -Infinity : Infinity

    for (const move of moves) {
      const newBoard = applyMove(board, move)
      const score = evaluateBoard(newBoard)
      if (isMaximizing ? score > bestScore : score < bestScore) {
        bestScore = score
        bestMove = move
      }
    }
    return bestMove
  }

  // 高级：Minimax深度3
  const isMaximizing = color === 'red'
  let bestMove = moves[0]
  let bestScore = isMaximizing ? -Infinity : Infinity

  for (const move of moves) {
    const newBoard = applyMove(board, move)
    const score = minimax(newBoard, 2, -Infinity, Infinity, !isMaximizing)
    if (isMaximizing ? score > bestScore : score < bestScore) {
      bestScore = score
      bestMove = move
    }
  }
  return bestMove
}
