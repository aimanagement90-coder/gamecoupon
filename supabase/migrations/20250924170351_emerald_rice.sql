/*
  # Update coupons table with quantity and minimum purchase amount

  1. Changes
    - Add `quantity` column to track available coupon count
    - Add `min_purchase_amount` column for minimum purchase requirement
    - Set default values for existing records

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to coupons table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'quantity'
  ) THEN
    ALTER TABLE coupons ADD COLUMN quantity integer DEFAULT 1 NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'min_purchase_amount'
  ) THEN
    ALTER TABLE coupons ADD COLUMN min_purchase_amount decimal(10,2) DEFAULT 0 NOT NULL;
  END IF;
END $$;