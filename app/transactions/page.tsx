'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTransactions } from '@/hooks/useTransactions'

export default function TransactionsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('adaptivefolio_user_id')
    if (!stored) { router.push('/onboarding'); return }
    setUserId(stored)
  }, [router])

  const { transactions, loading } = useTransactions(userId)

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
                path === '/transactions'
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
            <h2 className="text-2xl font-bold">Transactions</h2>
            <p className="text-gray-400 text-sm mt-1">Every on-chain transaction executed by the agent</p>
          </div>
          <div className="text-sm text-gray-500">{transactions.length} transactions</div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12 border border-gray-800 rounded-2xl">
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-gray-600 text-sm mt-1">Transactions will appear here once the agent starts executing</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-gray-800">
                  <th className="text-left py-3 pr-4">Time</th>
                  <th className="text-left py-3 pr-4">Action</th>
                  <th className="text-left py-3 pr-4">From</th>
                  <th className="text-left py-3 pr-4">To</th>
                  <th className="text-left py-3 pr-4">Amount</th>
                  <th className="text-left py-3 pr-4">Venue</th>
                  <th className="text-left py-3 pr-4">Status</th>
                  <th className="text-left py-3">Explorer</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 pr-4 text-xs text-gray-500">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 pr-4 text-xs font-medium text-gray-300">{tx.action}</td>
                    <td className="py-3 pr-4 text-xs text-gray-400">
                      {tx.from_asset} ({tx.from_chain})
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">
                      {tx.to_asset} ({tx.to_chain})
                    </td>
                    <td className="py-3 pr-4 text-xs text-white font-medium">
                      ${tx.amount_usdc.toFixed(2)}
                    </td>
                    <td className="py-3 pr-4 text-xs text-gray-400">{tx.venue}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'failed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3">
                      {tx.arcscan_url && tx.status === 'confirmed' ? (
                        <a
                          href={tx.arcscan_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          View ↗
                        </a>
                      ) : (
                        <span className="text-xs text-gray-600">—</span>
                      )}
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