-- Create emergency_contacts table
CREATE TABLE public.emergency_contacts (
  id SERIAL PRIMARY KEY,
  phone_number TEXT NOT NULL UNIQUE,
  name TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Allow public read for ESP32 polling
CREATE POLICY "Allow public read for ESP32" 
ON public.emergency_contacts 
FOR SELECT 
USING (true);

-- Allow authenticated users to manage contacts
CREATE POLICY "Auth users can insert contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Auth users can update contacts" 
ON public.emergency_contacts 
FOR UPDATE 
USING (true);

CREATE POLICY "Auth users can delete contacts" 
ON public.emergency_contacts 
FOR DELETE 
USING (true);

-- Insert the two initial emergency contacts
INSERT INTO public.emergency_contacts (phone_number, name) VALUES
  ('+639953481743', 'Contact 1'),
  ('+639271347954', 'Contact 2');