-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create projects table for Experiments section
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'OTHER',
  status TEXT NOT NULL DEFAULT 'PLANNING',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  technologies TEXT[] DEFAULT '{}',
  start_date DATE,
  update_date DATE DEFAULT CURRENT_DATE,
  demo_url TEXT,
  github_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_entries table for Learning Journey section
CREATE TABLE learning_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'OTHER',
  status TEXT NOT NULL DEFAULT 'PLANNING',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  skills TEXT[] DEFAULT '{}',
  resources JSONB DEFAULT '[]',
  difficulty_level TEXT DEFAULT 'BEGINNER',
  estimated_hours INTEGER,
  completed_hours INTEGER DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  target_completion_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table for Blog section
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  tags TEXT[] DEFAULT '{}',
  featured_image_url TEXT,
  reading_time INTEGER,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_learning_entries_updated_at
  BEFORE UPDATE ON learning_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at);

CREATE INDEX idx_learning_entries_category ON learning_entries(category);
CREATE INDEX idx_learning_entries_status ON learning_entries(status);
CREATE INDEX idx_learning_entries_created_at ON learning_entries(created_at);

CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_tags ON posts USING GIN(tags);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for now, adjust based on authentication needs)
CREATE POLICY "Enable read access for all users" ON projects FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON projects FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON projects FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON learning_entries FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON learning_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON learning_entries FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON learning_entries FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON posts FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON posts FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON posts FOR DELETE USING (true);

-- Insert some sample data
INSERT INTO projects (title, description, category, status, progress, technologies, start_date, demo_url, github_url) VALUES
('WMS 倉庫管理システム', 'WMS作ってみた', 'WEB', 'IN_PROGRESS', 40, '{"Next.js", "supabase", "Vercel"}', '2025-06-14', '#', '#'),
('Eleven Labs 音声チャットボット', 'Eleven Labs & OpenAI APIによるウェブアプリの作成公開', 'AI', 'COMPLETED', 100, '{"Next.js", "OpenAI API", "Eleven Labs API", "Vercel"}', '2025-06-19', '#', '#');

INSERT INTO learning_entries (title, description, category, status, progress, skills, difficulty_level, estimated_hours, start_date) VALUES
('Three.js 3D Graphics', '3Dグラフィックスの基礎学習', 'FRONTEND', 'IN_PROGRESS', 60, '{"Three.js", "WebGL", "3D Modeling"}', 'INTERMEDIATE', 40, '2025-06-01'),
('Supabase Database Design', 'データベース設計とSupabaseの学習', 'BACKEND', 'IN_PROGRESS', 30, '{"Supabase", "PostgreSQL", "Database Design"}', 'BEGINNER', 20, '2025-06-20');

INSERT INTO posts (title, slug, content, excerpt, status, tags, reading_time) VALUES
('Supabase入門：Next.jsとの連携', 'getting-started-with-supabase-nextjs', 'Supabaseを使ったNext.jsアプリケーションの開発方法について...', 'SupabaseとNext.jsを使ったフルスタック開発の基礎を学びます', 'PUBLISHED', '{"Supabase", "Next.js", "Tutorial"}', 10),
('Three.jsで3D地球儀を作る', 'creating-3d-globe-with-threejs', 'Three.jsを使って回転する3D地球儀を実装する方法...', 'Three.jsの基本的な使い方から3D地球儀の実装まで', 'DRAFT', '{"Three.js", "3D", "WebGL"}', 15);