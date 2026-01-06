-- Add sent_at column to sms_queue
ALTER TABLE public.sms_queue 
ADD COLUMN sent_at TIMESTAMP WITH TIME ZONE;

-- Create function to update sent_at when status changes to 'sent'
CREATE OR REPLACE FUNCTION public.update_sms_sent_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'sent' AND (OLD.status IS NULL OR OLD.status != 'sent') THEN
    NEW.sent_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
CREATE TRIGGER update_sms_sent_at_trigger
BEFORE UPDATE ON public.sms_queue
FOR EACH ROW
EXECUTE FUNCTION public.update_sms_sent_at();