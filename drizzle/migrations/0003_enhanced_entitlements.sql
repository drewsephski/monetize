-- Add trial tracking to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS trial_active boolean DEFAULT false;

-- Add features and limits to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS limits jsonb DEFAULT '{}'::jsonb;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT 0;

-- Add dunning tracking to subscriptions
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS failed_payment_count integer DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS past_due_since timestamp with time zone;

-- Add index for trial lookups
CREATE INDEX IF NOT EXISTS subscriptions_trial_active_idx ON subscriptions (trial_active) WHERE trial_active = true;
