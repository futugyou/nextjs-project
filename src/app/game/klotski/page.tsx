'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, ChevronDown, Trophy, Footprints } from 'lucide-react'
import { useGameStorage } from '@/hook/use-game-record'
import { useTranslations } from 'next-intl'

// ─── 类型定义 ────────────────────────────────────────────────────────────────

type PieceType = 'caocao' | 'general-h' | 'general-v' | 'soldier'

interface Piece {
  id: number
  type: PieceType
  col: number // 左上角列 (0-based)
  row: number // 左上角行 (0-based)
  w: number // 宽(格)
  h: number // 高(格)
}

interface Level {
  name: string
  description: string
  pieces: Omit<Piece, 'id'>[]
}

// ─── 关卡配置 ─────────────────────────────────────────────────────────────────
// 棋盘 4列(0-3) x 5行(0-4)，曹操2x2需到达 col=1,row=3 (底部中间出口)

const LEVELS: Level[] = [
  {
    name: 'level1',
    description: 'level1_desc',
    pieces: [
      { type: 'caocao', col: 1, row: 0, w: 2, h: 2 },
      { type: 'general-v', col: 0, row: 0, w: 1, h: 2 },
      { type: 'general-v', col: 3, row: 0, w: 1, h: 2 },
      { type: 'general-v', col: 0, row: 2, w: 1, h: 2 },
      { type: 'general-v', col: 3, row: 2, w: 1, h: 2 },
      { type: 'soldier', col: 1, row: 2, w: 1, h: 1 },
      { type: 'soldier', col: 2, row: 2, w: 1, h: 1 },
      { type: 'soldier', col: 1, row: 3, w: 1, h: 1 },
      { type: 'soldier', col: 2, row: 3, w: 1, h: 1 },
    ],
  },
  {
    name: 'level2',
    description: 'level2_desc',
    pieces: [
      { type: 'caocao', col: 1, row: 0, w: 2, h: 2 },
      { type: 'general-v', col: 0, row: 0, w: 1, h: 2 },
      { type: 'general-v', col: 3, row: 0, w: 1, h: 2 },
      { type: 'general-v', col: 0, row: 2, w: 1, h: 2 },
      { type: 'general-v', col: 3, row: 2, w: 1, h: 2 },
      { type: 'general-h', col: 1, row: 2, w: 2, h: 1 },
      { type: 'soldier', col: 1, row: 3, w: 1, h: 1 },
      { type: 'soldier', col: 2, row: 3, w: 1, h: 1 },
      { type: 'soldier', col: 0, row: 4, w: 1, h: 1 },
      { type: 'soldier', col: 3, row: 4, w: 1, h: 1 },
    ],
  },
  {
    name: 'level3',
    description: 'level3_desc',
    pieces: [
      { type: 'caocao', col: 1, row: 0, w: 2, h: 2 },
      { type: 'general-h', col: 1, row: 2, w: 2, h: 1 },
      { type: 'general-h', col: 1, row: 3, w: 2, h: 1 },
      { type: 'general-v', col: 0, row: 0, w: 1, h: 2 },
      { type: 'general-v', col: 3, row: 0, w: 1, h: 2 },
      { type: 'general-v', col: 0, row: 3, w: 1, h: 2 },
      { type: 'soldier', col: 1, row: 4, w: 1, h: 1 },
      { type: 'soldier', col: 2, row: 4, w: 1, h: 1 },
      { type: 'soldier', col: 3, row: 2, w: 1, h: 1 },
      { type: 'soldier', col: 3, row: 3, w: 1, h: 1 },
    ],
  },
]

const COLS = 4
const ROWS = 5

// ─── 主题配置（内联样式） ─────────────────────────────────────────────────────

