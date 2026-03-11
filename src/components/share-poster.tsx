import { useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { GameStats } from '@/hook/use-game-record'
import { Game } from '@/lib/games'
import { Download, Share2 } from 'lucide-react'
import { toPng } from 'html-to-image'
import { formatDuration, getRelativeTime } from '@/lib/utils'

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
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-95 z-101 focus:outline-none">
          <VisuallyHidden.Root>
            <Dialog.Title>{game.name} 战绩分享海报</Dialog.Title>
            <Dialog.Description>展示你在该游戏中的最高分和统计数据</Dialog.Description>
          </VisuallyHidden.Root>

          <div
            ref={posterRef}
            className={`relative aspect-9/16 w-full overflow-hidden rounded-[40px] bg-linear-to-b ${themeClass} p-8 text-white shadow-2xl flex flex-col`}
          >
            <div className="relative z-10 flex justify-between items-start mb-8">
              <div>
                <div className="text-4xl mb-2">{game.icon}</div>
                <h2 className="text-xl font-black tracking-tight uppercase">{game.name}</h2>
                <p className="text-[10px] opacity-60 font-mono tracking-widest">PERSONAL REPORT</p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded text-[9px] border border-white/20">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="relative z-10 text-center mb-8 py-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] opacity-60 mb-2">
                Highest Score
              </p>
              <div className="text-6xl font-black italic tracking-tighter drop-shadow-lg leading-none">
                {stats.bestRecord?.score || 0}
              </div>
            </div>

            <div className="relative z-10 flex-1 flex flex-col min-h-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-white/20"></div>
                <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                  Recent Battles
                </span>
                <div className="h-px flex-1 bg-white/20"></div>
              </div>

              <div className="space-y-3 overflow-hidden">
                {stats.history.slice(0, 6).map((r, idx) => (
                  <div
                    key={r.id}
                    className="group/item flex items-center justify-between bg-black/10 rounded-2xl p-3 border border-white/5 hover:bg-black/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${r.completed ? 'bg-white/20' : 'bg-black/20 opacity-50'}`}
                      >
                        {r.completed ? '🏆' : '💥'}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold leading-none">
                          {r.completed ? 'SUCCESS' : 'FAILED'}
                        </p>
                        <p className="text-[9px] opacity-40 mt-1 uppercase">
                          {getRelativeTime(r.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black leading-none">{r.score}</p>
                      <p className="text-[9px] opacity-40 mt-1">{formatDuration(r.duration)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-6 border-t border-white/10 flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-[10px] font-bold tracking-tight">GAME STATION</p>
                <p className="text-[8px] opacity-50">扫描二维码 挑战我的最高纪录</p>
              </div>
              <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-lg shadow-black/20">
                <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-sm rotate-45"></div>
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
