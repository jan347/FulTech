// This file will be generated based on your Supabase schema
// For now, we'll define a basic structure

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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          role: 'management' | 'electrician'
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['customers']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['customers']['Insert']>
      }
      employees: {
        Row: {
          id: string
          user_id: string
          employee_number: string | null
          hire_date: string | null
          hourly_rate: number | null
          skills: string[] | null
          certifications: string[] | null
          emergency_contact: string | null
          emergency_phone: string | null
          status: 'active' | 'inactive' | 'on_leave'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['employees']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['employees']['Insert']>
      }
      jobs: {
        Row: {
          id: string
          customer_id: string
          title: string
          description: string | null
          status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
          scheduled_start: string
          scheduled_end: string | null
          actual_start: string | null
          actual_end: string | null
          estimated_cost: number | null
          actual_cost: number | null
          revenue: number | null
          location_address: string | null
          assigned_electricians: string[] | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['jobs']['Insert']>
      }
      cost_entries: {
        Row: {
          id: string
          job_id: string
          category: 'labor' | 'materials' | 'equipment' | 'travel' | 'other'
          description: string
          amount: number
          date: string
          employee_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['cost_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['cost_entries']['Insert']>
      }
      revenue_entries: {
        Row: {
          id: string
          job_id: string
          amount: number
          date: string
          payment_method: string | null
          invoice_number: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['revenue_entries']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['revenue_entries']['Insert']>
      }
    }
  }
}

