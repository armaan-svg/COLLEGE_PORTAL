# ASTROVERSE architecture

This is a clean React + Vite + TypeScript SPA, not a redesign of existing frontend code. The platform requires Netlify Database + Drizzle ORM and Netlify Identity rather than external Supabase services.

- `src/main.tsx`: React Router route tree, lazy feature pages and authentication provider.
- `src/components`: shared layout and accessible visual primitives.
- `src/pages`: public editorial pages, quiz, gallery, authentication, registration, participant tools and administration.
- `src/lib`: real Netlify Identity session handling, same-origin API client and shared Zod registration validation.
- `src/data`: editable editorial schedule/FAQ/gallery and quiz data. Never store persistent application records here.
- `src/styles.css`: custom responsive space-themed design system, reduced-motion overrides and print card styling.
- `db/schema.ts`: Drizzle schema, `db/index.ts`: native Netlify database adapter.
- `netlify/functions/api.mts`: trusted server API. Database ownership/admin context is set transaction-locally after authenticating. Public verification exposes minimal team data only.
- `netlify/database/migrations`: generated structural migration and custom security migration. Preserve the manually added registration sequence, RLS policies and triggers. Every schema change needs a migration.
- `public/gallery`: genuine supplied archive photographs. Do not replace them with stock or AI imagery. Five repeated extracted images are excluded in the manifest.
- `public/supplied`: original source PDFs and reference image; `public/img`: supplied logo and original generated hero.
- `scripts`: authoring-only media extraction/generation and source ZIP packaging; not used by runtime.

Use descriptive variable names, modular components and semantic accessible forms. Do not add secrets, sample registration records, automatic email-based admin provisioning, invented policies or unlicensed media. Only the verified Identity user ID in `administrators` authorizes privileged APIs. Registration is closed by default until an authorized organizer confirms rules and opens it. Keep ASTROVERSE separate from the host branding, preserve the exact event title and local dates, and mark all unconfirmed content. Every mutation must have an authorization check and same-origin protection. Public verification must never expose participant emails or mobile numbers. Team inserts must remain transactional.

In this managed environment, do not run local build/start/test commands; platform validation runs automatically. Do not claim unperformed workflow tests. Regenerate the source archive after final changes. Detailed setup, authorization, content provenance and remaining dependencies are in README.md.
