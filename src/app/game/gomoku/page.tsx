import GomokuGame from '@/components/gomoku-game'
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations('gomoku')
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-foreground font-mono tracking-tight">
          <span className="text-primary">{t('title')}</span>
        </h1>
      </header>

      <GomokuGame />
    </main>
  )
}
