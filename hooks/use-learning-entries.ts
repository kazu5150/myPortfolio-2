"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { LearningEntry, LearningEntryInsert, LearningEntryUpdate } from '@/types/database'

export function useLearningEntries() {
  const [data, setData] = useState<LearningEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLearningEntries = async () => {
    try {
      setIsLoading(true)
      
      const { data: learningEntries, error } = await supabase
        .from('learning_entries')
        .select('*')
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setData(learningEntries || [])
    } catch (err) {
      console.warn('Supabase not configured, using empty data:', err)
      setData([])
      setError(null) // Don't show error for missing Supabase config
    } finally {
      setIsLoading(false)
    }
  }

  const createLearningEntry = async (entry: LearningEntryInsert) => {
    try {
      const { data: newEntry, error } = await supabase
        .from('learning_entries')
        .insert(entry)
        .select()
        .single()

      if (error) throw error
      setData(prev => [newEntry, ...prev])
      return newEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create learning entry')
      throw err
    }
  }

  const updateLearningEntry = async (id: string, updates: LearningEntryUpdate) => {
    try {
      const { data: updatedEntry, error } = await supabase
        .from('learning_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setData(prev => prev.map(e => e.id === id ? updatedEntry : e))
      return updatedEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update learning entry')
      throw err
    }
  }

  const deleteLearningEntry = async (id: string) => {
    try {
      const { error } = await supabase
        .from('learning_entries')
        .delete()
        .eq('id', id)

      if (error) throw error
      setData(prev => prev.filter(e => e.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete learning entry')
      throw err
    }
  }

  useEffect(() => {
    fetchLearningEntries()
  }, [])

  return {
    data,
    learningEntries: data, // alias for compatibility
    isLoading,
    loading: isLoading, // alias for compatibility
    error,
    refetch: fetchLearningEntries,
    createLearningEntry,
    updateLearningEntry,
    deleteLearningEntry
  }
}

export function useLearningEntry(id: string) {
  const [learningEntry, setLearningEntry] = useState<LearningEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLearningEntry = async () => {
      try {
        setIsLoading(true)
        const { data, error } = await supabase
          .from('learning_entries')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setLearningEntry(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch learning entry')
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchLearningEntry()
    }
  }, [id])

  return { learningEntry, data: learningEntry, isLoading, loading: isLoading, error }
}