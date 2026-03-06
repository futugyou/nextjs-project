'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function GameLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const games = [
    { name: 'Snake', slug: 'snake', icon: '🐍' },
    { name: 'Gomoku', slug: 'gomoku', icon: '⚪' },
    { name: '2048', slug: '2048', icon: '🔢' },
    { name: 'Minesweeper', slug: 'minesweeper', icon: '💣' },
  ]

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm sticky top-0 h-screen">
        <div className="p-6">
          <Link href="/" className="group flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:rotate-12 transition-transform">
              G
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              Arcade Hub
            </h2>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">
            Game Library
          </p>

          {games.map((game) => {
            const href = `/game/${game.slug}`
            const isActive = pathname === href

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
                <span className="font-semibold text-sm">{game.name}</span>

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

        <div className="p-4 mt-auto">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white text-xs">
            <p className="font-bold mb-1 opacity-90">Pro Tip:</p>
            <p className="opacity-70 leading-relaxed">按下 ESC 键可以快速退出当前游戏。</p>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-10">{children}</div>
      </main>
    </div>
  )
}
