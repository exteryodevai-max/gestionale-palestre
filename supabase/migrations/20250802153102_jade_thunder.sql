/*
  # Add missing columns to users table

  1. New Columns
    - `data_nascita` (date, nullable) - Birth date for staff members
    - `indirizzo` (text, nullable) - Address for staff members
    - `note` (text, nullable) - Additional notes for staff members

  2. Changes
    - Add missing columns that are referenced in the application code
    - All columns are nullable since they represent optional information
*/

-- Add missing columns to users table
DO $$
BEGIN
  -- Add data_nascita column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'data_nascita'
  ) THEN
    ALTER TABLE users ADD COLUMN data_nascita date;
  END IF;

  -- Add indirizzo column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'indirizzo'
  ) THEN
    ALTER TABLE users ADD COLUMN indirizzo text;
  END IF;

  -- Add note column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'note'
  ) THEN
    ALTER TABLE users ADD COLUMN note text;
  END IF;
END $$;