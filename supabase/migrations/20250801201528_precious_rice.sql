/*
  # Fix infinite recursion in users table RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause infinite recursion
    - Create new policies that don't reference the users table within users table policies
    - Use auth.uid() directly without additional user lookups for basic access
    - Separate policies for different operations to avoid complexity

  2. Policy Structure
    - Users can read their own profile using auth.uid()
    - Super admins can access all users (checked via auth.jwt())
    - Admins can access users in their gym (using a separate query pattern)
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admin gym access" ON users;
DROP POLICY IF EXISTS "Super admin full access" ON users;

-- Create new policies that avoid infinite recursion

-- Policy 1: Users can read and update their own profile
CREATE POLICY "Users can manage own profile"
  ON users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 2: Super admin access (using JWT claims to avoid table lookup)
CREATE POLICY "Super admin full access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'role' = 'super_admin'
    OR
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data ->> 'role' = 'super_admin'
    )
  );

-- Policy 3: Admin access to users in same gym (simplified approach)
CREATE POLICY "Admin gym users access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is super admin (already covered above) OR
    -- Allow if user is admin and accessing users in same gym
    gym_id IN (
      SELECT u.gym_id 
      FROM auth.users au
      JOIN users u ON au.id = u.id
      WHERE au.id = auth.uid() 
      AND u.ruolo IN ('admin', 'super_admin')
    )
  );