-- Run this in your Supabase SQL Editor to create the expenses table

CREATE TABLE IF NOT EXISTS expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast date-range queries
CREATE INDEX idx_expenses_date ON expenses (date);
CREATE INDEX idx_expenses_category ON expenses (category);

-- Disable RLS since this is a solo app with no auth
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow all operations without auth (anon key access)
CREATE POLICY "Allow all" ON expenses
  FOR ALL
  USING (true)
  WITH CHECK (true);
