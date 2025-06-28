"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LearningEntry, LearningEntryInsert, LearningEntryUpdate } from '@/types/database'

export function useLearningEntries() {
  const [entries, setEntries] = useState<LearningEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = async () => {
    try {
      setLoading(true)
      
      // Skip Supabase check in client components - let it proceed with actual fetch
      
      const { data, error } = await supabase
        .from('learning_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setEntries(data || [])
    } catch (err) {
      console.warn('Supabase not configured, using empty data:', err)
      setEntries([])
      setError(null) // Don't show error for missing Supabase config
    } finally {
      setLoading(false)
    }
  }

  const createEntry = async (entry: LearningEntryInsert) => {
    try {
      const { data, error } = await supabase
        .from('learning_entries')
        .insert(entry)
        .select()
        .single()

      if (error) throw error
      setEntries(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create learning entry')
      throw err
    }
  }

  const updateEntry = async (id: string, updates: LearningEntryUpdate) => {
    try {
      const { data, error } = await supabase
        .from('learning_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setEntries(prev => prev.map(e => e.id === id ? data : e))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update learning entry')
      throw err
    }
  }

  const deleteEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete learning entry')
      throw err
    }
  }

  useEffect(() => {
    fetchEntries()
  }, [])

  return {
    entries,
    loading,
    error,
    refetch: fetchEntries,
    createEntry,
    updateEntry,
    deleteEntry
  }
}

export function useLearningEntry(id: string) {
  const [entry, setEntry] = useState<LearningEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('learning_entries')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setEntry(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch learning entry')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchEntry()
    }
  }, [id])

  return { entry, loading, error }
}