'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOpportunitySet } from '@/hooks/useOpportunitySet'
import { RiskClassification } from '@/lib/types'

function RiskBadge({ classification }: { classification: RiskClassification }) {
  const styles = {
    STABLE_YIELD: 'bg-green-500/20 text-green-400',
    STABLE_FX: 'bg-blue-500/20 text-blue-400',
    STABLE_BASE: 'bg-gray-500/20 text-gray-400',
    VOLATILE_CRYPTO: 'bg-orange-500/20 text-orange-400',
    UNKNOWN: 'bg-red-500/20 text-red-400',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[classification] || styles.UNKNOWN}`}>
      {classification.replace('_', ' ')}
    </span>
  )
}

export default function OpportunitiesPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('adaptivefolio_user_id')
    if (!stored) { router.push('/onboarding'); return }
    setUserId(stored)
  }, [router])

  const { opportunities, loading } = useOpportunitySet(userId)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => router.push('/dashboard')}>AdaptiveFolio</h1>
        <div className="flex items-center gap-2 text-sm">
          {[
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Decisions', path: '/decisions' },
            { label: 'Transactions', path: '/transactions' },
            { label: 'Opportunities', path: '/opportunities' },
            { label: 'Tax', path: '/tax' },
          ].map(({ label, path }) => (
            <button key={path} onClick={() => router.push(path)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                path === '/opportunities'
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Opportunity Set</h2>
            <p className="text-gray-400 text-sm mt-1">Assets discovered and classified by the Scout specialist</p>
          </div>
          <div className="text-sm text-gray-500">{opportunities.length} assets</div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading opportunities...</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-12 border border-gray-800 rounded-2xl">
            <p className="text-gray-500">No opportunities discovered yet</p>
            <p className="text-gray-600 text-sm mt-1">Scout will populate this once the backend starts</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left py-3 pr-4">Asset</th>
                  <th className="text-left py-3 pr-4">Chain</th>
                  <th className="text-left py-3 pr-4">Classification</th>
                  <th className="text-left py-3 pr-4">Expected Return</th>
                  <th className="text-left py-3 pr-4">Yield APY</th>
                  <th className="text-left py-3 pr-4">Volatility</th>
                  <th className="text-left py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {opportunities.map(opp => (
                  <tr key={opp.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 pr-4">
                      <span className="font-medium text-white">{opp.asset_symbol}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{opp.chain}</td>
                    <td className="py-3 pr-4">
                      <RiskBadge classification={opp.risk_classification} />
                    </td>
                    <td className="py-3 pr-4 text-sm text-white">
                      {opp.expected_return_annual
                        ? `${(opp.expected_return_annual * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="py-3 pr-4 text-sm text-green-400">
                      {opp.yield_apy ? `${(opp.yield_apy * 100).toFixed(1)}%` : '—'}
                    </td>
                    <td className="py-3 pr-4 text-sm text-gray-300">
                      {opp.volatility_30d
                        ? `${(opp.volatility_30d * 100).toFixed(1)}%`
                        : '—'}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        opp.is_active ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-500'
                      }`}>
                        {opp.is_active ? 'In Portfolio' : 'Available'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}