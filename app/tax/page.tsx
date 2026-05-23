'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTaxOpportunities } from '@/hooks/useTaxOpportunities'

export default function TaxPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('adaptivefolio_user_id')
    if (!stored) { router.push('/onboarding'); return }
    setUserId(stored)
  }, [router])

  const { taxOpportunities, loading } = useTaxOpportunities(userId)

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
                path === '/tax'
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Tax Opportunities</h2>
          <p className="text-gray-400 text-sm mt-1">Positions flagged for potential tax-loss harvesting</p>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
          <p className="text-yellow-400 text-sm font-medium mb-1">⚠ Detection only</p>
          <p className="text-gray-400 text-xs">
            Tax-loss harvesting implications depend on your jurisdiction and personal tax situation.
            This tool detects potential opportunities only — consult a tax professional before acting on these signals.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading tax opportunities...</p>
          </div>
        ) : taxOpportunities.length === 0 ? (
          <div className="text-center py-12 border border-gray-800 rounded-2xl">
            <p className="text-gray-500">No harvesting opportunities detected</p>
            <p className="text-gray-600 text-sm mt-1">
              The agent flags positions with unrealized losses exceeding 8% of cost basis
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {taxOpportunities.map(opp => (
              <div key={opp.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{opp.asset_symbol}</span>
                      <span className="text-xs text-gray-500">on {opp.chain}</span>
                    </div>
                    <p className="text-sm text-red-400">
                      {(opp.unrealized_loss_pct * 100).toFixed(1)}% unrealized loss
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Harvestable</p>
                    <p className="text-lg font-bold text-white">
                      ${opp.harvestable_usdc.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Detected {new Date(opp.detected_at).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    opp.status === 'open'
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-gray-700 text-gray-500'
                  }`}>
                    {opp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}