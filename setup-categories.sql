-- Standard-Kategorien für die Krav Maga Video-Kurs-Plattform erstellen
-- Führe dieses SQL in deinem Supabase SQL Editor aus

-- Lösche bestehende Kategorien (falls vorhanden)
DELETE FROM course_categories;

-- Füge Standard-Kategorien hinzu
INSERT INTO course_categories (id, name, slug, description, created_at, updated_at) VALUES
(gen_random_uuid(), 'Grundlagen', 'grundlagen', 'Basis-Techniken und Grundlagen des Krav Maga für Anfänger', NOW(), NOW()),
(gen_random_uuid(), 'Selbstverteidigung', 'selbstverteidigung', 'Praktische Selbstverteidigungstechniken für den Alltag', NOW(), NOW()),
(gen_random_uuid(), 'Fortgeschrittene Techniken', 'fortgeschrittene-techniken', 'Komplexe Techniken und Kombinationen für erfahrene Praktiker', NOW(), NOW()),
(gen_random_uuid(), 'Kondition & Fitness', 'kondition-fitness', 'Körperliche Fitness und Konditionstraining für Krav Maga', NOW(), NOW()),
(gen_random_uuid(), 'Mentale Stärke', 'mentale-staerke', 'Psychologische Aspekte, Stressmanagement und Selbstvertrauen', NOW(), NOW()),
(gen_random_uuid(), 'Waffenverteidigung', 'waffenverteidigung', 'Verteidigung gegen verschiedene Waffen und Bedrohungen', NOW(), NOW());

-- Zeige alle erstellten Kategorien an
SELECT 
  id,
  name,
  description,
  created_at
FROM course_categories
ORDER BY name;
