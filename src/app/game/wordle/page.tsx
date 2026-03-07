'use client'

import { useState, useEffect, useCallback } from 'react'

const WORDS = [
  'APPLE',
  'BEACH',
  'CHAIR',
  'DANCE',
  'EAGLE',
  'FLAME',
  'GRAPE',
  'HOUSE',
  'JUICE',
  'KNIFE',
  'LEMON',
  'MANGO',
  'NIGHT',
  'OCEAN',
  'PIANO',
  'QUEEN',
  'RIVER',
  'STORM',
  'TIGER',
  'ULTRA',
  'VIVID',
  'WHALE',
  'ZEBRA',
  'BRAIN',
  'CLOUD',
  'DREAM',
  'EARTH',
  'FROST',
  'GHOST',
  'HEART',
  'IMAGE',
  'JOKER',
  'KAYAK',
  'LIGHT',
  'MAGIC',
  'NOBLE',
  'ORBIT',
  'PEARL',
  'QUEST',
  'ROYAL',
  'SHINE',
  'TOAST',
  'UNITY',
  'VOICE',
  'WORLD',
  'YOUTH',
  'BLAZE',
  'CRANE',
  'DRIFT',
  'EMBER',
]

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
]

type TileState = 'empty' | 'tbd' | 'correct' | 'present' | 'absent'
type KeyState = 'unused' | 'correct' | 'present' | 'absent'

