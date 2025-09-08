export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          is_admin: boolean
          subscription_status: 'active' | 'cancelled' | 'expired' | 'trialing' | null
          subscription_plan: 'monthly' | 'yearly' | null
          subscription_start_date: string | null
          subscription_end_date: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trialing' | null
          subscription_plan?: 'monthly' | 'yearly' | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          is_admin?: boolean
          subscription_status?: 'active' | 'cancelled' | 'expired' | 'trialing' | null
          subscription_plan?: 'monthly' | 'yearly' | null
          subscription_start_date?: string | null
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      course_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          slug: string
          color: string
          icon: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          slug: string
          color?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          slug?: string
          color?: string
          icon?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string | null
          short_description: string | null
          thumbnail_url: string | null
          trailer_video_url: string | null
          category_id: string | null
          instructor_name: string
          level: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
          duration_minutes: number
          what_you_learn: string[] | null
          requirements: string[] | null
          target_audience: string[] | null
          is_published: boolean
          is_featured: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          trailer_video_url?: string | null
          category_id?: string | null
          instructor_name?: string
          level?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
          duration_minutes?: number
          what_you_learn?: string[] | null
          requirements?: string[] | null
          target_audience?: string[] | null
          is_published?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          short_description?: string | null
          thumbnail_url?: string | null
          trailer_video_url?: string | null
          category_id?: string | null
          instructor_name?: string
          level?: 'beginner' | 'intermediate' | 'advanced' | 'all_levels'
          duration_minutes?: number
          what_you_learn?: string[] | null
          requirements?: string[] | null
          target_audience?: string[] | null
          is_published?: boolean
          is_featured?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_sections: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          sort_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          description?: string | null
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      course_lessons: {
        Row: {
          id: string
          course_id: string
          section_id: string
          title: string
          description: string | null
          video_url: string
          video_duration_seconds: number
          thumbnail_url: string | null
          sort_order: number
          is_preview: boolean
          has_quiz: boolean
          resources: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          section_id: string
          title: string
          description?: string | null
          video_url: string
          video_duration_seconds?: number
          thumbnail_url?: string | null
          sort_order: number
          is_preview?: boolean
          has_quiz?: boolean
          resources?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          section_id?: string
          title?: string
          description?: string | null
          video_url?: string
          video_duration_seconds?: number
          thumbnail_url?: string | null
          sort_order?: number
          is_preview?: boolean
          has_quiz?: boolean
          resources?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          completed: boolean
          watch_time_seconds: number
          last_position_seconds: number
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          course_id: string
          completed?: boolean
          watch_time_seconds?: number
          last_position_seconds?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          course_id?: string
          completed?: boolean
          watch_time_seconds?: number
          last_position_seconds?: number
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      course_completions: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completed_at: string
          completion_percentage: number
          certificate_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          completed_at?: string
          completion_percentage?: number
          certificate_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          completed_at?: string
          completion_percentage?: number
          certificate_url?: string | null
        }
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          timestamp_seconds: number
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          timestamp_seconds?: number
          note?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          timestamp_seconds?: number
          note?: string | null
          created_at?: string
        }
      }
      user_notes: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          course_id: string
          content: string
          timestamp_seconds: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          course_id: string
          content: string
          timestamp_seconds?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          lesson_id?: string
          course_id?: string
          content?: string
          timestamp_seconds?: number
          created_at?: string
          updated_at?: string
        }
      }
      lesson_questions: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          question: string
          is_answered: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          question: string
          is_answered?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          question?: string
          is_answered?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lesson_answers: {
        Row: {
          id: string
          question_id: string
          user_id: string
          answer: string
          is_instructor: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question_id: string
          user_id: string
          answer: string
          is_instructor?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          user_id?: string
          answer?: string
          is_instructor?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string
          title: string
          description: string | null
          passing_score: number
          max_attempts: number
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          title: string
          description?: string | null
          passing_score?: number
          max_attempts?: number
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          title?: string
          description?: string | null
          passing_score?: number
          max_attempts?: number
          created_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question: string
          question_type: 'multiple_choice' | 'true_false'
          options: Json
          correct_answer: string
          explanation: string | null
          sort_order: number
        }
        Insert: {
          id?: string
          quiz_id: string
          question: string
          question_type?: 'multiple_choice' | 'true_false'
          options: Json
          correct_answer: string
          explanation?: string | null
          sort_order?: number
        }
        Update: {
          id?: string
          quiz_id?: string
          question?: string
          question_type?: 'multiple_choice' | 'true_false'
          options?: Json
          correct_answer?: string
          explanation?: string | null
          sort_order?: number
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          score: number
          passed: boolean
          answers: Json
          completed_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          score: number
          passed?: boolean
          answers: Json
          completed_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string
          score?: number
          passed?: boolean
          answers?: Json
          completed_at?: string
        }
      }
      video_analytics: {
        Row: {
          id: string
          lesson_id: string
          user_id: string
          session_id: string
          watch_time_seconds: number
          total_duration_seconds: number
          completion_percentage: number
          dropped_at_seconds: number | null
          device_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          lesson_id: string
          user_id: string
          session_id: string
          watch_time_seconds?: number
          total_duration_seconds: number
          completion_percentage?: number
          dropped_at_seconds?: number | null
          device_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          lesson_id?: string
          user_id?: string
          session_id?: string
          watch_time_seconds?: number
          total_duration_seconds?: number
          completion_percentage?: number
          dropped_at_seconds?: number | null
          device_type?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_course_progress: {
        Args: {
          course_uuid: string
          user_uuid: string
        }
        Returns: {
          total_lessons: number
          completed_lessons: number
          progress_percentage: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for the application
export type Course = Database['public']['Tables']['courses']['Row'] & {
  course_categories?: Database['public']['Tables']['course_categories']['Row']
  sections?: CourseSection[]
  progress?: number
}

export type CourseSection = Database['public']['Tables']['course_sections']['Row'] & {
  lessons?: CourseLesson[]
}

export type CourseLesson = Database['public']['Tables']['course_lessons']['Row'] & {
  progress?: Database['public']['Tables']['user_progress']['Row']
  is_completed?: boolean
  user_notes?: Database['public']['Tables']['user_notes']['Row'][]
  bookmarks?: Database['public']['Tables']['user_bookmarks']['Row'][]
}

export type UserProfile = Database['public']['Tables']['profiles']['Row']

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trialing'
export type SubscriptionPlan = 'monthly' | 'yearly'
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all_levels'