import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { DecisionLogEntry } from '@/lib/types'

export function useDecisionLog(userId: string) {
  const [decisions, setDecisions] = useState<DecisionLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('decision_log')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setDecisions(data || [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`decision_log:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'decision_log',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setDecisions(prev => [payload.new as DecisionLogEntry, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { decisions, loading }
}