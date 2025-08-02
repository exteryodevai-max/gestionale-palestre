/*
  # Crea tabella users di base

  1. Nuove Tabelle
    - `users`
      - `id` (uuid, primary key)
      - `nome` (text, required)
      - `cognome` (text, required)
      - `email` (text, unique, required)
      - `telefono` (text, optional)
      - `ruolo` (enum: super_admin, admin, trainer, staff)
      - `attivo` (boolean, default true)
      - `gym_id` (uuid, optional)
      - `avatar_url` (text, optional)
      - `ultimo_accesso` (timestamp, optional)
      - `creato_il` (timestamp, default now)
      - `aggiornato_il` (timestamp, default now)

  2. Enum Types
    - `user_role` per i ruoli utente

  3. Security
    - Enable RLS on `users` table
    - Add policy for users to read their own data
    - Add policy for super_admin to access all data
*/

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'trainer', 'staff');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  cognome text NOT NULL,
  email text UNIQUE NOT NULL,
  telefono text,
  ruolo user_role NOT NULL DEFAULT 'staff',
  password_hash text,
  attivo boolean DEFAULT true,
  gym_id uuid,
  avatar_url text,
  ultimo_accesso timestamptz,
  creato_il timestamptz DEFAULT now(),
  aggiornato_il timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Super admin full access to users" ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id::text = auth.uid()::text 
      AND ruolo = 'super_admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_ruolo ON users(ruolo);
CREATE INDEX IF NOT EXISTS idx_users_gym_id ON users(gym_id);

-- Insert a test admin user (you can modify these details)
INSERT INTO users (
  id,
  nome, 
  cognome, 
  email, 
  ruolo, 
  attivo,
  creato_il
) VALUES (
  gen_random_uuid(),
  'Admin',
  'Test',
  'admin@test.com',
  'super_admin',
  true,
  now()
) ON CONFLICT (email) DO NOTHING;