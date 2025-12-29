-- Fix user deletion issue - add ON DELETE CASCADE to blocked_slots.created_by
-- This allows users to be deleted without violating foreign key constraints

-- Drop the old constraint that doesn't have cascade delete
ALTER TABLE blocked_slots
DROP CONSTRAINT IF EXISTS blocked_slots_created_by_fkey;

-- Add the new constraint with ON DELETE SET NULL (so we keep the blocked slot record but clear the creator)
ALTER TABLE blocked_slots
ADD CONSTRAINT blocked_slots_created_by_fkey
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
