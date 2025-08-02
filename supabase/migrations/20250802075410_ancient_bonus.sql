/*
  # Create subscription_products table

  1. New Tables
    - `subscription_products`
      - `id` (uuid, primary key)
      - `name` (text, required) - Nome del prodotto abbonamento
      - `description` (text, optional) - Descrizione del prodotto
      - `price` (numeric, required) - Prezzo del prodotto
      - `duration_value` (integer, required) - Valore della durata
      - `duration_unit` (enum, required) - Unità di durata (days, weeks, months, years, credits)
      - `credits_included` (integer, optional) - Crediti inclusi per abbonamenti a crediti
      - `is_active` (boolean, default true) - Se il prodotto è attivo/disponibile
      - `gym_id` (uuid, optional) - ID della palestra
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `subscription_products` table
    - Add policy for gym access (admin, super_admin, trainer, staff can manage products)
    - Add policy for super_admin full access

  3. Indexes
    - Index on gym_id for performance
    - Index on is_active for filtering active products
*/

-- Create enum for duration units if not exists
DO $$ BEGIN
    CREATE TYPE duration_unit_type AS ENUM ('days', 'weeks', 'months', 'years', 'credits');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create subscription_products table
CREATE TABLE IF NOT EXISTS subscription_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  duration_value integer NOT NULL DEFAULT 1,
  duration_unit duration_unit_type NOT NULL DEFAULT 'months',
  credits_included integer,
  is_active boolean DEFAULT true,
  gym_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_products ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_products_gym_id ON subscription_products(gym_id);
CREATE INDEX IF NOT EXISTS idx_subscription_products_active ON subscription_products(is_active);

-- Create RLS policies
CREATE POLICY "Subscription products gym access" ON subscription_products
FOR ALL USING (
  (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'super_admin'
  OR 
  gym_id IN (
    SELECT u.gym_id FROM users u 
    WHERE u.id = auth.uid() 
    AND u.ruolo IN ('admin', 'super_admin', 'trainer', 'staff')
  )
);

-- Create policy for super admin full access
CREATE POLICY "Super admin full access to subscription products" ON subscription_products
FOR ALL USING (
  (((jwt() ->> 'user_metadata'::text))::jsonb ->> 'role'::text) = 'super_admin'
);

-- Update subscriptions table to reference subscription_products
DO $$
BEGIN
  -- Add product_id column to subscriptions if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN product_id uuid REFERENCES subscription_products(id);
  END IF;

  -- Remove old columns that are now in subscription_products
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE subscriptions DROP COLUMN IF EXISTS tipo;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'nome'
  ) THEN
    ALTER TABLE subscriptions DROP COLUMN IF EXISTS nome;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'prezzo'
  ) THEN
    ALTER TABLE subscriptions DROP COLUMN IF EXISTS prezzo;
  END IF;
END $$;