# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A minimalist black-and-white personal blog with micro-blogging (memos) functionality, built with React Router 7 and SSR support.

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Run production server
pnpm typecheck    # Generate types and run TypeScript check
```

## Architecture

### Tech Stack
- **React Router 7** with SSR enabled
- **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Velite** for Markdown content processing
- **Vite 7** as build tool

### Key Directories
- `app/` - React Router application (routes, components, features)
- `lib/` - Business logic and utilities
  - `lib/data/client/` - Client-side data utilities
  - `lib/data/server/` - Server-side data processing
  - `lib/remark/`, `lib/rehype/` - Markdown processing plugins
- `content/posts/` - Blog posts in Markdown
- `content.local/` - Symlinked to iCloud for content sync (not in repo)

### Content System
Velite processes Markdown files from `content/posts/` into typed data. Schema defined in `velite.config.ts`:
- Posts have: title, slug, date, description, cover, draft, content_html, content_jsx, toc
- Generated types and data output to `.velite/`

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
---
```

### Configuration
- `site.config.ts` - Site metadata, social links, Waline comments, Google Analytics
- `react-router.config.ts` - SSR and prerendering settings
- `velite.config.ts` - Content schema and processing pipeline

### Integrations
- **Waline** - Comment system (configured via `walineApi` in site.config.ts)
- **Google Analytics** - Site analytics (configured via `GAId`)
- **RSS** - Auto-generated feed
- **Search** - Built-in with Chinese language support
