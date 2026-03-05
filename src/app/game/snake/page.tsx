import { SnakeGame } from '@/components/snake-game'

export default function Page() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight">
          <span className="text-primary">SNAKE</span> GAME
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-mono">
          Eat food, grow longer, don&apos;t hit the walls!
        </p>
      </header>

      <SnakeGame />

      <footer className="mt-12 text-center text-xs text-muted-foreground font-mono">
        <p>Speed increases every 50 points</p>
      </footer>
    </main>
  )
}
