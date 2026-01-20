-- Drop overly permissive policies
DROP POLICY IF EXISTS "Auth users can insert contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Auth users can update contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Auth users can delete contacts" ON public.emergency_contacts;

-- Create proper admin-only policies using profiles table
CREATE POLICY "Admins can insert contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update contacts" 
ON public.emergency_contacts 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete contacts" 
ON public.emergency_contacts 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);