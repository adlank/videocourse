-- Fix RLS Policy für Lektionen-Zugang
-- Dieses SQL in Supabase SQL Editor ausführen

-- 1. Alte restriktive Policy löschen
DROP POLICY IF EXISTS "Lessons visible to subscribers" ON course_lessons;

-- 2. Neue permissive Policy erstellen (für Testzwecke)
-- Alle authentifizierten Benutzer können alle Lektionen von veröffentlichten Kursen sehen
CREATE POLICY "Lessons visible to authenticated users" ON course_lessons FOR SELECT USING (
    -- Entweder ist es eine Vorschau-Lektion
    is_preview = true OR 
    -- Oder der Benutzer ist authentifiziert und der Kurs ist veröffentlicht
    (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM courses 
            WHERE id = course_id AND is_published = true
        )
    )
);

-- 3. Alternative: Für Produktionsumgebung mit Abonnement-Prüfung
-- (Kommentiert aus - verwenden Sie diese später)
/*
CREATE POLICY "Lessons visible with subscription" ON course_lessons FOR SELECT USING (
    -- Vorschau-Lektionen für alle
    is_preview = true OR 
    -- Oder aktive Abonnenten/Admins
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND (
            subscription_status IN ('active', 'trialing') OR 
            is_admin = true
        )
    ) OR
    -- Oder für Testzwecke: alle authentifizierten Benutzer
    (auth.role() = 'authenticated')
);
*/

-- 4. Prüfen der aktuellen Policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'course_lessons'
ORDER BY policyname;

-- 5. Test-Abfrage: Sollte jetzt Lektionen für authentifizierte Benutzer anzeigen
-- SELECT cl.id, cl.title, cl.is_preview, c.title as course_title, c.is_published
-- FROM course_lessons cl
-- JOIN courses c ON cl.course_id = c.id
-- WHERE c.is_published = true
-- ORDER BY c.title, cl.sort_order;
