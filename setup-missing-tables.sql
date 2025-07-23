-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_content TEXT,
    next_steps TEXT,
    work_in_progress_url TEXT,
    demo_url TEXT,
    github_url TEXT,
    image_url TEXT,
    status TEXT NOT NULL DEFAULT 'PLANNING',
    category TEXT NOT NULL DEFAULT 'OTHER',
    progress INTEGER NOT NULL DEFAULT 0,
    start_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create learning_entries table
CREATE TABLE IF NOT EXISTS learning_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    categories TEXT[] DEFAULT '{}',
    difficulty TEXT NOT NULL DEFAULT 'BEGINNER',
    completed_hours DECIMAL(6,2) NOT NULL DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    resources TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_learning_entries_date ON learning_entries(date);
CREATE INDEX IF NOT EXISTS idx_learning_entries_updated_at ON learning_entries(updated_at DESC);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_entries_updated_at ON learning_entries;
CREATE TRIGGER update_learning_entries_updated_at
    BEFORE UPDATE ON learning_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_entries ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (adjust based on your authentication needs)
DROP POLICY IF EXISTS "Enable all operations for all users on projects" ON projects;
CREATE POLICY "Enable all operations for all users on projects" ON projects
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all operations for all users on learning_entries" ON learning_entries;
CREATE POLICY "Enable all operations for all users on learning_entries" ON learning_entries
    FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data for projects
INSERT INTO projects (title, description, detailed_content, status, category, progress, demo_url, github_url) VALUES
('ポートフォリオWebサイト', 'Next.js 15とSupabaseを使用したレスポンシブなポートフォリオサイト', '3Dグローブ、ダークテーマ、ブログ機能を含む包括的なポートフォリオサイトを構築。Three.jsによる3Dビジュアル、Supabaseによるコンテンツ管理、shadcn/uiによる美しいUI設計を実装。', 'IN_PROGRESS', 'WEB', 75, 'https://example.com', 'https://github.com/user/portfolio'),
('AI チャットボット', 'OpenAI GPTを使用したインテリジェントチャットアシスタント', 'GPT-3.5-turboを活用したリアルタイムチャット機能。日本語対応、タイピングインジケーター、レスポンシブデザインを実装。', 'COMPLETED', 'AI', 100, NULL, 'https://github.com/user/ai-chatbot')
ON CONFLICT (id) DO NOTHING;

-- Insert sample data for learning_entries
INSERT INTO learning_entries (date, title, description, categories, difficulty, completed_hours, skills, resources) VALUES
('2024-07-20', 'Three.js 3Dプログラミング', 'WebGLを使用した3Dグラフィックスの基礎を学習。ジオメトリ、マテリアル、ライティングの概念を理解。', ARRAY['FRONTEND', 'GRAPHICS'], 'INTERMEDIATE', 3.5, ARRAY['Three.js', 'WebGL', 'JavaScript'], ARRAY['Three.js公式ドキュメント', 'WebGL Fundamentals']),
('2024-07-21', 'Supabase データベース設計', 'PostgreSQLとSupabaseを使用したフルスタック開発。RLS、トリガー、リアルタイム機能を実装。', ARRAY['BACKEND', 'DATABASE'], 'ADVANCED', 4.0, ARRAY['Supabase', 'PostgreSQL', 'SQL'], ARRAY['Supabase Documentation', 'PostgreSQL Manual'])
ON CONFLICT (id) DO NOTHING;