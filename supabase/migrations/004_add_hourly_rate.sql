-- Add hourly_rate column to users table for captain compensation tracking
ALTER TABLE users
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 0;

-- Add comment
COMMENT ON COLUMN users.hourly_rate IS 'Hourly rate for captains in EUR. 0 for non-captain roles or owner-captains.';
