-- Add image column to messages table for storing base64 image data
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS image TEXT DEFAULT NULL;

-- Add comment describing the column
COMMENT ON COLUMN public.messages.image IS 'Base64 encoded image data for multimodal messages';
