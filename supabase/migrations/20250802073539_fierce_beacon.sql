/*
  # Create Subscription Products System

  1. New Types
    - `duration_unit_type` enum for subscription duration units (days, weeks, months, years, credits)

  2. New Tables
    - `subscription_products`
      - `id` (uuid, primary key)
      - `name` (text, subscription product name)
      - `description` (text, optional description)
      - `price` (numeric, price in euros)
      - `duration_value` (integer, duration amount)
      - `duration_unit` (duration_unit_type, unit of duration)
      - `credits_included` (integer, credits for credit-based subscriptions)
      - `is_active` (boolean, whether product is available)
      - `gym_id` (uuid, for multi-gym support)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  3. Table Modifications
    - Modify `subscriptions` table to reference `subscription_products`
    - Remove redundant columns from `subscriptions`
    - Add foreign key relationship

  4. Security
    - Enable RLS on `subscription_products` table
    - Add policy for gym-based access control
*/

-- Create the duration unit type enum
CREATE TYPE IF NOT EXISTS public.duration_unit_type AS ENUM (
    'days',
    'weeks', 
    'months',
    'years',
    'credits'
);

-- Create the subscription_products table
CREATE TABLE IF NOT EXISTS public.subscription_products (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    duration_value integer NOT NULL,
    duration_unit public.duration_unit_type NOT NULL,
    credits_included integer,
    is_active boolean DEFAULT TRUE,
    gym_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_products_gym_id ON public.subscription_products USING btree (gym_id);
CREATE INDEX IF NOT EXISTS idx_subscription_products_is_active ON public.subscription_products USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_products_duration_unit ON public.subscription_products USING btree (duration_unit);

-- Enable RLS on subscription_products
ALTER TABLE public.subscription_products ENABLE ROW LEVEL SECURITY;

-- Create policy for subscription products access
CREATE POLICY "Subscription products gym access" ON public.subscription_products
FOR ALL USING (
  ((jwt() ->> 'user_metadata'::text)::jsonb ->> 'role'::text) = 'super_admin'::text
  OR
  gym_id IN (
    SELECT u.gym_id
    FROM public.users u
    WHERE u.id = auth.uid()
    AND u.ruolo = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'trainer'::user_role, 'staff'::user_role])
  )
);

-- Add product_id column to subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE public.subscriptions ADD COLUMN product_id uuid;
  END IF;
END $$;

-- Add foreign key constraint for product_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_subscriptions_product_id'
  ) THEN
    ALTER TABLE public.subscriptions
    ADD CONSTRAINT fk_subscriptions_product_id
    FOREIGN KEY (product_id) REFERENCES public.subscription_products(id);
  END IF;
END $$;

-- Remove redundant columns from subscriptions table (only if they exist)
DO $$
BEGIN
  -- Remove tipo column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'tipo'
  ) THEN
    ALTER TABLE public.subscriptions DROP COLUMN tipo;
  END IF;

  -- Remove nome column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'nome'
  ) THEN
    ALTER TABLE public.subscriptions DROP COLUMN nome;
  END IF;

  -- Remove prezzo column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'prezzo'
  ) THEN
    ALTER TABLE public.subscriptions DROP COLUMN prezzo;
  END IF;

  -- Remove crediti_totali column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'crediti_totali'
  ) THEN
    ALTER TABLE public.subscriptions DROP COLUMN crediti_totali;
  END IF;
END $$;

-- Insert some sample subscription products for testing
INSERT INTO public.subscription_products (name, description, price, duration_value, duration_unit, gym_id) VALUES
('Abbonamento Mensile Base', 'Accesso illimitato alla sala pesi e cardio per 1 mese', 50.00, 1, 'months', 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22'),
('Abbonamento Trimestrale', 'Accesso illimitato per 3 mesi con sconto', 135.00, 3, 'months', 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22'),
('Abbonamento Annuale', 'Accesso illimitato per 1 anno con massimo sconto', 480.00, 1, 'years', 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22'),
('Pacchetto 10 Ingressi', 'Pacchetto flessibile di 10 ingressi da utilizzare quando vuoi', 80.00, 10, 'credits', 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22', 10),
('Prova 3 Lezioni', 'Pacchetto di prova per nuovi iscritti - 3 lezioni', 25.00, 3, 'credits', 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22', 3),
('Abbonamento Settimanale', 'Accesso per una settimana, ideale per turisti', 20.00, 1, 'weeks', 'b1ffcc99-8d1c-5fg9-cc7e-7cc0ce491b22')
ON CONFLICT DO NOTHING;