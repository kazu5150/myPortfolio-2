export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          status: string
          progress: number
          technologies: string[]
          start_date: string | null
          update_date: string | null
          demo_url: string | null
          github_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string
          status?: string
          progress?: number
          technologies?: string[]
          start_date?: string | null
          update_date?: string | null
          demo_url?: string | null
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          status?: string
          progress?: number
          technologies?: string[]
          start_date?: string | null
          update_date?: string | null
          demo_url?: string | null
          github_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      learning_entries: {
        Row: {
          id: string
          title: string
          description: string | null
          category: string
          categories: string[]
          status: string
          progress: number
          skills: string[]
          resources: Json
          difficulty_level: string
          estimated_hours: number | null
          completed_hours: number
          start_date: string | null
          target_completion_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          category?: string
          categories?: string[]
          status?: string
          progress?: number
          skills?: string[]
          resources?: Json
          difficulty_level?: string
          estimated_hours?: number | null
          completed_hours?: number
          start_date?: string | null
          target_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          category?: string
          categories?: string[]
          status?: string
          progress?: number
          skills?: string[]
          resources?: Json
          difficulty_level?: string
          estimated_hours?: number | null
          completed_hours?: number
          start_date?: string | null
          target_completion_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string | null
          excerpt: string | null
          status: string
          tags: string[]
          featured_image_url: string | null
          reading_time: number | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content?: string | null
          excerpt?: string | null
          status?: string
          tags?: string[]
          featured_image_url?: string | null
          reading_time?: number | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string | null
          excerpt?: string | null
          status?: string
          tags?: string[]
          featured_image_url?: string | null
          reading_time?: number | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export type LearningEntry = Database['public']['Tables']['learning_entries']['Row']
export type LearningEntryInsert = Database['public']['Tables']['learning_entries']['Insert']
export type LearningEntryUpdate = Database['public']['Tables']['learning_entries']['Update']

export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

// Enum types for better type safety
export type ProjectCategory = 'WEB' | 'MOBILE' | 'AI' | 'GAME' | 'TOOL' | 'OTHER'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED' | 'PAUSED'

export type LearningCategory = 'FRONTEND' | 'BACKEND' | 'DEVOPS' | 'DATA' | 'AI' | 'DESIGN' | 'OTHER'
export type LearningStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED'
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

// Resource type for learning entries
export interface LearningResource {
  title: string
  url: string
  type: 'article' | 'video' | 'course' | 'book' | 'documentation' | 'other'
  completed?: boolean
}