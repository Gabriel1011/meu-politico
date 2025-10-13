-- Allow politicos and admins to view all profiles in their tenant
-- Uses SECURITY DEFINER helper functions to avoid RLS recursion
CREATE POLICY "profile_select_staff_tenant" ON profile FOR
SELECT
  TO authenticated USING (
    public.get_my_role () IN ('politico', 'admin', 'assessor')
    AND tenant_id = public.get_my_tenant_id ()
  );

-- Allow politicos and admins to update profiles in their tenant
CREATE POLICY "profile_update_staff_tenant" ON profile FOR
UPDATE TO authenticated USING (
  public.get_my_role () IN ('politico', 'admin', 'superadmin')
  AND tenant_id = public.get_my_tenant_id ()
)
WITH
  CHECK (
    -- Garante que não podem mudar o tenant_id
    tenant_id = public.get_my_tenant_id ()
  );