'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMarketSnapshot } from '@/hooks/useMarketSnapshot'
import { usePortfolioSnapshot } from '@/hooks/usePortfolioSnapshot'
import { useDecisionLog } from '@/hooks/useDecisionLog'

function RegimeBadge({ regime, score }: { regime: string, score: number }) {
  const colors = {
    RISK_ON: 'bg-green-500/20 text-green-400 border-green-500/30',
    TRANSITIONAL: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    RISK_OFF: 'bg-red-500/20 text-red-400 border-red-500/30',
  }
  const dots = {
    RISK_ON: 'bg-green-400',
    TRANSITIONAL: 'bg-yellow-400',
    RISK_OFF: 'bg-red-400',
  }
  const color = colors[regime as keyof typeof colors] || colors.TRANSITIONAL
  const dot = dots[regime as keyof typeof dots] || dots.TRANSITIONAL

  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${color}`}>
      <span className={`w-2 h-2 rounded-full animate-pulse ${dot}`} />
      <span className="font-semibold text-sm">{regime?.replace('_', ' ')}</span>
      <span className="text-xs opacity-70">Score: {score?.toFixed(2)}</span>
    </div>
  )
}

function FXBadge({ signal, deviation }: { signal: string, deviation: number }) {
  const colors = {
    EUR_STRONG: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    USD_STRONG: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    NEUTRAL: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  }
  const color = colors[signal as keyof typeof colors] || colors.NEUTRAL
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${color}`}>
      <span className="font-semibold text-sm">FX: {signal?.replace('_', ' ')}</span>
      <span className="text-xs opacity-70">{deviation > 0 ? '+' : ''}{(deviation * 100).toFixed(2)}%</span>
    </div>
  )
}

function PortfolioDonut({ weights }: { weights: Record<string, number> }) {
  const COLORS: Record<string, string> = {
    arc_usdc: '#3b82f6',
    arc_eurc: '#8b5cf6',
    arc_usyc: '#22c55e',
    arc_cirbtc: '#f97316',
    sep_usdc: '#06b6d4',
    base_usdc: '#ec4899',
  }

  const entries = Object.entries(weights || {}).filter(([, v]) => v > 0)
  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  let cumulativePercent = 0
  const slices = entries.map(([key, value]) => {
    const percent = (value / total) * 100
    const startPercent = cumulativePercent
    cumulativePercent += percent
    return { key, percent, startPercent, color: COLORS[key] || '#6b7280' }
  })

  const getCoordinates = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent / 100)
    const y = Math.sin(2 * Math.PI * percent / 100)
    return [x, y]
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox="-1 -1 2 2" className="w-48 h-48" style={{ transform: 'rotate(-90deg)' }}>
        {slices.map(({ key, percent, startPercent, color }) => {
          const [x1, y1] = getCoordinates(startPercent)
          const [x2, y2] = getCoordinates(startPercent + percent)
          const largeArc = percent > 50 ? 1 : 0
          return (
            <path
              key={key}
              d={`M 0 0 L ${x1} ${y1} A 1 1 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={color}
              opacity={0.85}
            />
          )
        })}
        <circle cx="0" cy="0" r="0.6" fill="#111827" />
      </svg>
      <div className="grid grid-cols-2 gap-x-6 gap-y-1 w-full">
        {slices.map(({ key, percent, color }) => (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-gray-400 truncate">{key.replace('_', ' ')}</span>
            <span className="text-white ml-auto">{percent.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('adaptivefolio_user_id')
    if (!stored) {
      router.push('/onboarding')
      return
    }
    setUserId(stored)
  }, [router])

  const { snapshot: market, loading: marketLoading } = useMarketSnapshot()
  const { snapshot: portfolio, loading: portfolioLoading } = usePortfolioSnapshot(userId)
  const { decisions, loading: decisionsLoading } = useDecisionLog(userId)

  useEffect(() => {
    if (market) setLastUpdated(new Date())
  }, [market])

  const mockWeights = {
    arc_usdc: 0.20,
    arc_eurc: 0.10,
    arc_usyc: 0.50,
    sep_usdc: 0.12,
    base_usdc: 0.08,
  }

  const weights = portfolio?.weights || mockWeights
  const regime = market?.regime || 'TRANSITIONAL'
  const regimeScore = market?.regime_score || 0.45
  const fxSignal = market?.fx_signal || 'NEUTRAL'
  const fxDeviation = market?.fx_deviation || 0
  const totalValue = portfolio?.total_value_usd || 0
  const peakValue = portfolio?.peak_value_usd || 0
  const drawdown = portfolio?.drawdown_pct || 0

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">AdaptiveFolio</h1>
        <div className="flex items-center gap-2 text-sm">
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Decisions', path: '/decisions' },
            { label: 'Transactions', path: '/transactions' },
            { label: 'Opportunities', path: '/opportunities' },
            { label: 'Tax', path: '/tax' },
          ].map(({ label, path }) => (
            <button
              key={path}
              onClick={() => router.push(path)}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Top bar — regime + FX */}
        <div className="flex items-center gap-3 flex-wrap">
          <RegimeBadge regime={regime} score={regimeScore} />
          <FXBadge signal={fxSignal} deviation={fxDeviation} />
          {lastUpdated && (
            <span className="text-xs text-gray-500 ml-auto">
              Updated {Math.round((Date.now() - lastUpdated.getTime()) / 1000)}s ago
            </span>
          )}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Portfolio donut */}
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-sm font-medium text-gray-400 mb-4">Portfolio Weights</h2>
            <PortfolioDonut weights={weights} />
          </div>

          {/* Performance + Chain positions */}
          <div className="lg:col-span-2 space-y-4">
            {/* Performance */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-sm font-medium text-gray-400 mb-4">Performance</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Total Value</p>
                  <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Peak Value</p>
                  <p className="text-2xl font-bold">${peakValue.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Drawdown</p>
                  <p className={`text-2xl font-bold ${drawdown > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    -{drawdown.toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Chain positions */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <h2 className="text-sm font-medium text-gray-400 mb-4">Chain Positions</h2>
              <div className="space-y-3">
                {[
                  { chain: 'Arc Testnet', keys: ['arc_usdc', 'arc_eurc', 'arc_usyc'] },
                  { chain: 'Ethereum Sepolia', keys: ['sep_usdc'] },
                  { chain: 'Base Sepolia', keys: ['base_usdc'] },
                ].map(({ chain, keys }) => {
                 const total = keys.reduce((sum, k) => sum + ((weights as Record<string, number>)[k] || 0), 0)
                  if (total === 0) return null
                  return (
                    <div key={chain} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                      <span className="text-sm text-gray-300">{chain}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-800 rounded-full h-1.5">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${total * 100}%` }} />
                        </div>
                        <span className="text-sm text-white w-12 text-right">{(total * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Decision log preview */}
        <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-400">Recent Decisions</h2>
            <button
              onClick={() => router.push('/decisions')}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              View all →
            </button>
          </div>

          {decisionsLoading ? (
            <p className="text-gray-500 text-sm">Loading decisions...</p>
          ) : decisions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No decisions yet — agent is initializing</p>
              <p className="text-gray-600 text-xs mt-1">First decision will appear within 60 seconds of backend starting</p>
            </div>
          ) : (
            <div className="space-y-3">
              {decisions.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-start gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                    d.action_taken
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-700 text-gray-400'
                  }`}>
                    {d.action_taken ? 'ACTED' : 'HELD'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500">{new Date(d.timestamp).toLocaleTimeString()} · {d.trigger_event}</p>
                    <p className="text-sm text-gray-300 mt-0.5 truncate">{d.explanation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}