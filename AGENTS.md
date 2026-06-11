<!-- BEGIN:nextjs-agent-rules -->

# Mundial Typer - Project Instructions

## Project overview

This is a private World Cup 2026 prediction league app built with Next.js.

The app allows users to:

- register and log in using username + password,
- predict exact match scores,
- view match results,
- view rankings,
- view other users' predictions after match kickoff,
- view group tables,
- view the World Cup bracket.

The first version focuses only on the World Cup 2026 group stage.
Knockout stage and bonus predictions will be added later.

## Tech stack

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Supabase Auth
- Supabase Database
- Supabase SSR
- Zod for validation

## Main rules

- Use App Router.
- Use TypeScript everywhere.
- Keep code modular and readable.
- Do not use localStorage for authentication.
- Use Supabase session cookies through `@supabase/ssr`.
- Keep API logic inside `src/app/api`.
- Keep reusable UI components inside `src/components`.
- Keep feature-specific code inside `src/features`.
- Keep validation schemas inside `schemas` folders.
- Keep shared types inside `src/types`.
- Keep constants inside `src/constants`.
- Use English names for files, folders, variables, functions, components and UI labels.
- Explanations and planning can be in Polish.

## Auth assumptions

Users log in with:

- username
- password

Supabase Auth requires email, so the app will generate a technical email from username:

`username@mundial-typer.local`

Rules:

- username is unique,
- username is stored lowercase,
- displayed username can be formatted later,
- user roles are stored in the `profiles` table.

Roles:

- `user`
- `admin`

## Scoring rules

Prediction points:

- 3 points for exact score,
- 1 point for correct winner or correct draw,
- 0 points for wrong prediction,
- 0 points for no prediction.

Users can create or edit predictions only before match kickoff time.

Other users' predictions are visible only after match kickoff time.

## MVP scope

The MVP includes:

- registration,
- login,
- logout,
- dashboard,
- group stage matches,
- match details,
- predictions,
- results,
- ranking,
- profile statistics,
- admin panel,
- manual match management,
- manual result entry,
- automatic points calculation,
- group tables,
- World Cup bracket placeholder/view.

## Admin scope

Admin can:

- add matches manually,
- edit matches,
- enter final match results,
- trigger automatic points calculation after entering results.

Initial group stage matches may be inserted directly into Supabase using SQL seed queries.

## Database entities planned

Initial tables:

- profiles
- matches
- predictions

Additional planned tables or views:

- group standings view
- bracket_matches or knockout_matches
- bonus_predictions, later
- ranking view, later if needed

## Code style

- Prefer clear names over short names.
- Avoid unnecessary abstractions.
- Keep components small.
- Separate UI from data logic when possible.
- Validate API request bodies with Zod.
- Return consistent API responses.
- Protect admin endpoints by checking the user's role.
- Do not trust frontend-only validation.
- Business rules must be checked on the API/server side.

## Development workflow

Work step by step.

Before adding new packages, decide whether they are really needed.

Before creating large features, first define:

- database shape,
- API endpoint,
- validation schema,
- UI flow.

Do not implement CSV import in the MVP.
Matches will be inserted initially with SQL and later managed manually by admin.

## UI direction

The UI is in Polish, but all code, file names, variables, database columns and API fields stay in English.

The app is for a private group of Polish friends. The tone can be informal, funny and slightly competitive.

The main prize rule:

- the winner receives as many beer bottles as the number of points they score.

Use a World Cup 2026 inspired visual style:

- dark stadium-like background,
- pitch green accents,
- trophy/gold accents for ranking,
- energetic red/blue/cyan details,
- clean cards and readable typography.

Use shadcn/ui components as the base UI system.
Prefer reusable components from `src/components/ui`.

<!-- END:nextjs-agent-rules -->
