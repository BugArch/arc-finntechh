const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export async function submitGoal(goalText: string, selectedChains: string[]) {
  const res = await fetch(`${BASE}/api/goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal_text: goalText, selected_chains: selectedChains }),
  })
  if (!res.ok) throw new Error('Goal submission failed')
  return res.json()
}

export async function startAgent(userId: string) {
  const res = await fetch(`${BASE}/api/start/${userId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to start agent')
  return res.json()
}

export async function stopAgent(userId: string) {
  const res = await fetch(`${BASE}/api/stop/${userId}`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to stop agent')
  return res.json()
}

export async function getStatus(userId: string) {
  const res = await fetch(`${BASE}/api/status/${userId}`)
  if (!res.ok) throw new Error('Failed to get status')
  return res.json()
}

export async function getSupportedChains(): Promise<string[]> {
  const res = await fetch(`${BASE}/api/chains`)
  if (!res.ok) return ['ARC-TESTNET', 'ETH-SEPOLIA', 'BASE-SEPOLIA', 'AVAX-FUJI', 'OP-SEPOLIA']
  return res.json()
}