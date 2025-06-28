"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Project, ProjectInsert, ProjectUpdate } from '@/types/database'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // Skip Supabase check in client components - let it proceed with actual fetch
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.warn('Supabase not configured, using empty data:', err)
      setProjects([])
      setError(null) // Don't show error for missing Supabase config
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (project: ProjectInsert) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert(project)
        .select()
        .single()

      if (error) throw error
      setProjects(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
      throw err
    }
  }

  const updateProject = async (id: string, updates: ProjectUpdate) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setProjects(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
      throw err
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
      setProjects(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project')
      throw err
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setProject(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch project')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

  return { project, loading, error }
}