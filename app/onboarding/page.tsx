'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { submitGoal, startAgent } from '@/lib/api'

const SUPPORTED_CHAINS = [
  { id: 'ARC-TESTNET', label: 'Arc Testnet', required: true },
  { id: 'ETH-SEPOLIA', label: 'Ethereum Sepolia', required: false },
  { id: 'BASE-SEPOLIA', label: 'Base Sepolia', required: false },
  { id: 'AVAX-FUJI', label: 'Avalanche Fuji', required: false },
  { id: 'OP-SEPOLIA', label: 'OP Sepolia', required: false },
]

type Step = 'input' | 'review' | 'confirming' | 'done'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')
  const [goalText, setGoalText] = useState('')
  const [selectedChains, setSelectedChains] = useState(['ARC-TESTNET', 'ETH-SEPOLIA', 'BASE-SEPOLIA'])
  const [parsedGoal, setParsedGoal] = useState<any>(null)
  const [wallets, setWallets] = useState<any[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoalSubmit = async () => {
    if (!goalText.trim()) return
    setLoading(true)
    setError('')
    try {
      const result = await submitGoal(goalText, selectedChains)
      setParsedGoal(result.goal_parsed)
      setWallets(result.wallets || [])
      setUserId(result.user_id)
      setStep('review')
    } catch (e) {
      // Backend not ready yet — use mock data for UI testing
      setParsedGoal({
        risk_tolerance: 0.5,
        horizon_years: 5,
        drawdown_limit: 0.15,
        risk_off_usdc_floor: 0.3,
        preserve_capital: true,
        target_return_annual: 0.08,
      })
      setWallets(selectedChains.map(c => ({ chain: c, address: '0x742d35Cc6634C0532925a3b8D4C9C7B9B1234567' })))
      setUserId('mock-user-' + Date.now())
      setStep('review')
    } finally {
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setStep('confirming')
    try {
      if (!userId.startsWith('mock')) {
        await startAgent(userId)
      }
      localStorage.setItem('adaptivefolio_user_id', userId)
      setTimeout(() => {
        setStep('done')
        setTimeout(() => router.push('/dashboard'), 1500)
      }, 2000)
    } catch (e) {
      localStorage.setItem('adaptivefolio_user_id', userId)
      setTimeout(() => router.push('/dashboard'), 1500)
    }
  }

  const toggleChain = (chainId: string) => {
    if (chainId === 'ARC-TESTNET') return
    setSelectedChains(prev =>
      prev.includes(chainId) ? prev.filter(c => c !== chainId) : [...prev, chainId]
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">AdaptiveFolio</h1>
          <p className="text-gray-400">Autonomous cross-chain portfolio management</p>
        </div>

        {/* Step 1 — Goal Input */}
        {step === 'input' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-2">Set your goal</h2>
            <p className="text-gray-400 text-sm mb-6">Describe what you want in plain English. The AI will handle everything else.</p>

            <textarea
              className="w-full bg-gray-800 border border-gray-700 rounded-xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:border-blue-500 transition-colors"
              rows={4}
              placeholder="e.g. moderate risk, 5 year horizon, preserve capital during downturns"
              value={goalText}
              onChange={e => setGoalText(e.target.value)}
            />

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Select chains to include</h3>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORTED_CHAINS.map(chain => (
                  <button
                    key={chain.id}
                    onClick={() => toggleChain(chain.id)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-sm transition-colors ${
                      selectedChains.includes(chain.id)
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-400'
                    } ${chain.required ? 'opacity-75 cursor-not-allowed' : 'cursor-pointer hover:border-gray-500'}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${selectedChains.includes(chain.id) ? 'bg-blue-400' : 'bg-gray-600'}`} />
                    {chain.label}
                    {chain.required && <span className="ml-auto text-xs text-gray-500">required</span>}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

            <button
              onClick={handleGoalSubmit}
              disabled={loading || !goalText.trim()}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              {loading ? 'Analyzing goal...' : 'Continue →'}
            </button>
          </div>
        )}

        {/* Step 2 — Review */}
        {step === 'review' && parsedGoal && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h2 className="text-xl font-semibold mb-6">Review your parameters</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Risk Tolerance</p>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${parsedGoal.risk_tolerance * 100}%` }} />
                </div>
                <p className="text-sm text-white">{Math.round(parsedGoal.risk_tolerance * 100)}%</p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Time Horizon</p>
                <p className="text-2xl font-bold text-white">{parsedGoal.horizon_years}<span className="text-sm font-normal text-gray-400"> years</span></p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Max Drawdown</p>
                <p className="text-2xl font-bold text-white">{Math.round(parsedGoal.drawdown_limit * 100)}<span className="text-sm font-normal text-gray-400">%</span></p>
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">Capital Preservation</p>
                <p className="text-2xl font-bold text-white">{parsedGoal.preserve_capital ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-xs text-gray-500 mb-2">Selected Chains</p>
              <div className="flex flex-wrap gap-2">
                {selectedChains.map(c => (
                  <span key={c} className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full">{c}</span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Start Agent →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Confirming */}
        {step === 'confirming' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Starting your agent...</h2>
            <p className="text-gray-400 text-sm">Creating wallets and initializing portfolio management</p>
          </div>
        )}

        {/* Step 4 — Done */}
        {step === 'done' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Agent is active</h2>
            <p className="text-gray-400 text-sm">Redirecting to your dashboard...</p>
          </div>
        )}

      </div>
    </div>
  )
}