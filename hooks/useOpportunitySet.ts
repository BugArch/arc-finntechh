import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Opportunity } from '@/lib/types'

export function useOpportunitySet(userId: string) {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('opportunity_set')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('expected_return_annual', { ascending: false })
      .then(({ data }) => {
        setOpportunities(data || [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`opportunity_set:${userId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'opportunity_set',
        filter: `user_id=eq.${userId}`,
      }, () => {
        supabase
          .from('opportunity_set')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .then(({ data }) => setOpportunities(data || []))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { opportunities, loading }
}