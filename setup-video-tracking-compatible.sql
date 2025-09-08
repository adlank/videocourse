-- Video Tracking und Fortschritts-System für die Krav Maga Plattform
-- KOMPATIBLE VERSION - Funktioniert mit bestehendem Schema
-- Führe dieses SQL in deinem Supabase SQL Editor aus

-- 1. Bestehende user_progress Tabelle erweitern
DO $$ 
BEGIN
    RAISE NOTICE 'Erweitere bestehende user_progress Tabelle...';
    
    -- current_time_seconds hinzufügen
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'user_progress' AND column_name = 'current_time_seconds') THEN
        ALTER TABLE user_progress ADD COLUMN current_time_seconds DECIMAL DEFAULT 0;
        RAISE NOTICE 'current_time_seconds Spalte hinzugefügt';
    END IF;
    
    -- progress_percentage hinzufügen
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'user_progress' AND column_name = 'progress_percentage') THEN
        ALTER TABLE user_progress ADD COLUMN progress_percentage INTEGER DEFAULT 0;
        RAISE NOTICE 'progress_percentage Spalte hinzugefügt';
    END IF;
    
    -- total_watch_time hinzufügen
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'user_progress' AND column_name = 'total_watch_time') THEN
        ALTER TABLE user_progress ADD COLUMN total_watch_time INTEGER DEFAULT 0;
        RAISE NOTICE 'total_watch_time Spalte hinzugefügt';
    END IF;
    
    -- last_accessed_at hinzufügen
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'user_progress' AND column_name = 'last_accessed_at') THEN
        ALTER TABLE user_progress ADD COLUMN last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'last_accessed_at Spalte hinzugefügt';
    END IF;
    
    -- created_at hinzufügen falls nicht vorhanden
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'user_progress' AND column_name = 'created_at') THEN
        ALTER TABLE user_progress ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'created_at Spalte hinzugefügt';
    END IF;
    
    -- updated_at hinzufügen falls nicht vorhanden
    IF NOT EXISTS (SELECT FROM information_schema.columns 
                  WHERE table_name = 'user_progress' AND column_name = 'updated_at') THEN
        ALTER TABLE user_progress ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'updated_at Spalte hinzugefügt';
    END IF;
    
    RAISE NOTICE 'user_progress Tabelle erfolgreich erweitert';
END $$;

-- 2. user_course_progress Tabelle (neue Tabelle)
CREATE TABLE IF NOT EXISTS user_course_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  last_watched_lesson_id UUID REFERENCES course_lessons(id),
  total_lessons INTEGER DEFAULT 0,
  completed_lessons INTEGER DEFAULT 0,
  total_watch_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, course_id)
);

-- 3. lesson_bookmarks Tabelle
CREATE TABLE IF NOT EXISTS lesson_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  time_seconds DECIMAL NOT NULL,
  title TEXT,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, lesson_id, time_seconds)
);

-- 4. learning_stats Tabelle
CREATE TABLE IF NOT EXISTS learning_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  total_watch_time INTEGER DEFAULT 0,
  lessons_completed INTEGER DEFAULT 0,
  courses_accessed INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date)
);

-- 5. Indizes für Performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_accessed ON user_progress(last_accessed_at);

CREATE INDEX IF NOT EXISTS idx_user_course_progress_user_id ON user_course_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_course_progress_course_id ON user_course_progress(course_id);

CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_user_id ON lesson_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_lesson_id ON lesson_bookmarks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_bookmarks_time ON lesson_bookmarks(time_seconds);

CREATE INDEX IF NOT EXISTS idx_learning_stats_user_id ON learning_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_stats_date ON learning_stats(date);

-- 6. RLS für neue Tabellen aktivieren (user_progress hat bereits RLS)
ALTER TABLE user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_stats ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies für neue Tabellen (bestehende Policies für user_progress bleiben)
DO $$
BEGIN
    -- user_course_progress Policies  
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_course_progress' AND policyname = 'user_course_progress_policy') THEN
        CREATE POLICY "user_course_progress_policy" ON user_course_progress FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE 'user_course_progress Policy erstellt';
    END IF;

    -- lesson_bookmarks Policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'lesson_bookmarks' AND policyname = 'lesson_bookmarks_policy') THEN
        CREATE POLICY "lesson_bookmarks_policy" ON lesson_bookmarks FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE 'lesson_bookmarks Policy erstellt';
    END IF;

    -- learning_stats Policies
    IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'learning_stats' AND policyname = 'learning_stats_policy') THEN
        CREATE POLICY "learning_stats_policy" ON learning_stats FOR ALL USING (auth.uid() = user_id);
        RAISE NOTICE 'learning_stats Policy erstellt';
    END IF;
END $$;

