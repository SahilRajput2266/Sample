# Production deployment

## Supported runtime

Use Node.js 20.19 or newer (Node 22 LTS is recommended), MongoDB 7+, and Redis 7+ over a private network. Run the API and automation worker as separate processes. External auto-submit remains unavailable regardless of environment configuration.

## Install and build

```bash
cd backend && npm ci && npx playwright install --with-deps chromium
cd ../frontend && npm ci && npm run build
sudo rsync -a --delete dist/ /var/www/joborbit/
```

Ubuntu's exact Playwright packages are installed and version-matched by `npx playwright install --with-deps chromium`. Verify Chromium with:

```bash
cd backend
node -e "import('playwright').then(async({chromium})=>{const b=await chromium.launch({headless:true});console.log(await b.version());await b.close()})"
```

## Environment and storage

Copy `backend/.env.example` into the secret manager; never commit `.env`. Required production values include `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `REDIS_URL`. For TLS Redis set `REDIS_TLS=true`, `REDIS_TLS_SERVERNAME`, and keep `REDIS_TLS_REJECT_UNAUTHORIZED=true`. Keep `AUTOMATION_AUTO_SUBMIT_ENABLED=false` and `AUTOMATION_TEST_FORM_ENABLED=false`.

Mount `backend/uploads/automation-screenshots` on a private volume owned by the worker (`0700` directories, `0600` files); never expose it through Nginx. For multi-instance production, replace the local screenshot service with an S3/R2 implementation using private buckets, server-side encryption, short-lived authenticated reads, lifecycle retention, and object keys derived from run IDs—not user filenames.

Before first production rollout, create and verify model indexes in a maintenance window. The active-run partial unique index enforces one non-terminal run per user.

## Processes and limits

```bash
cd /opt/joborbit/backend
NODE_ENV=production npm start
NODE_ENV=production npm run worker
```

PM2 example:

```bash
pm2 start server.js --name joborbit-api --time --max-memory-restart 512M
pm2 start workers/automation.worker.entry.js --name joborbit-worker --time --max-memory-restart 1536M
pm2 save
```

Set `AUTOMATION_GLOBAL_CONCURRENCY` from measured browser memory; start at `2`. Apply systemd `MemoryMax`, `CPUQuota`, `NoNewPrivileges=true`, `PrivateTmp=true`, restart-on-failure, and a 60-second stop timeout. Send SIGTERM during deploy; API, worker, browsers, Redis clients, scheduler, and MongoDB close gracefully. Rotate stdout/stderr daily with retention and redact request bodies, authorization headers, URLs with query secrets, and consent metadata.

## Nginx

Terminate TLS, redirect HTTP to HTTPS, proxy `/api/` to `127.0.0.1:5000`, serve `/var/www/joborbit`, and use `try_files $uri /index.html`. Set request-size limits appropriate for resumes, security headers, proxy timeouts, and rate limits. Do not add a location for screenshot storage or the local test form.

## Verification and monitoring

```bash
redis-cli -u "$REDIS_URL" --tls PING
curl --fail https://joborbit.example/
curl --fail -H "Authorization: Bearer $ADMIN_TOKEN" https://joborbit.example/api/admin/automation/queue-health
ps -ef | grep -E '[c]hromium|[c]hrome'
```

Monitor API latency/errors, worker heartbeat and restarts, BullMQ waiting/active/stalled/failed counts, Redis connectivity and memory, MongoDB connections/replication lag, browser count/RSS, disk usage, cleanup-lock age, stale runs, and screenshot cleanup failures. Alert when no worker consumes queued jobs.

## Backup, recovery, and rollback

Use encrypted MongoDB snapshots plus point-in-time recovery and separately version application releases. Redis queue data is operational state, not the system of record; reconcile runs from MongoDB after Redis loss. Test restores regularly. Before deploy, back up MongoDB and retain the previous frontend/backend artifact and lockfiles. To roll back: stop intake, drain or pause workers, deploy the previous artifact, restore only when a schema change is incompatible, rebuild indexes if required, restart worker then API, and verify health/queue reconciliation. Never roll back by deleting automation collections.