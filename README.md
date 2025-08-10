# AIポートフォリオ & ブログ

Next.js 15で構築されたモダンなポートフォリオ兼ブログサイト。3Dグローブビジュアライゼーション、Markdownサポート付きの包括的なブログシステム、AI搭載チャット機能を特徴としています。

## 🚀 主な機能

### コア機能
- **3Dグローブビジュアライゼーション**: 動的なカラーサイクリングを備えたインタラクティブなThree.js製グローブ
- **ブログシステム**: Markdownエディタ、画像アップロード、公開ワークフローを備えたフル機能のブログ
- **AIチャットボット**: サイト全体に統合されたOpenAI搭載のチャットアシスタント
- **AI Playground**: 実験的なAI機能を体験できるインタラクティブなプレイグラウンド
- **ダークテーマ**: グラデーションアクセントで最適化されたダークテーマデザイン
- **レスポンシブデザイン**: すべてのデバイスに対応したモバイルファーストアプローチ

### ブログ機能
- **Markdownエディタ**: ライブプレビュー付きのMarkdown記事作成
- **画像管理**: Supabase Storage統合によるドラッグ&ドロップ画像アップロード
- **公開ワークフロー**: 下書き、公開、アーカイブの記事管理
- **ヒーロー画像**: ヒーローセクション付きのブログ記事用アイキャッチ画像
- **SEO対応**: スラッグベースのルーティングとメタデータサポート

### AI Playground機能
- **NASA画像エクスプローラー**: NASAの宇宙画像をAIが詳しく解説する機能
- **Twitter検索エクスプローラー**: リアルタイムなTwitter検索と分析機能
  - キーワード検索とアカウント指定検索
  - エンゲージメント指標（いいね、リツイート、返信数）表示
  - 実際のTwitterページへの直接リンク
  - 多言語対応（日本語、英語など）
  - 取得件数とソート順の柔軟な設定

## 🛠 技術スタック

- **フレームワーク**: [Next.js 15](https://nextjs.org/) (App Router)
- **言語**: [TypeScript](https://www.typescriptlang.org/)
- **データベース**: [Supabase](https://supabase.com/) (PostgreSQL)
- **スタイリング**: [Tailwind CSS](https://tailwindcss.com/)
- **UIコンポーネント**: [shadcn/ui](https://ui.shadcn.com/)
- **3Dグラフィックス**: [Three.js](https://threejs.org/)
- **AI統合**: [OpenAI API](https://openai.com/)
- **Twitter API**: [twitterapi.io](https://twitterapi.io/) (Twitter Advanced Search API)
- **フォーム処理**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)

## 📦 インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/kazu5150/myPortfolio-2.git
cd myPortfolio-2
```

2. 依存関係をインストール:
```bash
pnpm install
```

3. 環境変数を設定:
```bash
cp .env.example .env.local
```

環境変数を追加:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
TWAPI_KEY=your_twitter_api_key
```

4. 外部サービスをセットアップ:
   - [supabase.com](https://supabase.com)で新しいプロジェクトを作成
   - データベーススキーマを実行（データベースセットアップセクションを参照）
   - `project-images`という名前のストレージバケットをパブリックアクセスで作成
   - [twitterapi.io](https://twitterapi.io/)でTwitter API keyを取得（Twitter検索機能用）

5. 開発サーバーを起動:
```bash
pnpm dev
```

[http://localhost:3000](http://localhost:3000)を開いてアプリケーションを確認してください。

## 🗄 データベースセットアップ

Supabaseプロジェクトで以下のテーブルを作成:

```sql
-- Postsテーブル
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT,
  excerpt TEXT,
  status TEXT DEFAULT 'DRAFT',
  tags TEXT[],
  featured_image_url TEXT,
  reading_time INTEGER,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- パブリック読み取りアクセスのポリシーを作成
CREATE POLICY "Posts are viewable by everyone" ON posts
  FOR SELECT USING (true);

-- 挿入/更新/削除のポリシーを作成（認証ニーズに基づいて調整）
CREATE POLICY "Posts are editable by everyone" ON posts
  FOR ALL USING (true);

-- updated_atトリガーを作成
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

## 🏗 プロジェクト構造

```
sophisticated-landing/
├── app/                    # Next.js App Routerページ
│   ├── ai-playground/     # AI実験機能
│   ├── blog/              # ブログページ
│   ├── dashboard/         # 管理ダッシュボード
│   └── page.tsx           # ホームページ
├── components/            # Reactコンポーネント
│   ├── Globe.tsx          # 3Dグローブビジュアライゼーション
│   ├── PostForm.tsx       # ブログ記事エディタ
│   ├── Sidebar.tsx        # ナビゲーションサイドバー
│   └── chatbot.tsx        # AIチャットインターフェース
├── hooks/                 # カスタムReactフック
├── lib/                   # ユーティリティ関数
├── types/                 # TypeScript型定義
└── public/               # 静的アセット
```

## 🎨 主要コンポーネント

### グローブビジュアライゼーション
ホームページには、動的に色が変化するThree.js製のインタラクティブな3Dグローブが表示されます。

### ブログシステム
- **PostForm**: Markdownサポートと画像アップロード機能を備えた包括的な記事エディタ
- **ブログ一覧**: アイキャッチ画像付きの3列グリッドレイアウト
- **ブログ詳細**: ヒーロー画像セクションとレンダリングされたMarkdownコンテンツ

### AIチャットボット
すべてのページで利用可能なフローティングチャットボタン。OpenAIのGPT-3.5-turboモデルを使用。

### AI Playground
実験的なAI機能を体験できるインタラクティブな環境:
- **NASA画像エクスプローラー**: 日付指定でNASAの宇宙画像を取得し、AIによる詳細解説を表示
- **Twitter検索エクスプローラー**: [twitterapi.io](https://twitterapi.io/)を利用したリアルタイムTwitter検索
  - キーワード検索 + アカウント指定検索
  - `from:username` 構文による特定アカウントの投稿検索
  - エンゲージメント指標とTwitterページへの直接リンク

## 📝 利用可能なスクリプト

```bash
pnpm dev         # 開発サーバーを起動
pnpm build       # プロダクションビルド
pnpm start       # プロダクションビルドを実行
pnpm lint        # ESLintを実行
```

## 🚧 環境変数

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトのURL | はい |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabaseの匿名キー | はい |
| `OPENAI_API_KEY` | OpenAI APIキー | はい（チャットボット用） |
| `TWAPI_KEY` | twitterapi.io APIキー | はい（Twitter検索用） |

## 📄 ライセンス

このプロジェクトはオープンソースで、[MITライセンス](LICENSE)の下で利用可能です。

## 🤝 コントリビューション

コントリビューションは歓迎します！お気軽にプルリクエストを送信してください。

## 📧 お問い合わせ

質問やフィードバックについては、GitHubでイシューを開いてください。

---

Next.jsとClaudeで構築 ❤️