interface TileData {
  letter: string
  state: TileState
  revealed: boolean
}

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState('')
  const [guesses, setGuesses] = useState<TileData[][]>(
    Array(6)
      .fill(null)
      .map(() =>
        Array(5)
          .fill(null)
          .map(() => ({ letter: '', state: 'empty' as TileState, revealed: false })),
      ),
  )
  const [currentRow, setCurrentRow] = useState(0)
  const [currentTile, setCurrentTile] = useState(0)
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({})
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [shake, setShake] = useState(false)
  const [message, setMessage] = useState('')

  // Initialize game
  useEffect(() => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)])
  }, [])

  const showMessage = useCallback((msg: string, duration = 1500) => {
    setMessage(msg)
    setTimeout(() => setMessage(''), duration)
  }, [])

  const handleKeyPress = useCallback(
    (key: string) => {
      if (gameOver) return

      if (key === 'ENTER') {
        if (currentTile !== 5) {
          setShake(true)
          setTimeout(() => setShake(false), 500)
          showMessage('字母不足')
          return
        }

        const currentGuess = guesses[currentRow].map((t) => t.letter).join('')

        // Check the guess
        const newGuesses = [...guesses]
        const targetLetters = targetWord.split('')
        const guessLetters = currentGuess.split('')
        const newKeyStates = { ...keyStates }

        // First pass: mark correct letters
        const letterCounts: Record<string, number> = {}
        targetLetters.forEach((l) => {
          letterCounts[l] = (letterCounts[l] || 0) + 1
        })

        // Mark correct first
        guessLetters.forEach((letter, i) => {
          if (letter === targetLetters[i]) {
            newGuesses[currentRow][i].state = 'correct'
            letterCounts[letter]--
            newKeyStates[letter] = 'correct'
          }
        })

        // Then mark present/absent
        guessLetters.forEach((letter, i) => {
          if (newGuesses[currentRow][i].state !== 'correct') {
            if (letterCounts[letter] > 0) {
              newGuesses[currentRow][i].state = 'present'
              letterCounts[letter]--
              if (newKeyStates[letter] !== 'correct') {
                newKeyStates[letter] = 'present'
              }
            } else {
              newGuesses[currentRow][i].state = 'absent'
              if (!newKeyStates[letter]) {
                newKeyStates[letter] = 'absent'
              }
            }
          }
        })

        // Reveal tiles with animation
        newGuesses[currentRow].forEach((tile, i) => {
          setTimeout(() => {
            setGuesses((prev) => {
              const updated = [...prev]
              updated[currentRow][i] = { ...updated[currentRow][i], revealed: true }
              return updated
            })
          }, i * 300)
        })

        setGuesses(newGuesses)
        setKeyStates(newKeyStates)

        // Check win/loss after animations
        setTimeout(
          () => {
            if (currentGuess === targetWord) {
              setGameWon(true)
              setGameOver(true)
              setShowModal(true)
            } else if (currentRow === 5) {
              setGameOver(true)
              setShowModal(true)
            } else {
              setCurrentRow((prev) => prev + 1)
              setCurrentTile(0)
            }
          },
          5 * 300 + 300,
        )
      } else if (key === '⌫' || key === 'BACKSPACE') {
        if (currentTile > 0) {
          const newGuesses = [...guesses]
          newGuesses[currentRow][currentTile - 1] = { letter: '', state: 'empty', revealed: false }
          setGuesses(newGuesses)
          setCurrentTile((prev) => prev - 1)
        }
      } else if (key.length === 1 && key.match(/[A-Z]/i)) {
        if (currentTile < 5) {
          const newGuesses = [...guesses]
          newGuesses[currentRow][currentTile] = {
            letter: key.toUpperCase(),
            state: 'tbd',
            revealed: false,
          }
          setGuesses(newGuesses)
          setCurrentTile((prev) => prev + 1)
        }
      }
    },
    [currentRow, currentTile, gameOver, guesses, keyStates, showMessage, targetWord],
  )

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return

      if (e.key === 'Enter') {
        handleKeyPress('ENTER')
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE')
      } else if (e.key.match(/^[a-zA-Z]$/)) {
        handleKeyPress(e.key.toUpperCase())
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyPress])

  const resetGame = () => {
    setTargetWord(WORDS[Math.floor(Math.random() * WORDS.length)])
    setGuesses(
      Array(6)
        .fill(null)
        .map(() =>
          Array(5)
            .fill(null)
            .map(() => ({ letter: '', state: 'empty' as TileState, revealed: false })),
        ),
    )
    setCurrentRow(0)
    setCurrentTile(0)
    setKeyStates({})
    setGameOver(false)
    setGameWon(false)
    setShowModal(false)
  }

  const shareResult = () => {
    const emojiGrid = guesses
      .slice(0, gameWon ? currentRow + 1 : 6)
      .filter((row) => row[0].state !== 'empty' && row[0].state !== 'tbd')
      .map((row) =>
        row
          .map((tile) => {
            if (tile.state === 'correct') return '🟩'
            if (tile.state === 'present') return '🟨'
            return '⬛'
          })
          .join(''),
      )
      .join('\n')

    const result = `Wordle ${gameWon ? currentRow + 1 : 'X'}/6\n\n${emojiGrid}`

    if (navigator.share) {
      navigator.share({ text: result })
    } else {
      navigator.clipboard.writeText(result)
      showMessage('已复制到剪贴板！')
    }
  }

  const getTileClasses = (tile: TileData, rowIndex: number) => {
    const baseClasses =
      'w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-bold uppercase border-2 select-none'

    if (!tile.revealed) {
      if (tile.letter) {
        return `${baseClasses} border-muted-foreground/50 bg-background text-foreground`
      }
      return `${baseClasses} border-muted-foreground/30 bg-background`
    }

    const stateClasses = {
      correct: 'bg-green-500 border-green-500 text-white',
      present: 'bg-yellow-500 border-yellow-500 text-white',
      absent: 'bg-muted border-muted text-muted-foreground',
      empty: 'border-muted-foreground/30 bg-background',
      tbd: 'border-muted-foreground/50 bg-background text-foreground',
    }

    return `${baseClasses} ${stateClasses[tile.state]}`
  }

  const getKeyClasses = (key: string) => {
    const baseClasses =
      'flex items-center justify-center font-semibold rounded transition-colors select-none'
    const sizeClasses =
      key.length > 1
        ? 'px-2 sm:px-4 h-14 text-xs sm:text-sm min-w-[50px] sm:min-w-[65px]'
        : 'w-8 sm:w-10 h-14 text-sm sm:text-base'

    const state = keyStates[key]
    const stateClasses = {
      correct: 'bg-green-500 text-white hover:bg-green-600',
      present: 'bg-yellow-500 text-white hover:bg-yellow-600',
      absent: 'bg-muted text-muted-foreground hover:bg-muted/80',
      unused: 'bg-muted-foreground/20 text-foreground hover:bg-muted-foreground/30',
    }

    return `${baseClasses} ${sizeClasses} ${stateClasses[state || 'unused']}`
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-4 px-2">
      {/* Header */}
      <header className="w-full max-w-lg border-b border-border pb-3 mb-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-center tracking-wider text-foreground">
          WORDLE
        </h1>
      </header>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-20 bg-foreground text-background px-6 py-3 rounded-lg font-semibold z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {message}
        </div>
      )}

      {/* Game Board */}
      <div className="flex flex-col gap-1.5 mb-6">
        {guesses.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-1.5 ${shake && rowIndex === currentRow ? 'animate-shake' : ''}`}
            style={{
              animation: shake && rowIndex === currentRow ? 'shake 0.5s ease-in-out' : undefined,
            }}
          >
            {row.map((tile, tileIndex) => (
              <div
                key={tileIndex}
                className={getTileClasses(tile, rowIndex)}
                style={{
                  transform: tile.revealed ? 'rotateX(0deg)' : 'rotateX(0deg)',
                  animation: tile.revealed
                    ? `flip 0.5s ease-in-out`
                    : tile.letter && !tile.revealed
                      ? 'pop 0.1s ease-in-out'
                      : undefined,
                  animationDelay: tile.revealed ? `${tileIndex * 0.3}s` : '0s',
                  animationFillMode: 'forwards',
                }}
              >
                {tile.letter}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Virtual Keyboard */}
      <div className="flex flex-col gap-1.5 w-full max-w-lg px-1">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => (
              <button key={key} onClick={() => handleKeyPress(key)} className={getKeyClasses(key)}>
                {key}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Win/Loss Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-xl p-6 sm:p-8 mx-4 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-bold text-center mb-4 text-foreground">
              {gameWon ? '🎉 恭喜！' : '😔 游戏结束'}
            </h2>

            {gameWon ? (
              <p className="text-center text-muted-foreground mb-6">
                你在 <span className="font-bold text-foreground">{currentRow + 1}</span>{' '}
                次尝试中猜出了单词！
              </p>
            ) : (
              <p className="text-center text-muted-foreground mb-6">
                正确答案是 <span className="font-bold text-foreground">{targetWord}</span>
              </p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-5 gap-1 mb-6">
              {guesses
                .slice(0, gameWon ? currentRow + 1 : 6)
                .filter((row) => row[0].state !== 'empty' && row[0].state !== 'tbd')
                .map((row, rowIdx) => (
                  <div key={rowIdx} className="contents">
                    {row.map((tile, idx) => (
                      <div
                        key={idx}
                        className={`w-8 h-8 rounded ${
                          tile.state === 'correct'
                            ? 'bg-green-500'
                            : tile.state === 'present'
                              ? 'bg-yellow-500'
                              : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={shareResult}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                分享结果
              </button>
              <button
                onClick={resetGame}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                再玩一次
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes flip {
          0% {
            transform: rotateX(0deg);
          }
          50% {
            transform: rotateX(90deg);
          }
          100% {
            transform: rotateX(0deg);
          }
        }

        @keyframes pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-4px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(4px);
          }
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
