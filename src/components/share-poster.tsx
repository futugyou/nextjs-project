import React, { useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { toPng } from 'html-to-image'
import { Share2, Download, X } from 'lucide-react'
import { GameStats } from '@/hook/use-game-record'
import { Game } from '@/lib/games'

export const SharePoster = ({ game, stats }: { game: Game; stats: GameStats }) => {
  const posterRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (posterRef.current) {
      const dataUrl = await toPng(posterRef.current, { quality: 0.95, cacheBust: true })
      const link = document.createElement('a')
      link.download = `${game.name}-战绩海报.png`
      link.href = dataUrl
      link.click()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="flex items-center gap-1 text-xs text-indigo-600 font-medium hover:underline">
          <Share2 size={12} /> 分享成就
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm focus:outline-none z-50">
          <div
            ref={posterRef}
            className="bg-white overflow-hidden rounded-3xl shadow-2xl relative aspect-3/4 flex flex-col"
          >
            <div className="absolute inset-0 bg-linear-to-b from-indigo-600 via-purple-500 to-pink-500 opacity-90" />
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

            <div className="relative z-10 p-8 flex-1 flex flex-col text-white">
              <div className="flex justify-between items-start">
                <div className="text-4xl font-black tracking-tighter italic">GAME OVER.</div>
                <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs border border-white/30">
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <div className="mt-12 flex flex-col items-center">
                <span className="text-6xl mb-4 drop-shadow-lg">{game.icon}</span>
                <h2 className="text-2xl font-bold uppercase tracking-widest">{game.name}</h2>
                <div className="h-1 w-12 bg-white/50 my-4 rounded-full" />
              </div>

              <div className="mt-auto space-y-6 text-center">
                <div>
                  <p className="text-white/70 text-xs uppercase tracking-widest mb-1">
                    Highest Score
                  </p>
                  <p className="text-6xl font-black leading-none tracking-tight">
                    {stats.bestRecord?.score || 0}
                  </p>
                </div>

                <div className="grid grid-cols-2 border-t border-white/20 pt-6">
                  <div>
                    <p className="text-white/60 text-[10px] uppercase">游玩次数</p>
                    <p className="font-bold">{stats.history.length} Games</p>
                  </div>
                  <div>
                    <p className="text-white/60 text-[10px] uppercase">最高段位</p>
                    <p className="font-bold">王者玩家</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-4">
                <div className="text-[10px] text-white/50 text-left leading-tight">
                  扫描挑战我的记录
                  <br />
                  来自你的趣玩小站
                </div>
                <div className="w-10 h-10 bg-white rounded-md p-1">
                  <div className="w-full h-full bg-gray-900 rounded-sm" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 px-4">
            <button
              onClick={handleDownload}
              className="flex-1 bg-white text-gray-900 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
            >
              <Download size={18} /> 保存到相册
            </button>
            <Dialog.Close asChild>
              <button className="bg-white/20 text-white p-3 rounded-xl hover:bg-white/30">
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
