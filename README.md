# AI Resume Builder

Premium resume builder web app with deterministic ATS scoring, template switching, export tools, and Project 3 build-track gating.

## Tech Stack

- React + TypeScript
- Vite
- React Router
- localStorage (state persistence)

Why this stack:
- React + Router give fast route-based UI iteration.
- TypeScript reduces runtime mistakes in complex form state.
- Vite keeps local dev and build speed high.
- localStorage enables zero-backend persistence for builder + proof flow.

## Routes

Main app routes:
- `/`
- `/builder`
- `/preview`
- `/proof`

Project 3 build-track routes:
- `/rb/01-problem`
- `/rb/02-market`
- `/rb/03-architecture`
- `/rb/04-hld`
- `/rb/05-lld`
- `/rb/06-build`
- `/rb/07-test`
- `/rb/08-ship`
- `/rb/proof`

## Implemented Features

- Resume builder with structured sections:
  - Personal Info, Summary, Education, Experience, Projects, Skills, Links
- Skills accordion:
  - Grouped chips for Technical Skills, Soft Skills, Tools & Technologies
  - Enter-to-add, remove chip, duplicate prevention, AI suggest button
- Projects accordion:
  - Add/remove project entries
  - Title, description, tech stack chips, live URL, GitHub URL
  - Collapsible cards and live preview rendering
- Live preview:
  - Conditional section rendering (empty sections hidden)
  - Template switching: Classic, Modern, Minimal
  - Color theme picker with persisted selection
- ATS scoring (deterministic):
  - 0-100 score, live updates while editing
  - Circular score status (Needs Work / Getting There / Strong Resume)
  - Suggestions + Top 3 Improvements
- Export:
  - Copy Resume as Text
  - Download PDF (optimized size, styled output)
- Persistence:
  - Resume data stored under `resumeBuilderData`
  - Template/color preferences persisted
  - Proof submission persisted under `rb_final_submission`

## Project 3 Build-Track Gating

- Sequential steps enforced on `/rb/01...08` (no skipping).
- `Next` remains disabled until current step artifact is uploaded.
- Artifacts are saved under `rb_step_X_artifact`.
- `/rb/08-ship` requires:
  - prior step completion
  - Step 7 checklist completion gate
- `/rb/proof` includes:
  - 8-step completion overview
  - Link inputs:
    - Lovable Project Link (optional, valid URL if provided)
    - GitHub Repository Link (required, valid URL)
    - Deployed URL (required, valid URL)
  - 10-item checklist validation
  - `Copy Final Submission`
- Status badge becomes `Shipped` only when all ship conditions are met.

## Run Locally

```bash
npm install
npm run dev
```

Open:
- Builder: `http://localhost:5173/builder`
- Preview: `http://localhost:5173/preview`
- Proof: `http://localhost:5173/rb/proof`
- Ship: `http://localhost:5173/rb/08-ship`

## Build

```bash
npm run build
npm run preview
```

## Deployment

- `vercel.json` is included for SPA route handling on refresh/direct URL navigation.

