'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDecisionLog } from '@/hooks/useDecisionLog'
import { DecisionLogEntry } from '@/lib/types'

function DecisionEntry({ d }: { d: DecisionLogEntry }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
            d.action_taken
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-700 text-gray-400'
          }`}>
            {d.action_taken ? 'ACTED' : 'HELD'}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-500">
                {new Date(d.timestamp).toLocaleString()}
              </span>
              <span className="text-xs text-gray-600">·</span>
              <span className="text-xs text-gray-500">{d.trigger_event}</span>
              {d.active_strategy && (
                <>
                  <span className="text-xs text-gray-600">·</span>
                  <span className="text-xs text-blue-400">{d.active_strategy}</span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-300">{d.explanation}</p>
          </div>
          <span className="text-gray-600 flex-shrink-0">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-800 p-4 bg-gray-900/50 space-y-4">
          {/* Verdict */}
          <div>
            <p className="text-xs text-gray-500 mb-1">Verdict</p>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              d.verdict === 'HOLDS' ? 'bg-gray-700 text-gray-300' :
              d.verdict === 'BROKEN' ? 'bg-red-500/20 text-red-400' :
              'bg-yellow-500/20 text-yellow-400'
            }`}>
              {d.verdict}
            </span>
            {d.previous_strategy && d.active_strategy !== d.previous_strategy && (
              <span className="ml-2 text-xs text-gray-500">
                {d.previous_strategy} → {d.active_strategy}
              </span>
            )}
          </div>

          {/* Flags */}
          {d.flags && d.flags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Risk Flags Applied</p>
              <div className="space-y-1">
                {d.flags.map((flag, i) => (
                  <p key={i} className="text-xs text-yellow-400">⚠ {flag}</p>
                ))}
              </div>
            </div>
          )}

          {/* Strategy evaluations */}
          {d.strategy_evaluations && d.strategy_evaluations.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Strategy Ranking</p>
              <div className="space-y-2">
                {d.strategy_evaluations
                  .sort((a, b) => b.score - a.score)
                  .map((s) => (
                  <div key={s.name} className="flex items-center gap-3">
                    <span className={`text-xs w-4 ${s.is_valid ? 'text-green-400' : 'text-gray-600'}`}>
                      {s.is_valid ? '✓' : '✗'}
                    </span>
                    <span className="text-xs text-gray-300 w-40">{s.name}</span>
                    <div className="flex-1 bg-gray-800 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${s.is_valid ? 'bg-blue-500' : 'bg-gray-700'}`}
                        style={{ width: `${s.score * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-10 text-right">
                      {(s.score * 100).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Target weights */}
          {d.target_weights && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Target Weights</p>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(d.target_weights).map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-lg p-2">
                    <p className="text-xs text-gray-500">{k.replace('_', ' ')}</p>
                    <p className="text-sm font-medium text-white">{(v * 100).toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function DecisionsPage() {
  const router = useRouter()
  const [userId, setUserId] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('adaptivefolio_user_id')
    if (!stored) { router.push('/onboarding'); return }
    setUserId(stored)
  }, [router])

  const { decisions, loading } = useDecisionLog(userId)

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
                path === '/decisions'
                  ? 'bg-gray-800 text-white'
                  : 'hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Decision Log</h2>
            <p className="text-gray-400 text-sm mt-1">Every decision the agent has made — holds and actions</p>
          </div>
          <div className="text-sm text-gray-500">{decisions.length} decisions</div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Loading decisions...</p>
          </div>
        ) : decisions.length === 0 ? (
          <div className="text-center py-12 border border-gray-800 rounded-2xl">
            <p className="text-gray-500">No decisions yet</p>
            <p className="text-gray-600 text-sm mt-1">The agent will log its first decision within 60 seconds of the backend starting</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map(d => <DecisionEntry key={d.id} d={d} />)}
          </div>
        )}
      </div>
    </div>
  )
}