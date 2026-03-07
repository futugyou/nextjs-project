// 中国象棋核心逻辑

export type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'chariot' | 'cannon' | 'soldier'
export type PieceColor = 'red' | 'black'

export interface Piece {
  type: PieceType
  color: PieceColor
  id: string
}

export type Board = (Piece | null)[][]

export interface Position {
  row: number
  col: number
}

export interface Move {
  from: Position
  to: Position
  piece: Piece
  captured: Piece | null
}

export interface MoveRecord {
  move: Move
  notation: string
}

// 棋子中文符号
export const PIECE_CHARS: Record<PieceColor, Record<PieceType, string>> = {
  red: {
    king: '帅',
    advisor: '仕',
    elephant: '相',
    horse: '馬',
    chariot: '車',
    cannon: '炮',
    soldier: '兵',
  },
  black: {
    king: '将',
    advisor: '士',
    elephant: '象',
    horse: '馬',
    chariot: '車',
    cannon: '砲',
    soldier: '卒',
  },
}

// 棋子价值（用于AI评估）
export const PIECE_VALUES: Record<PieceType, number> = {
  king: 10000,
  chariot: 900,
  cannon: 450,
  horse: 400,
  elephant: 200,
  advisor: 200,
  soldier: 100,
}

// 初始棋盘布局
export function createInitialBoard(): Board {
  const board: Board = Array(10)
    .fill(null)
    .map(() => Array(9).fill(null))

  // 黑方棋子（上方，row 0-4）
  const blackBack: PieceType[] = [
    'chariot',
    'horse',
    'elephant',
    'advisor',
    'king',
    'advisor',
    'elephant',
    'horse',
    'chariot',
  ]
  blackBack.forEach((type, col) => {
    board[0][col] = { type, color: 'black', id: `black-${type}-${col}` }
  })
  board[2][1] = { type: 'cannon', color: 'black', id: 'black-cannon-1' }
  board[2][7] = { type: 'cannon', color: 'black', id: 'black-cannon-7' }
  ;[0, 2, 4, 6, 8].forEach((col, i) => {
    board[3][col] = { type: 'soldier', color: 'black', id: `black-soldier-${i}` }
  })

  // 红方棋子（下方，row 5-9）
  const redBack: PieceType[] = [
    'chariot',
    'horse',
    'elephant',
    'advisor',
    'king',
    'advisor',
    'elephant',
    'horse',
    'chariot',
  ]
  redBack.forEach((type, col) => {
    board[9][col] = { type, color: 'red', id: `red-${type}-${col}` }
  })
  board[7][1] = { type: 'cannon', color: 'red', id: 'red-cannon-1' }
  board[7][7] = { type: 'cannon', color: 'red', id: 'red-cannon-7' }
  ;[0, 2, 4, 6, 8].forEach((col, i) => {
    board[6][col] = { type: 'soldier', color: 'red', id: `red-soldier-${i}` }
  })

  return board
}

// 判断位置是否在棋盘内
export function inBounds(row: number, col: number): boolean {
  return row >= 0 && row <= 9 && col >= 0 && col <= 8
}

// 判断位置是否在宫格内（将/帅、士/仕）
export function inPalace(row: number, col: number, color: PieceColor): boolean {
  const cols = col >= 3 && col <= 5
  if (color === 'red') return cols && row >= 7 && row <= 9
  return cols && row >= 0 && row <= 2
}

// 判断是否过河
export function hasCrossedRiver(row: number, color: PieceColor): boolean {
  if (color === 'red') return row <= 4
  return row >= 5
}