const THEME = {
  // 背景色
  background: 'oklch(0.22 0.04 55)', // 深棕木色
  boardBg: 'oklch(0.36 0.06 54)',
  boardGrid: 'oklch(0.32 0.05 52)',
  woodFrame: 'oklch(0.28 0.07 48)',

  // 前景色
  foreground: 'oklch(0.95 0.03 70)', // 暖米白
  textMuted: 'oklch(0.70 0.04 60)',

  // 主色调
  primary: 'oklch(0.62 0.14 42)', // 琥珀金
  primaryFore: 'oklch(0.15 0.03 50)',

  // 棋子颜色 (嵌入light+shadow)
  caocaoBg: 'oklch(0.62 0.20 32)', // 朱红
  caocaoBorder: 'oklch(0.42 0.15 30)',
  caocaoLight: 'oklch(0.75 0.18 40)',
  caocaoDark: 'oklch(0.38 0.16 28)',

  generalVBg: 'oklch(0.58 0.13 45)', // 琥珀
  generalVBorder: 'oklch(0.40 0.10 42)',
  generalVLight: 'oklch(0.72 0.12 52)',
  generalVDark: 'oklch(0.36 0.10 40)',

  generalHBg: 'oklch(0.56 0.12 48)',
  generalHBorder: 'oklch(0.38 0.09 46)',
  generalHLight: 'oklch(0.70 0.11 55)',
  generalHDark: 'oklch(0.34 0.09 44)',

  soldierBg: 'oklch(0.44 0.07 58)', // 橄榄棕
  soldierBorder: 'oklch(0.30 0.05 55)',
  soldierLight: 'oklch(0.60 0.06 65)',
  soldierDark: 'oklch(0.28 0.05 52)',
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────────

function buildGrid(pieces: Piece[]): (number | null)[][] {
  const grid: (number | null)[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(null))
  for (const p of pieces) {
    for (let r = p.row; r < p.row + p.h; r++) {
      for (let c = p.col; c < p.col + p.w; c++) {
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) grid[r][c] = p.id
      }
    }
  }
  return grid
}

function canMove(piece: Piece, dr: number, dc: number, pieces: Piece[]): boolean {
  const nr = piece.row + dr
  const nc = piece.col + dc
  if (nr < 0 || nc < 0 || nr + piece.h > ROWS || nc + piece.w > COLS) return false
  const grid = buildGrid(pieces)
  // 清除当前棋子占据的格子
  for (let r = piece.row; r < piece.row + piece.h; r++)
    for (let c = piece.col; c < piece.col + piece.w; c++) grid[r][c] = null
  // 检查目标位置是否空闲
  for (let r = nr; r < nr + piece.h; r++)
    for (let c = nc; c < nc + piece.w; c++) if (grid[r][c] !== null) return false
  return true
}

function initPieces(levelIdx: number): Piece[] {
  return LEVELS[levelIdx].pieces.map((p, i) => ({ ...p, id: i }))
}

function checkWin(pieces: Piece[]): boolean {
  const caocao = pieces.find((p) => p.type === 'caocao')
  return caocao?.col === 1 && caocao?.row === 3
}

// ─── 棋子样式配置 ─────────────────────────────────────────────────────────────

const PIECE_STYLES: Record<
  PieceType,
  { bg: string; border: string; shadowInset: string; label: string }
> = {
  caocao: {
    bg: THEME.caocaoBg,
    border: THEME.caocaoBorder,
    shadowInset: `inset 0 2px 4px ${THEME.caocaoLight}, inset 0 -2px 4px ${THEME.caocaoDark}`,
    label: '曹操',
  },
  'general-v': {
    bg: THEME.generalVBg,
    border: THEME.generalVBorder,
    shadowInset: `inset 0 2px 3px ${THEME.generalVLight}, inset 0 -2px 3px ${THEME.generalVDark}`,
    label: '将',
  },
  'general-h': {
    bg: THEME.generalHBg,
    border: THEME.generalHBorder,
    shadowInset: `inset 0 2px 3px ${THEME.generalHLight}, inset 0 -2px 3px ${THEME.generalHDark}`,
    label: '将',
  },
  soldier: {
    bg: THEME.soldierBg,
    border: THEME.soldierBorder,
    shadowInset: `inset 0 1px 2px ${THEME.soldierLight}, inset 0 -1px 2px ${THEME.soldierDark}`,
    label: '兵',
  },
}

// ─── 主组件 ───────────────────────────────────────────────────────────────────

