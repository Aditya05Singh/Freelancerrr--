import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'freelancer' | 'employer';
  bio: string;
  skills: string[];
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  budget: number;
  required_skills: string[];
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  employer?: Profile;
}

export interface Application {
  id: string;
  job_id: string;
  freelancer_id: string;
  cover_letter: string;
  proposed_rate: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  job?: Job;
  freelancer?: Profile;
}

export interface Payment {
  id: string;
  job_id: string;
  freelancer_id: string;
  employer_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  job?: Job;
  freelancer?: Profile;
  employer?: Profile;
}