// 计算某棋子的所有合法移动（不考虑将军检测）
export function getRawMoves(board: Board, pos: Position): Position[] {
  const piece = board[pos.row][pos.col]
  if (!piece) return []

  const { row, col } = pos
  const moves: Position[] = []

  const addIfValid = (r: number, c: number) => {
    if (!inBounds(r, c)) return
    const target = board[r][c]
    if (!target || target.color !== piece.color) moves.push({ row: r, col: c })
  }

  switch (piece.type) {
    case 'king': {
      // 只能在宫格内移动，上下左右
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]
      for (const [dr, dc] of dirs) {
        const nr = row + dr,
          nc = col + dc
        if (inPalace(nr, nc, piece.color)) addIfValid(nr, nc)
      }
      break
    }
    case 'advisor': {
      const dirs = [
        [1, 1],
        [1, -1],
        [-1, 1],
        [-1, -1],
      ]
      for (const [dr, dc] of dirs) {
        const nr = row + dr,
          nc = col + dc
        if (inPalace(nr, nc, piece.color)) addIfValid(nr, nc)
      }
      break
    }
    case 'elephant': {
      // 象走田字，不能过河，检查塞象眼
      const dirs = [
        [2, 2],
        [2, -2],
        [-2, 2],
        [-2, -2],
      ]
      for (const [dr, dc] of dirs) {
        const nr = row + dr,
          nc = col + dc
        if (!inBounds(nr, nc)) continue
        // 不能过河
        if (piece.color === 'red' && nr <= 4) continue
        if (piece.color === 'black' && nr >= 5) continue
        // 检查塞象眼（中间格子不能有棋子）
        const blockR = row + dr / 2,
          blockC = col + dc / 2
        if (board[blockR][blockC] !== null) continue
        addIfValid(nr, nc)
      }
      break
    }
    case 'horse': {
      // 马走日，检查蹩马腿
      const horseMoves: [number, number, number, number][] = [
        [-2, -1, -1, 0],
        [-2, 1, -1, 0],
        [2, -1, 1, 0],
        [2, 1, 1, 0],
        [-1, -2, 0, -1],
        [-1, 2, 0, 1],
        [1, -2, 0, -1],
        [1, 2, 0, 1],
      ]
      for (const [dr, dc, br, bc] of horseMoves) {
        const nr = row + dr,
          nc = col + dc
        if (!inBounds(nr, nc)) continue
        // 检查蹩马腿
        if (board[row + br][col + bc] !== null) continue
        addIfValid(nr, nc)
      }
      break
    }
    case 'chariot': {
      // 车走直线，不能越过棋子
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]
      for (const [dr, dc] of dirs) {
        let nr = row + dr,
          nc = col + dc
        while (inBounds(nr, nc)) {
          const target = board[nr][nc]
          if (target) {
            if (target.color !== piece.color) moves.push({ row: nr, col: nc })
            break
          }
          moves.push({ row: nr, col: nc })
          nr += dr
          nc += dc
        }
      }
      break
    }
    case 'cannon': {
      // 炮：移动同车，吃子须跳过一个棋子
      const dirs = [
        [0, 1],
        [0, -1],
        [1, 0],
        [-1, 0],
      ]
      for (const [dr, dc] of dirs) {
        let nr = row + dr,
          nc = col + dc
        let jumped = false
        while (inBounds(nr, nc)) {
          const target = board[nr][nc]
          if (!jumped) {
            if (target) {
              jumped = true
            } else {
              moves.push({ row: nr, col: nc })
            }
          } else {
            if (target) {
              if (target.color !== piece.color) moves.push({ row: nr, col: nc })
              break
            }
          }
          nr += dr
          nc += dc
        }
      }
      break
    }
    case 'soldier': {
      // 兵：未过河只能前进，过河后可左右
      if (piece.color === 'red') {
        // 红兵向上（row减小）
        if (inBounds(row - 1, col)) addIfValid(row - 1, col)
        if (hasCrossedRiver(row, 'red')) {
          if (inBounds(row, col - 1)) addIfValid(row, col - 1)
          if (inBounds(row, col + 1)) addIfValid(row, col + 1)
        }
      } else {
        // 黑卒向下（row增大）
        if (inBounds(row + 1, col)) addIfValid(row + 1, col)
        if (hasCrossedRiver(row, 'black')) {
          if (inBounds(row, col - 1)) addIfValid(row, col - 1)
          if (inBounds(row, col + 1)) addIfValid(row, col + 1)
        }
      }
      break
    }
  }

  return moves
}

