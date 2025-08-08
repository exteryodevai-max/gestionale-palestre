/*
  # Fix Users Table INSERT Policy

  1. Security Changes
    - Drop existing problematic INSERT policy if it exists
    - Create new policy that properly allows admins and super_admins to create staff
    - Use correct JWT claims checking and gym_id validation

  2. Policy Logic
    - Super admins can create any user
    - Admins can create users only within their gym
    - Proper role checking using JWT metadata
*/

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow admins and super admins to create staff" ON public.users;

-- Create new policy for INSERT operations
CREATE POLICY "Allow admins to insert new staff"
ON public.users
FOR INSERT
WITH CHECK (
  -- Super admin can create any user
  (((auth.jwt() -> 'user_metadata'::text)::jsonb ->> 'role'::text) = 'super_admin'::text)
  OR
  -- Admin can create users in their gym
  (
    EXISTS (
      SELECT 1 
      FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.ruolo = 'admin'::user_role 
        AND u.gym_id = NEW.gym_id
    )
  )
  OR
  -- Super admin in database can create any user
  (
    EXISTS (
      SELECT 1 
      FROM public.users u 
      WHERE u.id = auth.uid() 
        AND u.ruolo = 'super_admin'::user_role
    )
  )
);