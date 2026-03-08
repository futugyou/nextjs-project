export interface Game {
  name: string
  slug: string
  icon: string
  description: string
}

export const GAMES: Game[] = [
  {
    name: 'Snake',
    slug: 'snake',
    icon: '🐍',
    description: 'A classic retro game that will challenge your reflexes.',
  },
  {
    name: 'Gomoku',
    slug: 'gomoku',
    icon: '⚪',
    description: 'Strategy game, the player who connects five in a row wins.',
  },
  {
    name: '2048',
    slug: '2048',
    icon: '🔢',
    description: 'Slide the tiles and try to create a tile with the number 2048.',
  },
  {
    name: 'Minesweeper',
    slug: 'minesweeper',
    icon: '💣',
    description: 'Uncover all the safe squares without detonating any mines.',
  },
  {
    name: 'Tetris',
    slug: 'tetris',
    icon: '🧩',
    description: 'A classic puzzle game where you stack falling blocks.',
  },
  {
    name: 'Wordle',
    slug: 'wordle',
    icon: '🔤',
    description: 'A word guessing game where you have six attempts to guess a five-letter word.',
  },
  {
    name: 'Memory Match',
    slug: 'memory',
    icon: '🧠',
    description: 'A matching game where you need to find pairs of identical cards.',
  },
  {
    name: 'Othello',
    slug: 'othello',
    icon: '⚫',
    description: 'A strategy game where players take turns placing discs on a board.',
  },
  {
    name: 'Chinese Chess',
    slug: 'xiangqi',
    icon: '🐎',
    description: 'A traditional Chinese strategy game played on a grid.',
  },
  {
    name: 'Klotski',
    slug: 'klotski',
    icon: '🏃',
    description: 'A sliding block puzzle game where you need to move blocks to create a path.',
  },
]
