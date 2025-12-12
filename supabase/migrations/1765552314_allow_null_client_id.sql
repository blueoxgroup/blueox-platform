-- Migration: allow_null_client_id
-- Created at: 1765552314

-- Allow client_id to be null for chatbot applications
ALTER TABLE applications ALTER COLUMN client_id DROP NOT NULL;

-- Add comment to document the change
COMMENT ON COLUMN applications.client_id IS 'Optional client ID for tracking; null for chatbot applications';