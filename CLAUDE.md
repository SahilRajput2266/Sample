# JobOrbit — Project State & Agent Guide

> **RULE FOR ALL AGENTS:** Read this file before analyzing the codebase — it replaces a full re-inspection.
> After ANY change, update the relevant section AND add a dated entry to the **Changelog** at the bottom.
> Keep entries terse. Do not duplicate what's in README.md (setup/run instructions live there).

Last full audit: 2026-07-18 (read-only, no changes made).

## 1. Stack & Architecture

- **Backend** (`backend/`): Node ESM, Express 5, Mongoose 9, MongoDB, JWT (30d, Bearer header), bcryptjs, multer, helmet, express-rate-limit (global 100/15min), cors.
  - Pattern: `route → validator middleware → controller → service`.
  - Generic CRUD factory: `controllers/resource.controller.js` powers skill/experience/education/certification/language controllers (3-line wrappers).
  - `/api/profile` mounts 7 routers on one path (`server.js:46`).
  - Admin can read/write any user's data via `?userId=` — resolved by `utils/profileAccess.js` (used by all profile/job/application controllers; AI generation is self-only).
  - Central error handler: `middleware/error.js`. Uploads NOT served statically — download only via authed endpoint.
  - Validation is hand-rolled (`validators/*.js`) + Mongoose schema validators. No express-validator.
- **Frontend** (`frontend/`): React 19, Vite 5, Tailwind 4 (`@tailwindcss/postcss`, no config file), react-router-dom 7, axios, vite-plugin-pwa, lucide-react. No TypeScript.
  - Auth: `src/context/AuthContext.jsx` — token in localStorage, global axios defaults (`baseURL='/api'`, Bearer header). **No axios service layer; no 401 interceptor** — 24 files call bare axios (~87 sites).
  - Route guard: `src/components/ProtectedRoute.jsx` — exact role match (admins locked out of user pages).
  - Dev API via Vite `/api` proxy → `localhost:5000`. No `import.meta.env` usage — prod needs same-origin reverse proxy.
- **Style warning:** M2+ backend profile routes/controllers and most frontend pages are minified single-line JSX/JS. Auth/admin pages are conventionally formatted. Two styles coexist.
- **No tests anywhere. Folder is NOT a git repo (as of audit).**

## 2. Database (20 collections, all keyed by `userId` ref User)

users, profiles, skills, experiences, educations, certifications, languages, resumes, jobs, jobpreferences, jobactivities, savedjobs, applications, applicationnotes, applicationinterviews, applicationdocuments, applicationactivities, airequests, generateddocuments, resumeoptimizations.

- Key uniques: 1 profile/user; 1 jobpreference/user; skill+language unique per user (case-insensitive collation); 1 default resume/user (partial unique `Resume.js:11`); 1 savedjob & 1 application per (user,job); job dedupe via 2 partial uniques (`Job.js:36-37`).
- User isolation is consistent: every query filters `{userId}`; create force-sets it; updates strip `userId`/`_id`.
- Cascade delete: full (19 collections + resume files) but only in `admin.controller.js:175-215` (controller-side, non-transactional). Job/application/resume deletes leave some dangling refs (see Known Issues).
- Profile completion: `services/profile.service.js:9-24` — personal 20 + skills 20 + experience 20 + education 15 + resume 15 + social 10 = 100. Recomputed on every relevant mutation. Certifications/languages have no weight.

## 3. Milestone status

| Milestone | Status |
|---|---|
| M1 Auth/roles/admin | ✅ Done |
| M2 Profiles (7 domains, resumes, completion %) | ✅ Done |
| M3 Jobs (mock adapters, matching, saved/ignored) | ✅ Done |
| M4 ATS (applications, kanban, notes, interviews, analytics) | ✅ Done |
| M5 AI documents (template/openai/gemini providers) | ✅ Done |
| Future (per README): auto-apply, extensions, payments, recruiter dash | ❌ Not started |

## 4. Known issues (from 2026-07-18 audit) — mark ✅ + changelog entry when fixed

### Blockers (fix before new milestone work)
- [ ] No git repository — init + commit; add `dev-dist/` to `.gitignore` (only `**/dist/` covered).
- [ ] `backend/.env:3` JWT_SECRET is the default `change_this_secret` — rotate. Also `NODE_ENV` unset → stack traces leak in API errors (`middleware/error.js:18`).
- [ ] `middleware/auth.js:27-37` — missing `return` causes double `next(err)` on bare `Authorization: Bearer` header.
- [ ] Zero tests — add minimum: auth + one CRUD resource + resume upload/isolation (Supertest + in-memory Mongo).

### High/Medium
- [ ] `models/User.js:9-17` email lacks `lowercase`/`trim` (case-duplicate accounts); regex rejects TLDs like `.info`. Raw `req.body.email` into `findOne` = NoSQL operator injection (`auth.controller.js:11,47`, `admin.controller.js:69`).
- [ ] No dedicated rate limit on `/api/auth` (only global 100/15min; AI routes have their own).
- [ ] Frontend: no 401 interceptor → expired token = silent failures. `AuthContext.jsx:12` sets baseURL in render body.
- [ ] `pages/admin/UserEdit.jsx:56-63` — failed save replaces form with error page, losing edits.
- [ ] `admin.controller.js:120-170` — no last-admin guard (can demote/deactivate the only admin); delete refuses all admins (inconsistent).
- [ ] `Sidebar.jsx:36` — `bg-opacity-50` is Tailwind 3 syntax; overlay renders solid black in v4. Use `bg-black/50`.
- [ ] Hardcoded admin seed creds `admin@joborbit.com`/`Admin@123` (`seed-admin.js:21-22`, README).

### Low / debt
- [ ] `ResourceManager.jsx:10` selects show first option while state is `''` (untouched select saves empty); stale success notices (`:8`).
- [ ] `admin.controller.js:125-128` `||` fallbacks — falsy values can't be saved.
- [ ] Dangling refs: job delete misses Application/GeneratedDocument/ResumeOptimization `.jobId` (`job.controller.js:63`); resume delete leaves `resumeId` refs; `Application.coverLetterId` has no `ref` (`Application.js:19`).
- [ ] Dead files: `frontend/src/App.css`, `src/assets/{hero.png,react.svg,vite.svg}`, `.toast` in `index.css`, `public/icons.svg`, `autoprefixer` dep. `index.html` title = "frontend". No 404 route (`App.jsx:86`).
- [ ] Duplication: `escapeRegex` in job+application controllers; ownership helpers ×3; `e.response?.data?.message` boilerplate ~15×; Login/Register redirect effect; admin table markup ×2.
- [ ] Scalability: admin users list unpaginated (`admin.controller.js:55`); no TTL on activity/log collections; local-disk resume storage (no S3 seam); plan/limit fields on User never enforced; ResumeOptimization write-only (never queried); no `trust proxy`; upload type check trusts client mimetype (no magic bytes); password policy minlength 6 only.
- [ ] PWA: SVG-only icon fails installability; no apple-touch-icon/theme-color meta.

## 5. What's missing (features)
- Settings page is read-only (no password/email change, no account deletion; no user-facing change-password endpoint).
- Admin UI for user profile data — backend `?userId=` fully works but no frontend page uses it.
- Password reset/forgot flow, email verification, token refresh/revocation.
- 404 page, public landing page (`/` → login).
- `backend/.env` missing AI vars from `.env.example` (falls back to template mode).

## 6. Changelog (newest first — append here after every change)

- **2026-07-18** — Full read-only audit performed; this file created. No code changes yet. All checkboxes above unfixed.
