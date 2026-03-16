'use client'

import React, { useMemo } from 'react'
import { Trophy, Clock, Calendar, BarChart3 } from 'lucide-react'
import { GameStats, useGameStorage } from '@/hook/use-game-record'
import { GAMES } from '@/lib/games'
import { SharePoster } from '@/components/share-poster'
import { formatDuration, getRelativeTime } from '@/lib/utils'
import Link from 'next/link'

export default function RecordsPage() {
  const { allStats } = useGameStorage()
  const globalSummary = useMemo(() => {
    let totalGames = 0
    let totalDuration = 0
    Object.values(allStats).forEach((s: any) => {
      totalGames += s.history?.length || 0
      s.history?.forEach((r: any) => (totalDuration += r.duration))
    })
    return { totalGames, totalDuration: Math.floor(totalDuration / 60) }
  }, [allStats])

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="opacity-80 text-sm">总游玩次数</p>
          <h2 className="text-4xl font-bold mt-1">
            {globalSummary.totalGames} <span className="text-lg font-normal">场</span>
          </h2>
        </div>
        <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-sm">累计投入时长</p>
          <h2 className="text-4xl font-bold mt-1 text-gray-800">
            {globalSummary.totalDuration}{' '}
            <span className="text-lg font-normal text-gray-400">分钟</span>
          </h2>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="text-indigo-600" /> 详细战绩分析
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GAMES.map((game) => {
          const stats = allStats[game.slug] as GameStats | undefined
          const hasData = stats && stats.history.length > 0

          const winRate = hasData
            ? Math.round(
                (stats.history.filter((h) => h.completed).length / stats.history.length) * 100,
              )
            : 0

          return (
            <div
              key={game.slug}
              className="group relative bg-white rounded-2xl p-5 border border-gray-100 hover:border-indigo-200 transition-all hover:shadow-lg"
            >
              {stats?.bestRecord && (
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <SharePoster game={game} stats={stats} />
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl p-2 bg-gray-50 rounded-lg group-hover:scale-110 transition-transform">
                    {game.icon}
                  </span>
                  <div>
                    <Link href={'/game/' + game.slug} className="btn-style">
                      <h2 className="font-bold text-gray-800">{game.name}</h2>
                    </Link>
                  </div>
                </div>
              </div>

              {hasData ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-orange-600 mb-1">
                        <Trophy size={14} />
                        <span className="text-[10px] font-bold uppercase">最高分</span>
                      </div>
                      <p className="text-xl font-black text-orange-700">
                        {stats.bestRecord?.score}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl">
                      <div className="flex items-center gap-1 text-blue-600 mb-1">
                        <Clock size={14} />
                        <span className="text-[10px] font-bold uppercase">胜率</span>
                      </div>
                      <p className="text-xl font-black text-blue-700">{winRate}%</p>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                      最近挑战
                    </p>
                    {stats.history.slice(0, 5).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group/item"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${record.completed ? 'filter-none' : 'grayscale opacity-70'}`}
                          >
                            {record.completed ? '🏆' : '💥'}
                          </span>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-medium text-gray-700 leading-none">
                              {record.completed ? '挑战成功' : '遗憾失败'}
                            </span>
                            <span className="text-[9px] text-gray-400 mt-1">
                              {getRelativeTime(record.timestamp)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className="text-sm font-bold text-gray-900 leading-none">
                            {record.score.toLocaleString()}
                          </span>
                          <span className="text-[9px] text-gray-400 mt-1 flex items-center gap-0.5">
                            <Clock size={8} className="inline" />
                            {formatDuration(record.duration)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      最后玩过: {new Date(stats.history[0].timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400 italic mb-3">尚未解锁成就</p>
                  <Link href={'/game/' + game.slug} className="btn-style">
                    <button className="text-xs bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full font-medium hover:bg-indigo-100 transition-colors">
                      立即开启挑战
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
