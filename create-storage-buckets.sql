-- Supabase Storage Buckets für die Video-Kurs-Plattform erstellen
-- WICHTIG: Diese Befehle müssen im Supabase Dashboard unter "Storage" ausgeführt werden
-- Dieses SQL ist nur zur Dokumentation - die Buckets werden über das Dashboard erstellt

-- 1. MANUELL IM SUPABASE DASHBOARD:
-- Gehe zu: Storage → "New bucket"
-- Erstelle folgende Buckets:

-- Bucket 1: "videos"
-- - Name: videos
-- - Public: false (privat für Mitglieder)
-- - File size limit: 2GB
-- - Allowed MIME types: video/mp4, video/mov, video/avi, video/mkv

-- Bucket 2: "thumbnails" 
-- - Name: thumbnails
-- - Public: true (öffentlich für Vorschaubilder)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- 2. DANN DIESES SQL AUSFÜHREN FÜR RLS POLICIES:

-- Videos Bucket Policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('videos', 'videos', false, 2147483648, '{"video/mp4","video/mov","video/avi","video/mkv","video/webm"}'),
  ('thumbnails', 'thumbnails', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif"}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS für Videos aktivieren
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Admins können Videos hochladen
CREATE POLICY "Admins can upload videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Admins können Videos verwalten
CREATE POLICY "Admins can manage videos" ON storage.objects
FOR ALL USING (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Mitglieder können Videos ansehen (später für Premium-System)
CREATE POLICY "Members can view videos" ON storage.objects
FOR SELECT USING (
  bucket_id = 'videos' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM user_memberships 
    WHERE user_id = auth.uid() 
    AND status = 'active'
    AND expires_at > NOW()
  )
);

-- Thumbnails Policies
CREATE POLICY "Admins can manage thumbnails" ON storage.objects
FOR ALL USING (
  bucket_id = 'thumbnails' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Jeder kann Thumbnails sehen
CREATE POLICY "Public can view thumbnails" ON storage.objects
FOR SELECT USING (bucket_id = 'thumbnails');

-- Bestätigung
SELECT 
  'Storage Buckets und Policies erfolgreich erstellt!' as status,
  COUNT(*) as bucket_count
FROM storage.buckets 
WHERE id IN ('videos', 'thumbnails');
