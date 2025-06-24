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

This is a Next.js 15 application using the App Router with a Three.js-powered 3D globe visualization as the centerpiece.

### Key Components

**Globe.tsx** - The main feature, implementing:
- WebGL globe with Three.js using texture mapping and atmospheric shaders
- Color-cycling animation through predefined color palette
- OrbitControls for user interaction
- Progressive loading (wireframe → textured)
- Fallback handling for missing textures

**UI Components** - Extensive shadcn/ui component library in `components/ui/` providing a complete design system. Components use Radix UI primitives with Tailwind styling.

### Tech Stack

- **Next.js 15** with App Router
- **React 19** with TypeScript
- **Three.js** for 3D graphics
- **Tailwind CSS** with custom theming
- **shadcn/ui** component library
- **Framer Motion** for animations
- **pnpm** package manager

### Important Notes

1. **Missing Assets**: The Globe component references Earth texture files that don't exist in `/public/`. It gracefully falls back to wireframe mode.

2. **Build Configuration**: TypeScript and ESLint errors are ignored during builds (see `next.config.ts`). Fix these before production deployment.

3. **Unused Components**: Contact.tsx exists but isn't integrated into the main page.

4. **Theme System**: Dark mode infrastructure is set up but the app currently uses a fixed black background.

5. **Performance**: Three.js globe runs continuously. Consider implementing viewport visibility detection to pause rendering when off-screen.