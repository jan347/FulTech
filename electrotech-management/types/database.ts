// Type definitions for database tables

export type UserRole = 'management' | 'electrician';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_number?: string;
  hire_date?: string;
  hourly_rate?: number;
  skills?: string[];
  certifications?: string[];
  emergency_contact?: string;
  emergency_phone?: string;
  status: 'active' | 'inactive' | 'on_leave';
  created_at: string;
  updated_at: string;
  user?: User;
}

export type JobStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface Job {
  id: string;
  customer_id: string;
  title: string;
  description?: string;
  status: JobStatus;
  scheduled_start: string;
  scheduled_end?: string;
  actual_start?: string;
  actual_end?: string;
  estimated_cost?: number;
  actual_cost?: number;
  revenue?: number;
  location_address?: string;
  assigned_electricians?: string[]; // Array of employee IDs
  created_by: string;
  created_at: string;
  updated_at: string;
  customer?: Customer;
}

export interface CostEntry {
  id: string;
  job_id: string;
  category: 'labor' | 'materials' | 'equipment' | 'travel' | 'other';
  description: string;
  amount: number;
  date: string;
  employee_id?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
  employee?: Employee;
}

export interface RevenueEntry {
  id: string;
  job_id: string;
  amount: number;
  date: string;
  payment_method?: string;
  invoice_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  job?: Job;
}

