'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GAMES } from '@/lib/games'
import { useGameStorage } from '@/hook/use-game-record'
import ExitGameHandler from '@/components/ExitGameHandler'
import { useTranslations } from 'next-intl'

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { allStats } = useGameStorage()
  const t = useTranslations('gamelayout')

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <ExitGameHandler></ExitGameHandler>
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/game" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">
              G
            </div>
            <h2 className="text-xl font-bold bg-linear-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {t('title')}
            </h2>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
            {t('dashboard')}
          </p>
          <Link
            href="/game/records"
            className={`flex items-center px-3 py-2.5 rounded-xl transition-all mb-6 ${
              pathname === '/game/records'
                ? 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="mr-3 text-lg">📊</span>
            <span className="font-semibold text-sm">{t('statistics')}</span>
          </Link>

          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">
            {t('game_library')}
          </p>

          {GAMES.map((game) => {
            const href = `/game/${game.slug}`
            const isActive = pathname === href
            const bestScore = allStats[game.slug]?.bestRecord?.score

            return (
              <Link
                key={game.slug}
                href={href}
                className={`
                  group flex items-center px-3 py-2.5 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200 translate-x-1'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
                  }
                `}
              >
                <span
                  className={`mr-3 text-lg transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                >
                  {game.icon}
                </span>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm leading-none">{t(game.nameKey)}</span>
                  {bestScore !== undefined && !isActive && (
                    <span className="text-[10px] opacity-50 mt-1">
                      {t('best')}: {bestScore}
                    </span>
                  )}
                </div>

                {isActive ? (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full opacity-80" />
                ) : (
                  <svg
                    className="ml-auto w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 space-y-3">
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
            <p className="text-[10px] text-blue-500 font-bold uppercase">{t('total_played')}</p>
            <p className="text-lg font-bold text-blue-700">
              {Object.values(allStats).reduce((acc, curr) => acc + curr.history.length, 0)}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 text-white text-xs">
            <p className="font-bold mb-1 opacity-90">{t('protip')}:</p>
            <p className="opacity-70 leading-relaxed">{t('tip')}</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto p-10">{children}</div>
      </main>
    </div>
  )
}
