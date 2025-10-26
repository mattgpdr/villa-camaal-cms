-- Script SQL complet pour la page "En savoir plus"
-- Supprime et recrée la table learn_more_sections

-- Supprimer la table existante et ses dépendances
DROP TABLE IF EXISTS learn_more_sections CASCADE;

-- Créer la table learn_more_sections
CREATE TABLE learn_more_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  visible BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Supprimer les anciennes policies si elles existent
DROP POLICY IF EXISTS "Allow public read access" ON learn_more_sections;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON learn_more_sections;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON learn_more_sections;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON learn_more_sections;

-- Activer RLS
ALTER TABLE learn_more_sections ENABLE ROW LEVEL SECURITY;

-- Créer les policies RLS
CREATE POLICY "Allow public read access" ON learn_more_sections
  FOR SELECT TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert" ON learn_more_sections
  FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON learn_more_sections
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete" ON learn_more_sections
  FOR DELETE TO authenticated
  USING (true);

-- Supprimer toutes les données existantes
TRUNCATE TABLE learn_more_sections;

-- Insérer des sections d'exemple
INSERT INTO learn_more_sections (title, content, visible, display_order) VALUES
(
  'Notre Histoire',
  '<p>Fondée en 2020, notre entreprise est née d''une passion pour l''excellence et le service client. Nous avons commencé comme une petite équipe dédiée à offrir des expériences uniques et mémorables.</p><p>Au fil des années, nous avons grandi pour devenir un leader dans notre domaine, tout en conservant nos valeurs fondamentales de qualité, d''authenticité et d''innovation.</p>',
  true,
  1
),
(
  'Notre Mission',
  '<p>Notre mission est de créer des expériences exceptionnelles qui dépassent les attentes de nos clients. Nous nous engageons à :</p><ul><li>Offrir un service personnalisé de haute qualité</li><li>Maintenir les standards les plus élevés</li><li>Innover constamment pour améliorer nos offres</li><li>Contribuer positivement à notre communauté</li></ul>',
  true,
  2
),
(
  'Nos Valeurs',
  '<p><strong>Excellence :</strong> Nous visons l''excellence dans tout ce que nous faisons.</p><p><strong>Intégrité :</strong> Nous agissons avec honnêteté et transparence.</p><p><strong>Innovation :</strong> Nous embrassons le changement et l''amélioration continue.</p><p><strong>Passion :</strong> Nous aimons ce que nous faisons et cela se voit.</p>',
  true,
  3
),
(
  'Notre Équipe',
  '<p>Notre équipe est composée de professionnels passionnés et expérimentés, chacun apportant son expertise unique. Nous croyons que nos collaborateurs sont notre plus grande force.</p><p>Formés aux meilleures pratiques de l''industrie, nos membres partagent une vision commune : offrir le meilleur à nos clients.</p>',
  true,
  4
),
(
  'Nos Engagements',
  '<p>Nous nous engageons à :</p><ul><li><strong>Qualité garantie :</strong> Tous nos services respectent des standards stricts de qualité</li><li><strong>Satisfaction client :</strong> Votre bonheur est notre priorité absolue</li><li><strong>Développement durable :</strong> Nous adoptons des pratiques respectueuses de l''environnement</li><li><strong>Amélioration continue :</strong> Nous écoutons vos retours pour nous améliorer</li></ul>',
  true,
  5
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_learn_more_sections_display_order ON learn_more_sections(display_order);
CREATE INDEX IF NOT EXISTS idx_learn_more_sections_visible ON learn_more_sections(visible);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_learn_more_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_learn_more_sections_timestamp ON learn_more_sections;
CREATE TRIGGER update_learn_more_sections_timestamp
  BEFORE UPDATE ON learn_more_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_learn_more_sections_updated_at();
