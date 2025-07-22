# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
```bash
pnpm dev         # Start development server on http://localhost:3000
pnpm build       # Build for production
pnpm start       # Run production build
pnpm lint        # Run ESLint
```

**Testing:**
No test framework is currently configured. Consider using `pnpm test` with Jest or Vitest if tests are added.

## Architecture

This is a Next.js 15 portfolio application featuring a Three.js-powered 3D globe, a complete content management system using Supabase, and an AI-powered chatbot. The app showcases experimental projects, learning journey entries, and blog posts with full CRUD functionality.

### Content Management System

The application is built around three main content types managed through Supabase:

**Projects (Experimental Projects)** - `/app/experiments/`
- Full project lifecycle tracking with detailed content, next steps, and work-in-progress URLs
- Image upload support via Supabase Storage with drag-and-drop functionality
- Status tracking (PLANNING → IN_PROGRESS → TESTING → COMPLETED → PAUSED)
- Category filtering (WEB, MOBILE, AI, GAME, TOOL, OTHER)
- Progress tracking with visual progress bars
- Demo and GitHub URL links
- Calendar picker for start date selection using Japanese locale

**Learning Entries (Learning Journey)** - `/app/learning/`
- Daily learning log with date picker, study hours tracking, and multi-category support
- Simplified workflow without estimated hours or completion dates
- Skills and resources tracking
- Difficulty levels (BEGINNER, INTERMEDIATE, ADVANCED)
- Multi-category selection support

**Posts (Blog)** - `/app/blog/`
- Blog post management with draft/published states
- Slug-based routing with SEO-friendly URLs
- Tags and reading time estimation
- Featured image support

### AI Chatbot Integration

**OpenAI-Powered Chat Assistant** - `/components/chatbot.tsx`
- Floating chat button with gradient styling on all pages
- Real-time chat interface with typing indicators
- Uses GPT-3.5-turbo model via `/api/chat` endpoint
- Japanese language UI with localized messages
- No chat history persistence (memory lost on refresh)
- Requires `OPENAI_API_KEY` environment variable

### Database Schema

**Supabase PostgreSQL** with three main tables:
- `projects` - Enhanced with `detailed_content`, `next_steps`, `work_in_progress_url`, `image_url`
- `learning_entries` - Supports `categories` array and `completed_hours` as DECIMAL(6,2)
- `posts` - Full blog functionality with publishing workflow

**Key Database Features:**
- Auto-updating `updated_at` timestamps via triggers
- Row Level Security (RLS) enabled with permissive policies
- Performance indexes on commonly queried fields
- UUID primary keys with auto-generation

### Custom React Hooks

**CRUD Operations:**
- `useProjects()` - Projects CRUD with filtering and sorting
- `useLearningEntries()` - Learning entries management
- `usePosts()` - Blog posts with publish/draft states
- Individual item hooks: `useProject(id)`, `useLearningEntry(id)`, `usePost(slug)`

**Data Flow:**
- All hooks sort by `updated_at` DESC, then `created_at` DESC for newest-first display
- Real-time optimistic updates to local state
- Consistent error handling with toast notifications

### Form Components and UI

**Form Components:**
- `ProjectForm` - Calendar picker, image upload, comprehensive project data
- `LearningForm` - Simplified daily learning log with Japanese date formatting
- `PostForm` - Blog post editor with slug generation and publishing workflow

**Image Management:**
- `ImageUpload` - Drag-and-drop file upload to Supabase Storage
- Image validation, resizing, and error handling
- Modal display for full-size image viewing
- Consistent styling with borders and shadows

### Tech Stack

- **Next.js 15** with App Router and React 19
- **Supabase** for PostgreSQL database, real-time subscriptions, and file storage
- **React Hook Form** with Zod validation for type-safe forms
- **shadcn/ui** component library with Radix UI primitives
- **Three.js** for 3D globe visualization with color-cycling animation
- **Tailwind CSS** with dark theme optimization
- **date-fns** with Japanese locale support for date formatting
- **TypeScript** with comprehensive database type definitions
- **OpenAI SDK** for AI chat functionality

### Environment Configuration

**Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

The Supabase client gracefully handles missing environment variables during development. The OpenAI API key is required for chatbot functionality.

### Important Notes

1. **Database Schema Evolution**: The schema has been enhanced with additional columns. Use `ALTER TABLE` commands when adding new fields to maintain data consistency.

2. **Image Storage**: Supabase Storage bucket must be configured for image upload functionality. The application handles upload errors gracefully.

3. **Form Validation**: All forms use Zod schemas for validation with Japanese error messages. Date fields use calendar pickers with Japanese locale formatting.

4. **Content Sorting**: All content lists are sorted by newest updates first (`updated_at` DESC) to show recently modified items at the top.

5. **Type Safety**: Database types are auto-generated in `/types/database.ts` with convenience types for each table operation (Insert, Update, Row).

6. **Three.js Globe**: Still references missing Earth texture files in `/public/` and falls back to wireframe mode. Consider implementing viewport visibility detection for performance optimization.

7. **Build Configuration**: The `next.config.mjs` is configured to ignore both ESLint and TypeScript errors during builds. This can hide potential issues in production.

8. **Authentication**: Currently no authentication is implemented. All database operations are publicly accessible through Supabase's permissive RLS policies.

9. **API Security**: The `/api/chat` endpoint has no rate limiting or authentication, which could lead to API abuse and unexpected OpenAI costs.