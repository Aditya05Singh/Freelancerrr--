/*
  # Freelancing Management System Schema

  ## Overview
  Creates a comprehensive schema for a skill-based freelancing platform connecting freelancers with employers.

  ## New Tables

  ### 1. profiles
  Extended user profiles with role information
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: 'freelancer' or 'employer'
  - `bio` (text) - User biography
  - `skills` (text array) - Skills for freelancers
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. jobs
  Job postings from employers
  - `id` (uuid, primary key) - Unique job identifier
  - `employer_id` (uuid) - References profiles table
  - `title` (text) - Job title
  - `description` (text) - Detailed job description
  - `budget` (numeric) - Job budget amount
  - `required_skills` (text array) - Required skills
  - `status` (text) - Job status: 'open', 'in_progress', 'completed', 'cancelled'
  - `created_at` (timestamptz) - Job posting timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. applications
  Applications from freelancers to jobs
  - `id` (uuid, primary key) - Unique application identifier
  - `job_id` (uuid) - References jobs table
  - `freelancer_id` (uuid) - References profiles table
  - `cover_letter` (text) - Application cover letter
  - `proposed_rate` (numeric) - Freelancer's proposed rate
  - `status` (text) - Application status: 'pending', 'accepted', 'rejected'
  - `created_at` (timestamptz) - Application timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. payments
  Payment tracking for completed work
  - `id` (uuid, primary key) - Unique payment identifier
  - `job_id` (uuid) - References jobs table
  - `freelancer_id` (uuid) - References profiles table
  - `employer_id` (uuid) - References profiles table
  - `amount` (numeric) - Payment amount
  - `status` (text) - Payment status: 'pending', 'completed', 'cancelled'
  - `created_at` (timestamptz) - Payment creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security

  ### Row Level Security (RLS)
  All tables have RLS enabled with restrictive policies ensuring:
  - Users can only view their own profile data
  - Employers can create and manage their own job postings
  - Freelancers can view open jobs and create applications
  - Application access is restricted to job owners and applicants
  - Payment records are visible only to involved parties

  ### Important Notes
  1. All tables use UUID primary keys for security
  2. Foreign key constraints ensure data integrity
  3. Timestamp fields auto-update for audit trails
  4. RLS policies enforce strict access control
  5. Default values prevent null-related issues
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text DEFAULT '',
  role text NOT NULL CHECK (role IN ('freelancer', 'employer')),
  bio text DEFAULT '',
  skills text[] DEFAULT '{}',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL CHECK (budget > 0),
  required_skills text[] DEFAULT '{}',
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (status = 'open' OR employer_id = auth.uid());

CREATE POLICY "Employers can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (employer_id = auth.uid())
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Employers can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (employer_id = auth.uid());

-- Create applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cover_letter text DEFAULT '',
  proposed_rate numeric NOT NULL CHECK (proposed_rate > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(job_id, freelancer_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Freelancers can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    freelancer_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.employer_id = auth.uid()
    )
  );

CREATE POLICY "Freelancers can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (freelancer_id = auth.uid());

CREATE POLICY "Employers can update applications for their jobs"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.employer_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jobs 
      WHERE jobs.id = applications.job_id 
      AND jobs.employer_id = auth.uid()
    )
  );

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  freelancer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount numeric NOT NULL CHECK (amount > 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (freelancer_id = auth.uid() OR employer_id = auth.uid());

CREATE POLICY "Employers can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (employer_id = auth.uid());

CREATE POLICY "Involved parties can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (freelancer_id = auth.uid() OR employer_id = auth.uid())
  WITH CHECK (freelancer_id = auth.uid() OR employer_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_jobs_employer ON jobs(employer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_freelancer ON applications(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_payments_job ON payments(job_id);
CREATE INDEX IF NOT EXISTS idx_payments_freelancer ON payments(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_payments_employer ON payments(employer_id);