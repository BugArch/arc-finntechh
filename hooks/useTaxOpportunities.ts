import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TaxOpportunity } from '@/lib/types'

export function useTaxOpportunities(userId: string) {
  const [taxOpportunities, setTaxOpportunities] = useState<TaxOpportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('tax_opportunities')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'open')
      .order('detected_at', { ascending: false })
      .then(({ data }) => {
        setTaxOpportunities(data || [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`tax_opportunities:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tax_opportunities',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setTaxOpportunities(prev => [payload.new as TaxOpportunity, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { taxOpportunities, loading }
}