export type Regime = 'RISK_ON' | 'TRANSITIONAL' | 'RISK_OFF'
export type FXSignal = 'USD_STRONG' | 'EUR_STRONG' | 'NEUTRAL'
export type RiskClassification = 'STABLE_YIELD' | 'STABLE_FX' | 'STABLE_BASE' | 'VOLATILE_CRYPTO' | 'UNKNOWN'
export type TxStatus = 'pending' | 'confirmed' | 'failed'
export type DecisionVerdict = 'HOLDS' | 'STALE' | 'BROKEN' | 'INITIAL'

export interface MarketSnapshot {
  id: string
  timestamp: string
  prices: Record<string, number>
  regime_score: number
  regime: Regime
  fx_signal: FXSignal
  fx_deviation: number
  fear_greed: number
  usdc_dominance: number
  volatility_30d: number
}

export interface PortfolioSnapshot {
  id: string
  user_id: string
  timestamp: string
  balances: Record<string, number>
  weights: Record<string, number>
  total_value_usd: number
  peak_value_usd: number
  drawdown_pct: number
  pending_bridges: any[]
}

export interface StrategyEvaluation {
  name: string
  is_valid: boolean
  score: number
  target_weights: Record<string, number>
  expected_return: number
  expected_vol: number
  conditions_met: string[]
  conditions_failed: string[]
  reasoning: string
}

export interface DecisionLogEntry {
  id: string
  user_id: string
  timestamp: string
  trigger_event: string
  verdict: DecisionVerdict
  active_strategy: string | null
  previous_strategy: string | null
  strategy_evaluations: StrategyEvaluation[]
  target_weights: Record<string, number> | null
  flags: string[]
  explanation: string
  action_taken: boolean
}

export interface Transaction {
  id: string
  user_id: string
  timestamp: string
  action: string
  from_asset: string
  to_asset: string
  from_chain: string
  to_chain: string
  amount_usdc: number
  venue: string
  tx_hash: string | null
  status: TxStatus
  confirmed_at: string | null
  arcscan_url: string | null
}

export interface Opportunity {
  id: string
  user_id: string
  asset_symbol: string
  chain: string
  risk_classification: RiskClassification
  expected_return_annual: number
  volatility_30d: number
  yield_apy: number | null
  price_usd: number
  is_active: boolean
  last_updated: string
}

export interface TaxOpportunity {
  id: string
  user_id: string
  detected_at: string
  asset_symbol: string
  chain: string
  unrealized_loss_pct: number
  harvestable_usdc: number
  status: 'open' | 'dismissed'
}

export interface GoalParsed {
  risk_tolerance: number
  horizon_years: number
  drawdown_limit: number
  risk_off_usdc_floor: number
  preserve_capital: boolean
  target_return_annual: number
}

export interface User {
  id: string
  created_at: string
  goal_raw: string
  goal_parsed: GoalParsed
  selected_chains: string[]
  status: 'active' | 'paused'
}

export interface Wallet {
  id: string
  user_id: string
  chain: string
  address: string
  circle_wallet_id: string
}