import { useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { GameStats } from '@/hook/use-game-record'
import { Game } from '@/lib/games'
import { Download, Share2 } from 'lucide-react'
import { toPng } from 'html-to-image'

const GAME_THEMES: Record<string, string> = {
  tetris: 'from-blue-600 via-blue-500 to-indigo-600',
  snake: 'from-emerald-600 via-green-500 to-teal-600',
  'memory-card': 'from-purple-600 via-pink-500 to-rose-500',
  sudoku: 'from-amber-500 via-orange-500 to-red-600',
  default: 'from-slate-700 via-slate-600 to-slate-800',
}

export const SharePoster = ({ game, stats }: { game: Game; stats: GameStats }) => {
  const posterRef = useRef<HTMLDivElement>(null)
  const themeClass = GAME_THEMES[game.slug] || GAME_THEMES.default

  const handleDownload = async () => {
    if (!posterRef.current) return
    const dataUrl = await toPng(posterRef.current, {
      quality: 1,
      pixelRatio: 2,
    })
    const link = document.createElement('a')
    link.download = `${game.name}-成就海报.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all">
          <Share2 size={16} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-100 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-90 z-101 focus:outline-none">
          <VisuallyHidden.Root>
            <Dialog.Title>{game.name} 战绩分享海报</Dialog.Title>
            <Dialog.Description>展示你在该游戏中的最高分和统计数据</Dialog.Description>
          </VisuallyHidden.Root>

          <div
            ref={posterRef}
            className={`relative aspect-3/4.5 w-full overflow-hidden rounded-4xl bg-linear-to-br ${themeClass} p-8 text-white shadow-2xl`}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: `url("data:image/svg+xml,...")` }}
            />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs tracking-widest opacity-80 uppercase">
                  Achievement
                </span>
                <div className="h-2 w-2 rounded-full bg-white animate-pulse" />
              </div>

              <div className="mt-12 text-center">
                <div className="text-6xl mb-4 inline-block drop-shadow-2xl">{game.icon}</div>
                <h2 className="text-2xl font-black tracking-tight uppercase">{game.name}</h2>
              </div>

              <div className="mt-auto mb-10 text-center">
                <p className="text-[10px] uppercase tracking-[0.2em] opacity-70 mb-2">
                  Personal Best
                </p>
                <div className="text-7xl font-black italic tracking-tighter drop-shadow-md">
                  {stats.bestRecord?.score || 0}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-6 text-center">
                <div>
                  <p className="text-[9px] opacity-60 uppercase mb-1">Total Played</p>
                  <p className="text-lg font-bold">{stats.history.length}</p>
                </div>
                <div>
                  <p className="text-[9px] opacity-60 uppercase mb-1">Rank</p>
                  <p className="text-lg font-bold">传说级别</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-transform"
            >
              <Download size={20} /> 保存精美海报
            </button>
            <Dialog.Close asChild>
              <button className="mx-auto text-white/60 text-sm hover:text-white transition-colors">
                暂不分享，返回页面
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
