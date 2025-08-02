/*
  # Add product_id to subscriptions table

  1. Changes
    - Add `product_id` column to `subscriptions` table
    - Add foreign key constraint to link subscriptions to subscription_products
    - Update existing subscriptions to have a default product (if any exist)

  2. Notes
    - This migration handles existing data by creating a default product if needed
    - The product_id column is initially nullable to handle existing records
*/

-- First, ensure we have at least one subscription product for existing subscriptions
DO $$
BEGIN
  -- Check if subscription_products table exists and has data
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_products') THEN
    -- If no products exist, create a default one for existing subscriptions
    IF NOT EXISTS (SELECT 1 FROM subscription_products LIMIT 1) THEN
      INSERT INTO subscription_products (
        name,
        description,
        price,
        duration_value,
        duration_unit,
        is_active
      ) VALUES (
        'Abbonamento Standard',
        'Abbonamento standard migrato dal sistema precedente',
        50.00,
        1,
        'months',
        true
      );
    END IF;
  END IF;
END $$;

-- Add product_id column to subscriptions table (nullable initially)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' AND column_name = 'product_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN product_id uuid;
  END IF;
END $$;

-- Update existing subscriptions to reference the first available product
UPDATE subscriptions 
SET product_id = (
  SELECT id FROM subscription_products 
  WHERE is_active = true 
  LIMIT 1
)
WHERE product_id IS NULL;

-- Now make product_id NOT NULL and add the foreign key constraint
DO $$
BEGIN
  -- Make product_id NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscriptions' 
    AND column_name = 'product_id' 
    AND is_nullable = 'YES'
  ) THEN
    ALTER TABLE subscriptions ALTER COLUMN product_id SET NOT NULL;
  END IF;

  -- Add foreign key constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_subscriptions_product_id'
  ) THEN
    ALTER TABLE subscriptions 
    ADD CONSTRAINT fk_subscriptions_product_id 
    FOREIGN KEY (product_id) REFERENCES subscription_products(id);
  END IF;
END $$;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_product_id 
ON subscriptions USING btree (product_id);