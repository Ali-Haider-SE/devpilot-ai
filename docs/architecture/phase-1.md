# Phase 1 — Backend foundation (status: UNVERIFIED)

## Request pipeline
request → requestId middleware (x-request-id / x-correlation-id) → helmet → CORS → pino-http (redacts auth/cookies)
→ ThrottlerGuard (global, in-memory store) → controller → ResponseEnvelopeInterceptor `{success,data,meta}`
→ errors: AllExceptionsFilter `{success:false,error:{code,message,requestId,timestamp,details?}}`.
Unknown errors return INTERNAL_ERROR with no internals; stack/details go to logs only.

## Modules
- `config/` Zod-validated env (fails fast at boot, messages never include values)
- `modules/prisma` PrismaService (connect on init, `ping()`, disconnect on shutdown)
- `modules/redis` ioredis client (`ping()`, quit on shutdown)
- `modules/queue` BullMQ wired to Redis with one `system` queue (no processors yet; feature queues come with their phases)
- `modules/health` `/health`, `/health/live` (process only), `/health/ready` (real DB + Redis probes, 2s timeout, 503 `NOT_READY` with per-dependency status)
- `common/` filter, interceptor, middleware, Zod pipe, `AppException`, utils

## Routing
Health is unversioned and outside the `/api` prefix. Everything else will live under `/api/v1`.

## Deliberately NOT in Phase 1
Auth/RBAC, domain models and migrations (Prisma schema has datasource+generator only), pgvector extension (image has it; enabled in Phase 11), distributed rate-limit store, CSRF.

## Known limitations
- Rate limiter uses in-memory storage: not shared across API instances (move to Redis storage later).
- Docker runtime image keeps dev dependencies; prune in hardening phase.
- No package-lock.json yet (no network here) → Docker build is not reproducible until it is committed.
