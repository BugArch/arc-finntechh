import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction } from '@/lib/types'

export function useTransactions(userId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return

    supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setTransactions(data || [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`transactions:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setTransactions(prev => [payload.new as Transaction, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { transactions, loading }
}