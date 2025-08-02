/*
  # Create course_instances table

  1. New Tables
    - `course_instances`
      - `id` (uuid, primary key)
      - `course_id` (uuid, foreign key to courses)
      - `trainer_id` (uuid, foreign key to users with trainer role)
      - `area_id` (uuid, foreign key to areas)
      - `start_time` (timestamptz, not null)
      - `end_time` (timestamptz, not null)
      - `max_capacity` (integer, default from course capacity)
      - `current_bookings_count` (integer, default 0)
      - `is_cancelled` (boolean, default false)
      - `gym_id` (uuid, foreign key)
      - `created_at` (timestamptz, default now)
      - `updated_at` (timestamptz, default now)

  2. Security
    - Enable RLS on `course_instances` table
    - Add policy for gym-based access control
    - Add policy for trainer role validation

  3. Indexes
    - Index on start_time for calendar queries
    - Index on trainer_id for trainer availability
    - Index on course_id for course-based queries
*/

-- Create course_instances table
CREATE TABLE IF NOT EXISTS course_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  trainer_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  area_id uuid NOT NULL REFERENCES areas(id) ON DELETE RESTRICT,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  max_capacity integer NOT NULL DEFAULT 10,
  current_bookings_count integer NOT NULL DEFAULT 0,
  is_cancelled boolean NOT NULL DEFAULT false,
  gym_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE course_instances ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_instances_start_time ON course_instances(start_time);
CREATE INDEX IF NOT EXISTS idx_course_instances_trainer_id ON course_instances(trainer_id);
CREATE INDEX IF NOT EXISTS idx_course_instances_course_id ON course_instances(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instances_gym_id ON course_instances(gym_id);

-- RLS Policies
CREATE POLICY "Course instances gym access" ON course_instances
FOR ALL USING (
  (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'super_admin'::text
  OR 
  gym_id IN (
    SELECT u.gym_id FROM users u 
    WHERE u.id = auth.uid() 
    AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
  )
);

-- Constraint to ensure trainer has correct role
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'course_instances_trainer_role_check'
  ) THEN
    ALTER TABLE course_instances 
    ADD CONSTRAINT course_instances_trainer_role_check 
    CHECK (
      trainer_id IN (
        SELECT id FROM users WHERE ruolo = 'trainer'
      )
    );
  END IF;
END $$;

-- Constraint to ensure end_time is after start_time
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'course_instances_time_order_check'
  ) THEN
    ALTER TABLE course_instances 
    ADD CONSTRAINT course_instances_time_order_check 
    CHECK (end_time > start_time);
  END IF;
END $$;