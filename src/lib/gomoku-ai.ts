// Gomoku AI with multiple difficulty levels

export type CellValue = 0 | 1 | 2 // 0=empty, 1=black, 2=white
export type Board = CellValue[][]
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

const BOARD_SIZE = 15

const DIRECTIONS = [
  [1, 0], // horizontal
  [0, 1], // vertical
  [1, 1], // diagonal
  [1, -1], // anti-diagonal
]

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE
}

// Score patterns for evaluation
function countConsecutive(
  board: Board,
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: CellValue,
): { count: number; openEnds: number } {
  let count = 1
  let openEnds = 0

  // Forward
  let r = row + dr
  let c = col + dc
  while (inBounds(r, c) && board[r][c] === player) {
    count++
    r += dr
    c += dc
  }
  if (inBounds(r, c) && board[r][c] === 0) openEnds++

  // Backward
  r = row - dr
  c = col - dc
  while (inBounds(r, c) && board[r][c] === player) {
    count++
    r -= dr
    c -= dc
  }
  if (inBounds(r, c) && board[r][c] === 0) openEnds++

  return { count, openEnds }
}

function evaluatePosition(board: Board, row: number, col: number, player: CellValue): number {
  let score = 0
  for (const [dr, dc] of DIRECTIONS) {
    const { count, openEnds } = countConsecutive(board, row, col, dr, dc, player)
    if (count >= 5) score += 100000
    else if (count === 4 && openEnds === 2) score += 10000
    else if (count === 4 && openEnds === 1) score += 1000
    else if (count === 3 && openEnds === 2) score += 1000
    else if (count === 3 && openEnds === 1) score += 100
    else if (count === 2 && openEnds === 2) score += 100
    else if (count === 2 && openEnds === 1) score += 10
    else if (count === 1 && openEnds === 2) score += 5
  }
  return score
}

function getCandidateMoves(board: Board): [number, number][] {
  const candidates = new Set<string>()
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] !== 0) {
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr
            const nc = c + dc
            if (inBounds(nr, nc) && board[nr][nc] === 0) {
              candidates.add(`${nr},${nc}`)
            }
          }
        }
      }
    }
  }
  if (candidates.size === 0) {
    return [[7, 7]]
  }
  return Array.from(candidates).map((s) => {
    const [r, c] = s.split(',').map(Number)
    return [r, c] as [number, number]
  })
}

export function checkWinner(board: Board, row: number, col: number): CellValue {
  const player = board[row][col]
  if (player === 0) return 0

  for (const [dr, dc] of DIRECTIONS) {
    let count = 1
    let r = row + dr
    let c = col + dc
    while (inBounds(r, c) && board[r][c] === player) {
      count++
      r += dr
      c += dc
    }
    r = row - dr
    c = col - dc
    while (inBounds(r, c) && board[r][c] === player) {
      count++
      r -= dr
      c -= dc
    }
    if (count >= 5) return player
  }
  return 0
}

export function getWinningLine(board: Board, row: number, col: number): [number, number][] | null {
  const player = board[row][col]
  if (player === 0) return null

  for (const [dr, dc] of DIRECTIONS) {
    const line: [number, number][] = [[row, col]]
    let r = row + dr
    let c = col + dc
    while (inBounds(r, c) && board[r][c] === player) {
      line.push([r, c])
      r += dr
      c += dc
    }
    r = row - dr
    c = col - dc
    while (inBounds(r, c) && board[r][c] === player) {
      line.push([r, c])
      r -= dr
      c -= dc
    }
    if (line.length >= 5) return line
  }
  return null
}

export function isBoardFull(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== 0))
}

export function getAIMove(
  board: Board,
  aiPlayer: CellValue,
  difficulty: Difficulty,
): [number, number] {
  const humanPlayer: CellValue = aiPlayer === 1 ? 2 : 1
  const candidates = getCandidateMoves(board)

  if (difficulty === 'beginner') {
    // 50% chance of random move, otherwise basic evaluation
    if (Math.random() < 0.35) {
      return candidates[Math.floor(Math.random() * candidates.length)]
    }
    return basicEval(board, candidates, aiPlayer, humanPlayer)
  }

  if (difficulty === 'intermediate') {
    // Smart evaluation with occasional mistakes
    if (Math.random() < 0.1) {
      return candidates[Math.floor(Math.random() * Math.min(5, candidates.length))]
    }
    return smartEval(board, candidates, aiPlayer, humanPlayer)
  }

  // Advanced: full minimax-style evaluation
  return smartEval(board, candidates, aiPlayer, humanPlayer, true)
}

function basicEval(
  board: Board,
  candidates: [number, number][],
  aiPlayer: CellValue,
  humanPlayer: CellValue,
): [number, number] {
  let bestScore = -1
  let bestMove = candidates[0]

  for (const [r, c] of candidates) {
    board[r][c] = aiPlayer
    const attackScore = evaluatePosition(board, r, c, aiPlayer)
    board[r][c] = 0

    board[r][c] = humanPlayer
    const defendScore = evaluatePosition(board, r, c, humanPlayer)
    board[r][c] = 0

    const totalScore = attackScore + defendScore * 0.9
    if (totalScore > bestScore) {
      bestScore = totalScore
      bestMove = [r, c]
    }
  }

  return bestMove
}

function smartEval(
  board: Board,
  candidates: [number, number][],
  aiPlayer: CellValue,
  humanPlayer: CellValue,
  aggressive: boolean = false,
): [number, number] {
  let bestScore = -1
  let bestMove = candidates[0]

  // First check for immediate wins
  for (const [r, c] of candidates) {
    board[r][c] = aiPlayer
    if (checkWinner(board, r, c) === aiPlayer) {
      board[r][c] = 0
      return [r, c]
    }
    board[r][c] = 0
  }

  // Block immediate opponent wins
  for (const [r, c] of candidates) {
    board[r][c] = humanPlayer
    if (checkWinner(board, r, c) === humanPlayer) {
      board[r][c] = 0
      return [r, c]
    }
    board[r][c] = 0
  }

  const attackWeight = aggressive ? 1.2 : 1.0
  const defendWeight = aggressive ? 1.0 : 1.1

  for (const [r, c] of candidates) {
    board[r][c] = aiPlayer
    const attackScore = evaluatePosition(board, r, c, aiPlayer)
    board[r][c] = 0

    board[r][c] = humanPlayer
    const defendScore = evaluatePosition(board, r, c, humanPlayer)
    board[r][c] = 0

    // Center bonus
    const centerBonus = 7 - Math.abs(r - 7) + (7 - Math.abs(c - 7))

    const totalScore = attackScore * attackWeight + defendScore * defendWeight + centerBonus * 2

    if (totalScore > bestScore) {
      bestScore = totalScore
      bestMove = [r, c]
    }
  }

  return bestMove
}

export function createEmptyBoard(): Board {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => 0 as CellValue),
  )
}
