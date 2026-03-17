import { SnakeGame } from '@/components/snake-game'
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations('snake')
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight">
          <span className="text-primary">{t('title')}</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm font-mono">{t('desc')}</p>
      </header>

      <SnakeGame />

      <footer className="mt-12 text-center text-xs text-muted-foreground font-mono">
        <p>{t('footer')}</p>
      </footer>
    </main>
  )
}
