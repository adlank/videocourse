-- Fix Supabase Storage Access für Videos und Thumbnails
-- Diese SQL-Befehle müssen in Supabase SQL Editor ausgeführt werden

-- 1. Storage Buckets öffentlich machen
UPDATE storage.buckets 
SET public = true 
WHERE id IN ('videos', 'thumbnails');

-- 2. RLS Policies für Storage Objects erstellen/aktualisieren

-- Videos Bucket - Öffentlicher Lesezugriff
DROP POLICY IF EXISTS "Public read access for videos" ON storage.objects;
CREATE POLICY "Public read access for videos" ON storage.objects
FOR SELECT USING (bucket_id = 'videos');

-- Videos Bucket - Authentifizierte Benutzer können hochladen
DROP POLICY IF EXISTS "Authenticated users can upload videos" ON storage.objects;
CREATE POLICY "Authenticated users can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Videos Bucket - Authentifizierte Benutzer können aktualisieren
DROP POLICY IF EXISTS "Authenticated users can update videos" ON storage.objects;
CREATE POLICY "Authenticated users can update videos" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Videos Bucket - Authentifizierte Benutzer können löschen
DROP POLICY IF EXISTS "Authenticated users can delete videos" ON storage.objects;
CREATE POLICY "Authenticated users can delete videos" ON storage.objects
FOR DELETE USING (
  bucket_id = 'videos' 
  AND auth.role() = 'authenticated'
);

-- Thumbnails Bucket - Öffentlicher Lesezugriff
DROP POLICY IF EXISTS "Public read access for thumbnails" ON storage.objects;
CREATE POLICY "Public read access for thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

-- Thumbnails Bucket - Authentifizierte Benutzer können hochladen
DROP POLICY IF EXISTS "Authenticated users can upload thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can upload thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'thumbnails' 
  AND auth.role() = 'authenticated'
);

-- Thumbnails Bucket - Authentifizierte Benutzer können aktualisieren
DROP POLICY IF EXISTS "Authenticated users can update thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can update thumbnails" ON storage.objects
FOR UPDATE WITH CHECK (
  bucket_id = 'thumbnails' 
  AND auth.role() = 'authenticated'
);

-- Thumbnails Bucket - Authentifizierte Benutzer können löschen
DROP POLICY IF EXISTS "Authenticated users can delete thumbnails" ON storage.objects;
CREATE POLICY "Authenticated users can delete thumbnails" ON storage.objects
FOR DELETE USING (
  bucket_id = 'thumbnails' 
  AND auth.role() = 'authenticated'
);

-- 3. Überprüfung der Bucket-Konfiguration
SELECT 
  id as bucket_name,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id IN ('videos', 'thumbnails');

-- 4. Überprüfung der Storage-Policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
ORDER BY policyname;
