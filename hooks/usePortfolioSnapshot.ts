import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PortfolioSnapshot } from '@/lib/types'

export function usePortfolioSnapshot(userId: string) {
  const [snapshot, setSnapshot] = useState<PortfolioSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('portfolio_snapshots')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data && data.length > 0) setSnapshot(data[0])
        setLoading(false)
      })

    const channel = supabase
      .channel(`portfolio_snapshots:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'portfolio_snapshots',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setSnapshot(payload.new as PortfolioSnapshot)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { snapshot, loading }
}