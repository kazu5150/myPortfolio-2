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
      projects: {
        Row: {
          id: string
          title: string
          description: string
          detailed_content: string | null
          next_steps: string | null
          work_in_progress_url: string | null
          demo_url: string | null
          github_url: string | null
          image_url: string | null
          status: string
          category: string
          progress: number
          start_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          detailed_content?: string | null
          next_steps?: string | null
          work_in_progress_url?: string | null
          demo_url?: string | null
          github_url?: string | null
          image_url?: string | null
          status?: string
          category?: string
          progress?: number
          start_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          detailed_content?: string | null
          next_steps?: string | null
          work_in_progress_url?: string | null
          demo_url?: string | null
          github_url?: string | null
          image_url?: string | null
          status?: string
          category?: string
          progress?: number
          start_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      learning_entries: {
        Row: {
          id: string
          date: string
          title: string
          description: string
          categories: string[]
          difficulty: string
          completed_hours: number
          skills: string[]
          resources: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          date: string
          title: string
          description: string
          categories?: string[]
          difficulty?: string
          completed_hours?: number
          skills?: string[]
          resources?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          date?: string
          title?: string
          description?: string
          categories?: string[]
          difficulty?: string
          completed_hours?: number
          skills?: string[]
          resources?: string[]
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

// Posts
export type Post = Database['public']['Tables']['posts']['Row']
export type PostInsert = Database['public']['Tables']['posts']['Insert']
export type PostUpdate = Database['public']['Tables']['posts']['Update']

// Projects
export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

// Learning Entries
export type LearningEntry = Database['public']['Tables']['learning_entries']['Row']
export type LearningEntryInsert = Database['public']['Tables']['learning_entries']['Insert']
export type LearningEntryUpdate = Database['public']['Tables']['learning_entries']['Update']

// Enum types for better type safety

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'TESTING' | 'COMPLETED' | 'PAUSED'
export type ProjectCategory = 'WEB' | 'MOBILE' | 'AI' | 'GAME' | 'TOOL' | 'OTHER'
export type LearningDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

