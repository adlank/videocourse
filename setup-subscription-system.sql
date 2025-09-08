-- Abonnement-System für die Krav Maga Plattform
-- Führe dieses SQL in deinem Supabase SQL Editor aus

-- 1. profiles Tabelle um Abonnement-Felder erweitern
DO $$ 
BEGIN
    -- Abonnement-Status hinzufügen
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_status') THEN
        ALTER TABLE profiles ADD COLUMN subscription_status TEXT DEFAULT 'inactive';
    END IF;
    
    -- Stripe Customer ID
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'stripe_customer_id') THEN
        ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
    END IF;
    
    -- Stripe Subscription ID
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_id') THEN
        ALTER TABLE profiles ADD COLUMN subscription_id TEXT;
    END IF;
    
    -- Abonnement-Plan (monthly/yearly)
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_plan') THEN
        ALTER TABLE profiles ADD COLUMN subscription_plan TEXT;
    END IF;
    
    -- Aktuelle Periode Start
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_current_period_start') THEN
        ALTER TABLE profiles ADD COLUMN subscription_current_period_start TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Aktuelle Periode Ende
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_current_period_end') THEN
        ALTER TABLE profiles ADD COLUMN subscription_current_period_end TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Abonnement erstellt am
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'subscription_created_at') THEN
        ALTER TABLE profiles ADD COLUMN subscription_created_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- 2. Zahlungshistorie Tabelle
CREATE TABLE IF NOT EXISTS payment_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER NOT NULL, -- Betrag in Rappen (CHF)
  currency TEXT DEFAULT 'CHF',
  status TEXT NOT NULL, -- 'succeeded', 'failed', 'pending', 'refunded'
  description TEXT,
  receipt_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Abonnement-Pläne Tabelle (für Admin-Verwaltung)
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  stripe_price_id TEXT UNIQUE NOT NULL,
  price INTEGER NOT NULL, -- Preis in Rappen
  currency TEXT DEFAULT 'CHF',
  interval TEXT NOT NULL, -- 'month' oder 'year'
  interval_count INTEGER DEFAULT 1,
  trial_period_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  features TEXT[], -- Array von Features
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Abonnement-Events Tabelle (für Audit-Trail)
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'updated', 'canceled', 'payment_succeeded', 'payment_failed'
  stripe_event_id TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Indizes für bessere Performance
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_id ON profiles(subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_end ON profiles(subscription_current_period_end);

CREATE INDEX IF NOT EXISTS idx_payment_history_user_id ON payment_history(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);
CREATE INDEX IF NOT EXISTS idx_payment_history_created_at ON payment_history(created_at);

CREATE INDEX IF NOT EXISTS idx_subscription_plans_active ON subscription_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price_id ON subscription_plans(stripe_price_id);

CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);

-- 6. RLS Policies aktivieren
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies erstellen

-- payment_history Policies
CREATE POLICY "Users can view own payment history" ON payment_history
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment history" ON payment_history
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- subscription_plans Policies (öffentlich lesbar, nur Admins können ändern)
CREATE POLICY "Subscription plans visible to all" ON subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON subscription_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- subscription_events Policies
CREATE POLICY "Users can view own subscription events" ON subscription_events
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscription events" ON subscription_events
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- System kann Events erstellen (für Webhooks)
CREATE POLICY "System can create subscription events" ON subscription_events
FOR INSERT WITH CHECK (true);

-- 8. Trigger für updated_at
DROP TRIGGER IF EXISTS update_payment_history_updated_at ON payment_history;
CREATE TRIGGER update_payment_history_updated_at 
  BEFORE UPDATE ON payment_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscription_plans_updated_at ON subscription_plans;
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Hilfsfunktionen

-- Funktion um zu prüfen ob Benutzer aktives Abonnement hat
CREATE OR REPLACE FUNCTION has_active_subscription(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    subscription_valid BOOLEAN := FALSE;
BEGIN
    SELECT 
        subscription_status IN ('active', 'trialing') 
        AND (subscription_current_period_end IS NULL OR subscription_current_period_end > NOW())
    INTO subscription_valid
    FROM profiles
    WHERE id = p_user_id;
    
    RETURN COALESCE(subscription_valid, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funktion um Abonnement-Status zu aktualisieren
CREATE OR REPLACE FUNCTION update_subscription_status(
    p_user_id UUID,
    p_status TEXT,
    p_subscription_id TEXT DEFAULT NULL,
    p_plan TEXT DEFAULT NULL,
    p_period_start TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_period_end TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_customer_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles SET
        subscription_status = p_status,
        subscription_id = COALESCE(p_subscription_id, subscription_id),
        subscription_plan = COALESCE(p_plan, subscription_plan),
        subscription_current_period_start = COALESCE(p_period_start, subscription_current_period_start),
        subscription_current_period_end = COALESCE(p_period_end, subscription_current_period_end),
        stripe_customer_id = COALESCE(p_customer_id, stripe_customer_id),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Standard-Abonnement-Pläne einfügen
INSERT INTO subscription_plans (name, description, stripe_price_id, price, currency, interval, features) 
VALUES 
(
    'Monatlich',
    'Monatlicher Zugang zu allen Kursen',
    'price_monthly_placeholder', -- Ersetzen Sie mit echter Stripe Price ID
    2900, -- CHF 29.00
    'CHF',
    'month',
    ARRAY[
        'Zugang zu allen Kursen',
        'Unbegrenzte Videozeit',
        'Fortschrittsverfolgung',
        'Bookmarks und Notizen',
        'Mobile App Zugang',
        'Community Forum'
    ]
),
(
    'Jährlich',
    'Jährlicher Zugang zu allen Kursen (2 Monate gratis!)',
    'price_yearly_placeholder', -- Ersetzen Sie mit echter Stripe Price ID
    29000, -- CHF 290.00
    'CHF',
    'year',
    ARRAY[
        'Zugang zu allen Kursen',
        'Unbegrenzte Videozeit',
        'Fortschrittsverfolgung',
        'Bookmarks und Notizen',
        'Mobile App Zugang',
        'Community Forum',
        'Prioritätssupport',
        '2 Monate GRATIS!'
    ]
)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- 11. Aktualisierte RLS Policy für course_lessons (nur für Abonnenten)
DROP POLICY IF EXISTS "Lessons visible to subscribers" ON course_lessons;
CREATE POLICY "Lessons visible to subscribers" ON course_lessons FOR SELECT USING (
    is_preview = true OR 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (
            is_admin = true OR 
            has_active_subscription(id)
        )
    )
);

-- 12. Bestätigung
SELECT 
    'Abonnement-System erfolgreich eingerichtet!' as status,
    (SELECT COUNT(*) FROM subscription_plans WHERE is_active = true) as active_plans,
    (SELECT COUNT(*) FROM profiles WHERE subscription_status = 'active') as active_subscribers;
