import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { MarketSnapshot } from '@/lib/types'

export function useMarketSnapshot() {
  const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('market_snapshots')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setSnapshot(data[0])
        setLoading(false)
      })

    const channel = supabase
      .channel('market_snapshots')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'market_snapshots',
      }, (payload) => {
        setSnapshot(payload.new as MarketSnapshot)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return { snapshot, loading }
}