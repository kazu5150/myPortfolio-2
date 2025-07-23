"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Post, PostInsert, PostUpdate } from '@/types/database'

export function usePosts(includeUnpublished = false) {
  const [data, setData] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      
      let query = supabase
        .from('posts')
        .select('*')

      if (!includeUnpublished) {
        query = query
          .eq('status', 'PUBLISHED')
          .order('published_at', { ascending: false, nullsLast: true })
          .order('updated_at', { ascending: false })
      } else {
        query = query
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
      }

      const { data: posts, error } = await query

      if (error) throw error
      setData(posts || [])
    } catch (err) {
      console.warn('Supabase not configured, using empty data:', err)
      setData([])
      setError(null) // Don't show error for missing Supabase config
    } finally {
      setIsLoading(false)
    }
  }

  const createPost = async (post: PostInsert) => {
    try {
      const { data: newPost, error } = await supabase
        .from('posts')
        .insert(post)
        .select()
        .single()

      if (error) throw error
      setData(prev => [newPost, ...prev])
      return newPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post')
      throw err
    }
  }

  const updatePost = async (id: string, updates: PostUpdate) => {
    try {
      const { data: updatedPost, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setData(prev => prev.map(p => p.id === id ? updatedPost : p))
      return updatedPost
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
      setData(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post')
      throw err
    }
  }

  const publishPost = async (id: string) => {
    try {
      const { data: publishedPost, error } = await supabase
        .from('posts')
        .update({ 
          status: 'PUBLISHED',
          published_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      setData(prev => prev.map(p => p.id === id ? publishedPost : p))
      return publishedPost
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish post')
      throw err
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [includeUnpublished])

  return {
    data,
    posts: data, // alias for compatibility
    isLoading,
    loading: isLoading, // alias for compatibility
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true)
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
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchPost()
    }
  }, [slug])

  return { post, data: post, isLoading, loading: isLoading, error }
}