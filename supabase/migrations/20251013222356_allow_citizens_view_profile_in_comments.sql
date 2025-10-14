-- ============================================
-- MIGRATION: Allow citizens to view profile info in comments
-- Description: Allow citizens to view basic profile info (including role)
--              from the same tenant when they appear in comments
-- ============================================

-- Drop and recreate the policy to allow all authenticated users in the same tenant
-- to view basic profile information (needed for comment authors)
DROP POLICY IF EXISTS "profile_select_own" ON profile;

-- Policy 1: Users can always see their own profile
CREATE POLICY "profile_select_own"
  ON profile FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Policy 2: Users can see basic info of profiles in the same tenant
-- This allows citizens to see who commented on their tickets
CREATE POLICY "profile_select_same_tenant"
  ON profile FOR SELECT
  TO authenticated
  USING (
    tenant_id = public.get_my_tenant_id()
    AND tenant_id IS NOT NULL
  );
