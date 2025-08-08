```sql
-- Create course_instances table
CREATE TABLE IF NOT EXISTS public.course_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  trainer_id uuid,
  area_id uuid,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  max_capacity integer NOT NULL DEFAULT 1,
  current_bookings_count integer DEFAULT 0,
  is_cancelled boolean DEFAULT false,
  gym_id uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.course_instances ENABLE ROW LEVEL SECURITY;

-- RLS Policy for gym access
CREATE POLICY "Course instances gym access" ON public.course_instances
  FOR ALL
  TO authenticated
  USING (
    ((jwt() ->> 'user_metadata'::text)::jsonb ->> 'role'::text) = 'super_admin'::text
    OR
    gym_id IN (
      SELECT u.gym_id
      FROM public.users u
      WHERE u.id = auth.uid()
      AND u.ruolo = ANY (ARRAY['admin'::user_role, 'super_admin'::user_role, 'trainer'::user_role, 'staff'::user_role])
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_instances_course_id ON public.course_instances USING btree (course_id);
CREATE INDEX IF NOT EXISTS idx_course_instances_trainer_id ON public.course_instances USING btree (trainer_id);
CREATE INDEX IF NOT EXISTS idx_course_instances_area_id ON public.course_instances USING btree (area_id);
CREATE INDEX IF NOT EXISTS idx_course_instances_start_time ON public.course_instances USING btree (start_time);
CREATE INDEX IF NOT EXISTS idx_course_instances_gym_id ON public.course_instances USING btree (gym_id);

-- Add foreign key constraints (these will be added in a separate, subsequent migration if not already present)
-- ALTER TABLE public.course_instances ADD CONSTRAINT fk_course_id FOREIGN KEY (course_id) REFERENCES public.courses(id) ON DELETE CASCADE;
-- ALTER TABLE public.course_instances ADD CONSTRAINT fk_trainer_id FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE SET NULL;
-- ALTER TABLE public.course_instances ADD CONSTRAINT fk_area_id FOREIGN KEY (area_id) REFERENCES public.areas(id) ON DELETE SET NULL;
```