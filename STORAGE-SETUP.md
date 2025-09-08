# 🗄️ Supabase Storage Setup für Video-Upload

## Problem: "Bucket not found" Fehler

Die Upload-Funktionalität benötigt zwei Storage Buckets in Supabase:
- `videos` - für Video-Dateien
- `thumbnails` - für Kurs-Bilder

## 🚀 Schnelle Lösung (Supabase Dashboard)

### 1. Supabase Dashboard öffnen
- Gehen Sie zu [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Wählen Sie Ihr Projekt aus
- Navigieren Sie zu **Storage** im Seitenmenü

### 2. Videos Bucket erstellen
1. Klicken Sie auf **"New bucket"**
2. Konfiguration:
   ```
   Name: videos
   Public bucket: ❌ NEIN (privat)
   File size limit: 2048 MB (2GB)
   Allowed MIME types: 
   - video/mp4
   - video/mov
   - video/avi
   - video/mkv
   - video/webm
   - video/quicktime
   ```
3. Klicken Sie **"Save"**

### 3. Thumbnails Bucket erstellen
1. Klicken Sie erneut auf **"New bucket"**
2. Konfiguration:
   ```
   Name: thumbnails  
   Public bucket: ✅ JA (öffentlich)
   File size limit: 5 MB
   Allowed MIME types:
   - image/jpeg
   - image/jpg
   - image/png
   - image/webp
   - image/gif
   ```
3. Klicken Sie **"Save"**

### 4. RLS Policies aktivieren
Führen Sie das SQL-Script aus:
```sql
-- In Supabase SQL Editor ausführen:
-- setup-storage.sql
```

## ✅ Testen

Nach der Einrichtung:
1. Gehen Sie zu `/admin/courses/new`
2. Versuchen Sie ein Thumbnail hochzuladen
3. Versuchen Sie ein Video hochzuladen
4. Beide sollten jetzt funktionieren!

## 🔧 Alternative: Programmatische Erstellung

Falls Sie die Buckets programmatisch erstellen möchten:

```javascript
// In der Browser-Konsole auf /admin/settings/storage ausführen:
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Videos bucket
await supabase.storage.createBucket('videos', {
  public: false,
  fileSizeLimit: 2147483648, // 2GB
  allowedMimeTypes: ['video/mp4', 'video/mov', 'video/avi', 'video/mkv', 'video/webm']
})

// Thumbnails bucket  
await supabase.storage.createBucket('thumbnails', {
  public: true,
  fileSizeLimit: 5242880, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
})
```

## 🛠️ Troubleshooting

### "Bucket not found" Fehler
- ✅ Überprüfen Sie, dass beide Buckets (`videos` und `thumbnails`) existieren
- ✅ Stellen Sie sicher, dass die Namen exakt übereinstimmen (kleingeschrieben)
- ✅ Prüfen Sie die MIME-Type Konfiguration

### "Permission denied" Fehler
- ✅ Führen Sie `setup-storage.sql` aus
- ✅ Überprüfen Sie, dass Sie als Admin eingeloggt sind
- ✅ Prüfen Sie die RLS Policies im Supabase Dashboard

### Upload funktioniert nicht
- ✅ Überprüfen Sie die Dateigröße (Videos max. 2GB, Bilder max. 5MB)
- ✅ Prüfen Sie das Dateiformat
- ✅ Schauen Sie in die Browser-Konsole nach Fehlermeldungen

## 📊 Bucket-Übersicht nach Setup

| Bucket | Typ | Zugriff | Max. Größe | Formate |
|--------|-----|---------|------------|---------|
| `videos` | Video | Privat | 2GB | MP4, MOV, AVI, MKV |
| `thumbnails` | Bild | Öffentlich | 5MB | JPG, PNG, WebP |

Nach der Einrichtung sollten alle Upload-Funktionen in der Admin-Oberfläche funktionieren! 🎉
