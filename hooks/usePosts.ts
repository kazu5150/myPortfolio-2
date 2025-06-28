"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, PostInsert, PostUpdate } from '@/types/database'

export function usePosts(includeUnpublished = false) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setLoading(true)
      let query = supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (!includeUnpublished) {
        query = query.eq('status', 'PUBLISHED')
      }

      const { data, error } = await query

      if (error) throw error
      setPosts(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (post: PostInsert) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single()

      if (error) throw error
      setPosts(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      throw err
    }
  }

  const updatePost = async (id: string, updates: PostUpdate) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPosts(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update post')
      throw err
    }
  }

  const deletePost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id)

      if (error) throw error
      setPosts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
      throw err
    }
  }

  const publishPost = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update({ 
          status: 'PUBLISHED',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setPosts(prev => prev.map(p => p.id === id ? data : p))
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post')
      throw err
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [includeUnpublished])

  return {
    posts,
    loading,
    error,
    refetch: fetchPosts,
    createPost,
    updatePost,
    deletePost,
    publishPost
  }
}

export function usePost(slug: string) {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .single()

        if (error) throw error
        setPost(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch post')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  return { post, loading, error }
}