-- Fix sessions table id column to have a default value
ALTER TABLE "sessions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
