/*
  # Fix Authentication and RLS Policies

  1. Security Updates
    - Drop existing problematic policies that cause infinite recursion
    - Create new simplified policies using auth.uid() directly
    - Add proper policies for all tables with gym-based access control

  2. Policy Structure
    - Users can access their own data using auth.uid()
    - Super admins have full access via JWT metadata
    - Admins have access to their gym's data
    - Prevent infinite recursion by avoiding self-referential queries
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can manage own profile" ON users;
DROP POLICY IF EXISTS "Admin gym users access" ON users;
DROP POLICY IF EXISTS "Super admin full access" ON users;

-- Create new simplified policies for users table
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Super admin full access to users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
  );

-- Fix members policies
DROP POLICY IF EXISTS "Admin members access" ON members;
DROP POLICY IF EXISTS "Super admin members access" ON members;

CREATE POLICY "Members gym access"
  ON members
  FOR ALL
  TO authenticated
  USING (
    -- Super admin has access to all
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    -- Admin/staff can access members from their gym
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Subscriptions access" ON subscriptions;

CREATE POLICY "Subscriptions gym access"
  ON subscriptions
  FOR ALL
  TO authenticated
  USING (
    -- Super admin has access to all
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    -- Admin/staff can access subscriptions for members from their gym
    member_id IN (
      SELECT m.id 
      FROM members m
      JOIN users u ON u.gym_id = m.gym_id
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

-- Fix other table policies with same pattern
DROP POLICY IF EXISTS "Gym data access" ON areas;
CREATE POLICY "Areas gym access"
  ON areas
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Courses access" ON courses;
CREATE POLICY "Courses gym access"
  ON courses
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Bookings access" ON bookings;
CREATE POLICY "Bookings gym access"
  ON bookings
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    member_id IN (
      SELECT m.id 
      FROM members m
      JOIN users u ON u.gym_id = m.gym_id
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Equipment access" ON equipments;
CREATE POLICY "Equipment gym access"
  ON equipments
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "NFC tags access" ON nfc_tags;
CREATE POLICY "NFC tags gym access"
  ON nfc_tags
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Access logs access" ON access_logs;
CREATE POLICY "Access logs gym access"
  ON access_logs
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Maintenance logs access" ON maintenance_logs;
CREATE POLICY "Maintenance logs gym access"
  ON maintenance_logs
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    equipment_id IN (
      SELECT e.id 
      FROM equipments e
      JOIN users u ON u.gym_id = e.gym_id
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Automations access" ON automations;
CREATE POLICY "Automations gym access"
  ON automations
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    gym_id IN (
      SELECT u.gym_id 
      FROM users u 
      WHERE u.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
    )
  );

DROP POLICY IF EXISTS "Notifications access" ON notifications;
CREATE POLICY "Notifications access"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    destinatario_id = auth.uid()
    OR
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
  );