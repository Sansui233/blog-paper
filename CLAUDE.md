# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimalist black-and-white personal blog with micro-blogging (memos) functionality, built with React Router 7 in SSG mode.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production (SSG)
pnpm start        # Run production server
pnpm typecheck    # Generate types and run TypeScript check
```

## Architecture

### Tech Stack
- **React Router 7.11** with SSG (ssr: false, prerender enabled)
- **React 19** + **TypeScript 5.9**
- **Tailwind CSS v4** with Vite plugin
- **Velite** for Markdown/MDX content processing
- **Vite 7** as build tool
- **Zustand** for state management (theme, language)
- **i18next** for internationalization

### Key Directories
```
app/
├── routes/           # Route handlers (home, posts, memos, categories, tags, about)
├── components/       # React components organized by feature
│   ├── common/       # Shared (layout, topbar, footer, search, waline)
│   ├── home/         # Home page (ArticleItem, NavCat)
│   ├── post/         # Post page (FloatButtons, Pagination, PostMeta, TOC)
│   ├── memo/         # Memo page (MemoCard, VirtualList, ImageBrowser, Sidebar, CommentModal)
│   ├── markdown/     # Markdown rendering (MDImg, MDXComponent)
│   └── categories/   # Category components (Timeline)
├── hooks/            # Custom hooks (use-theme, use-search, use-toc-highlight, etc.)
└── styles/           # Global CSS (animations, base, theme, components)

lib/
├── data/server/      # Server-side processing (posts, memos, rss, searchindex)
├── data/client/      # Client-side data utilities
├── search/           # Search engine implementation
├── md-compile/       # Markdown compilation utilities
├── remark/           # Remark plugins (remark-unwrap-images, remark-tag)
├── rehype/           # Rehype plugins (rehype-tag)
└── fs/               # File system utilities

content/
├── posts/            # Blog post Markdown files
└── memos/            # Micro-blog Markdown files

public/data/          # Generated CSR data (memos pagination, search index)
.velite/              # Generated content data (posts.json, memos.json)
```

### Content System

**Velite** processes Markdown files into typed data. Schema in `velite.config.ts`:

**Posts** have: title, slug, date, description, cover, draft, content_html, content_jsx, toc, tags, categories, keywords

**Memos** are split by `## Title` headings within each file:
- Tags extracted from inline hashtags (#tagname)
- Images collected from standalone image lines
- Paginated to `public/data/memos/` (10 per page)

### Post Frontmatter Format
```yaml
---
title: Post Title
date: 2023-08-30 02:54:34
categories: Category
tags:
  - tag1
  - tag2
description: Optional description
draft: true  # Optional, hides from RSS
keywords: Optional keywords
---
```

### Data Flow

**Build Time (SSG):**
1. Velite processes Markdown → HTML/MDX JSX
2. Search index built from posts and memos
3. RSS feed and sitemap generated
4. Memo CSR data paginated to `public/data/memos/`

**Runtime (SSG/CSR Hybrid):**
- Posts: SSG prerendered, loaded via server loader
- Memos: Initial page SSG, additional pages via CSR fetch
- Search: Client-side with pre-built index
- Theme: Zustand store + localStorage persistence

### Routes
- `/` - Home (blog posts with category filtering)
- `/posts/:slug` - Individual blog post
- `/categories` - Categories listing
- `/categories/:id` - Posts in category
- `/tags/:id` - Posts with tag
- `/memos` - Micro-blog feed with search, filtering, infinite scroll
- `/about` - About page

### Configuration
- `site.config.ts` - Site metadata, social links, Waline API, Google Analytics ID
- `react-router.config.ts` - SSG and prerendering settings
- `velite.config.ts` - Content schema and processing pipeline
- `vite.config.ts` - Tailwind, React Router, path aliases

### Key Patterns

**Loader Pattern (React Router 7):**
```tsx
export async function loader() { /* SSG data */ }
export async function clientLoader() { /* CSR data */ }
clientLoader.hydrate = true; // Force client execution
export function HydrateFallback() { /* Loading UI */ }
```

**Theme System:**
- `useTheme` hook with system preference listener
- Light/Dark/System modes
- CSS class on document root

**Virtual Scrolling:**
- Custom `VirtualList` component for memo infinite scroll
- Dynamic height tracking
- Bidirectional loading (prev/next)

### Integrations
- **Waline** - Comment system (`walineApi` in site.config.ts)
- **Google Analytics** - Site analytics (`GAId`)
- **RSS** - Auto-generated feed (posts + recent memos)
- **Search** - Built-in with Chinese/English support, field-specific queries

### Styles
- **Light and Dark Colors**: styles/base.css
- **Tailwind theme registry**: styles/theme.css