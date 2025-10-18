import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from '../config/supabase.config';

export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
});

// Database Types
export interface User {
  wallet_address: string; // Primary key
  name: string;
  description: string;
  skills: string[]; // JSON array
  work_experience: WorkExperience[]; // JSON array
  education: Education[]; // JSON array
  role: 'client' | 'freelancer';
  created_at: string;
  updated_at: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  duration: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  year: string;
}

export interface Task {
  id: string; // UUID
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  requirements: string[]; // JSON array
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  client_wallet: string; // Foreign key to users
  freelancer_wallet: string | null; // Assigned freelancer
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string; // UUID
  task_id: string; // Foreign key
  freelancer_wallet: string; // Foreign key
  experience: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
}

export interface Submission {
  id: string; // UUID
  task_id: string; // Foreign key
  freelancer_wallet: string; // Foreign key
  entries: SubmissionEntry[]; // JSON array
  status: 'pending' | 'verified' | 'rejected';
  submitted_at: string;
}

export interface SubmissionEntry {
  type: 'text' | 'code' | 'image' | 'pdf';
  content: string; // Text/code content or file URL
  filename?: string;
}

export interface Payment {
  id: string; // UUID
  task_id: string; // Foreign key
  from_wallet: string;
  to_wallet: string;
  amount: number;
  tx_hash: string | null;
  status: 'pending' | 'escrowed' | 'released' | 'refunded';
  created_at: string;
  updated_at: string;
}

