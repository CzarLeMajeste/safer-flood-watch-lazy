
-- Fix 1: Remove public read on emergency_contacts (edge function uses service role, bypasses RLS)
DROP POLICY "Allow public read for ESP32" ON public.emergency_contacts;

-- Add admin-only read for emergency_contacts
CREATE POLICY "Admins can read contacts"
ON public.emergency_contacts
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Fix 2: Restrict email_queue INSERT to admins only
DROP POLICY "Auth Users can queue SMS" ON public.email_queue;
CREATE POLICY "Admins can queue emails"
ON public.email_queue
FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Fix 3: Restrict email_queue SELECT to admins (edge function uses service role)
DROP POLICY "ESP32 read queue" ON public.email_queue;
CREATE POLICY "Admins can read email queue"
ON public.email_queue
FOR SELECT
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Fix 4: Restrict email_queue UPDATE to admins (edge function uses service role)
DROP POLICY "ESP32 update queue" ON public.email_queue;
CREATE POLICY "Admins can update email queue"
ON public.email_queue
FOR UPDATE
USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
