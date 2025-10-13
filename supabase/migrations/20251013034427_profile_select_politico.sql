-- Allow politicos to view all profiles in their tenant
-- Uses SECURITY DEFINER helper functions to avoid RLS recursion

CREATE POLICY "profile_select_politico_tenant"
  ON profile FOR SELECT
  TO authenticated
  USING (
    public.get_my_role() = 'politico'
    AND tenant_id = public.get_my_tenant_id()
  );
