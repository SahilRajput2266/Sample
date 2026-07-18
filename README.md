# JobOrbit

JobOrbit is an AI-powered Job Search & Application Automation platform.

## Setup Instructions

### Prerequisites
- Node.js 20.19+ (required by the current MongoDB/Mongoose toolchain)
- MongoDB (Running locally or via Docker)

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables template and configure them:
   ```bash
   cp .env.example .env
   ```
   On PowerShell, use:
   ```powershell
   Copy-Item .env.example .env
   ```
4. Start MongoDB locally (ensure it's running on port `27017`).
5. Run the admin seed script to create the default admin user:
   ```bash
   npm run seed
   ```
6. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server (no frontend `.env` file is required locally):
   ```bash
   npm run dev
   ```

### 3. Usage
1. Open your browser and navigate to `http://localhost:5173`.
2. Login as admin using the seeded credentials:
   - **Email:** admin@joborbit.com
   - **Password:** Admin@123

## Milestone 2: Professional profiles

Authenticated users can manage their profile, skills, experience, education, certifications, languages, and multiple resumes from the dashboard. Profile data is stored in separate user-indexed MongoDB collections.

Resume uploads use the `resume` multipart field. PDF, DOC, and DOCX files up to 10 MB are stored under `backend/uploads/resumes/`. Files are excluded from source control and are only served through the authenticated download endpoint. Keep this directory writable in local and container deployments.

The backend environment requires `PORT`, `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL`; see `backend/.env.example`. The frontend uses Vite's `/api` development proxy and requires no environment variables for local development.

## Milestone 3: Job discovery and matching

Users can configure job preferences, fetch normalized jobs from six safe local mock adapters, search and filter jobs, save opportunities with notes, ignore jobs, start applications, update statuses, and review activity timelines. Matching is deterministic and uses role, skills, location, experience, salary, and work-mode weights.

Milestone 3 does not scrape external sites and does not require source API keys. Mock adapters live under `backend/services/job-sources/`; all generated apply links use the safe `jobs.example.com` domain. Repeated fetches are deduplicated per user and source.

Authenticated APIs are available at `/api/job-preferences` and `/api/jobs`. Administrators can add `?userId=<id>` when viewing another user's preferences or jobs.

## Milestone 4: Application Tracking System

Users can create manual applications or convert matched jobs into tracked applications. The ATS includes responsive list and Kanban views, nine pipeline statuses, priorities, follow-up dates, resume/document associations, notes, interview rounds, activity history, and application analytics.

Authenticated ATS APIs are available under `/api/applications`. Application data is stored in separate `applications`, `applicationNotes`, `applicationInterviews`, `applicationDocuments`, and `applicationActivities` collections. Administrators can append `?userId=<id>` to inspect a user's ATS data.

The Kanban board uses native drag and drop on desktop and a status selector on touch-sized screens. No external services or additional environment variables are required for Milestone 4.


## Milestone 5: AI Resume Optimizer and Document Generator

Users can generate and save cover letters, resume summaries, resume optimization suggestions, job fit analyses, interview questions, and follow-up emails from their stored profile, resume, job, and application data. Generated documents are editable, copyable, downloadable as TXT, and attachable to tracked applications.

Authenticated AI APIs are available under `/api/ai`; generated document CRUD is available under `/api/generated-documents`. AI request logs are stored for usage history. Normal users can view their own AI usage, and administrators can view all AI logs or filter by `userId`.

AI provider configuration is backend-only and keys are never exposed to the frontend:

```env
AI_PROVIDER=template
AI_MODEL=
OPENAI_API_KEY=
GEMINI_API_KEY=
```

Use `AI_PROVIDER=template` for deterministic local generation with no external API key. To use OpenAI, set `AI_PROVIDER=openai`, `OPENAI_API_KEY`, and optionally `AI_MODEL` such as `gpt-4o-mini`. To use Gemini, set `AI_PROVIDER=gemini`, `GEMINI_API_KEY`, and optionally `AI_MODEL` such as `gemini-2.5-flash`. If a provider is selected without its key, JobOrbit automatically falls back to template mode.
### Verification

```bash
cd backend
npm audit
cd ../frontend
npm run lint
npm run build
```

### Exact local run commands (PowerShell)

Terminal 1:

```powershell
cd B:\Github\JobOrbit\backend
npm install
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm run seed
npm run dev
```

Terminal 2:

```powershell
cd B:\Github\JobOrbit\frontend
npm install
npm run dev
```

Then open `http://localhost:5173`.

With MongoDB and the API running, profile endpoints are available under `/api/profile`. Administrators may append `?userId=<id>` to view or manage a specific user's professional profile data.

---
*Note: Auto-apply automation, browser extensions, subscriptions, payments, recruiter dashboards, and mobile apps are planned for future milestones.*

## Milestone 6 — Safe Auto-Apply Automation

JobOrbit supports assisted application preparation, review-before-submit, action-required pauses, saved answers, audit steps, screenshots, and admin monitoring. Real external job platforms are never submitted automatically: supported adapters may navigate and prefill, then stop for review or manual completion. Captcha, OTP, login, anti-bot, and restricted flows always pause.

### Install and run

```bash
cd backend
npm install
npx playwright install chromium
npm run dev
```

For production queue processing, configure Redis and run the worker separately:

```bash
cd backend
npm run worker
```

When `REDIS_URL` is empty, local development uses a bounded in-process queue. It is process-local and jobs do not survive restarts. Redis is required for durable production queueing.

Frontend:

```bash
cd frontend
npm install
npm run dev
```

### Local test application form

Set `AUTOMATION_TEST_FORM_ENABLED=true` with a non-production `NODE_ENV`, then open:

`http://localhost:5000/test-job-application`

This is the only form on which automated final submission is permitted. It never sends data to a third party and is unavailable in production.

### Safety and supported adapters

Adapters: generic forms, company career pages, Greenhouse, Lever, Workable, assisted navigation, and the local test form. External adapters stop before final submit. No stealth plugins, proxy rotation, fingerprint spoofing, third-party password storage, persistent cookies, captcha solving, OTP bypass, or login bypass are implemented.

### Production considerations

Use Redis, Node 20.19 or newer, a dedicated worker, Playwright Chromium system dependencies, restricted screenshot storage, HTTPS, and monitored cleanup jobs. Keep `AUTOMATION_AUTO_SUBMIT_ENABLED=false`. Server-hosted browser sessions and changing third-party markup mean external automation remains assisted and is not guaranteed for every site.
## Production deployment

See [Production deployment](docs/production-deployment.md) for supported runtimes, Redis TLS, the dedicated worker, Playwright Linux dependencies, process limits, monitoring, backup, and rollback.
