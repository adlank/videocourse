-- Supabase Storage für Video-Upload konfigurieren
-- Führe dieses SQL in deinem Supabase SQL Editor aus

-- 1. Storage Buckets erstellen (falls nicht bereits vorhanden)
-- Dies wird normalerweise über das Supabase Dashboard gemacht, aber hier zur Dokumentation

-- 2. RLS Policies für Storage erstellen
-- Admins können alle Videos hochladen und verwalten
CREATE POLICY "Admins can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can update videos" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Admins can delete videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Authentifizierte Benutzer können Videos ansehen (für Premium-Mitglieder)
CREATE POLICY "Members can view videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated'
);

-- 3. Thumbnails Bucket Policies
CREATE POLICY "Admins can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

CREATE POLICY "Everyone can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

-- 4. Zeige aktuelle Storage Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects';
