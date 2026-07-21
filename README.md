# Pooya Choob — Carpentry Portfolio Site

**Live demo:** https://pooya-choob.cpt-n3m0.workers.dev (read-only demo on Cloudflare Workers)

A Persian (RTL) portfolio website for a carpentry / cabinet-making workshop, with a **simple Persian admin panel** for adding categories, works, and photos. Image quality and size are optimized automatically on upload.

- Framework: Next.js 16 (App Router) + Tailwind CSS 4
- Fonts: Estedad (headings) and Vazirmatn (body) — self-hosted
- Storage: Vercel Blob in production; local files in development
- Hosting: free on Vercel

## Local development

Requirements: Node.js 22 and pnpm 9.

```bash
pnpm install
pnpm dev
```

The site runs at `http://localhost:3000` and the admin panel at `/admin` (default development password: `admin`).

Until you save your first change, the site shows the pre-loaded seed content (built from the owner's work photos in `public/works-photos/`). The first save from the admin panel creates your editable copy (stored in `.data/` in development).

## Deployment

Step-by-step guide: [SETUP.md](SETUP.md)

## Useful commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the development server |
| `pnpm build` | Production build |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | TypeScript check |
| `node scripts/e2e-admin.mjs` | Full automated admin-panel test |
| `node scripts/probe-interactions.mjs` | Interaction checks (menu, lightbox, filters) |
| `node scripts/shoot.mjs <dir>` | Screenshot every page (desktop + mobile) |
| `node scripts/import-photos.mjs` | Re-import owner photos from the project root |
| `pnpm run deploy:cf` | Deploy the read-only demo to Cloudflare Workers |

## Content model

All site content (settings, categories, works) lives in a single JSON document:

- Production: `data/content.json` in Vercel Blob
- Development: `.data/content.json`
- Photos: Vercel Blob (production) or `public/uploads` (development)
- Seed photos: `public/works-photos/` (originals archived in `_source-photos/`)

The `_source-photos/` folder holds the owner's original photos (already imported into the site); it is not used in deployment and can be deleted once you have them backed up elsewhere.
