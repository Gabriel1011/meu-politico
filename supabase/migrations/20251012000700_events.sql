-- ============================================
-- EVENTS TABLE
-- ============================================
-- Table to store public agenda events from the office

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,

  -- Event information
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500),

  -- Date and time
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,

  -- Banner image
  banner_url TEXT,

  -- Visibility
  published BOOLEAN NOT NULL DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_events_tenant_id
  ON public.events(tenant_id);

CREATE INDEX IF NOT EXISTS idx_events_start_date
  ON public.events(start_date DESC);

CREATE INDEX IF NOT EXISTS idx_events_published
  ON public.events(published)
  WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_events_tenant_date
  ON public.events(tenant_id, start_date DESC);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Public can view published events
CREATE POLICY "Anyone can view published events"
  ON public.events
  FOR SELECT
  USING (published = true);

-- Staff (assessor, politico, admin) can view all events from their tenant
CREATE POLICY "Staff can view all events from their tenant"
  ON public.events
  FOR SELECT
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profile
      WHERE id = auth.uid()
        AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- Staff can insert events for their tenant
CREATE POLICY "Staff can create events for their tenant"
  ON public.events
  FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.profile
      WHERE id = auth.uid()
        AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- Staff can update events from their tenant
CREATE POLICY "Staff can update events from their tenant"
  ON public.events
  FOR UPDATE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profile
      WHERE id = auth.uid()
        AND role IN ('assessor', 'politico', 'admin')
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.profile
      WHERE id = auth.uid()
        AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- Staff can delete events from their tenant
CREATE POLICY "Staff can delete events from their tenant"
  ON public.events
  FOR DELETE
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.profile
      WHERE id = auth.uid()
        AND role IN ('assessor', 'politico', 'admin')
    )
  );

-- ============================================
-- TRIGGER FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE public.events IS 'Public agenda events from the office';
COMMENT ON COLUMN public.events.tenant_id IS 'Tenant (office) ID that owns this event';
COMMENT ON COLUMN public.events.published IS 'If true, event is publicly visible';
COMMENT ON COLUMN public.events.start_date IS 'Event start date and time';
COMMENT ON COLUMN public.events.end_date IS 'Event end date and time';
