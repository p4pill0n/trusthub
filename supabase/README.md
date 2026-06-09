# Supabase setup

## New project

Run in order in the Supabase SQL Editor:

1. `schema.sql` — full schema (current state)
2. `seed.sql` — sample data

Do **not** run individual migration files on a fresh database.

## Existing project (upgrade)

Use files in `migrations/` to apply incremental changes. Run only migrations you have not already applied.

`run_all_updates.sql` bundles several older data migrations — do not run it if you have already applied the individual files it contains.

`rename_recommendations_to_remediations.sql` is only needed for databases that still have a `recommendations` table.
