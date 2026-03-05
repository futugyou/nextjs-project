import GomokuGame from '@/components/gomoku-game'

export default function Page() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight">
          <span className="text-primary">GOMOKU</span> GAME
        </h1>
      </header>

      <GomokuGame />
    </main>
  )
}
