export interface Game {
  name: string
  slug: string
  icon: string
  nameKey: string
  descriptionKey: string
}

export const GAMES: Game[] = [
  {
    name: 'snake',
    slug: 'snake',
    icon: '🐍',
    nameKey: 'snake',
    descriptionKey: 'snake_desc',
  },
  {
    slug: 'gomoku',
    name: 'gomoku',
    icon: '⚪',
    nameKey: 'gomoku',
    descriptionKey: 'gomoku_desc',
  },
  {
    slug: '2048',
    name: '2048',
    icon: '🔢',
    nameKey: '2048',
    descriptionKey: '2048_desc',
  },
  {
    slug: 'minesweeper',
    name: 'minesweeper',
    icon: '💣',
    nameKey: 'minesweeper',
    descriptionKey: 'minesweeper_desc',
  },
  {
    slug: 'tetris',
    name: 'tetris',
    icon: '🧩',
    nameKey: 'tetris',
    descriptionKey: 'tetris_desc',
  },
  {
    slug: 'wordle',
    name: 'wordle',
    icon: '🔤',
    nameKey: 'wordle',
    descriptionKey: 'wordle_desc',
  },
  {
    slug: 'memory',
    name: 'memory',
    icon: '🧠',
    nameKey: 'memory',
    descriptionKey: 'memory_desc',
  },
  {
    slug: 'othello',
    name: 'othello',
    icon: '⚫',
    nameKey: 'othello',
    descriptionKey: 'othello_desc',
  },
  {
    slug: 'xiangqi',
    name: 'xiangqi',
    icon: '🐎',
    nameKey: 'xiangqi',
    descriptionKey: 'xiangqi_desc',
  },
  {
    slug: 'klotski',
    name: 'klotski',
    icon: '🏃',
    nameKey: 'klotski',
    descriptionKey: 'klotski_desc',
  },
]
