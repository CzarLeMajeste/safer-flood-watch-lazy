-- Add humidity column to sensor_readings
ALTER TABLE public.sensor_readings 
ADD COLUMN humidity double precision;