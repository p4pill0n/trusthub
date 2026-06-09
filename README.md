# Trust Hub

Third-Party Risk Management (TPRM) platform for banking institutions.

## Tech Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui components
- **Supabase** (auth + PostgreSQL database)
- **Recharts** for data visualizations
- Deployed on **Vercel**

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy `.env.example` to `.env.local` and fill in your credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Run the schema and seed files in the Supabase SQL Editor:
   - `supabase/schema.sql` — creates all tables and RLS policies (use for **new** projects)
   - `supabase/seed.sql` — inserts vendors with related data
   - `supabase/migrations/` — incremental upgrades for **existing** databases only (see `supabase/README.md`)

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|-------|-------------|
| `/` | Dashboard — KPIs, charts, overdue reviews |
| `/vendors` | Full vendor register with search & filters |
| `/risk-assessment` | Risk assessments, trigger questionnaires, track responses |
| `/questionnaire/[token]` | Vendor-facing security questionnaire (no sidebar) |
| `/fourth-parties` | Fourth parties ranked by cross-portfolio frequency |
| `/remediations` | Remediations tracking with inline status updates |
| `/incidents` | Security incident log |
| `/bitsight` | BitSight security ratings |
| `/interconnections` | Data flow table + network diagram |

Legacy redirects: `/onboarding` → `/risk-assessment`, `/recommendations` → `/remediations`.

## Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
4. Deploy

## Project Structure

```
app/
  (app)/            # Authenticated pages with sidebar layout
  (public)/         # Public pages without sidebar (questionnaire)
components/
  ui/               # shadcn primitives
  layout/           # Sidebar, PageHeader
  shared/           # Cross-feature components (risk badges)
  [feature]/        # Feature-specific components
lib/                # Supabase client, queries, server actions
types/              # TypeScript interfaces
supabase/           # schema.sql, seed.sql, migrations/
```
