-- Migration: Add active field to profile table for soft delete
-- Description: Instead of hard deleting users, we'll mark them as inactive to maintain traceability

-- Add active column to profile table (default true for existing users)
ALTER TABLE profile
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Create index for faster filtering of active users
CREATE INDEX IF NOT EXISTS idx_profile_active ON profile(active);

-- Create index for tenant_id + active (common query pattern)
CREATE INDEX IF NOT EXISTS idx_profile_tenant_active ON profile(tenant_id, active);

-- Comment for documentation
COMMENT ON COLUMN profile.active IS 'Soft delete flag: false = inactive user (preserves traceability)';
