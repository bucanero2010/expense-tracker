-- Run this in your Supabase SQL Editor to add the shared/tag column
ALTER TABLE expenses ADD COLUMN shared_with TEXT DEFAULT NULL;

-- Optional: index for filtering
CREATE INDEX idx_expenses_shared_with ON expenses (shared_with);