-- 8. updated_at Trigger-Funktion (falls nicht vorhanden)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Trigger für updated_at erstellen
DO $$ 
BEGIN
    -- user_progress trigger (erweitert bestehende Tabelle)
    BEGIN
        DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
        CREATE TRIGGER update_user_progress_updated_at 
        BEFORE UPDATE ON user_progress 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'user_progress updated_at Trigger erstellt';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'user_progress Trigger Fehler: %', SQLERRM;
    END;
    
    -- user_course_progress trigger  
    BEGIN
        DROP TRIGGER IF EXISTS update_user_course_progress_updated_at ON user_course_progress;
        CREATE TRIGGER update_user_course_progress_updated_at 
        BEFORE UPDATE ON user_course_progress 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'user_course_progress updated_at Trigger erstellt';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'user_course_progress Trigger Fehler: %', SQLERRM;
    END;
    
    -- learning_stats trigger
    BEGIN
        DROP TRIGGER IF EXISTS update_learning_stats_updated_at ON learning_stats;
        CREATE TRIGGER update_learning_stats_updated_at 
        BEFORE UPDATE ON learning_stats 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'learning_stats updated_at Trigger erstellt';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'learning_stats Trigger Fehler: %', SQLERRM;
    END;
END $$;

-- 10. Hilfsfunktionen
CREATE OR REPLACE FUNCTION calculate_course_progress(p_user_id UUID, p_course_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_lessons INTEGER;
    completed_lessons INTEGER;
    progress_percentage INTEGER;
BEGIN
    -- Gesamtanzahl Lektionen im Kurs
    SELECT COUNT(*) INTO total_lessons
    FROM course_lessons cl
    JOIN course_sections cs ON cl.section_id = cs.id
    WHERE cs.course_id = p_course_id;
    
    -- Anzahl abgeschlossene Lektionen
    SELECT COUNT(*) INTO completed_lessons
    FROM user_progress up
    JOIN course_lessons cl ON up.lesson_id = cl.id
    JOIN course_sections cs ON cl.section_id = cs.id
    WHERE up.user_id = p_user_id 
    AND cs.course_id = p_course_id 
    AND up.completed = true;
    
    -- Fortschritt berechnen
    IF total_lessons > 0 THEN
        progress_percentage := ROUND((completed_lessons::DECIMAL / total_lessons) * 100);
    ELSE
        progress_percentage := 0;
    END IF;
    
    -- user_course_progress aktualisieren
    INSERT INTO user_course_progress (
        user_id, 
        course_id, 
        progress, 
        total_lessons, 
        completed_lessons,
        updated_at
    ) VALUES (
        p_user_id, 
        p_course_id, 
        progress_percentage, 
        total_lessons, 
        completed_lessons,
        NOW()
    )
    ON CONFLICT (user_id, course_id) 
    DO UPDATE SET 
        progress = progress_percentage,
        total_lessons = EXCLUDED.total_lessons,
        completed_lessons = EXCLUDED.completed_lessons,
        updated_at = NOW();
    
    RETURN progress_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Trigger für automatische Fortschritt-Updates
CREATE OR REPLACE FUNCTION update_course_progress_on_lesson_complete()
RETURNS TRIGGER AS $$
BEGIN
    -- Nur wenn Lektion als abgeschlossen markiert wird
    IF NEW.completed = true AND (OLD IS NULL OR OLD.completed = false) THEN
        PERFORM calculate_course_progress(NEW.user_id, NEW.course_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger erstellen
DO $$ 
BEGIN
    BEGIN
        DROP TRIGGER IF EXISTS trigger_update_course_progress ON user_progress;
        CREATE TRIGGER trigger_update_course_progress
        AFTER INSERT OR UPDATE ON user_progress
        FOR EACH ROW EXECUTE FUNCTION update_course_progress_on_lesson_complete();
        RAISE NOTICE 'Fortschritt-Update Trigger erstellt';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Fortschritt-Trigger Fehler: %', SQLERRM;
    END;
END $$;

-- 12. Bestehende Daten aktualisieren (falls vorhanden)
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Setze created_at für bestehende Einträge ohne Datum
    UPDATE user_progress 
    SET created_at = NOW(), updated_at = NOW() 
    WHERE created_at IS NULL;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    IF updated_count > 0 THEN
        RAISE NOTICE 'Timestamps für % bestehende user_progress Einträge gesetzt', updated_count;
    END IF;
END $$;

-- 13. Erfolgs-Bestätigung
DO $$
DECLARE
    table_count INTEGER;
    policy_count INTEGER;
    column_count INTEGER;
BEGIN
    -- Tabellen zählen
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_name IN ('user_progress', 'user_course_progress', 'lesson_bookmarks', 'learning_stats');
    
    -- Policies zählen
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE tablename IN ('user_progress', 'user_course_progress', 'lesson_bookmarks', 'learning_stats');
    
    -- Neue Spalten in user_progress zählen
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'user_progress' 
    AND column_name IN ('current_time_seconds', 'progress_percentage', 'total_watch_time', 'last_accessed_at');
    
    RAISE NOTICE '=== VIDEO TRACKING SYSTEM ERFOLGREICH EINGERICHTET! ===';
    RAISE NOTICE 'Tabellen vorhanden: %', table_count;
    RAISE NOTICE 'Neue Spalten in user_progress: %', column_count;
    RAISE NOTICE 'RLS Policies aktiv: %', policy_count;
    RAISE NOTICE '=== SYSTEM BEREIT FÜR NUTZUNG ===';
END $$;
