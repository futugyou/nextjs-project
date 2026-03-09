'use client'

import { useGameStorage } from '@/hook/use-game-record'
import { GAMES } from '@/lib/games'

export default function RecordsPage() {
  const { allStats } = useGameStorage()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">我的战绩</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {GAMES.map((game) => {
          const stats = allStats[game.slug]
          return (
            <div key={game.slug} className="border p-4 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span>{game.icon}</span>
                <h2 className="font-semibold">{game.name}</h2>
              </div>
              {stats?.bestRecord ? (
                <div>
                  <p className="text-sm text-gray-500">最高分: {stats.bestRecord.score}</p>
                  <p className="text-xs text-gray-400">
                    最后一次: {new Date(stats.history[0].timestamp).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">暂无记录，快去玩一把吧！</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