// 克隆棋盘
export function cloneBoard(board: Board): Board {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)))
}

// 执行移动（返回新棋盘）
export function applyMove(board: Board, move: Move): Board {
  const newBoard = cloneBoard(board)
  newBoard[move.to.row][move.to.col] = newBoard[move.from.row][move.from.col]
  newBoard[move.from.row][move.from.col] = null
  return newBoard
}

// 找到将/帅的位置
export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c]
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row: r, col: c }
      }
    }
  }
  return null
}

// 检查将帅是否"对脸"（中间无任何棋子）
export function kingsAreFacing(board: Board): boolean {
  const redKing = findKing(board, 'red')
  const blackKing = findKing(board, 'black')
  if (!redKing || !blackKing) return false
  if (redKing.col !== blackKing.col) return false
  const minRow = Math.min(redKing.row, blackKing.row)
  const maxRow = Math.max(redKing.row, blackKing.row)
  for (let r = minRow + 1; r < maxRow; r++) {
    if (board[r][redKing.col] !== null) return false
  }
  return true
}

// 判断某颜色是否被将军
export function isInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color)
  if (!kingPos) return true
  const opponent: PieceColor = color === 'red' ? 'black' : 'red'
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c]
      if (piece && piece.color === opponent) {
        const moves = getRawMoves(board, { row: r, col: c })
        if (moves.some((m) => m.row === kingPos.row && m.col === kingPos.col)) {
          return true
        }
      }
    }
  }
  return kingsAreFacing(board)
}

// 获取某棋子的合法移动（过滤掉会导致将军的移动）
export function getLegalMoves(board: Board, pos: Position): Position[] {
  const piece = board[pos.row][pos.col]
  if (!piece) return []
  const rawMoves = getRawMoves(board, pos)
  return rawMoves.filter((to) => {
    const move: Move = { from: pos, to, piece, captured: board[to.row][to.col] }
    const newBoard = applyMove(board, move)
    return !isInCheck(newBoard, piece.color)
  })
}

// 获取某颜色的所有合法移动
export function getAllLegalMoves(board: Board, color: PieceColor): Move[] {
  const moves: Move[] = []
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 9; c++) {
      const piece = board[r][c]
      if (piece && piece.color === color) {
        const legalMoves = getLegalMoves(board, { row: r, col: c })
        legalMoves.forEach((to) => {
          moves.push({ from: { row: r, col: c }, to, piece, captured: board[to.row][to.col] })
        })
      }
    }
  }
  return moves
}

// 检查某颜色是否被将死（无合法移动）
export function isCheckmate(board: Board, color: PieceColor): boolean {
  return getAllLegalMoves(board, color).length === 0
}

// 生成棋谱记录文字
export function generateNotation(move: Move): string {
  const pieceChar = PIECE_CHARS[move.piece.color][move.piece.type]
  const cols =
    move.piece.color === 'red'
      ? ['一', '二', '三', '四', '五', '六', '七', '八', '九']
      : ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  const fromCol = cols[move.from.col]
  const toCol = cols[move.to.col]
  const rowDiff = move.to.row - move.from.row
  let direction = ''
  if (rowDiff === 0) direction = '平'
  else if (move.piece.color === 'red') direction = rowDiff < 0 ? '进' : '退'
  else direction = rowDiff > 0 ? '进' : '退'
  const steps = Math.abs(rowDiff) || Math.abs(move.to.col - move.from.col)
  const stepChar = rowDiff === 0 ? cols[move.to.col] : String(steps)
  return `${pieceChar}${fromCol}${direction}${stepChar}`
}