export default function KlotskiGame() {
  const t = useTranslations('klotski')
  const { saveRecord, currentGameData } = useGameStorage('klotski')
  const [levelIdx, setLevelIdx] = useState(0)
  const [pieces, setPieces] = useState<Piece[]>(() => initPieces(0))
  const [selected, setSelected] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [won, setWon] = useState(false)
  const [showLevelMenu, setShowLevelMenu] = useState(false)
  const [animating, setAnimating] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const [startTime, setStartTime] = useState<number | null>(null)
  const hasSaved = useRef(false)
  // 关闭下拉菜单
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowLevelMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const reset = useCallback(() => {
    setPieces(initPieces(levelIdx))
    setSelected(null)
    setMoves(0)
    setWon(false)
    setStartTime(null)
    hasSaved.current = false
  }, [levelIdx])

  const selectLevel = useCallback((idx: number) => {
    setLevelIdx(idx)
    setPieces(initPieces(idx))
    setSelected(null)
    setMoves(0)
    setWon(false)
    setShowLevelMenu(false)
    setStartTime(null)
    hasSaved.current = false
  }, [])

  const calculateScore = (moves: number, duration: number) => {
    const difficultyMultiplier = (levelIdx + 1) * 1000
    return Math.floor(
      difficultyMultiplier / (Math.log10(moves + 1) + Math.log10(duration + 1) * 0.5),
    )
  }

  const movePiece = useCallback(
    (pieceId: number, dr: number, dc: number) => {
      if (animating || won) return

      if (startTime === null) setStartTime(Date.now())

      setPieces((prev) => {
        const piece = prev.find((p) => p.id === pieceId)
        if (!piece || !canMove(piece, dr, dc, prev)) return prev
        const updated = prev.map((p) =>
          p.id === pieceId ? { ...p, row: p.row + dr, col: p.col + dc } : p,
        )
        if (checkWin(updated)) {
          setTimeout(() => setWon(true), 350)
        }
        return updated
      })
      setMoves((m) => m + 1)
      setSelected(null)
    },
    [animating, won, startTime],
  )

  useEffect(() => {
    if (won && !hasSaved.current) {
      const endTime = Date.now()
      const duration = startTime ? Math.floor((endTime - startTime) / 1000) : 0
      const score = calculateScore(moves, duration)

      saveRecord(score, duration, true)
      hasSaved.current = true
    }
  }, [won, moves, startTime, saveRecord])

  const handlePieceClick = useCallback(
    (pieceId: number) => {
      if (won) return
      if (selected === pieceId) {
        setSelected(null)
        return
      }
      setSelected(pieceId)
    },
    [selected, won],
  )

  // 键盘控制
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (selected === null) return
      const dirMap: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
        w: [-1, 0],
        s: [1, 0],
        a: [0, -1],
        d: [0, 1],
      }
      const dir = dirMap[e.key]
      if (dir) {
        e.preventDefault()
        movePiece(selected, dir[0], dir[1])
      }
      if (e.key === 'Escape') setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, movePiece])

  const selectedPiece = pieces.find((p) => p.id === selected) ?? null

  // 计算选中棋子的可移动方向
  const moveDirs = selectedPiece
    ? (['up', 'down', 'left', 'right'] as const).filter((d) => {
        const delta: Record<string, [number, number]> = {
          up: [-1, 0],
          down: [1, 0],
          left: [0, -1],
          right: [0, 1],
        }
        const [dr, dc] = delta[d]
        return canMove(selectedPiece, dr, dc, pieces)
      })
    : []

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.background,
        fontFamily: 'sans-serif',
        padding: '32px 16px',
        userSelect: 'none',
      }}
    >
      {/* 标题 */}
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            letterSpacing: '0.25em',
            color: THEME.primary,
            marginBottom: '4px',
            fontFamily: 'serif',
            textShadow: `0 2px 8px oklch(0.15 0.05 45 / 0.6)`,
          }}
        >
          {t('title')}
        </h1>
        <p style={{ color: THEME.textMuted, fontSize: '14px', letterSpacing: '0.05em' }}>
          {t('sub_title')}
        </p>
        {currentGameData?.bestRecord && (
          <p style={{ color: THEME.primary, fontSize: '12px', marginTop: '4px' }}>
            {t('best_record', {
              score: currentGameData.bestRecord.score,
              duration: currentGameData.bestRecord.duration,
            })}{' '}
          </p>
        )}
      </header>

      {/* 控制栏 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          width: '100%',
          maxWidth: '320px',
        }}
      >
        {/* 关卡选择 */}
        <div style={{ position: 'relative', flex: 1 }} ref={menuRef}>
          <button
            onClick={() => setShowLevelMenu((v) => !v)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '4px',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#ffffff',
              border: `1px solid #e5e7eb`,
              color: '#1f2937',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            <span>{t(LEVELS[levelIdx].name)}</span>
            <ChevronDown className="w-4 h-4" style={{ color: THEME.textMuted }} />
          </button>
          <AnimatePresence>
            {showLevelMenu && (
              <motion.div
                initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                exit={{ opacity: 0, y: -6, scaleY: 0.9 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  zIndex: 50,
                  borderRadius: '6px',
                  border: `1px solid #e5e7eb`,
                  backgroundColor: '#ffffff',
                  overflow: 'hidden',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  transformOrigin: 'top',
                }}
              >
                {LEVELS.map((lv, i) => (
                  <button
                    key={i}
                    onClick={() => selectLevel(i)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '10px 12px',
                      fontSize: '14px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: i === levelIdx ? THEME.primary : '#1f2937',
                      fontWeight: i === levelIdx ? '600' : '400',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <div style={{ fontWeight: '500' }}>{t(lv.name)}</div>
                    <div style={{ fontSize: '12px', color: THEME.textMuted }}>
                      {t(lv.description)}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 步数 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            border: `1px solid #e5e7eb`,
            minWidth: '72px',
          }}
        >
          <Footprints className="w-4 h-4" style={{ color: THEME.primary }} />
          <span
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1f2937',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {moves}
          </span>
        </div>

        {/* 重置 */}
        <button
          onClick={reset}
          style={{
            padding: '8px',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            border: `1px solid #e5e7eb`,
            color: THEME.textMuted,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = THEME.primary
            e.currentTarget.style.borderColor = THEME.primary
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = THEME.textMuted
            e.currentTarget.style.borderColor = '#e5e7eb'
          }}
          title={t('reset')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 棋盘 */}
      <Board
        pieces={pieces}
        selected={selected}
        moveDirs={moveDirs}
        onPieceClick={handlePieceClick}
        onMove={(dr, dc) => selected !== null && movePiece(selected, dr, dc)}
      />

      {/* 操作提示 */}
      <p
        style={{ marginTop: '16px', fontSize: '12px', color: THEME.textMuted, textAlign: 'center' }}
      >
        {selected !== null ? t('tip') : t('tip1')}
      </p>

      {/* 胜利弹窗 */}
      <AnimatePresence>
        {won && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 50,
              padding: '16px',
            }}
            onClick={reset}
          >
            <motion.div
              initial={{ scale: 0.7, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{
                backgroundColor: '#ffffff',
                border: `2px solid ${THEME.primary}`,
                borderRadius: '12px',
                padding: '32px',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxWidth: '320px',
                width: '100%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy
                style={{
                  width: '48px',
                  height: '48px',
                  color: THEME.primary,
                  margin: '0 auto 12px',
                }}
              />
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: THEME.primary,
                  marginBottom: '4px',
                  fontFamily: 'serif',
                }}
              >
                {t('result')}
              </h2>
              <p style={{ color: THEME.textMuted, fontSize: '14px', marginBottom: '4px' }}>
                {t('level')}：{t(LEVELS[levelIdx].name)}
              </p>
              <p style={{ color: '#1f2937', fontWeight: '500', marginBottom: '24px' }}>
                {t.rich('result_desc', {
                  count: moves,
                  kbd: (chunks) => (
                    <span style={{ color: THEME.primary, fontSize: '20px', fontWeight: 'bold' }}>
                      {chunks}
                    </span>
                  ),
                })}
              </p>
              <button
                onClick={reset}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: THEME.primary,
                  color: THEME.primaryFore,
                  fontWeight: '600',
                  fontSize: '14px',
                  letterSpacing: '0.05em',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: '8px',
                  transition: 'opacity 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {t('again')}
              </button>
              <button
                onClick={() => {
                  selectLevel((levelIdx + 1) % LEVELS.length)
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#f3f4f6',
                  color: '#1f2937',
                  fontWeight: '500',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#e5e7eb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#f3f4f6')}
              >
                {t('next')}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

// ─── 棋盘组件 ─────────────────────────────────────────────────────────────────

interface BoardProps {
  pieces: Piece[]
  selected: number | null
  moveDirs: string[]
  onPieceClick: (id: number) => void
  onMove: (dr: number, dc: number) => void
}

function Board({ pieces, selected, moveDirs, onPieceClick, onMove }: BoardProps) {
  const t = useTranslations('klotski')
  const CELL = 72

  const boardW = COLS * CELL
  const boardH = ROWS * CELL

  const selectedPiece = pieces.find((p) => p.id === selected)

  // 方向箭头配置
  const arrowConfig = [
    {
      dir: 'up',
      dr: -1,
      dc: 0,
      style: {
        left: selectedPiece ? selectedPiece.col * CELL + (selectedPiece.w * CELL) / 2 - 16 : 0,
        top: selectedPiece ? selectedPiece.row * CELL - 36 : 0,
      },
    },
    {
      dir: 'down',
      dr: 1,
      dc: 0,
      style: {
        left: selectedPiece ? selectedPiece.col * CELL + (selectedPiece.w * CELL) / 2 - 16 : 0,
        top: selectedPiece ? (selectedPiece.row + selectedPiece.h) * CELL + 4 : 0,
      },
    },
    {
      dir: 'left',
      dr: 0,
      dc: -1,
      style: {
        left: selectedPiece ? selectedPiece.col * CELL - 36 : 0,
        top: selectedPiece ? selectedPiece.row * CELL + (selectedPiece.h * CELL) / 2 - 16 : 0,
      },
    },
    {
      dir: 'right',
      dr: 0,
      dc: 1,
      style: {
        left: selectedPiece ? (selectedPiece.col + selectedPiece.w) * CELL + 4 : 0,
        top: selectedPiece ? selectedPiece.row * CELL + (selectedPiece.h * CELL) / 2 - 16 : 0,
      },
    },
  ]

  return (
    <div style={{ position: 'relative', width: boardW + 16, height: boardH + 20 }}>
      {/* 木框外壳 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '8px',
          background: THEME.woodFrame,
          boxShadow: `0 8px 32px oklch(0.10 0.04 45 / 0.7), inset 0 1px 0 oklch(0.48 0.08 55)`,
        }}
      />

      {/* 棋盘内区域 */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: 8,
          width: boardW,
          height: boardH,
          background: `repeating-linear-gradient(${THEME.boardGrid} 0px, ${THEME.boardGrid} 1px, transparent 1px, transparent 72px), repeating-linear-gradient(90deg, ${THEME.boardGrid} 0px, ${THEME.boardGrid} 1px, transparent 1px, transparent 72px), ${THEME.boardBg}`,
          borderRadius: 4,
        }}
      >
        {/* 出口标记 */}
        <div
          style={{
            position: 'absolute',
            left: CELL,
            bottom: 0,
            width: CELL * 2,
            height: 4,
            background: THEME.caocaoBg,
            borderRadius: '2px 2px 0 0',
            boxShadow: `0 0 8px ${THEME.caocaoBg}bb`,
          }}
        />

        {/* 棋子 */}
        {pieces.map((piece) => (
          <PieceTile
            key={piece.id}
            piece={piece}
            cellSize={CELL}
            isSelected={piece.id === selected}
            onClick={() => onPieceClick(piece.id)}
          />
        ))}

        {/* 方向箭头 */}
        <AnimatePresence>
          {selected !== null &&
            selectedPiece &&
            arrowConfig.map(({ dir, dr, dc, style }) =>
              moveDirs.includes(dir) ? (
                <motion.button
                  key={dir}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => onMove(dr, dc)}
                  style={{
                    position: 'absolute',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20,
                    borderRadius: '50%',
                    backgroundColor: `${THEME.primary}e6`,
                    color: THEME.primaryFore,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.1s',
                    ...style,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = THEME.primary
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `${THEME.primary}e6`
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
                  aria-label={t('move', { dir: t(dir) })}
                >
                  <ArrowIcon dir={dir as 'up' | 'down' | 'left' | 'right'} />
                </motion.button>
              ) : null,
            )}
        </AnimatePresence>
      </div>

      {/* 底部出口文字 */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '12px',
          color: THEME.primary,
          fontWeight: '600',
          letterSpacing: '0.1em',
          bottom: 0,
          opacity: 0.8,
        }}
      >
        {t('exit')}
      </div>
    </div>
  )
}

// ─── 棋子组件 ─────────────────────────────────────────────────────────────────

interface PieceTileProps {
  piece: Piece
  cellSize: number
  isSelected: boolean
  onClick: () => void
}

function PieceTile({ piece, cellSize, isSelected, onClick }: PieceTileProps) {
  const GAP = 4
  const style_ = PIECE_STYLES[piece.type]

  const x = piece.col * cellSize + GAP / 2
  const y = piece.row * cellSize + GAP / 2
  const w = piece.w * cellSize - GAP
  const h = piece.h * cellSize - GAP

  return (
    <motion.button
      layout
      layoutId={`piece-${piece.id}`}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onClick={onClick}
      style={{
        position: 'absolute',
        borderRadius: '6px',
        border: `2px solid ${style_.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: style_.bg,
        boxShadow: style_.shadowInset,
        transition: 'box-shadow 0.2s, border-color 0.2s',
        left: x,
        top: y,
        width: w,
        height: h,
      }}
      whileHover={{ filter: isSelected ? 'brightness(1)' : 'brightness(1.1)' }}
      whileTap={{ scale: 0.97 }}
      aria-label={`${style_.label} 棋子`}
      aria-pressed={isSelected}
      onFocus={(e) => {
        if (isSelected) {
          e.currentTarget.style.boxShadow = `${style_.shadowInset}, 0 0 0 3px ${THEME.primary}`
          e.currentTarget.style.borderColor = THEME.primary
        }
      }}
      onBlur={(e) => {
        e.currentTarget.style.boxShadow = style_.shadowInset
        e.currentTarget.style.borderColor = style_.border
      }}
    >
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '6px',
            border: `2px solid ${THEME.primary}`,
            opacity: 0.3,
            pointerEvents: 'none',
          }}
        />
      )}
      <PieceLabel piece={piece} cellSize={cellSize} />
    </motion.button>
  )
}

function PieceLabel({ piece, cellSize }: { piece: Piece; cellSize: number }) {
  const style_ = PIECE_STYLES[piece.type]
  const isBig = piece.type === 'caocao'
  const isSoldier = piece.type === 'soldier'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2px',
        pointerEvents: 'none',
      }}
    >
      {isBig ? (
        <>
          <span
            style={{
              fontWeight: 'bold',
              color: THEME.foreground,
              opacity: 0.9,
              lineHeight: 1,
              fontSize: cellSize * 0.38,
              fontFamily: 'serif',
              textShadow: '0 1px 3px oklch(0.10 0.05 40 / 0.5)',
            }}
          >
            曹操
          </span>
          {/* 装饰纹 */}
          <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  backgroundColor: THEME.foreground,
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        </>
      ) : (
        <span
          style={{
            fontWeight: '600',
            color: THEME.foreground,
            opacity: 0.85,
            lineHeight: 1,
            fontSize: isSoldier ? cellSize * 0.3 : cellSize * 0.28,
            fontFamily: 'serif',
            textShadow: '0 1px 2px oklch(0.10 0.05 40 / 0.4)',
          }}
        >
          {style_.label}
        </span>
      )}
    </div>
  )
}

// ─── 箭头图标 ─────────────────────────────────────────────────────────────────

function ArrowIcon({ dir }: { dir: 'up' | 'down' | 'left' | 'right' }) {
  const paths: Record<string, string> = {
    up: 'M12 19V5m0 0l-5 5m5-5l5 5',
    down: 'M12 5v14m0 0l5-5m-5 5l-5-5',
    left: 'M19 12H5m0 0l5-5m-5 5l5 5',
    right: 'M5 12h14m0 0l-5-5m5 5l-5 5',
  }
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={2.5}
      stroke="currentColor"
      style={{ width: 16, height: 16 }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d={paths[dir]} />
    </svg>
  )
}
