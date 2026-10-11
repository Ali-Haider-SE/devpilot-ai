# DevPilot AI

Backend-first AI software engineering platform. **Current state: Phase 1 (backend foundation) — code written, NOT yet run/verified.**
See `docs/requirements-audit.md` for the full checklist and phase map.

## Run locally (exact steps)

```bash
cp .env.example .env            # then set POSTGRES_PASSWORD and the same password inside DATABASE_URL
npm install                     # also creates package-lock.json -> commit it
docker compose up -d postgres redis
npm run typecheck && npm run lint && npm test
npm run build
npm run start:dev               # API on http://localhost:3000
curl -i localhost:3000/health/live
curl -i localhost:3000/health/ready
# Swagger UI: http://localhost:3000/api/docs
```

Full stack in Docker (API + Postgres + Redis):

```bash
docker compose up -d --build
curl -i localhost:3000/health/ready
```

## Layout

- `apps/api` NestJS API (modular monolith)
- `packages/shared-types` envelope/error-code/health types shared with the future frontend
- `docker/api/Dockerfile`, `docker-compose.yml`
- `docs/` requirements audit, architecture notes

GitHub sync test
