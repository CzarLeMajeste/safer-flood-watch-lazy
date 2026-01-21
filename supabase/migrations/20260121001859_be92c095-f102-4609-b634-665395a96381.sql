-- Update emergency_contacts table to use email instead of phone
ALTER TABLE public.emergency_contacts 
  ADD COLUMN email TEXT,
  ALTER COLUMN phone_number DROP NOT NULL;

-- Update existing records with placeholder emails (you can update these later)
UPDATE public.emergency_contacts SET email = 'tyroneyson27@gmail.com' WHERE phone_number = '+639953481743';
UPDATE public.emergency_contacts SET email = 'tkcabasan@gmail.com' WHERE phone_number = '+639271347954';

-- Rename sms_queue to email_queue for clarity
ALTER TABLE public.sms_queue RENAME TO email_queue;
ALTER TABLE public.email_queue RENAME COLUMN message_body TO email_body;